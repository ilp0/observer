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
		this.state = {servers: this.props.servers};
	}

	render(){
		
		return (<div>
			{
				this.state.servers.map((slave, index) =>
				<Server key={index} id={slave.id} ip={slave.ip} cpu_us={slave.cpu_us} mem_us={slave.mem_us} mem_tot={slave.mem_tot}></Server>)
			}
		</div>);
		
	}

	componentDidMount(){
    
		this.timerID = setInterval(
			  () => this.tick(),
			  1000
			);
		}
		componentWillUnmount() {
			clearInterval(this.timerID);
		  }
		
		  tick() {
			  console.log("rerender servercards");
			this.setState(this.state);
	
		  }
		  
	  
}
export default ServerCards;