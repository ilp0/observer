import React, { Component } from 'react';
import { Card, Button, CardHeader, CardFooter, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';
import ReactDOM from 'react-dom';

let cards = [];



const CardVar = (slv) => {
	return (<Card>
		<CardHeader>{slv.ip}</CardHeader>
	  <CardBody>
		<CardTitle>Server Health <Alert color="success">GOOD</Alert></CardTitle>
		<CardText>{slv.cpu.us}% | Memory: {slv.mem.used}/{slv.mem.total}</CardText>
		<Button>Open Server 1</Button>
	  </CardBody>
	</Card>);
};

const AllCards = (cards) => {
	for(let i = 0; i < cards.length; i++){
		
	}
};

class ObserverConnect extends React.Component{

	projectCards = (arr) => {
		if ( arr.length !== 0 ) {
		  return arr.map( ca => 
			 <div>{ca}</div>
		  )
		}
	  }

	componentDidMount(){
		let slaves = [];

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
		
		var ws = new WebSocket("ws://node.ilpo.codes:6152/");
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
					if(slaves[x].ip == jn['ip']) {
						slv = slaves[x];
						break;
					}
				}
				if(slv == null) {
					slv = new slave(jn['ip']);
					
				}
				if(jn['cmd'] == "FREEM") {
					slv.mem.total = jn['data']['tot'];
					slv.mem.used = jn['data']['used'];

				}
				if(jn['cmd'] == "CPU") {
					slv.cpu.us = jn['data']['us'];
				}
				let cc = new CardVar(slv);
				cards.push(cc);
			}
			//document.getElementById("data").innerHTML = event.data;
		}
		

	}
	render(){
		if (cards.length !== 0)return this.projectCards(cards);
		else return null;
		
	}
	}
	
export default ObserverConnect;
	


