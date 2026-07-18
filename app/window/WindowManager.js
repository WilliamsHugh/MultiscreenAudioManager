import GLib from 'gi://GLib';
import Meta from 'gi://Meta';

export default class WindowManager {
    constructor(uuid, onWindowMoved) {
        this.uuid = uuid;
        this._onWindowMoved = onWindowMoved;
        this._trackedWindows = new Map(); // key: winId, value: {window, signalIds}
        this._windowCreatedId = null;
        this._focusChangedId = null;
    }

    start() {
        console.log(`[${this.uuid}] WindowManager: Initializing...`);

        // Signal 1: Track when new windows are created (standard way)
        this._windowCreatedId = global.display.connect('window-created', (display, window) => {
            console.log(`[${this.uuid}] WindowManager: Caught 'window-created' signal for "${window.get_title()}"`);
            this._trackedWindowSignals(window);
        });

        // Signal 2: Track when window gets focus
        // This catches windows that don't emit 'window-created'
        this._focusChangedId = global.display.connect('notify::focus-window', (display) => {
            let focusedWindow = global.display.get_focus_window();
            if (focusedWindow && this._isValidWindow(focusedWindow)) {
                let winId = focusedWindow.get_id();
                // Nếu window chưa được track, thêm vào
                if (!this._trackedWindows.has(winId)) {
                    console.log(`[${this.uuid}] WindowManager: Caught focused window (not in tracking): "${focusedWindow.get_title()}"`);
                    this._trackedWindowSignals(focusedWindow);
                }
            }
        });

        // Get all current windows
        let currentWindows = this.getCurrentWindows();
        for (let win of currentWindows) {
            this._trackedWindowSignals(win);
        }

        console.log(`[${this.uuid}] WindowManager: Initialize successful`);
    }

    /**
     * Get all windows (improved for Wayland)
     */
    getCurrentWindows() {
        let windows = [];

        // Method 1: get_tab_list (main source)
        let tabListWindows = global.display.get_tab_list(0, null);
        windows = tabListWindows.filter(w => this._isValidWindow(w));

        // Method 2: Fallback using get_window_actors (catch windows get_tab_list misses)
        let actors = global.get_window_actors();
        for (let actor of actors) {
            let window = actor.get_meta_window?.();
            if (window && this._isValidWindow(window)) {
                // Avoid duplicates
                if (!windows.some(w => w.get_id() === window.get_id())) {
                    windows.push(window);
                }
            }
        }

        return windows;
    }

    /**
     * Validate if window should be tracked
     */
    _isValidWindow(window) {
        if (!window || typeof window.get_id !== 'function') return false;
        if (!window.get_title?.()) return false;
        
        const windowType = window.get_window_type?.();
        if (windowType && windowType !== Meta.WindowType.NORMAL) return false;

        return true;
    }

    getWindowListSnapshot() {
        let windows = this.getCurrentWindows();
        return windows.map(w => {
            return {
                id: w.get_id(),
                pid: w.get_pid?.(),
                monitor: w.get_monitor?.(),
                title: w.get_title?.(),
                wm_class: w.get_wm_class?.()
            };
        });
    }

    /**
     * Track a window's signals
     */
    _trackedWindowSignals(window) {
        if (!window || !this._isValidWindow(window)) return;

        let winId = window.get_id();

        // Prevent duplicates
        if (this._trackedWindows.has(winId)) return;

        let signalIds = [];
        let lastMonitor = window.get_monitor();

        // [MOVEMENT SIGNAL]: Track when window moves to different monitor
        let posId = window.connect('position-changed', (win) => {
            if (!win || typeof win.get_monitor !== 'function') return;

            let currentMonitor = win.get_monitor();

            if (currentMonitor !== lastMonitor) {
                lastMonitor = currentMonitor;

                console.log(`[${this.uuid}] WindowManager: Window "${win.get_title()}" [PID: ${win.get_pid()}] moved to Monitor: ${currentMonitor}`);

                if (this._onWindowMoved) {
                    this._onWindowMoved(win, currentMonitor);
                }
            }
        });
        signalIds.push(posId);

        // [CLOSE SIGNAL]: Track when window is closed
        let unmanagedId = window.connect('unmanaged', (win) => {
            this._untrackWindow(win);
        });
        signalIds.push(unmanagedId);

        this._trackedWindows.set(winId, {
            window: window,
            signalIds: signalIds
        });

        console.log(`[${this.uuid}] WindowManager: Now tracking window "${window.get_title()}" (ID: ${winId})`);
    }

    /**
     * Stop tracking a window
     */
    _untrackWindow(window) {
        let winId = window.get_id();
        if (this._trackedWindows.has(winId)) {
            let { signalIds } = this._trackedWindows.get(winId);

            for (let id of signalIds) {
                window.disconnect(id);
            }
            this._trackedWindows.delete(winId);
            console.log(`[${this.uuid}] WindowManager: Stopped tracking window "${window.get_title()}" (ID: ${winId})`);
        }
    }

    /**
     * Clean up all tracking
     */
    stop() {
        // Disconnect display signals
        if (this._windowCreatedId) {
            global.display.disconnect(this._windowCreatedId);
            this._windowCreatedId = null;
        }

        if (this._focusChangedId) {
            global.display.disconnect(this._focusChangedId);
            this._focusChangedId = null;
        }

        // Untrack all windows
        for (let [winId, { window, signalIds }] of this._trackedWindows.entries()) {
            for (let id of signalIds) {
                window.disconnect(id);
            }
        }

        this._trackedWindows.clear();
        console.log(`[${this.uuid}] WindowManager: Stopped and cleaned up`);
    }
}