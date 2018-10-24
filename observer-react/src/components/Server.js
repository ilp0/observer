import React, { Component } from 'react';
import { Card, Button, CardHeader, CardFooter, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';


//Määrittää mitä returnataan.
class Server extends React.Component {

	constructor(props){
		super(props);
		this.state = {ip: 0, id: 0, cpu_us: 0, mem_us: 0, mem_tot: 0};
	}

	render (){
		return (<Card>
		<CardHeader>{this.state.ip}-{this.state.id}</CardHeader>
		<CardBody>
		<CardTitle>Server Health <Alert color="success">GOOD</Alert></CardTitle>
		<CardText>{this.state.cpu_us}% | Memory: {this.state.mem_us}/{this.state.mem_tot}</CardText>
		<Button>Open Server</Button>
		</CardBody>
		</Card>	)
	}
}
//määrittää tarvittavat propertyt
Server.propTypes = {
	id: PropTypes.string.isRequired,
	ip: PropTypes.string.isRequired,
	cpu_us: PropTypes.string.isRequired,
	mem_us: PropTypes.string.isRequired,
	mem_tot: PropTypes.string.isRequired
}

export default Server;