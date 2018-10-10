var slaves = [];

var rn_numb = 0;

function slave (ip) {
	this.ip = ip;
	this.id = rn_numb++;
	this.mem = {
		total: 0,
		used: 0
	}
	this.cpu = {
		us: 0
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
	
	if(jn['ip']) {
		console.log("yes");
		var slv = null;
		for(var x = 0; x < slaves.length; x++) {
			if(slaves[x].ip == jn['ip']) {
				slv = slaves[x];
				break;
			}
		}
		if(slv == null) {
			slv = new slave(jn['ip']);
			$("#slaves").append("<div class='device' id='device_" + slv.id+ "'> <h3> " + slv.ip + " </h3> </div>");
			$("#device_" + slv.id).append("Memory: <span class='mem_used'>" + (slv.mem.used/1000).toFixed(2) + "</span>GB/<span class='mem_total'>" + (slv.mem.total/1000).toFixed(2) + "</span>GB<br/>");
			$("#device_" + slv.id).append("CPU: <span class='cpu_us'>" + (slv.cpu.us).toFixed(2) + "</span>%<br/>");

		}
		if(jn['cmd'] == "FREEM") {
			slv.mem.total = jn['data']['tot'];
			slv.mem.used = jn['data']['used'];
			$("#device_" + slv.id).find(".mem_used").html((slv.mem.used/1000).toFixed(2));
			$("#device_" + slv.id).find(".mem_total").html((slv.mem.total/1000).toFixed(2));
		}
		if(jn['cmd'] == "CPU") {
			slv.cpu.us = jn['data']['us'];
			$("#device_" + slv.id).find(".cpu_us").html((slv.cpu.us).toFixed(2));
		}
	}
	document.getElementById("data").innerHTML = event.data;
}

