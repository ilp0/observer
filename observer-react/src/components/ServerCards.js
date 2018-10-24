import React, { Component } from 'react';
import { Card, Button, CardHeader, CardFooter, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Server from './Server'

class ServerCards extends React.Component {

	constructor(props){
		super(props);
		this.servers = this.props.servers;
	}

	render(){
		if (isNaN(this.servers)){
		return (<div>
			{
				this.servers.map((slave, index) =>
				<Server key={index} id={slave.id} ip={slave.ip} ></Server>)
			}
		</div>);
		} else return null;
	}

	componentDidMount() {
		this.timerID = setInterval(
		  () => this.tick(),
		  1000
		);
	  }
	
	  componentWillUnmount() {
		clearInterval(this.timerID);
	  }
	
	  tick() {
		this.setState(this.state);
	  }
	  

}
export default ServerCards;