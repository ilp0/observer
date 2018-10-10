#include <iostream>
#include <stdio.h>
#include "../tinyws/src/websocket.h"
#include <array>
#include <algorithm>
#include "json.hpp"

#define AUTH_KEY "9xAb3yhJA93hkbOprrw2gG30186km8jg9"
#define TEST_MAC_ADDR "A0-73-B5-16-00-C0"

struct websocket *w;

void onmessage (char *data, uint16_t length) {
    printf("%s\n", data);
    // Parse message here
}

std::string exec_comm (std::string cmd, int *returncode) {
    std::string command(cmd + " 2>&1");

    std::array<char, 512> buffer;
    std::string result;

    FILE* pipe = popen(command.c_str(), "r");
    if (!pipe)
    {
        return ":F";
    }
    while (fgets(buffer.data(), 512, pipe) != NULL) {
        result += buffer.data();
    }
    std::string checked = "";
    for(int x = 0; x < result.size(); x++) {
        if((int)result[x] < 32 || (int)result[x] > 126)
            continue;

        checked += result[x];
    }
    int returnCode = pclose(pipe);

    if(returncode != NULL) {
        *returncode = returnCode;
    }
    return checked;
}

void transmit_memory () {
    json::JSON jm;
    //std::string ab = exec_comm("free -m |grep Mem", NULL);
    int total_memory = std::atoi(exec_comm("free -m |grep Mem |awk '{print $2}'", NULL).c_str());
    int used_memory = std::atoi(exec_comm("free -m |grep Mem |awk '{print $3}'", NULL).c_str());
    jm["cmd"] = "DATA";
    jm["type"] = "MEM";
    jm["data"]["tot"] = total_memory;
    jm["data"]["used"] = used_memory;
    std::string o = jm.dump(0, "");
    WS_send(w, (char*)o.c_str(), o.size(), TEXT);
}

int main () {
    w = WS((char*)"127.0.0.1", 6152, NULL, NULL, NULL);
    if(w == NULL) {
        printf("WS Connection not established\n");
        return 1;
    }
    w->onmessage = onmessage;
    json::JSON jn;
    jn["cmd"] = "AUTH";
    jn["auth"] = AUTH_KEY;
    jn["mac"] = TEST_MAC_ADDR;
    std::string auth_msg = jn.dump(0, "");
    WS_send(w, (char*)auth_msg.c_str(), auth_msg.size(), TEXT);
    while(1) {
        sleep(5);
        transmit_memory();
    }
    return 0;
}
