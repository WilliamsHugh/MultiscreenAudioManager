import Meta from 'gi://Meta';
import WindowInfo from './WindowInfo.js';

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
        this._windowCreatedId = global.display.connect('window-created', (display, metaWindow) => {
            console.log(`[${this.uuid}] WindowManager: Caught 'window-created' signal for "${metaWindow.get_title()}"`);
            this._trackedWindow(metaWindow);
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
                    this._trackedWindow(focusedWindow);
                }
            }
        });

        // Get all current windows
        let currentWindows = this.getCurrentWindows();
        for (let metaWindow of currentWindows) {
            this._trackedWindow(metaWindow);
        }

        console.log(`[${this.uuid}] WindowManager: Initialize successful`);
    }

    /**
     * Get all windows (improved for Wayland)
     */
    getCurrentWindows() {
        let metaWindows = [];

        // Method 1: get_tab_list (main source)
        let tabListWindows = global.display.get_tab_list(0, null);
        metaWindows = tabListWindows.filter(w => this._isValidWindow(w));

        // Method 2: Fallback using get_window_actors (catch windows get_tab_list misses)
        let actors = global.get_window_actors();
        for (let actor of actors) {
            let metaWindow = actor.get_meta_window?.();
            if (metaWindow && this._isValidWindow(metaWindow)) {
                // Avoid duplicates
                if (!metaWindows.some(w => w.get_id() === metaWindow.get_id())) {
                    metaWindows.push(metaWindow);
                }
            }
        }

        return metaWindows;
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

    /**
     * Get a snapshot of all tracked windows
     * 
     * @returns {WindowInfo[]}
     */
    getWindowListSnapshot() {
        return this.getCurrentWindows()
            .map(WindowInfo.fromMetaWindow);
    }

    /**
     * Start tracking a Meta.Window instance.
     * 
     * @param {Meta.Window} metaWindow
     */
    _trackedWindow(metaWindow) {
        if (!metaWindow || !this._isValidWindow(metaWindow)) return;

        const initialInfo = WindowInfo.fromMetaWindow(metaWindow);

        // Prevent duplicates
        if (this._trackedWindows.has(initialInfo.id)) return;

        let signalIds = [];
        let lastMonitor = initialInfo.monitor;

        // [MOVEMENT SIGNAL]: Track when window moves to different monitor
        let posId = metaWindow.connect('position-changed', (metaWindow) => {
            const info = WindowInfo.fromMetaWindow(metaWindow);

            if (info.monitor === lastMonitor) return;

            lastMonitor = info.monitor;
            console.log(`[${this.uuid}] WindowManager: Window "${info.title}" [PID: ${info.pid}] moved to Monitor: ${info.monitor}`);

            this._onWindowMoved?.(info);
        });
        signalIds.push(posId);

        // [CLOSE SIGNAL]: Track when window is closed
        let unmanagedId = metaWindow.connect('unmanaged', (metaWindow) => {
            this._untrackWindow(metaWindow);
        });
        signalIds.push(unmanagedId);

        this._trackedWindows.set(initialInfo.id, {
            metaWindow,
            signalIds
        });

        console.log(`[${this.uuid}] WindowManager: Now tracking window "${initialInfo.title}" (ID: ${initialInfo.id})`);
    }

    /**
     * Stop tracking a window
     */
    _untrackWindow(metaWindow) {
        const winId = metaWindow.get_id();

        if (this._trackedWindows.has(winId)) {
            const { signalIds } = this._trackedWindows.get(winId);

            for (const id of signalIds) {
                metaWindow.disconnect(id);
            }
            this._trackedWindows.delete(winId);
            console.log(`[${this.uuid}] WindowManager: Stopped tracking window "${metaWindow.get_title()}" (ID: ${winId})`);
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
        for (let [winId, { metaWindow, signalIds }] of this._trackedWindows.entries()) {
            for (let id of signalIds) {
                metaWindow.disconnect(id);
            }
        }

        this._trackedWindows.clear();
        console.log(`[${this.uuid}] WindowManager: Stopped and cleaned up`);
    }
}