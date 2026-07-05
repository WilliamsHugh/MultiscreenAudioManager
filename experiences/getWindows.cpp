// experiences/getWindows.cpp

#include <iostream>
#include <X11/Xlib.h>
#include "header/getWindows.h"
using namespace std;

// Fix: Suppress warning bằng cách đánh dấu parameter không dùng
int handleXError([[maybe_unused]] Display* dpy, XErrorEvent* error) {
    if (error->error_code == BadWindow) return 0;
    return 0;
}

void getWindows() {
    Display* dpy = XOpenDisplay(NULL);
    if (!dpy) {
        cerr << "Failed to open display" << endl;
        return;
    }

    XSetErrorHandler(handleXError);
    
    Window root = DefaultRootWindow(dpy);
    Window parent;
    Window *children = NULL;
    unsigned int nchildren;

    if (XQueryTree(dpy, root, &root, &parent, &children, &nchildren) == 0) {
        cerr << "Failed to query window tree" << endl;
        XCloseDisplay(dpy);
        return;
    }

    cout << "Number of windows: " << nchildren << endl;

    for (unsigned int i = 0; i < nchildren; ++i) {
        XWindowAttributes attr;
        if (XGetWindowAttributes(dpy, children[i], &attr)) {
            if (attr.map_state == IsViewable) {
                char* window_name = NULL;
                XFetchName(dpy, children[i], &window_name);
                if (window_name) {
                    cout << "Window ID: " << children[i] << ", Name: " << window_name << endl;
                    XFree(window_name);
                }
            }
        }
    }

    if (children) {
        XFree(children);
    }

    XSetErrorHandler(NULL);
    XCloseDisplay(dpy);
}