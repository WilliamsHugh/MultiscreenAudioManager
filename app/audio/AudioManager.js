import GLib from 'gi://GLib';
import AudioProfile from './AudioProfile.js';
import AudioInfo from './AudioInfo.js';

export default class AudioManager {
    /**
     * Run static function to get list data (pactl @json list ...)
     */
    static _execCommandSync(cmd) {
        try {
            let [res, stdout, stderr, status] = GLib.spawn_command_line_sync(cmd);
            if (res && status === 0) {
                return new TextDecoder().decode(stdout).trim();
            }
        } catch (e) {
            console.error(`[AudioManager] Exec error: ${e.message}`);
        }
        return null;
    }

    /**
     * Run async command (pactl set-card-profile)
     */
    static _execAsync(cmd) {
        try {
            GLib.spawn_command_line_async(cmd);
            return true;
        } catch (e) {
            console.error(`[AudioManager] Async Exec error: ${e.message}`);
            return false;
        }
    }

    /**
     * Get current sink info
     * @returns {Promise<AudioInfo>}
     */
    static getCurrentAudioInfo() {
        try {
            const stdout = this._execCommandSync('pactl @json list sinks');
            if (!stdout) return null;

            const sinks = JSON.parse(stdout);
            if (!Array.isArray(sinks) || sinks.length === 0) return null;

            const activeSink = sinks[0];
            const props = activeSink.properties || {};

            const cardName = props['device.name'] || props['device.string'] || 'alsa_card.pci-0000_00_1f.3';

            let profileName = props['device.profile.name'];
            if (!profileName && activeSink.name) {
                const parts = activeSink.name.split('.');
                profileName = parts[parts.length - 1];
            }
            if (!profileName) profileName = 'analog-stereo';

            const fullProfileStr = `output:${profileName}+input:analog-stereo`;
            const profileDesc = props['device.profile.description'] || profileName;

            const audioProfile = new AudioProfile(cardName, fullProfileStr, profileDesc);
            
            return new AudioInfo(
                activeSink.name || 'Unknown Sink',
                props['device.description'] || activeSink.description || 'Built-in Audio',
                audioProfile,
                activeSink.index ?? 0
            );
        } catch (err) {
            console.error(`[AudioManager] Error in getCurrentAudioInfo: ${err.message}`);
            console.error(err.stack);
            return null;
        }
    }

    /**
     * Get all HDMI & Analog Profile available in audio card
     * @returns {Promise<AudioProfile[]}
     */
    static getAvailableProfiles() {
        try {
            const stdout = this._execCommandSync('pactl @json list cards');
            if (!stdout) return [];

            const cards = JSON.parse(stdout);
            if (!Array.isArray(cards) || cards.length === 0) return [];

            const primaryCard = cards[0];
            const availableProfiles = [];

            if (primaryCard.profiles && Array.isArray(primaryCard.profiles)) {
                primaryCard.profiles.forEach(p => {
                    if (p.name && p.name.startsWith('output:') && p.available !== false) {
                        const fullProfileName = `${p.name}+input:analog-stereo`;
                        availableProfiles.push(
                            new AudioProfile(primaryCard.name, fullProfileName, p.description)
                        );
                    }
                });
            }

            return availableProfiles;
        } catch (err) {
            console.error(`[AudioManager] Error in getAvailableProfiles: ${err.message}`);
            return [];
        }
    }

    /**
     * Switch audio output by AudioProfile
     * @param {AudioProfile} audioProfile
     * @returns {Promise<boolean>}
     */
    static switchProfile(audioProfile) {
        if (!audioProfile || !audioProfile.card || !audioProfile.profile) {
            console.error('[AudioManager] Invalid AudioProfile object passed to switchProfile');
            return false;
        }

        const command = `pactl set-card-profile ${audioProfile.card} ${audioProfile.profile}`;
        console.log(`[AudioManager] Executing command: ${command}`);
        return this._execCommandAsync(command);
    }
}