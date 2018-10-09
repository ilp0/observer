#include <stdio.h>
#include "../tinyws/src/websocket.h"

struct websocket *w;
void send_mem () ;
void onmessage (char *data, uint16_t length) {
    printf("%s\n", data);
}


int main () {
    w = WS("127.0.0.1", 6152, NULL, NULL, NULL);
    if(w == NULL) {
        printf("WS Connection not established\n");
        return 1;
    }
    w->onmessage = onmessage;
    char *auth_message = "{\"cmd\":\"AUTH\",\"auth\":\"9xAb3yhJA93hkbOprrw2gG30186km8jg9\",\"mac\":\"A0-73-B5-16-00-C0\"}";
    WS_send(w, auth_message, strlen(auth_message), TEXT);
    while(1) {
        sleep(5);
        send_mem();
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

    char *t = "{\"cmd\":\"FREEM_TEST\",\"data\":\"Test: 351353151\"}";
    WS_send(w, t, strlen(t), TEXT);
}