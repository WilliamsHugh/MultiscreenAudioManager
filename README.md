# Design Principles

This project follows a few core principles:

- Event-driven instead of polling whenever possible.
- Window state is the primary source of truth.
- Audio routing decisions are isolated inside the Rule Engine.
- System interaction is encapsulated inside dedicated managers.
- Each component has a single responsibility.
- The architecture should remain backend-agnostic to allow future PipeWire native integration.

# MultiScreen Audio Manager

> Automatically route application audio based on the monitor where its window is currently displayed.

## Overview

MultiScreen Audio Manager is a GNOME Shell extension that intelligently routes audio output according to the monitor containing an application's window.

Instead of forcing users to manually switch audio outputs whenever moving windows between monitors, this extension automatically detects window movements and updates the audio routing accordingly.

Example:

```
Monitor 0 (Laptop)
┌──────────────────────────────┐
│ VS Code                      │
│ Terminal                     │
└──────────────────────────────┘
          │
          ▼
Audio Output → Laptop Speakers


Monitor 1 (HDMI)
┌──────────────────────────────┐
│ Firefox (YouTube)            │
└──────────────────────────────┘
          │
          ▼
Audio Output → HDMI Monitor Speakers
```

---

# Motivation

Many users work with multiple monitors, each having its own built-in speakers.

Current Linux desktop environments only support one default audio output at a time.

As a result:

- Moving a browser window to another monitor does not move its audio.
- Users must manually switch audio devices.
- Multiple applications cannot naturally follow different monitors.

This project aims to solve that problem automatically.

---

# Goals

## Phase 1

Automatically switch the default audio output whenever a playing application's window moves to another monitor.

Example:

```
Firefox
Monitor 0
↓
Move window
↓
Monitor 1
↓
Automatically switch audio to HDMI
```

---

## Phase 2

Support per-application routing.

Example:

```
Firefox
→ HDMI

Spotify
→ Laptop Speaker

Discord
→ USB Headset
```

---

## Phase 3

Support multiple simultaneous audio outputs using PipeWire.

Example:

```
Firefox
→ HDMI

Spotify
→ Analog

Discord
→ USB Headset
```

---

# How It Works

```
WindowManager
        │
        ▼
Window moved
        │
        ▼
Get Window PID
        │
        ▼
AudioManager
        │
        ▼
Query PipeWire Streams
        │
        ▼
RuleEngine
        │
        ▼
Find Matching Audio Stream
        │
        ▼
RoutingConfig
        │
        ▼
Switch Output Device
```

---

# Architecture

```
multiscreen-audio/

metadata.json
extension.js

window/
    WindowManager.js

audio/
    AudioManager.js
    AudioSession.js

rules/
    RuleEngine.js

config/
    RoutingConfig.js

utils/
    Logger.js
```

---

# Components

## WindowManager

Responsible for interacting with GNOME Shell.

Responsibilities:

- Track active windows
- Detect newly created windows
- Detect closed windows
- Detect monitor changes
- Retrieve PID
- Retrieve workspace
- Retrieve monitor ID

---

## AudioManager

Responsible for interacting with PipeWire / PulseAudio.

Responsibilities:

- Query sink inputs
- Parse audio sessions
- Switch output device
- Execute pactl/wpctl commands

---

## RuleEngine

Core decision-making module.

Responsibilities:

- Match window PID with audio stream PID
- Determine target monitor
- Determine target output device
- Prevent unnecessary switching

---

## RoutingConfig

Stores monitor-to-device mappings.

Example:

```json
{
    "0": "analog",
    "1": "hdmi"
}
```

---

# Current Development Status

## Research Phase

- [x] X11 prototype
- [x] Window enumeration
- [x] Monitor enumeration
- [x] Audio switching with pactl
- [x] GNOME Shell API investigation
- [x] Window tracking using signals
- [x] PID retrieval
- [x] Looking Glass exploration

---

## Development Roadmap

### Milestone 1

Window tracking

- [ ] Track all existing windows
- [ ] Track newly created windows
- [ ] Detect window movement
- [ ] Detect window destruction

---

### Milestone 2

Window information

- [ ] PID
- [ ] Workspace
- [ ] Monitor
- [ ] Title

---

### Milestone 3

Audio Manager

- [ ] Parse sink inputs
- [ ] Parse PipeWire sessions
- [ ] Switch audio output

---

### Milestone 4

PID Matching

- [ ] Match Window ↔ Audio Session

---

### Milestone 5

Rule Engine

- [ ] Automatic routing

---

### Milestone 6

Configuration

- [ ] User configurable monitor mapping

---

### Milestone 7

Advanced Routing

- [ ] Per-application routing
- [ ] Multiple simultaneous outputs
- [ ] PipeWire native support

---

# Technologies

- JavaScript (GJS)
- GNOME Shell Extension API
- GLib
- Meta.Window
- PipeWire
- PulseAudio Compatibility Layer
- pactl
- wpctl

---

# Why GNOME Extension?

An early prototype was developed in C++ using X11.

However, modern GNOME runs primarily on Wayland, where applications cannot freely inspect or manipulate windows due to security restrictions.

GNOME Shell extensions have privileged access to Meta.Window objects, making them the most suitable platform for implementing monitor-aware audio routing.

---

# Future Ideas

- Per-browser-tab audio routing
- Notification-aware routing
- User-defined routing rules
- GUI configuration panel
- PipeWire native backend
- Multi-seat support

---
