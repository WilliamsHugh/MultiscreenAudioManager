export default class AudioProfile {
    /**
     * 
     * @param {string} card - Card name (ex: 'alsa_card.pci-0000_00_1f.3)
     * @param {string} profile - profile id (ex: 'output:hdmi-stereo_+input:analog-stereo)
     */
    constructor(card, profile, description = '') {
        this.card = card;
        this.profile = profile;
        this.description = description || profile;

        Object.freeze(this);
    }

    isHDMI() {
        return this.profile.includes('hdmi');
    }

    isAnalog() {
        return this.profile.includes('analog');
    }
}