#include <iostream>
#include "header/AudioProfile.h"

const AudioProfile analog {
    "alsa_card.pci-0000_00_1f.3", 
    "output:analog-stereo+input:analog-stereo"
};

const AudioProfile hdmi {
    "alsa_card.pci-0000_00_1f.3", 
    "output:hdmi-stereo"
};

bool switchAudioOutput(const AudioProfile& profile) {

}