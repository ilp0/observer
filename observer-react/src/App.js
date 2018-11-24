import React, { Component } from 'react';
import Nav from './components/Nav.js';
import { CardColumns, Container, Row, Col } from 'reactstrap';
import './App.css';
import ServerCards from './components/ServerCards';

//SERVER VARIABLES ARE STORED HERE!!
let servers = [];
//VIEW VARIABLE: ONLY FIRST(0) OBJECT IS EVER USED. WEIRD STUFF WITH PASSING DOWN SINGLE VARIABLES. PASSING DOWN ARRAYS SEEMS TO WORK ???
let view = [];

let ws = new WebSocket("ws://localhost:6152/");

// Mysql friendly date format
const _formatdate = function (date) {
	let addz = function (a) {
		if (a < 10)
			return ('0' + a);

		return a;
	};
	return date.getFullYear() + "-" + addz(date.getMonth() + 1) + "-" + addz(date.getDate()) + " " + addz(date.getHours()) + ":" + addz(date.getMinutes()) + ":" + addz(date.getSeconds());
};
export const getHistoricalData = function (type, from, pkey) {
	ws.send(JSON.stringify({ cmd: "REQH", from: _formatdate(from), type: type, pkey: pkey}));
};

class App extends Component {

	constructor(props) {
		super(props);
		this.handleServerClick = this.handleServerClick.bind(this);
		this.getHistory = this.getHistory.bind(this);
		this.state = {
			showPopup: false
		};
	}


	handleServerClick(id) {
		view[0] = id;
	}
	//MAIN RENDER FUNCTION
	render() {

		return (
			<div className="App">
				<Container>
					<Row>
						<Col md="3">
							<Nav servers={servers} allClick={this.handleServerClick} />
						</Col>
						<Col md="9">
							<ServerCards view={view} servers={servers} handleServerClick={this.handleServerClick}></ServerCards>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}

	getHistory(type, from, pkey) {
		getHistoricalData(type, from, pkey);
	}

	componentWillMount() {
		//VIEW ARRAY NEEDS TO BE INITIALIZED
		let x = 0;
		view.push(x);
	}

	componentDidMount() {
		//OPEN WEB SOCKET AT START

		ws.onopen = function () {
			let jt = {
				"cmd": "AUTH",
				"auth": "68hv7Et8gj9fL35g9c8kO3lfoc7j5Klnm"
			};
			ws.send(JSON.stringify(jt));

			let gse = {
				"cmd": "MISC",
				"sub": "SERVERS"
			};
			ws.send(JSON.stringify(gse));
		}


		//ON ERROR, PRINT IN CONSOLE. SHOULD NOT HAPPEN!
		ws.onerror = function () {
			console.log("********CONNECTION LOST!!!!!!!!!!!!!***************");
		}
		//ON MESSAGE RECEIVED, PARSE MESSAGE, SHOULD HAPPEN!!
		ws.onmessage = function (event) {
			let jn = JSON.parse(event.data);

			if (jn['cmd'] == "MISC") {
				if (jn['sub'] == "SERVERS") {
					for (let i = 0; i < jn['servers'].length; i++) {
						let ser = jn['servers'][i];
						console.log(ser);
						servers.push({ id: ser.uni_id, ip: ser.ip, friendlyname: ser.friendlyname, his: { mem_us: [], mem_tot: [], cpu_us: [] }, status: "OFFLINE" });
					}
					return;
				}
			}
			// Data
			if (jn['pkey']) {
				let s = {};
				let isNew = true;
				let index = 0;
				servers.map((ss, i) => {
					if (ss.id === jn['pkey']) {
						index = i;
						s = ss;
						isNew = false;
					}
				});
				if (jn['cmd'] == "EVENT") {
					if (jn['type'] == "slave_dc") {
						s.status = "OFFLINE";
					}
					return;
				}
				// Receive history
				if (jn['cmd'] == "REQH") {
					switch(jn['type']) {
						case "cpu_us":
							s.history_cpu = jn['data'];
							break;
						case "mem_us":
							s.history_mem = jn['data'];
							break;
					}
					
					return;
				}

				s.id = jn['pkey'];
				s.ip = jn['ip'];
				s.status = "ONLINE";
				if (isNew) {
					s.his = { mem_us: [], mem_tot: [], cpu_us: [] }
				}
				//IF THE MESSAGE CONTAINS CMD (COMMAND), THEN SET APPROPRIATE DATA TO SERVER
				switch (jn['cmd']) {
					case "FREEM":
						let mus = jn['data']['used'];
						let mtot = jn['data']['tot'];
						s.mem_us = mus;
						s.mem_tot = mtot;
						s.his.mem_us.push({ data: mus, time: Date.now() });
						s.his.mem_tot.push({ data: mtot, time: Date.now() });
						break;
					case "CPU":
						s.cpu_us = jn['data']['us'].toFixed(2);
						s.his.cpu_us.push({ data: jn['data']['us'], time: Date.now() });
						break;
					default:
						break;
				}
				//console.log(s);
				//IF NEW, CREATE NEW SERVER, ELSE REWRITE OLD SERVER WITH NEW DATA.
				console.log(s.his);
				if (isNew) servers.push(s);
				else s = servers[index];
			}

		}
	}


}

export default (App);