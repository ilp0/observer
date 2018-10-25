#include <iostream>
#include <stdio.h>
#include "../tinyws/src/websocket.h"
#include <array>
#include <algorithm>
#include <fstream>
#include <sstream>
#include "json.hpp"
#include <netdb.h>

#define AUTH_KEY "9xAb3yhJA93hkbOprrw2gG30186km8jg9"
#define TEST_MAC_ADDR "A0-73-B5-16-00-C0"

struct tx_conf {
    std::string ip = "127.0.0.1";
    int port = 6152;
    std::string key_location = "/etc/observer/";
    bool isHP = false;
} config;

struct websocket *w;
std::string exec_comm (std::string cmd, int *returncode);
void transmit_service_status (std::string service);
void transmit_cpu ();
void transmit_memory ();
void transmit_temp_hp ();

void onmessage (char *data, uint16_t length) {
    printf("%s\n", data);
    // Parse message here
    json::JSON jns = json::JSON::Load(std::string(data));
    if(jns.hasKey("cmd")) {
        if(jns["cmd"].ToString() == "AUTH") {
            if(jns["cb"].ToString() == "OK_NEW") {
                std::ofstream f(std::string(config.key_location + ".obsc_conf"), std::ofstream::out);
                f << jns["uuid"].ToString();
                f.close();
                printf("Finished writing to file\n");
            }
        }
        else if(jns["cmd"].ToString() == "REQ") {
            if(jns["req"].ToString() == "SERVICE_STATUS") {
                transmit_service_status(jns["service"].ToString());
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

void transmit_service_status (std::string service) {
    json::JSON jm;

    jm["cmd"] = "SERVICE";
    jm["service"] = service;

    std::string data = exec_comm("systemctl status "+service+" |grep Active: |awk '{print $2}'", NULL);
    jm["status"] = data;
    std::string o = jm.dump(0, "");
    WS_send(w, (char*)o.c_str(), o.size(), TEXT);
}

void transmit_temp_hp(){
    json::JSON jm;
    int ambient = std::atoi(exec_comm("hpasmcli -s \"show temp\" | grep \"AMBIENT\" | awk -F \" \" '{print +$3}'", NULL).c_str());
    int mb = std::atoi(exec_comm("hpasmcli -s \"show temp\" | grep \"#29\" | awk -F \" \" '{print +$3}'", NULL).c_str());
    int processor = std::atoi(exec_comm("hpasmcli -s \"show temp\" | grep \"#2\" | grep \"179F\" | awk -F \" \" '{print +$3}'", NULL).c_str());
    jm["cmd"] = "DATA";
    jm["type"] = "HP_TEMP";
    jm["data"]["ambient"] = ambient;
    jm["data"]["mb"] = mb;
    jm["data"]["processor"] = processor;
    std::string o = jm.dump(0, "");
    WS_send(w, (char*)o.c_str(), o.size(), TEXT);
}

bool hostname_to_ip(const char * hostname , char* ip)
{
    struct hostent *he;
    struct in_addr **addr_list;
    int i;
         
    if ( (he = gethostbyname( hostname ) ) == NULL) 
    {
        // get the host info
        herror("gethostbyname");
        return 1;
    }
 
    addr_list = (struct in_addr **) he->h_addr_list;
     
    for(i = 0; addr_list[i] != NULL; i++) 
    {
        //Return the first one;
        strcpy(ip , inet_ntoa(*addr_list[i]) );
        return 0;
    }
     
    return 1;
}

bool read_conf () {
    std::ifstream infile("/etc/observer/obs.conf");
    std::string line;
    while (std::getline(infile, line))
    {
        
        std::string key = "";
        std::string value = "";
        int ix = 0;
        while(ix < line.size() && (line[ix] == ' ' || line[ix] == '\t')) {
            if(line[ix] == '#')
                goto _comment;
            ix++;
        }
        while(ix < line.size() && (line[ix] != ' ' && line[ix] != '\t' && line[ix] != ':')) {
            if(line[ix] == '#')
                goto _comment;
            key += line[ix];
            ix++;
        }
        while(ix < line.size() && (line[ix] == ' ' || line[ix] == '\t' || line[ix] == ':')) {
            if(line[ix] == '#')
                goto _comment;
            ix++;
        }
        while(ix < line.size() && (line[ix] != ' ' && line[ix] != '\t' && line[ix] != ':')) {
            if(line[ix] == '#')
                goto _comment;
            value += line[ix];
            ix++;
        }
        while(ix < line.size() && (line[ix] != ' ' && line[ix] != '\t' && line[ix] != ':')) {
            if(line[ix] == '#')
                goto _comment;
            value += line[ix];
            ix++;
        }
        _comment:
        if(key != "") {
            if(key == "SERVER" || key == "server") {
                char ip[100] = { 0 };
                hostname_to_ip(value.c_str(), ip);
                config.ip = ip;
                printf("Config: Set & resolved %s as %s\n", value.c_str(), config.ip.c_str());
                continue;
            }
            else if(key == "PORT" || key == "port") {
                printf("Config: Set server port to %s\n", value.c_str());
                config.port = std::atoi(value.c_str());
                continue;
            }
            else if(key == "KEY" || key == "key") {
                printf("Config: Set Key parent directory to %s\n", value.c_str());
                config.key_location = value;
                continue;
            } else if(key == "HPCLIENABLED" || key == "hpclienabled") {
                printf("HP TOOLS ENABLED");
                if(value == "true" ) config.isHP = true;
                continue;
            }
            else {
                printf("Config: Unknown key %s\n", key.c_str());
            }
        }
    }
    infile.close();
}

int main () {
    read_conf();
    
    w = WS((char*)config.ip.c_str(), config.port, NULL, NULL, NULL);
    if(w == NULL) {
        printf("WS Connection not established\n");
        return 1;
    }
    w->onmessage = onmessage;
    
    json::JSON jn;
    jn["cmd"] = "AUTH";
    jn["auth"] = AUTH_KEY;
    jn["mac"] = TEST_MAC_ADDR;
    if(file_exists(std::string(config.key_location + ".obsc_conf").c_str())) {
        std::string unikey = "";
        std::ifstream is(config.key_location + ".obsc_conf");

        char c;
        while (is.get(c)) {
            if(c == '\n' || c == '\t' || c == ' ')
                continue;
            unikey += c;
        }
        if(unikey.size() > 31) {
            jn["unid"] = unikey;
        }

    }
    std::string auth_msg = jn.dump(0, "");
    WS_send(w, (char*)auth_msg.c_str(), auth_msg.size(), TEXT);
    while(1) {
        sleep(1);
        transmit_memory();
        transmit_cpu();
        if(config.isHP) transmit_temp_hp();
    }
    return 0;
}
