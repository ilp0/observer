import React, { Component } from 'react';
import { Card, Button, CardHeader, CardFooter, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';
import ReactDOM from 'react-dom';
import Server from './ServerCard';

let slaves = [];

class ObserverConnect extends React.Component {

	constructor(props){
		super(props);
		slaves = this.props.cards;
	}

	componentDidMount(){

		let t = this;
		let rn_numb = 0;
		
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
		
		//new websocket connection
		let ws = new WebSocket("ws://node.ilpo.codes:6152/");
		//on websocket open
		ws.onopen = function (event){
			let jt = {
				"cmd": "AUTH",
				"auth": "68hv7Et8gj9fL35g9c8kO3lfoc7j5Klnm"
			};
			ws.send(JSON.stringify(jt));
		} 
		//on message received
		ws.onmessage = function (event) {
			/*
			*
			*
			* TÄHÄN REDUX STOREEN MAPPAUS
			* JA ALAALLA OLEVAT POIS!!!
			*
			*/
			let jn = JSON.parse(event.data);
			
			if(jn['ip']) {
				console.log(event.data);
				let slv = null;
				for(let x = 0; x < slaves.length; x++) {
					if(slaves[x].ip == jn['ip']) {
						slv = slaves[x];
						break;
					}
					slaves[x].setState({ip: jn['ip']});
					if(jn['cmd'] == "FREEM") {
						slaves[x].setState({mem_tot: jn['data']['tot']});
						slaves[x].setState({mem_us: jn['data']['used']});
					}
					if(jn['cmd'] == "CPU") {
						slaves[x].setState({cpu_us: jn['data']['us']});
					} 

				}
				if(slv == null) {
					slv = new Server(jn['ip']);
					if(jn['cmd'] == "FREEM") {
						slv.setState({mem_tot: jn['data']['tot']});
						slv.setState({mem_us: jn['data']['used']});
					}
					if(jn['cmd'] == "CPU") {
						slv.setState({cpu_us: jn['data']['us']});
					} 
					let cc = new Server(slv);
					slaves.push(cc);
				}	
				t.setState(t.state);		
			}
			//document.getElementById("data").innerHTML = event.data;
		}

	}
	render(){
		return null;
		}
	}
	
export default ObserverConnect;
	


