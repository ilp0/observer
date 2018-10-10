var slaves = [];

var rn_numb = 0;

function slave (mac) {
	this.mac = mac;
	this.id = rn_numb++;
	this.mem = {
		total: 0,
		used: 0
	}
	slaves.push(this);
	return this;
}

var ws = new WebSocket("ws://localhost:6152");
ws.onopen = function (event){
	var jt = {
		"cmd": "AUTH",
		"auth": "68hv7Et8gj9fL35g9c8kO3lfoc7j5Klnm"
	};
	ws.send(JSON.stringify(jt));
} 
ws.onmessage = function (event) {
	var jn = JSON.parse(event.data);
	
	if(jn['mac']) {
		console.log("yes");
		var slv = null;
		for(var x = 0; x < slaves.length; x++) {
			if(slaves[x].mac == jn['mac']) {
				slv = slaves[x];
				break;
			}
		}
		if(slv == null) {
			slv = new slave(jn['mac']);
			$("#slaves").append("<div class='device' id='device_" + slv.rn_numb + "'> <h3> " + slv.mac + " </h3> </div>");
			$("#device_" + slv.rn_numb).append("Memory: <span class='mem_used'>" + (slv.mem.used/1000) + "</span>GB/<span class='mem_total'>" + (slv.mem.total) + "</span>GB");
		}
		if(jn['cmd'] == "FREEM") {
			slv.mem.total = jn['data']['tot'];
			slv.mem.used = jn['data']['used'];
			$("#device_" + slv.rn_numb).find(".mem_used").html((slv.mem.used/1000));
			$("#device_" + slv.rn_numb).find(".mem_total").html((slv.mem.total/1000));

		}
	}
	document.getElementById("data").innerHTML = event.data;
}

