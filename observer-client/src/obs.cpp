#include <iostream>
#include <stdio.h>
#include "../tinyws/src/websocket.h"
#include <array>
#include <algorithm>

struct websocket *w;
void send_mem () ;
void onmessage (char *data, uint16_t length) {
    printf("%s\n", data);
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

int main () {
    w = WS((char*)"127.0.0.1", 6152, NULL, NULL, NULL);
    if(w == NULL) {
        printf("WS Connection not established\n");
        return 1;
    }
    w->onmessage = onmessage;
    const char *auth_message = "{\"cmd\":\"AUTH\",\"auth\":\"9xAb3yhJA93hkbOprrw2gG30186km8jg9\",\"mac\":\"A0-73-B5-16-00-C0\"}";
    WS_send(w, (char*)auth_message, strlen(auth_message), TEXT);
    while(1) {
        sleep(5);
        std::string outs = "{\"cmd\":\"FREEM_TEST\",\"data\":\"";
        outs += exec_comm("free -m | grep Mem", NULL);
        outs += "\"}";
        WS_send(w, (char*)outs.c_str(), outs.size(), TEXT);
    }
    return 0;
}

void send_mem () {
    /*
    FILE *fp;
    char buff[512];

    fp = popen("free -m |grep Mem", "r");
    if (fp == NULL) {
        printf("Failed to run command\n" );
        return;
    }
    char c;
    int n;
    while ((c = fgetc(fp)) != EOF)
    {
        buff[n++] = (char) c;
    }
    buff[n] = 0;

    pclose(fp);
    char fbf[2048] = { 0 };
    sprintf(fbf, "{\"cmd\":\"FREEM_TEST\",\"data\":\"%s\"}", buff);
    printf("%s", fbf);
    */

    const char *t = "{\"cmd\":\"FREEM_TEST\",\"data\":\"Test: 351353151\"}";
    WS_send(w, (char*)t, strlen(t), TEXT);
}