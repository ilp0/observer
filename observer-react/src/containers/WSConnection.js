import React, { Component } from 'react';
import {connect} from 'react-redux'
import Server from '../components/Server.js'

class WSConnection extends Component {
	
		//new websocket connection
		componentDidMount(){
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
				
				if(jn['pkey']) {
					console.log(event.data);
					var slv = null;
					for(var x = 0; x < slaves.length; x++) {
						if(slaves[x].unid == jn['pkey']) {
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
						slv = new slave(jn['ip'], jn['pkey']);
						
					}
					if(jn['cmd'] == "FREEM") {
						slv.mem.total = jn['data']['tot'];
						slv.mem.used = jn['data']['used'];
						
					}
					if(jn['cmd'] == "CPU") {
						slv.cpu.us = jn['data']['us'];
						
					}
				}
	// document.getElementById("data").innerHTML = event.data;
}}}

export default (WSConnection)