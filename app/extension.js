import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import WindowManager from './managers/WindowManager.js';

export default class MultiScreenAudioManager extends Extension {
    enable() {
        // Initialize the WindowManager and start tracking signals
        try {
            this.WindowManager = new WindowManager(this.uuid, (window, monitorIndes) => {
                // Handle the signal when a window is moved
                console.log(`[${this.uuid}] Succesfully catch data from WindowManager`);
                console.log(` -> Window: "${window.get_title()}" [App: ${window.get_wm_class()}]`);
                console.log(` -> Has moved to monitor: ${monitorIndex}`);
            });

            this.WindowManager.start();
        } catch (error) {
            console.error(`[${this.uuid}] has initialize failed: ${error.message}`);
        }
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