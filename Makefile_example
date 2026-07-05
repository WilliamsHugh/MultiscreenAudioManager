# ============================================================================
# Makefile for MultiscreenAudioManager
# ============================================================================

# Compiler
CC := g++
CFLAGS := -std=c++17 -Wall -Wextra -O2

# pkg-config for libraries
PULSE_CFLAGS := $(shell pkg-config --cflags libpulse 2>/dev/null || echo "")
PULSE_LIBS := $(shell pkg-config --libs libpulse 2>/dev/null || echo "-lpulse")

X11_CFLAGS := $(shell pkg-config --cflags x11 2>/dev/null || echo "")
X11_LIBS := $(shell pkg-config --libs x11 2>/dev/null || echo "-lX11")

XRANDR_CFLAGS := $(shell pkg-config --cflags xrandr 2>/dev/null || echo "")
XRANDR_LIBS := $(shell pkg-config --libs xrandr 2>/dev/null || echo "-lxrandr")

# Combine all flags
CFLAGS += $(PULSE_CFLAGS) $(X11_CFLAGS) $(XRANDR_CFLAGS)
LIBS := $(PULSE_LIBS) $(X11_LIBS) $(XRANDR_LIBS)

# Directories
SRC_DIR := .
EXP_DIR := experiences
HEADER_DIR := $(EXP_DIR)/header
BUILD_DIR := build
BIN_NAME := main

# Source files
SOURCES := $(SRC_DIR)/main.cpp \
           $(EXP_DIR)/getMonitors.cpp \
           $(EXP_DIR)/getWindows.cpp

# Object files
OBJECTS := $(SOURCES:%.cpp=$(BUILD_DIR)/%.o)

# Includes
INCLUDES := -I$(HEADER_DIR)

# Debug flags
DEBUG_FLAGS := -g -O0 -DDEBUG

# ============================================================================
# PHONY TARGETS
# ============================================================================

.PHONY: all build run clean install help debug rebuild check-deps

# ============================================================================
# DEFAULT TARGET
# ============================================================================

all: build

# ============================================================================
# CHECK DEPENDENCIES
# ============================================================================

check-deps:
	@echo "🔍 Checking dependencies..."
	@pkg-config --exists libpulse && echo "✓ libpulse found" || echo "✗ libpulse NOT found (install: sudo apt install libpulse-dev)"
	@pkg-config --exists x11 && echo "✓ x11 found" || echo "✗ x11 NOT found (install: sudo apt install libx11-dev)"
	@pkg-config --exists xrandr && echo "✓ xrandr found" || echo "✗ xrandr NOT found (install: sudo apt install libxrandr-dev)"
	@echo ""

# ============================================================================
# BUILD TARGETS
# ============================================================================

build: check-deps $(BIN_NAME)
	@echo "✓ Build complete: $(BIN_NAME)"

$(BIN_NAME): $(OBJECTS)
	@echo "🔗 Linking..."
	@$(CC) $(CFLAGS) -o $@ $^ $(LIBS)
	@echo "✓ Executable created: $@"

# Compile individual object files
$(BUILD_DIR)/%.o: %.cpp
	@mkdir -p $(dir $@)
	@echo "📝 Compiling: $<"
	@$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

# ============================================================================
# RUN TARGETS
# ============================================================================

run: build
	@echo "🚀 Running..."
	@./$(BIN_NAME)

debug: CFLAGS += $(DEBUG_FLAGS)
debug: clean build
	@echo "🐛 Debug build complete"
	@echo "Run: ./$(BIN_NAME)"

# ============================================================================
# UTILITY TARGETS
# ============================================================================

clean:
	@echo "🧹 Cleaning..."
	@rm -rf $(BUILD_DIR)
	@rm -f $(BIN_NAME)
	@echo "✓ Clean complete"

rebuild: clean build
	@echo "✓ Rebuild complete"

install: build
	@echo "📦 Installing..."
	@sudo cp $(BIN_NAME) /usr/local/bin/
	@sudo chmod +x /usr/local/bin/$(BIN_NAME)
	@echo "✓ Installed to /usr/local/bin/$(BIN_NAME)"
	@echo "Run: $(BIN_NAME)"

uninstall:
	@echo "🗑️  Uninstalling..."
	@sudo rm -f /usr/local/bin/$(BIN_NAME)
	@echo "✓ Uninstalled"

# ============================================================================
# INFO TARGETS
# ============================================================================

info:
	@echo "=== MultiscreenAudioManager Build Info ==="
	@echo "Compiler: $(CC)"
	@echo "CFLAGS: $(CFLAGS)"
	@echo "LIBS: $(LIBS)"
	@echo "Source files:"
	@echo "  $(SOURCES)"
	@echo "Binary: $(BIN_NAME)"
	@echo ""

help:
	@echo "╔════════════════════════════════════════════════════════════════╗"
	@echo "║        MultiscreenAudioManager - Makefile Commands             ║"
	@echo "╚════════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "📋 Build Commands:"
	@echo "  make              - Build the project"
	@echo "  make build        - Same as make"
	@echo "  make rebuild      - Clean and rebuild"
	@echo ""
	@echo "🚀 Run Commands:"
	@echo "  make run          - Build and run"
	@echo "  make debug        - Build with debug symbols and run"
	@echo ""
	@echo "🧹 Cleanup:"
	@echo "  make clean        - Remove build artifacts"
	@echo ""
	@echo "📦 Installation:"
	@echo "  make install      - Install binary to /usr/local/bin"
	@echo "  make uninstall    - Remove from /usr/local/bin"
	@echo ""
	@echo "🔧 Maintenance:"
	@echo "  make check-deps   - Check if dependencies are installed"
	@echo ""
	@echo "ℹ️  Info:"
	@echo "  make info         - Show build configuration"
	@echo "  make help         - Show this message"
	@echo ""

# ============================================================================
# DEFAULT HELP
# ============================================================================

.DEFAULT:
	@echo "❌ Unknown target: $@"
	@echo "Run 'make help' for available commands"