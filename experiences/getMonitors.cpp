#include <iostream>
#include <string>

#include "getMonitors.h"

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

void getMonitors() {
    Display* dpy = XOpenDisplay(NULL);
    if (!dpy) {
        cerr << "Failed to open X display" << endl;
    }

    Window root = RootWindow(dpy, DefaultScreen(dpy));

    int num_monitors = 0;
    XRRMonitorInfo* monitors = XRRGetMonitors(dpy, root, True, &num_monitors);

    if (monitors == NULL) {
        cerr << "Failed to get monitor information" << endl;
        XCloseDisplay(dpy);
    } else {
        cout << "Number of monitors: " << num_monitors << endl;
        for (int i = 0; i < num_monitors; ++i) {
            MonitorInfo info;
            info.name = XGetAtomName(dpy, monitors[i].name);
            info.x = monitors[i].x;
            info.y = monitors[i].y;
            info.width = monitors[i].width;
            info.height = monitors[i].height;

            cout << "Monitor " << i + 1 << ":" << info.name << endl;
            cout << "Position: (" << info.x << ", " << info.y << ")" << endl;
            cout << "Size: " << info.width << "x" << info.height << endl;
        }
    }

    XCloseDisplay(dpy);
}