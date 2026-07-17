import GLib from 'gi://GLib';
import AudioProfile from './AudioProfile.js';
import AudioInfo from './AudioInfo.js';

export default class AudioManager {
    /**
     * Run static function to get list data (pactl @json list ...)
     */
    static _execSync(cmd) {
        try {
            let [res, stdout, stderr, status] = GLib.spawn_command_line_sync(cmd);
            if (res && status === 0) {
                // GLib trả về kiểu Uint8Array, cần decode sang String
                return new TextDecoder().decode(stdout).trim();
            }
        } catch (e) {
            console.error(`[AudioManager] Error running command: ${e.message}`);
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
            console.error(`[AudioManager] Error running async command: ${e.message}`);
            return false;
        }
    }

    /**
     * Get current sink info
     * @returns {Promise<AudioInfo>}
     */
    static getCurrentAudioInfo() {
        const stdout = this._execCommandSync('pactl @json list sinks');
        if (!stdout) return null;

        let sinks;
        try {
            sinks = JSON.parse(stdout);
        } catch (e) {
            console.error(`[AudioManager] JSON Parse Error: ${e.message}`);
            return null;
        }

        if (!Array.isArray(sinks) || sinks.length === 0) return null;

        // Lấy sink đang hoạt động (hoặc sink đầu tiên)
        const activeSink = sinks[0];
        const props = activeSink.properties || {};

        // 1. Lấy tên Card
        const cardName = props['device.name'] || props['device.string'] || 'alsa_card.pci-0000_00_1f.3';

        // 2. Lấy tên Profile an toàn với Fallback
        let profileName = props['device.profile.name'];

        // Fallback 1: Trích xuất từ tên của Sink (VD: alsa_output.pci-0000_00_1f.3.analog-stereo -> analog-stereo)
        if (!profileName && activeSink.name) {
            const parts = activeSink.name.split('.');
            profileName = parts[parts.length - 1]; // Lấy phần đuôi
        }

        // Fallback 2: Nếu vẫn không tìm thấy, mặc định là analog-stereo
        if (!profileName) {
            profileName = 'analog-stereo';
        }

        // 3. Tạo chuỗi profile đầy đủ bao gồm Micro input
        const fullProfileStr = `output:${profileName}+input:analog-stereo`;

        // 4. Tạo instance AudioProfile an toàn
        const profileDescription = props['device.profile.description'] || profileName;
        const audioProfile = new AudioProfile(cardName, fullProfileStr, profileDescription);

        // 5. Trả về AudioInfo
        return new AudioInfo(
            activeSink.name || 'Unknown Sink',
            props['device.description'] || activeSink.description || 'Built-in Audio',
            audioProfile, // Đảm bảo luôn gán đúng instance
            activeSink.index ?? 0
        );
    }

    /**
     * Get all HDMI & Analog Profile available in audio card
     * @returns {Promise<AudioProfile[]}
     */
    static async getAvailableProfiles() {
        const stdout = await this._execCommand('pactl @json list cards');
        const cards = JSON.parse(stdout);
        const primaryCard = cards[0];

        if (!primaryCard) return [];

        const availableProfiles = [];

        primaryCard.profiles.forEach(p => {
            // Get available output profiles
            if (p.name.startsWith('output:') && p.available !== false) {
                // Include mic input to not lost micro when switch
                const fullProfileName = `${p.name}+input:analog-stereo`;

                availableProfiles.push(
                    new AudioProfile(primaryCard.name, fullProfileName, p.description) 
                );                
            }
        });

        return availableProfiles;
    }

    /**
     * Switch audio output by AudioProfile
     * @param {AudioProfile} audioProfile
     * @returns {Promise<boolean>}
     */
    static async switchProfile(audioProfile) {
        if (!(audioProfile instanceof AudioProfile)) {
            throw new Error('');
        }

        const command = `pactl set-card-profile ${audioProfile.card} ${audioProfile.profile}`;
        await this._execCommand(command);
        return true;
    }
}