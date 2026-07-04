#include <iostream>
#include <X11/Xlib.h>
#include "header/getWindows.h"

using namespace std;

void getWindows() {
    Display* dpy = XOpenDisplay(NULL);
    if (!dpy) {
        cerr << "Failed to open display" << endl;
    }

    Window root = DefaultRootWindow(dpy);
    Window parent;
    Window *children;
    unsigned int nchildren;

    if (XQueryTree(dpy, root, &root, &parent, &children, &nchildren) == 0) {
        cerr << "Failed to query window tree" << endl;
        XCloseDisplay(dpy);
    }

    cout << "Number of windows: " << nchildren << endl;
    for (unsigned int i = 0; i < nchildren; ++i) {
        char* window_name = NULL;

        XFetchName(dpy, children[i], &window_name);
        if (window_name) {
            cout << "Window ID: " << children[i] << ", Name: " << window_name << endl;
            XFree(window_name);
        } else {
            cout << "Window ID: " << children[i] << ", Name: (none)" << endl;
        }
    }

    XFree(children);
    XCloseDisplay(dpy);
}