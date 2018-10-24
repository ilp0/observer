import React, { Component } from 'react';
import { Card, Button, CardHeader, CardFooter, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Server from './Server'

let servers = [];

class ServerCards extends React.Component {

	constructor(props){
		super(props);
		this.state = {ser: servers}
	}

	render(){
		
		return (<div>
			{
				servers.map((slave, index) =>
				<Server key={index} id={slave.id} ip={slave.ip} cpu_us={slave.cpu_us} mem_us={slave.mem_us} mem_tot={slave.mem_tot}></Server>)
			}
		</div>);
		
	}

	componentDidMount(){
    
		this.timerID = setInterval(
			  () => this.tick(),
			  1000
			);
		  
		let ws = new WebSocket("ws://node.ilpo.codes:6152/");
		//on websocket open
		ws.onopen = function (){
		  let jt = {
			"cmd": "AUTH",
			"auth": "68hv7Et8gj9fL35g9c8kO3lfoc7j5Klnm"
		  };
		  ws.send(JSON.stringify(jt));
		} 
		//on message received
		ws.onmessage = function (event) {
		  let jn = JSON.parse(event.data);
		  if(jn['pkey']){
			let s = new Server(0);
			console.log(jn);
			let isNew = true;
			let index = 0;
			servers.map((ss, i) =>{
			  if (ss.id == jn['pkey']) {
				index = i;
				s = servers[i];
				isNew = false;
			  }
			});
			
			  s.id = jn['pkey'];
			  s.ip = jn['ip'];
			
			switch (jn['cmd']) {
			  case "FREEM":
				s.mem_us = jn['data']['used'];
				s.mem_tot = jn['data']['tot'];
				break;
			  case "CPU":
				s.cpu_us = jn['data']['us'].toFixed(2);
				break;
			  default:
			  break;
			} 
			console.log(s);
			if(isNew) servers.push(s);
			else s = servers[index];
		  }
	
	  }}
	
	
		
		  componentWillUnmount() {
			clearInterval(this.timerID);
		  }
		
		  tick() {
		this.setState({ser: servers});
	
		  }
		  
	  
}
export default ServerCards;