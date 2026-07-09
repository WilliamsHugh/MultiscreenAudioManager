import GLib from 'gi://GLib';

export default class WindowManager {
    /**
     * 
     * @param {string} uuid - extension's UUID is convert to log
     * @param {Function} onWindowMoved - callback function when window is moved
     */

    constructor(uuid, onWindowMoved) {
        this.uuid = uuid;
        this._onWindowMoved = onWindowMoved;
        this._trackedWindows = new Map();
        this._windowCreatedId = null;
    }

    // Method to track signals of a window from extension.js
    start() {
        // Track window signals when it is created
        this._windowCreatedId = global.display.connect('window-created', (display, window) => {
            this._trackWindowSignals(window);
        });

        // Track current window signals
        let currentWindows = global.display.get_tab_list(0, null);
        for (let window of currentWindows) {
            this._trackWindowSignals(window);
        }
        console.log(`[${this.uuid}] WindowManger started.`);
    }

    _trackWindowSignals(window) {
        if (this._trackedWindows.has(window)) return;

        let signalIds = [];
        let lastMonitor = window.get_monitor();

        // Signal 1: track the window moves
        let posId = window.connect('position-changed', (win) => {
            let currentMonitor = win.get_monitor();

            if (currentMonitor !== lastMonitor) {
                lastMonitor = currentMonitor;
                console.log(`[${this.uuid}] Window "${win.get_title()}" has moved to ${currentMonitor}`);
                
                // Transmit the signal to RuleEngine for processing
                // if (this._onWindowMoved) {
                //     this._onWindowMoved(win, currentMonitor);
                // }
            }
        });
        signalIds.push(posId);

        // Signal 2: track the window close
        let unmanagedId = window.connect('unmanaged', (win) => {
            this._untrackedWindow(win);
        });
        signalIds.push(unmanagedId);

        this._trackedWindows.set(window, signalIds);
    }

    _untrackedWindow(window) {
        if (this._trackedWindows.has(window)) {
            let signalIds = this._trackedWindows.get(window);

            for (let id of signalIds) {
                window.disconnect(id);
            }
            this._trackedWindows.delete(window);
            console.log(`[${this.uuid}] Unfollowed the recently closed window "${window.get_title()}"`)
        }
    }

    stop() {
        if (this._windowCreatedId) {
            global.display.disconnect(this._windowCreatedId);
            this._windowCreatedId = null;
        }

        for (let [window, signalIds] of this._trackedWindows.entries()) {
            for (let id of signalIds) {
                window.disconnect(id);
            }
        }

        this._trackedWindows.clear();
        console.log(`[${this.uuid}] WindowManager stopped successfully`);
    }
}