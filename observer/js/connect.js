var slaves = [];

var rn_numb = 0;

function slave (ip, unid) {
	this.ip = ip;
	this.unid = unid;
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

// var ws = new WebSocket("ws://84.250.89.146:6152");
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
		console.log(event.data);
		var slv = null;
		for(var x = 0; x < slaves.length; x++) {
			if(slaves[x].unid == jn['unid']) {
				slv = slaves[x];
				break;
			}
		}

		/*
		<div class="card">
                      <div class="card-header">
                        Sample
                      </div>
                      <div class="card-body">
                          <p>CPU : 54%</p>
                          <p>MEM : 1.44GB/15.4GB</p>
                      </div>
					</div>
					*/
		if(slv == null) {
			slv = new slave(jn['ip'], jn['unid']);
			$("#slaves").append('<div class="card" id="device_' + slv.id + '"> <div class="card-header"> ' + slv.ip + ' </div>');
			$("#device_" + slv.id).append("<div class='card-body' id='device_body_" + slv.id + "'>");
			$("#device_body_" + slv.id).append("Memory: <span class='mem_used'>" + (slv.mem.used/1000).toFixed(2) + "</span>GB/<span class='mem_total'>" + (slv.mem.total/1000).toFixed(2) + "</span>GB<br/>");
			$("#device_body_" + slv.id).append("CPU: <span class='cpu_us'>" + (slv.cpu.us).toFixed(2) + "</span>%<br/>");
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
	// document.getElementById("data").innerHTML = event.data;
}

