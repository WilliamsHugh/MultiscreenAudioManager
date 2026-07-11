import GLib from 'gi://GLib';
import Meta from 'gi://Meta';

export default class WindowManager {
    /** 
     * 
     * @param {string} uuid - extension's UUID is convert to log
     * @paran {Function} onWindowMoved - callback function when window is moved
     */

    constructor(uuid, onWindowMoved) {
        this.uuid = uuid;
        this._onWindowMoved = onWindowMoved;
        this._trackedWindows = new Map(); // key: winId (Number), value: array signal IDs
        this._windowCreatedId = null;
    }

    /**
     * Start tracking and window moverment signals.
     */

    start() {
        console.log(`[${this.uuid}] WindowManager: Initializing...`);

        // Track create new windows
        this._windowCreatedId = global.display.connect('window-created', (display, window) => {
            this._trackedWindowSignals(window);
        });

        // Track all current windows
        let currentWindows = this.getCurrentWindows();
        for (let win of currentWindows) {
            this._trackedWindowSignals(win);
        }

        console.log(`[${this.uuid}] WindowManager: Initialize succesfull`);
    }

    /**
     * Function get all current windows in tab list.
     * @returns {Meta.windos[]} list of valid object.
     */

    getCurrentWindows() {
        // Get tab list in order of (Alt + tab list)
        let windows = global.display.get_tab_list(0, null);

        // Only get actual application windows (except pop-up in the background)
        return windows.filter(w => {
            return w && 
                   typeof w.get_id === 'function' &&
                   w.get_window_type() === Meta.WindowType.NORMAL &&
                   w.get_title()
        });
    }

    /**
     * Public API: Return list of windows's basic info (include PID and Monitor index).
     * @returns {Object[]} list of windows's snapshot JSON.
     */
    getWindowListSnapshot() {
        let windows = this.getCurrentWindows();
        return windows.map(w => {
            return {
                id: w.get_id(),
                pid: w.get_pid(),
                monitor: w.get_monitor(),
                title: w.get_title(),
                wm_class: w.get_wm_class()
            };
        });
    }

    /**
     * Sign up signals listener for window (position change and close).
     * @param {Meta.Window} window 
     */
    _trackedWindowSignals(window) {
        if (!window || typeof window.get_id !== 'function' || !window.get_title()) return;
        if (window.get_window_type() !== Meta.WindowType.NORMAL) return;

        let winId = window.get_id();

        // prevent duplication by integer ID and prevent recusion on RAM
        if (this._trackedWindows.has(winId)) return;

        let signalIds = [];
        let lastMonitor = window.get_monitor();

        // [MOVERMENT SIGNAL]: track the monitor where window is in.
        let posId = window.connect('position-changed', (win) => {
            if (!win || typeof win.get_monitor !== 'function') return;

            let currentMonitor = win.get_monitor();

            // Only trigger when window actually moved to another monitor.
            if (currentMonitor !== lastMonitor) {
                lastMonitor = currentMonitor;

                console.log(`[${this.uuid}] WindowManger: Window "${win.get_title()}" [PID: ${win.get_pid()}] has moved to Monitor: ${currentMonitor}`);

                // Transmit the signal to RuleEngine for processing
                if (this._onWindowMoved) {
                    console.log(`It runs`)
                    this._onWindowMoved(win, currentMonitor);
                }
            }
        });
        signalIds.push(posId);

        // [CLOSE SIGNAL]: Track window when it is closed.
        let unmanagedId = window.connect('unmanaged', (win) => {
            this._untrackWindow(win);
        });
        signalIds.push(unmanagedId);

        // Save list of window ID for clean up
        this._trackedWindows.set(window, signalIds);
    }

    /**
     * Untrack a window by its ID.
     * @param {numer} winId The ID of the window to untrack
     */
    _untrackWindow(window) {
        if (this._trackedWindows.has(window)) {
            let signalIds = this._trackedWindows.get(window);

            // Release all signals associated with the window
            for (let id of signalIds) {
                window.disconnect(id);
            }
            this._trackedWindows.delete(window);
            console.log(`[${this.uuid}] WindowManager: Unfollowed the recently closed window ${window.get_title()}.`);
        }
    }

    /**
     * Clean up all tracked windows.
     */
    stop() {
        // Release all signals associated with the tracked windows
        if (this._windowCreatedId) {
            global.display.disconnect(this._windowCreatedId);
            this._windowCreatedId = null;
        }

        // Go through each window and untrack it
        for (let [window, signalIds] of this._trackedWindows.entries()) {
            for (let id of signalIds) {
                window.disconnect(id);
            }
        }

        this._trackedWindows.clear();
        console.log(`[${this.uuid}] WindowManager: Stopped and clean up clearly`);
    }
}