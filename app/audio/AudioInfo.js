export default class AudioInfo {
    /**
     * 
     * @param {string} sinkName - full name of Sink (ex: 'alsa_output.pci-0000_00_1f.3.hdmi-stereo')
     * @param {string} device
     * @param {AudioProfile} profile - current AudioProfile
     * @param {number|string} pid - Sink ID or Process ID
     */
    constructor(
        sinkName, 
        device,
        profile,
        pid
    ) {
        this.sinkName = sinkName;
        this.device = device;
        this.profile = profile;
        this.pid = pid;

        Object.freeze(this);
    }
}