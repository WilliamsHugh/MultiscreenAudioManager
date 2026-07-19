export default class AudioProfile {
    constructor(card, profile) {
        this.card = card;
        this.profile = profile;

        Object.freeze(this);
    }
}