var WebSocketServer = require('websocket').server;
var http = require('http');
var mysql = require('mysql');

var auth_slave = "9xAb3yhJA93hkbOprrw2gG30186km8jg9";
var auth_userclient = "68hv7Et8gj9fL35g9c8kO3lfoc7j5Klnm";

var clients = [];

function client () {
    this.type = null;
    this.auth = -1;
    this.state = "";
    this.conn = null;
    this.ipaddr = null;
    this.unid = null;
    this.index = clients.push(this) - 1;
    return this;
}

function client_find_index (connid) {
    for(var x = 0; x < clients.length; x++) {
        if(clients[x].conn.id == connid)
            return x;
    }
    return -1;
}
function getUniqueID () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

function generate_uuid () {
    var gr = ['A', 'B', 'C', 'D', 'E', 'F', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    var str = "";
    for(var x = 0; x < 64; x++) {
        str += gr[Math.floor(Math.random() * gr.length)];
    }
    return str;
}

function client_send (message, mode = "ALL", client_id) {
    if(mode == "ALL") {
        for(var x = 0; x < clients.length; x++) {
            if(clients[x].type == null)
                continue;
        
            clients[x].conn.send(message);

        }
    }
    else if(mode == "WEB") {
        for(var x = 0; x < clients.length; x++) {
            if(clients[x].type == null)
                continue;
            
            if(clients[x].type == "WB") {
                clients[x].conn.send(message);
            }

        }
    }
    else if(mode == "SINGLE") {
        for(var x = 0; x < clients.length; x++) {
            if(clients[x].unid == client_id) {
                clients[x].conn.send(message);
                break;
            }
        }
    }
}

function parse_message (cli, message) {
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
                var splt_addr = cli.conn.remoteAddress.split(":");
                cli.ipaddr = splt_addr[splt_addr.length - 1];
                // Mac address is obsolete
                // cli.mac = jsn['mac'];
                if(!jsn['unid']) {
                    // Old tx
                    var out_uuid = generate_uuid();
                    con.query("INSERT INTO slave (ip_addr, uni_id) VALUES ('"+cli.ipaddr+"', '"+out_uuid+"')");
                    var jt = {
                        "cmd": "AUTH",
                        "cb": "OK_NEW",
                        "uuid": out_uuid
                    };
                    console.log("NEW SLAVE!");
                    cli.conn.send(JSON.stringify(jt));
                }
                else {
                    cli.unid = jsn['unid'];
                    con.query("SELECT * FROM slave WHERE uni_id='" + cli.unid + "'", function (err, result, fields) {
                        if(err || result.length == 0) {
                            // NOT FOUND -- DROP CLIENT
                            console.log("FAKE SLAVE! >:(");
                            cli.conn.close();
                        }
                        else {
                            var uuid = result[0].uni_id;
                            con.query("UPDATE slave SET ip_addr = '"+cli.ipaddr+"' WHERE uni_id = '" + uuid + "'");
                            console.log("OLD SLAVE!");
                            var jt = {
                                "cmd": "AUTH",
                                "cb": "OK"
                            };
                            cli.conn.send(JSON.stringify(jt));
                        }
                    });
                }

                return true;
            }
            else if(jsn['auth'] == auth_userclient) {
                // Connection is a web interface user
                cli.type = "WB";
                cli.state = "AUTHORIZED";
                cli.auth = 1;
                cli.unid = getUniqueID();
                var jt = {
                    "cmd": "AUTH",
                    "cb": "AUTH_OK",
                    "ses_id": cli.unid
                };
                cli.conn.send(JSON.stringify(jt));
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
        if(jsn['cmd'] == "DATA") {

            if(jsn['type'] == "MEM") {
                // RECEIVE MEMORY
                var rt = {
                    "cmd": "FREEM",
                    "data": jsn['data'],
                    "pkey": cli.unid,
                    "ip": cli.ipaddr
                };
                client_send(JSON.stringify(rt), "WEB")
            }
            else if(jsn['type'] == "CPU") {
                
                var rt = {
                    "cmd": "CPU",
                    "data": jsn['data'],
                    "pkey": cli.unid,
                    "ip": cli.ipaddr
                };
                client_send(JSON.stringify(rt), "WEB");
            }
            else if(jsn['type'] == "SERVICE") {
                var rt = {
                    "cmd": "SERVICE",
                    "data": {
                        "service": jsn['service'],
                        "status": jsn['status']
                    },
                    "pkey": cli.unid,
                    "ip": cli.ipaddr
                };
                client_send(JSON.stringify(rt), "WEB");
            }
        }
    }
    else if(cli.type == "WB") {
        if(jsn['cmd'] == "REQ") {
            var rt = {
                "cmd": "REQ",
                "req": jsn['req']
            };
            client_send(JSON.stringify(rt), "SINGLE", jsn['pkey']);

        }
    }

}


var con = mysql.createConnection({
    host: "localhost",
    user: "observeruser",
    password: "obspass123", // Change this to match your mysql password
    database: "observerdb"
});

console.log("Starting Observer-server...");
console.log("Date: " + new Date());
con.connect(function(err) {
    if (err) throw err;
    console.log("MySQL:     [OK]");
});

var server = http.createServer(function(request, response) {

});
server.listen(6152, function() { console.log("TCP:      [OK]"); });

wsServer = new WebSocketServer({
    httpServer: server
});


function handle_on_m (cli) {
    cli.conn.on('message', function(message) {
        if(message.type === 'binary') {

        }
        else if (message.type === 'utf8') {
            parse_message(cli, message.utf8Data);
        }
        
    });
    cli.conn.on('close', function(connection) {
        console.log("client dc");
        clients.splice(cli.index, 1);
    });
}

function handle_req (req) {
    let cli = new client();
    cli.conn = req.accept(null, req.origin)
    handle_on_m(cli);
}


wsServer.on('request', function(request) {
    
    handle_req(request);
});