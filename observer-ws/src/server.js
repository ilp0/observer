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
    // i never think
    this.id_in_database = null;
    this.index = clients.push(this) - 1;
    // buffer
    this.buffer = {
        mem_us: [],
        cpu_us: [],
        t_cpu: [],
        t_amb: [],
        t_mb: [],
        pwr: []
    };
    // buffer timer
    this.buffer_timer = Math.floor(Date.now() / 1000) + 60/*save data every minute*/;
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
                    con.query("INSERT INTO slave (ip_addr, uni_id) VALUES ('"+cli.ipaddr+"', '"+out_uuid+"')", function (err, result, fields) {

                    });

                    con.query("SELECT id FROM slave WHERE uni_id='"+out_uuid+"'", function (err, result, fields) {
                        if(!err && result.length != 0) {
                            cli.id_in_database = result[0].id;
                        }
                    });
                    var jt = {
                        "cmd": "AUTH",
                        "cb": "OK_NEW",
                        "uuid": out_uuid
                    };
                    console.log("NEW SLAVE!");
                    cli.unid = out_uuid;
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
                            cli.id_in_database = result[0].id;
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
                    "data": data
                };
                client_send(JSON.stringify(jt), "SINGLE", cli.unid);
            });
            
        }
        else if (jsn['cmd'] == "MISC") {
            if(jsn['sub'] == "SERVERS") {
                var slvs = [];
                con.query("SELECT * FROM slave", function (err, result, fields) {
                    for(var i = 0; i < result.length; i++) {
                        var x = { id: result[i].id, ip: result[i].ip_addr, uni_id: result[i].uni_id, friendlyname: result[i].friendlyname };
                        slvs.push(x);
                    }
                    var jt = {
                        "cmd": "MISC",
                        "sub": "SERVERS",
                        "servers": slvs
                    };
                    client_send(JSON.stringify(jt), "SINGLE", cli.unid);
                });
                
            }
        }
    }

}

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
                
            con.query("INSERT INTO log (type, value, slave_id, timestamp) VALUES ('" + key + "', '" + avg[key] + "', '" + cli.id_in_database + "', CURRENT_TIMESTAMP)", function (err, result, fields) {
                
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

/*
datatype guide:
0 = memory
1 = cpu

frequency of data:
0 = divide timespan by 10 
1 = divide timespan by 25
2 = divide timespan by 50
3 = divide timespan by 100
4 = divide timespan by 250
5 = divide timespan by 500 (lot of data!!!!)
666 = get all data (NOT RECOMMENDED!)

timeframe guide: 
m = min
h = hour
d = day
mo = month
y = year



time is BACKWARDS FROM THIS MOMENT

for 5 day memory history: 
getDataFromMySQL()

*/

// slave = pkey/uni_id, from = date (format 'YYYY-MM-DD hh:ii:ss'), datatype = ex. cpu_us, callback = first parameter is the data
function getHistory(slave, from, datatype, callback){
    con.query("SELECT l.* FROM log l INNER JOIN slave s ON s.uni_id = '" + slave + "' WHERE type = '"+datatype+"' AND slave_id = s.id AND DATE(l.timestamp) BETWEEN '"+from+"' AND NOW() ORDER BY timestamp ASC", function (err, result, fields) {
        if(!err) {
            callback(result);
        }
        else {
            callback(null);
        }
    });

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
        // save db on exit
        db_save(cli);
        clients.splice(cli.index, 1);
        var rt = {
            "cmd": "EVENT",
            "type": "slave_dc",
            "pkey": cli.unid
        };
        client_send(JSON.stringify(rt), "WEB");
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
