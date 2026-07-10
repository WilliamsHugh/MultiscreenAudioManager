import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import WindowManager from './window/WindowManager.js';

export default class MultiScreenAudioManager extends Extension {
    enable() {
        // Initialize the WindowManager and start tracking signals
        this.WindowManager = new WindowManager(this.uuid, (window, monitorIndex) => {
            console.log(`MILESTONE 1: Run test track window movement.`);
            console.log(` -> Title: ${window.get_wm_class()} | PID: ${window.get_pid()} | has moved to Monitor: ${monitorIndex}`);
        });

        // Listen window manager signals;
        this.WindowManager.start();
        
        // Test feature 1: get list of window's PID
        let currentSnapshot = this.WindowManager.getWindowListSnapshot();
        console.log(`[MILESTONE 1 - First Snapshot]: Has ${currentSnapshot.length} windows`);
        console.log(JSON.stringify(currentSnapshot, null, 2));
    }

    disable() {
        // Stop tracking signals and clean up resources
        if (this.WindowManager) {
            this.WindowManager.stop();
            this.WindowManager = null;
        }
        console.log(`[${this.uuid}] Extension has stopped.`)
    }
}