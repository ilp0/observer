import React from 'react';
import { Card, Button, CardHeader, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';

//Määrittää mitä returnataan.
class Server extends React.Component {
	//SET ALL PROPS
	constructor(props){
		super(props);
		this.id = props.id;
		this.ip = props.ip;
		this.cpu_us = props.cpu_us;
		this.mem_us = props.mem_us;
		this.mem_tot = props.mem_tot;
		this.openServer = this.openServer.bind(this);
	
	}
	//EXECUTES METHOD IN SERVERCARDS
	openServer(){
		this.props.selectServer(this.id);
	}

	render (){
		return (
		<div><Card>
		<CardHeader>{this.props.ip}</CardHeader>
		<CardBody>
		<CardTitle>Server Health <Alert color="success">GOOD</Alert></CardTitle>
		<CardText>{this.props.cpu_us}% | Memory: {this.props.mem_us}/{this.props.mem_tot}</CardText>
		<Button onClick={() => this.openServer()}>Open Server</Button>
		</CardBody>
		</Card></div>)
		
	}
}


export default Server;