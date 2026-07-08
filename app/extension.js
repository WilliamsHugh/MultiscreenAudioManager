import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import GLib from 'gi://GLib';

export default class MultiScreenAudioManager extends Extension {
    enable() {
        console.log(`[${this.uuid}] Extension đã kích hoạt!`);
        this._trackedWindows = new Map();

        // 1. Lắng nghe khi có cửa sổ mới được tạo ra
        this._windowCreatedId = global.display.connect('window-created', (display, window) => {
            this._trackWindowSignals(window);
        });

        // 2. Theo dõi các cửa sổ đang mở sẵn trên máy khi vừa bật Extension
        let currentWindows = global.display.get_tab_list(0, null);
        for (let window of currentWindows) {
            this._trackWindowSignals(window);
        }
    }

    _trackWindowSignals(window) {
        if (this._trackedWindows.has(window)) return;

        let signalIds = [];
        let lastMonitor = window.get_monitor();

        // TÍN HIỆU 1: Theo dõi khi cửa sổ di chuyển hoặc thay đổi kích thước
        let posId = window.connect('position-changed', (win) => {
            let currentMonitor = win.get_monitor();
            
            // Kỹ thuật tối ưu: Chỉ xử lý khi cửa sổ thực sự lọt sang màn hình khác
            if (currentMonitor !== lastMonitor) {
                lastMonitor = currentMonitor;
                console.log(`[${this.uuid}] Cửa sổ "${win.get_title()}" vừa nhảy sang Màn hình số: ${currentMonitor}`);
                
                // --- ĐÂY LÀ NƠI BẠN GỌI LỆNH ĐỔI NGUỒN ÂM THANH ---
                // Ví dụ chạy lệnh ngầm đổi nguồn:
                // GLib.spawn_command_line_async('wpctl set-default <ID>');
            }
        });
        signalIds.push(posId);

        // TÍN HIỆU 2: Theo dõi khi cửa sổ bị đóng (Bắt buộc để tránh rò rỉ bộ nhớ)
        let unmanagedId = window.connect('unmanaged', (win) => {
            this._untrackWindow(win);
        });
        signalIds.push(unmanagedId);

        this._trackedWindows.set(window, signalIds);
    }

    _untrackWindow(window) {
        if (this._trackedWindows.has(window)) {
            let signalIds = this._trackedWindows.get(window);
            for (let id of signalIds) {
                window.disconnect(id);
            }
            this._trackedWindows.delete(window);
            console.log(`[${this.uuid}] Đã ngừng theo dõi một cửa sổ vừa đóng.`);
        }
    }

    disable() {
        // DỌN DẸP HỆ THỐNG KHI TẮT EXTENSION
        if (this._windowCreatedId) {
            global.display.disconnect(this._windowCreatedId);
            this._windowCreatedId = null;
        }

        for (let [window, signalIds] of this._trackedWindows.entries()) {
            for (let id of signalIds) {
                window.disconnect(id);
            }
        }
        this._trackedWindows.clear();
        this._trackedWindows = null;
        console.log(`[${this.uuid}] Extension đã tắt hoàn toàn.`);
    }
}
