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
		this.ip = props.ip
	}

	render (){
		return (<div><Card>
		<CardHeader>{this.props.ip}-{this.props.id}</CardHeader></Card>	</div>)/*
		<CardBody>
		<CardTitle>Server Health <Alert color="success">GOOD</Alert></CardTitle>
		<CardText>{this.state.cpu_us}% | Memory: {this.state.mem_us}/{this.state.mem_tot}</CardText>
		<Button>Open Server</Button>
		</CardBody>
		</Card>	)
		*/
	}
}


export default Server;