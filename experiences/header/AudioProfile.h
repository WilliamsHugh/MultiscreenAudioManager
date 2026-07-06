// AudioProfile.h
#pragma once

#include <string>

struct AudioProfile {
    std::string card;
    std::string profile;
};

extern const AudioProfile analog;
extern const AudioProfile hdmi;

AudioProfile getCurrentAudioProfile();
bool switchAudioOutput(const AudioProfile& profile);