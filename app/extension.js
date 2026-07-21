import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import WindowManager from './window/WindowManager.js';
import AudioManager from './audio/AudioManager.js';

export default class MultiScreenAudioManager extends Extension {
enable() {
        console.log(`[${this.uuid}] Extension: Enabling MultiscreenAudioManager...`);
        
        // --- WINDOW MANAGER INIT & TRACKING ---
        this.WindowManager = new WindowManager(this.uuid, (info) => {
            console.log(`MILESTONE 1: Run test track window movement.`);
            console.log(` -> Title: ${info.wmClass} | PID: ${info.pid} | has moved to Monitor: ${info.monitor}`);
            
            // Suggest: update for future
            // When switch to the difference monitor -> auto call AudioManager.switchProfile()
        });
        
        console.log(`[${this.uuid}] WindowManager created`);
        this.WindowManager.start();
        console.log(`[${this.uuid}] WindowManager.start() called`);
        
        // --- TEST FEATURE 1: WINDOWS SNAPSHOT ---
        try {
            console.log(`[${this.uuid}] About to call getWindowListSnapshot()`);
            let currentSnapshot = this.WindowManager.getWindowListSnapshot();
            
            console.log(`[MILESTONE 1 - First Snapshot]: Has ${currentSnapshot ? currentSnapshot.length : 0} windows`);
            
            if (currentSnapshot && currentSnapshot.length > 0) {
                for (let i = 0; i < currentSnapshot.length; i++) {
                    let w = currentSnapshot[i];
                    console.log(`  [${i}] ID: ${String(w.id)}, PID: ${String(w.pid)}, Monitor: ${String(w.monitor)}, Title: "${String(w.title)}"`);
                }
            }
        } catch (error) {
            console.error(`[${this.uuid}] ERROR in getWindowListSnapshot:`, error);
        }

        // ==========================================
        // --- TEST FEATURE 2: AUDIO MANAGER TEST ---
        // ==========================================
        console.log(`\n[${this.uuid}] --- STARTING AUDIO MANAGER TEST ---`);
        try {
            // 1. Get current audio info
            const currentAudio = AudioManager.getCurrentAudioInfo();
            if (currentAudio) {
                console.log(`[${this.uuid}] [Audio Current] Device: ${currentAudio.device}`);
                console.log(`[${this.uuid}] [Audio Current] Sink: ${currentAudio.sinkName}`);
                console.log(`[${this.uuid}] [Audio Current] Active Profile: ${currentAudio.profile.profile}`);
            } else {
                console.log(`[${this.uuid}] [Audio Current] Unable to fetch active audio info.`);
            }

            // 2. List of all monitor / audio profile
            const availableProfiles = AudioManager.getAvailableProfiles();
            console.log(`[${this.uuid}] [Audio Profiles] Found ${availableProfiles.length} available profiles:`);
            
            availableProfiles.forEach((prof, idx) => {
                console.log(`[${this.uuid}]   (${idx}) ${prof.description} -> [${prof.profile}]`);
            });

            // 3. Test switch HDMI profile if it's available
            const hdmiProfile = availableProfiles.find(p => p.isHDMI());
            if (hdmiProfile) {
                console.log(`[${this.uuid}] [Audio Test Switch] Attempting switch to HDMI: ${hdmiProfile.description}`);
            
                AudioManager.switchProfile(hdmiProfile);
            } else {
                console.log(`[${this.uuid}] [Audio Test Switch] No HDMI profile available to test switch.`);
            }

        } catch (audioErr) {
            console.error(`[${this.uuid}] ERROR in AudioManager Test:`, audioErr);
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