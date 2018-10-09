var WebSocketServer = require('websocket').server;
var http = require('http');
//var mysql = require('mysql');

var auth_slave = "9xAb3yhJA93hkbOprrw2gG30186km8jg9";
var auth_userclient = "68hv7Et8gj9fL35g9c8kO3lfoc7j5Klnm";

var clients = [];

function client () {
    this.type = null;
    this.auth = -1;
    this.state = "";
    this.conn = null;
    this.mac = null;
    this.index = clients.push(this) - 1;
    return this;
}

function client_find_index (conn) {
    for(var x = 0; x < clients.length; x++) {
        if(clients[x].conn == conn)
            return x;
    }
    return -1;
}

function generate_uuid () {
    var gr = ['A', 'B', 'C', 'D', 'E', 'F', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    var str = "";
    for(var x = 0; x < 64; x++) {
        str += gr[Math.floor(Math.random() * gr.length)];
    }
    return str;
}

function parse_message (cli, message) {
    console.log("MESSAGE: " + message + "\n**************************END");
    var jsn = JSON.parse(message);
    if(jsn == null)
        return false;

    if(cli.auth < 0) {

        if(jsn['cmd'] == 'AUTH') {
            if(jsn['auth'] == auth_slave) {
                // Connection is a transmitter
                cli.type = "TX";
                cli.state = "AUTHORIZED";
                cli.auth = 1;
                cli.mac = jsn['mac'];
                /*
                con.query("SELECT * FROM slave WHERE mac_addr='" + jsn['mac'] + "'", function (err, result, fields) {
                    if(err || result.length == 0) {
                        var out_uuid = generate_uuid();
                        con.query("INSERT INTO slave (mac_addr, ip_addr, unique_id) VALUES ('"+jsn['mac']+"', '"+jsn['ip']+"', '"+out_uuid+"')");
                        var jt = {
                            "cmd": "AUTH",
                            "cb": "OK_NEW",
                            "uuid": out_uuid
                        };
                        cli.conn.send(JSON.stringify(jt));
                    }
                    else {
                        var uuid = result[0].uni_id;
                        // TODO: Check UUID --
                        var jt = {
                            "cmd": "AUTH",
                            "cb": "OK",
                            "uuid": uuid
                        };
                        cli.conn.send(JSON.stringify(jt));
                    }
                });
                */
                // FOR TESTING ---- REMOVE LATER
                var out_uuid = generate_uuid();
                var jt = {
                    "cmd": "AUTH",
                    "cb": "OK_NEW",
                    "uuid": out_uuid
                };
                cli.conn.send(JSON.stringify(jt));
                return true;
            }
            else if(jsn['auth'] == auth_userclient) {
                // Connection is a web interface user
                cli.type = "WB";
                cli.state = "AUTHORIZED";
                cli.auth = 1;
                return true;
            }
            else {
                console.log("Client authorization error. Dropping.");
                cli.conn.close();
                return true;
            }
        }
        else {
            cli.conn.send("{\"cmd\":\"AUTH\",\"resp\":-1}");
            return true;
        }
    }
    if(cli.type == "TX") {
        if(jsn['cmd'] == "SERVICE_STATUS") {
            if(jsn['services'] == "*") {
                // Status of all registered services
                
            }
        }
        // Testing 
        else if(jsn['cmd'] == "FREEM_TEST") {
            // Send values to Web Clients
            for(var x = 0; x < clients.length; x++) {
                if(clients[x].type == null)
                    continue;
                
                if(clients[x].type == "WB") {
                    var rt = {
                        "cmd": "FREEM",
                        "data": jsn['data'],
                        "client": clients[x].mac
                    };
                    clients[x].conn.send(JSON.stringify(rt));
                }

            }
        }
    }

}

/*
var con = mysql.createConnection({
    host: "localhost",
    user: "observeruser",
    password: "obspass123", // Change this to match your mysql password
    database: "observerdb"
});


con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});
*/
var server = http.createServer(function(request, response) {

});
server.listen(6152, function() { });

wsServer = new WebSocketServer({
    httpServer: server
});


wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);
    var cli = new client();
    cli.conn = connection;
    connection.on('message', function(message) {
        if(message.type === 'binary') {

        }
        else if (message.type === 'utf8') {
            parse_message(cli, message.utf8Data);
        }
        
    });

    connection.on('close', function(connection) {
        clients.splice(cli.index, 1);
    });
});