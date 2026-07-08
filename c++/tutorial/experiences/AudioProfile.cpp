#include <iostream>
#include "header/AudioProfile.h"
#include <cstdlib>

const AudioProfile analog {
    "alsa_card.pci-0000_00_1f.3", 
    "output:analog-stereo+input:analog-stereo"
};

const AudioProfile hdmi {
    "alsa_card.pci-0000_00_1f.3", 
    "output:hdmi-stereo"
};

AudioProfile getCurrentAudioProfile() {
    std::string command = "pactl list short sinks";
    FILE* pipe = popen(command.c_str(), "r");

    if (!pipe) {
        std::cerr << "Failed to run command: " << command << std::endl;
        return AudioProfile{};
    } 

    std::string output = "";
    char buffer[128];

    while (fgets(buffer, sizeof(buffer), pipe) != nullptr) {
        output += buffer;
    }

    pclose(pipe);
    
    if (output.find("analog") != std::string::npos) {
        return analog;
    } else if (output.find("hdmi") != std::string::npos) {
        return hdmi;
    } else {
        std::cout << "No known audio profile found in output." << std::endl;
        throw std::runtime_error("No known audio profile found.");
    }
}

bool switchAudioOutput(const AudioProfile& profile) {
    AudioProfile currentProfile = getCurrentAudioProfile();

    if (currentProfile.card == profile.card && currentProfile.profile == profile.profile) {
        std::cout << "Already using the desired audio profile." << std::endl;
        return true;
    }

    std::string command = "pactl set-card-profile " + profile.card + " " + profile.profile;
    int result = system(command.c_str());
    return result == 0;
}