#include <iostream>
#include <stdio.h>
#include "../tinyws/src/websocket.h"
#include <array>
#include <algorithm>
#include <fstream>
#include "json.hpp"

#define AUTH_KEY "9xAb3yhJA93hkbOprrw2gG30186km8jg9"
#define TEST_MAC_ADDR "A0-73-B5-16-00-C0"

struct websocket *w;

void onmessage (char *data, uint16_t length) {
    printf("%s\n", data);
    // Parse message here
    json::JSON jns = json::JSON::Load(std::string(data));
    if(jns.hasKey("cmd")) {
        if(jns["cmd"].ToString() == "AUTH") {
            if(jns["cb"].ToString() == "OK_NEW") {
                std::ofstream f;
                f.open(".obsc_conf");
                f << jns["uuid"].ToString();
                f.close();
            }
        }
    }
}

bool file_exists(const char *fileName) {
    std::ifstream infile(fileName);
    return infile.good();
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

void transmit_cpu () {
    json::JSON jm;
    //std::string ab = exec_comm("free -m |grep Mem", NULL);
    float total_usg = std::atof(exec_comm("awk -v a=\"$(awk '/cpu /{print $2+$4,$2+$4+$5}' /proc/stat; sleep 1)\" '/cpu /{split(a,b,\" \"); print 100*($2+$4-b[1])/($2+$4+$5-b[2])}'  /proc/stat", NULL).c_str());
    jm["cmd"] = "DATA";
    jm["type"] = "CPU";
    jm["data"]["us"] = total_usg;
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
    if(file_exists(".obsc_conf")) {
        std::string unikey = "";
        std::ifstream is(".obsc_conf");

        char c;
        while (is.get(c)) {
            if(c == '\n' || c == '\t' || c == ' ')
                continue;
            unikey += c;
        }
        jn["unid"] = unikey;

    }
    std::string auth_msg = jn.dump(0, "");
    WS_send(w, (char*)auth_msg.c_str(), auth_msg.size(), TEXT);
    while(1) {
        sleep(1);
        transmit_memory();
        transmit_cpu();
    }
    return 0;
}
