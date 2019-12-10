var WebSocketServer = require('websocket').server;
var http = require('http');
var mysql = require('mysql');
const { Expo } = require('expo-server-sdk');


var expo = new Expo();

// Slave authentication string
var auth_slave = "9xAb3yhJA93hkbOprrw2gG30186km8jg9";
// Web client authentication string
var auth_userclient = "68hv7Et8gj9fL35g9c8kO3lfoc7j5Klnm";

// Client array
var clients = [];

// Client object
function client () {
    this.type = null;
    this.auth = -1;
    this.state = "";
    this.conn = null;
    this.ipaddr = null;
    this.unid = null;
    this.pushtoken = null; // PUSH message token
    this.id_in_database = null;
    this.index = clients.push(this) - 1; // Push client to "clients" array
    // Data buffer
    this.buffer = {
        mem_us: [],
        cpu_us: [],
        t_cpu: [],
        t_amb: [],
        t_mb: [],
        pwr: []
    };
    // Buffer save timer
    this.buffer_timer = Math.floor(Date.now() / 1000) + 60;
    return this;
}

// Find client index helper
function client_find_index (connid) {
    for(var x = 0; x < clients.length; x++) {
        if(clients[x].conn.id == connid)
            return x;
    }
    return -1;
}

// Generates a temporary unique id for web client
function getUniqueID () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

// Generates the slave unique key, stored in /etc/observer/.obsc_conf
function generate_uuid () {
    var gr = ['A', 'B', 'C', 'D', 'E', 'F', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    var str = "";
    for(var x = 0; x < 64; x++) {
        str += gr[Math.floor(Math.random() * gr.length)];
    }
    return str;
}

function clients_push_message (body) {
    let messages = [];
    let tokens = [];
    for(let c of clients) {
        if(c.pushtoken != null) {
            // Prevent token duplicates
            if(tokens.includes(c.pushtoken))
                continue;
            
            messages.push({
                to: c.pushtoken,
                sound: 'default',
                body: body
            });
            console.log("Added client to push notification list!");
        }
    }
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
        try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
        } catch (error) {
        console.error(error);
        }
    }
    })();
}

// Send data to clients
function client_send (message, mode = "ALL", client_id) {
    // Broadcast all authenticated
    if(mode == "ALL") {
        for(var x = 0; x < clients.length; x++) {
            if(clients[x].type == null)
                continue;
        
            clients[x].conn.send(message);

        }
    }
    // Send to every web client
    else if(mode == "WEB") {
        for(var x = 0; x < clients.length; x++) {
            if(clients[x].type == null)
                continue;
            
            if(clients[x].type == "WB") {
                clients[x].conn.send(message);
            }

        }
    }
    // Send to every slave
    else if(mode == "SLAVES") {
        for(var x = 0; x < clients.length; x++) {
            if(clients[x].type == null)
                continue;
            
            if(clients[x].type == "TX") {
                clients[x].conn.send(message);
            }

        }
    }
    // Send to a single client
    else if(mode == "SINGLE") {
        for(var x = 0; x < clients.length; x++) {
            if(clients[x].unid == client_id) {
                clients[x].conn.send(message);
                break;
            }
        }
    }
}

// Message parser
function parse_message (cli, message) {
    var jsn = JSON.parse(message);
    if(jsn == null)
        return false;

    // Check if client should identify
    if(cli.auth < 0) {
        // Receiving client authorization
        if(jsn['cmd'] == 'AUTH') {
            // Slave authorization string
            if(jsn['auth'] == auth_slave) {
                // Setting client type, state and authorization status
                cli.type = "TX";
                cli.state = "AUTHORIZED";
                cli.auth = 1;

                // Getting IP address
                var splt_addr = cli.conn.remoteAddress.split(":");
                cli.ipaddr = splt_addr[splt_addr.length - 1];
                cli.friendlyname = jsn['hostname'];
                // Mac address is obsolete
                // cli.mac = jsn['mac'];
                if(!jsn['unid']) {
                    // Old tx
                    var out_uuid = generate_uuid();
                    con.query("INSERT INTO slave (ip_addr, uni_id, friendlyname) VALUES ("+con.escape(cli.ipaddr)+", "+con.escape(out_uuid)+", " + con.escape(cli.friendlyname) + ")", function (err, result, fields) {
                        if(err) {
                            console.log(err);
                        }
                    });

                    con.query("SELECT id FROM slave WHERE uni_id="+con.escape(out_uuid)+"", function (err, result, fields) {
                        if(!err && result.length != 0) {
                            cli.id_in_database = result[0].id;
                        }
                    });
                    // Response
                    var resp = {
                        "cmd": "AUTH",
                        "cb": "OK_NEW",
                        "uuid": out_uuid
                    };
                    console.log("NEW SLAVE!");
                    cli.unid = out_uuid;
                    cli.conn.send(JSON.stringify(resp));
                }
                else {
                    cli.unid = jsn['unid'];
                    con.query("SELECT * FROM slave WHERE uni_id=" + con.escape(cli.unid) + "", function (err, result, fields) {
                        if(err || result.length == 0) {
                            // NOT FOUND -- DROP CLIENT
                            console.log("Slave unique id not found from database, dropping...");
                            cli.conn.close();
                        }
                        else {
                            var uuid = result[0].uni_id;
                            cli.id_in_database = result[0].id;
                            cli.friendlyname = result[0].friendlyname;
                            con.query("UPDATE slave SET ip_addr = "+con.escape(cli.ipaddr)+" WHERE uni_id = " + con.escape(uuid) + "");
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
                cli.buffer.mem_us.push(jsn['data']['used']);
                client_send(JSON.stringify(rt), "WEB")
            }
            else if(jsn['type'] == "CPU") {
                
                var rt = {
                    "cmd": "CPU",
                    "data": jsn['data'],
                    "pkey": cli.unid,
                    "ip": cli.ipaddr
                };
                cli.buffer.cpu_us.push(jsn['data']['us']);
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
            else if(jsn['type'] == "HP_TEMP"){
                var rt = {
                    "cmd": "HP_TEMP",
                    "data": jsn['data'],
                    "pkey": cli.unid,
                    "ip": cli.ipaddr
                };
                cli.buffer.t_amb.push(jsn['data']['ambient']);
                cli.buffer.t_cpu.push(jsn['data']['cpu']);
                cli.buffer.t_mb.push(jsn['data']['mb']);
                client_send(JSON.stringify(rt), "WEB");
            }
            else if(jsn['type'] == "HP_PWRM"){
                var rt = {
                    "cmd": "HP_PWRM",
                    "data": jsn['data'],
                    "pkey": cli.unid,
                    "ip": cli.ipaddr
                };
                cli.buffer.pwr.push(jsn['data']['pwrm']);
                client_send(JSON.stringify(rt), "WEB");
            }
            // Timer check
            if(Math.floor(Date.now() / 1000) >= cli.buffer_timer) {
                db_save(cli);
            }
        }
        // Service change
        else if(jsn['cmd'] == "SERVICE_CHANGE") {
            var rt = {
                "cmd": "SERVICE_CHANGE",
                "service": jsn['service'],
                "status": jsn['status'],
                "pkey": cli.unid,
                "ip": cli.ipaddr
            };
            client_send(JSON.stringify(rt), "WEB");
            console.log("Service change detected!");
            con.query("INSERT INTO log (type, value, info, slave_id, timestamp) VALUES ('service_change', " + (jsn['status'] == 'active' ? 1 : 0) + ", " + con.escape(jsn['service']) + ", " + con.escape(cli.id_in_database) + ", CURRENT_TIMESTAMP)", function (err, result, fields) {
                if(err) {
                    console.log(err);
                }
            });
        }
    }
    else if(cli.type == "WB") {
        // service status
        if(jsn['cmd'] == "REQS") {
            var rt = {
                "cmd": "REQ",
                "req": "SERVICE",
                "service": jsn['service']
            };
            client_send(JSON.stringify(rt), "SINGLE", jsn['pkey']);

        } 
        else if (jsn['cmd'] == "REQH"){
            //Request history from database
            getHistory(jsn['pkey'], jsn['from'], jsn['type'], function (data) {
                var jt = {
                    "cmd": "REQH",
                    "data": data,
                    "type": jsn['type'],
                    "pkey": jsn['pkey']
                };
                client_send(JSON.stringify(jt), "SINGLE", cli.unid);
            });
            
        }
        else if (jsn['cmd'] == "MISC") {
            if(jsn['sub'] == "SERVERS") {
                var slvs = [];
                con.query("SELECT * FROM slave", function (err, result, fields) {
                    con.query("SELECT slave_id, info, value FROM log WHERE type = 'service_change' AND id IN (SELECT MAX(id) FROM log GROUP BY info, slave_id)", function (ex, rx, fx) {
                        for(var i = 0; i < result.length; i++) {
                            let _services = [];
                            for(var y = 0; y < rx.length; y++) {
                                if(rx[y].slave_id == result[i].id) {
                                    _services.push({name: rx[y].info, state: rx[y].value});
                                }
                            }
                            var x = { id: result[i].id, ip: result[i].ip_addr, uni_id: result[i].uni_id, friendlyname: result[i].friendlyname, services: _services };
                            slvs.push(x);
                        }
                        var jt = {
                            "cmd": "MISC",
                            "sub": "SERVERS",
                            "servers": slvs
                        };
                        client_send(JSON.stringify(jt), "SINGLE", cli.unid);
                    });
                    
                });
                
            
            } 
            else if(jsn['sub'] == "SETN") {
                let pkey = jsn['pkey'];
                let friendlyname = jsn['friendlyname'];
                con.query("UPDATE slave SET friendlyname =" + con.escape(friendlyname) + " WHERE uni_id=" + con.escape(pkey));
                console.log(pkey + " name changed to " + friendlyname);
            }
            else if(jsn['sub'] == "SETPUSHTOKEN") {
                cli.pushtoken = jsn['token'];
                console.log("added push token: " + cli.pushtoken);
            }
        }
    }

}
// Store data to database
function db_save (cli) {
    console.log("DB save");
    var avg = {

    };

    var get_avg = function (arr) {
        if(arr == null || arr == undefined)
            return null;
        if(arr.length == 0)
            return null;
        
        var b = 0;
        for(var x = 0; x < arr.length; x++) {
            b += arr[x];
        }
        return b/arr.length;
    }
    for (var key in cli.buffer) {
        if (cli.buffer.hasOwnProperty(key)) {
            avg[key] = get_avg(cli.buffer[key]);
            if(avg[key] == null)
                continue;
                
            con.query("INSERT INTO log (type, value, slave_id, timestamp) VALUES (" + con.escape(key) + ", " + con.escape(avg[key]) + ", " + con.escape(cli.id_in_database) + ", CURRENT_TIMESTAMP)", function (err, result, fields) {
                
            });
        }
    }
    cli.buffer_timer = Math.floor(Date.now() / 1000) + 60;
    cli.buffer = {
        mem_us: [],
        cpu_us: [],
        t_cpu: [],
        t_amb: [],
        t_mb: [],
        pwr: []
    };

    
}

// slave = pkey/uni_id, from = date (format 'YYYY-MM-DD hh:ii:ss'), datatype = ex. cpu_us, callback = first parameter is the data
function getHistory(slave, from, datatype, callback){
    let q = "SELECT l.value, l.info, l.timestamp FROM log l INNER JOIN slave s ON s.uni_id = " + con.escape(slave) + " WHERE type = "+con.escape(datatype)+" AND slave_id = s.id AND l.timestamp BETWEEN "+con.escape(from)+" AND NOW() ORDER BY timestamp ASC";
    
    con.query(q, function (err, result, fields) {
        if(!err) {
            
            callback(result);
        }
        else {
            callback(null);
        }
    });

}


fs = require('fs');
var sqlCreds = JSON.parse(fs.readFileSync('.sql-credentials', 'utf8'));
// Connect to mysql
var con = mysql.createConnection({
    host: sqlCreds.db.host,
    user: sqlCreds.db.user,
    password: sqlCreds.db.password, // Change this to match your mysql password
    database: sqlCreds.db.database
});

console.log("Starting Observer-server...");
console.log("Date: " + new Date());
con.connect(function(err) {
    if (err) throw err;
    console.log("MySQL:     [OK]");
});
// Create HTTP server
var server = http.createServer(function(request, response) {

});
// Listen to 6152 port, this must match the client's port
server.listen(6152, function() { console.log("TCP:      [OK]"); });

// Create websocket server
wsServer = new WebSocketServer({
    httpServer: server
});


function handle_on_m (cli) {
    cli.conn.on('message', function(message) {
        if(message.type === 'binary') {

        }
        // Receiving Text data
        else if (message.type === 'utf8') {
            parse_message(cli, message.utf8Data);
        }
        
    });
    cli.conn.on('close', function(connection) {
        console.log("client dc");
        // save db on exit
        if(cli.type == "TX")
            db_save(cli);
        for(let x = 0; x < clients.length; x++) {
            if(clients[x] == cli) {
                clients.splice(x, 1);
                break;
            }
        }
        var rt = {
            "cmd": "EVENT",
            "type": "slave_dc",
            "pkey": cli.unid
        };
        client_send(JSON.stringify(rt), "WEB");

        // Send push notifications
        clients_push_message("Client " + cli.friendlyname + " disconnected!")
    });
}

// Handling connection request
function handle_req (req) {
    let cli = new client();
    cli.conn = req.accept(null, req.origin)
    handle_on_m(cli);
}


wsServer.on('request', function(request) {
    
    handle_req(request);
});
