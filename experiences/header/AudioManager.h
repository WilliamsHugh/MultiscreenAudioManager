// AudioManager.h
#pragma once

#include "AudioProfile.h"

extern const AudioProfile analog;
extern const AudioProfile hdmi;

bool switchAudioOutput(const AudioProfile& profile);
bool switchAudioOutput(const AudioProfile& profile);