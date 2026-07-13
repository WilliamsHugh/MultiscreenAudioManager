# Design Principles

This project follows a few core principles:

- Event-driven instead of polling whenever possible.
- Window state is the primary source of truth.
- Audio routing decisions are isolated inside the Rule Engine.
- System interaction is encapsulated inside dedicated managers.
- Each component has a single responsibility.
- The architecture should remain backend-agnostic to allow future PipeWire native integration.
