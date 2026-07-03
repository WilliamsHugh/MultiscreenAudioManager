#include <iostream>
#include <vector>
#include <string>
#include <X11/Xlib.h>
#include <X11/extensions/Xrandr.h>

using namespace std;

struct MonitorInfo {
    string name;
    int x;
    int y;
    int width;
    int height;
};

int main() {
    Display* dpy = XOpenDisplay(NULL);
    if (!dpy) {
        cerr << "Failed to open X display" << endl;
        return 1;
    }

    Window root = RootWindow(dpy, DefaultScreen(dpy));

    int num_monitors = 0;
    XRRMonitorInfo* monitors = XRRGetMonitors(dpy, root, True, &num_monitors);

    if (monitors == nullptr) {
        cerr << "Failed to get monitor information" << endl;
        XCloseDisplay(dpy);
        return 1;
    } else {
        cout << "Number of monitors: " << num_monitors << endl;
        vector<MonitorInfo> monitorInfos;
        for (int i = 0; i < num_monitors; ++i) {
            MonitorInfo info;
            info.name = XGetAtomName(dpy, monitors[i].name);
            info.x = monitors[i].x;
            info.y = monitors[i].y;
            info.width = monitors[i].width;
            info.height = monitors[i].height;
            monitorInfos.push_back(info);
        }
        for (const auto& info : monitorInfos) {
            cout << "Monitor: " << info.name << endl;
            cout << "  Position: (" << info.x << ", " << info.y << ")" << endl;
            cout << "  Size: " << info.width << "x" << info.height << endl;
        }
    }
    XCloseDisplay(dpy);
}