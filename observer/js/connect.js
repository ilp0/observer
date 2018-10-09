var ws = new WebSocket("ws://localhost:6152");
ws.onopen = function (event){
	var jt = {
		"cmd": "AUTH",
		"auth": "68hv7Et8gj9fL35g9c8kO3lfoc7j5Klnm"
	};
	ws.send(JSON.stringify(jt));
} 
ws.onmessage = function (event) {
	document.getElementById("data").innerHTML = event.data;
}

