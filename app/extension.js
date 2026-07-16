import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import WindowManager from './window/WindowManager.js';

export default class MultiScreenAudioManager extends Extension {
    enable() {
        console.log(`[${this.uuid}] Extension: Enabling MultiscreenAudioManager...`);
        
        // Initialize the WindowManager and start tracking signals
        this.WindowManager = new WindowManager(this.uuid, (window, monitorIndex) => {
            console.log(`MILESTONE 1: Run test track window movement.`);
            console.log(` -> Title: ${window.get_wm_class()} | PID: ${window.get_pid()} | has moved to Monitor: ${monitorIndex}`);
        });
        
        console.log(`[${this.uuid}] WindowManager created`);
        
        // Listen window manager signals
        this.WindowManager.start();
        
        console.log(`[${this.uuid}] WindowManager.start() called`);
        
        // Test feature 1: get list of window's PID
        try {
            console.log(`[${this.uuid}] About to call getWindowListSnapshot()`);
            
            let currentSnapshot = this.WindowManager.getWindowListSnapshot();
            
            console.log(`[${this.uuid}] getWindowListSnapshot() returned successfully`);
            console.log(`[${this.uuid}] currentSnapshot type: ${typeof currentSnapshot}`);
            console.log(`[${this.uuid}] currentSnapshot is array: ${Array.isArray(currentSnapshot)}`);
            console.log(`[${this.uuid}] currentSnapshot.length: ${currentSnapshot ? currentSnapshot.length : 'undefined'}`);
            
            console.log(`[MILESTONE 1 - First Snapshot]: Has ${currentSnapshot.length} windows`);
            
            // Format manually để tránh JSON.stringify() fail
            if (currentSnapshot && currentSnapshot.length > 0) {
                console.log(`[${this.uuid}] Entering loop to print windows...`);
                
                for (let i = 0; i < currentSnapshot.length; i++) {
                    try {
                        let w = currentSnapshot[i];
                        console.log(`[${this.uuid}] Processing window ${i}: ${typeof w}`);
                        
                        // Access each property safely
                        let id = w.id;
                        let pid = w.pid;
                        let monitor = w.monitor;
                        let title = w.title;
                        
                        console.log(`[${this.uuid}]   - All properties accessed safely`);
                        
                        // Build string safely with String constructor
                        let message = `  [${i}] ID: ${String(id)}, PID: ${String(pid)}, Monitor: ${String(monitor)}, Title: "${String(title)}"`;
                        console.log(message);
                        
                    } catch (itemError) {
                        console.error(`[${this.uuid}] ERROR processing window ${i}:`, itemError);
                        console.error(`[${this.uuid}] ERROR stack:`, itemError.stack);
                    }
                }
                console.log(`[${this.uuid}] Loop finished`);
            } else {
                console.log(`[${this.uuid}] No windows to display`);
            }
        } catch (error) {
            console.error(`[${this.uuid}] ERROR in getWindowListSnapshot:`, error);
            console.error(`[${this.uuid}] ERROR stack:`, error.stack);
        }
        
        console.log(`[${this.uuid}] Extension: Enabled successfully`);
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