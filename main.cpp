#include <iostream>
#include "experiences/header/AudioProfile.h"

int main() {
    std::cout << "Enter audio profile (analog/hdmi): ";
    std::string input;
    std::cin >> input;

    if (input == "analog") {
        return switchAudioOutput(analog) ? 0 : 1;
    } else if (input == "hdmi") {
        return switchAudioOutput(hdmi) ? 0 : 1;
    } else {
        std::cerr << "Invalid audio profile specified." << std::endl;
        return 1;
    }
}