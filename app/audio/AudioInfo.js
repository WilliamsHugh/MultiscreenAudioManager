export default class AudioInfo {
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