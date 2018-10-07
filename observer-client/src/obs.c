#include <stdio.h>
#include "../tinyws/src/websocket.h"

struct websocket *w;
void send_mem () ;
void onmessage (char *data, uint16_t length) {

}


int main () {
    w = WS("127.0.0.1", 8080, NULL, NULL, NULL);
    if(w == NULL) {
        printf("WS Connection not established\n");
        return 1;
    }
    w->onmessage = onmessage;
    while(1) {
        sleep(10);
        send_mem();
    }
    return 0;
}

void send_mem () {
    FILE *fp;
    char buff[2048];

    fp = popen("free -m", "r");
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

    /* close */
    pclose(fp);
    WS_send(w, buff, n, TEXT);
}