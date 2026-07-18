export default class WindowInfo {
    constructor(id, pid, title, monitor, workspace, wmClass) {
        this.id = id;
        this.pid = pid;
        this.title = title;
        this.monitor = monitor;
        this.workspace = workspace;
        this.wmClass = wmClass;

        Object.freeze(this);
    }

    static fromMetaWindow(window) {
        return new WindowInfo(
            window.get_id(),
            window.get_pid(),
            window.get_title(),
            window.get_monitor(),
            window.get_workspace()?.index() ?? -1,
            window.get_wm_class?.() ?? ""
        );
    }
}