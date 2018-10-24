import React, { Component } from 'react';
import { Card, Button, CardHeader, CardFooter, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';


//Määrittää mitä returnataan.
class Server extends React.Component {

	constructor(props){
		super(props);
		this.id = props.id;
		this.ip = props.ip;
		this.cpu_us = props.cpu_us;
		this.mem_us = props.mem_us;
		this.mem_tot = props.mem_tot;
	}

	render (){
		return (<div><Card>
		<CardHeader>{this.props.ip}-{this.props.id}</CardHeader>
		<CardBody>
		<CardTitle>Server Health <Alert color="success">GOOD</Alert></CardTitle>
		<CardText>{this.props.cpu_us}% | Memory: {this.props.mem_us}/{this.props.mem_tot}</CardText>
		<Button>Open Server</Button>
		</CardBody>
		</Card></div>)
		
	}
}


export default Server;