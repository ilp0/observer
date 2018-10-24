import React, { Component } from 'react';
import { Card, Button, CardHeader, CardFooter, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Server from './Server'

class ServerCards extends React.Component {

	constructor(props){
		super(props);
		this.state = {slaves: []};
		let s = new Server();
		this.state.slaves.push(s);
		this.getSlaves = this.getSlaves.bind(this);
		this.updateSlaves = this.updateSlaves.bind(this);
		this.myref = React.createRef();
	}

	updateSlaves(d) {
		let jn = JSON.parse(d.data);
		//jos parsetussa javascriptissä on 'pkey'
		if(jn['pkey']){
		//temp serve
		console.log(d.data);
		let s = new Server();
		let isNew = true;
		s.setState({id: jn['pkey']});
		this.state.slaves.map((slave, i) =>{
		  if (slave.state.id === jn['pkey']) {
			s = this.state.slaves[i];
			isNew = false;
		  }
		});
		s.setState({ip: jn['ip']});
		switch(jn['cmd']){
		  case "FREEM":
		  s.setState({mem_us: jn['data']['used']});
		  s.setState({mem_tot: jn['data']['tot']});
		  break;
		  case "CPU":
		  s.setState({cpu_us: jn['data']['us']});
		  break;
		  default:
		  break;
		}
		this.state.slaves.push(s);
	  }
	}
	getSlaves (d) {
		let jn = JSON.parse(d.data);
		//jos parsetussa javascriptissä on 'pkey'
		if(jn['pkey']){
		//temp serve
		console.log(d.data);
		let s = new Server();
		let isNew = true;
		s.setState({id: jn['pkey']});
		this.state.slaves.map((slave, i) =>{
		  if (slave.state.id === jn['pkey']) {
			s = this.state.slaves[i];
			isNew = false;
		  }
		});
		s.setState({ip: jn['ip']});
		switch(jn['cmd']){
		  case "FREEM":
		  s.setState({mem_us: jn['data']['used']});
		  s.setState({mem_tot: jn['data']['tot']});
		  break;
		  case "CPU":
		  s.setState({cpu_us: jn['data']['us']});
		  break;
		  default:
		  break;
		}
		this.state.slaves.push(s);
	  }
	}

	render(){
		return (<div ref={this.myref}>
			{
				this.state.slaves.map((slave, index) =>
				<Server key={index} {...slave} ></Server>)
			}
		</div>);
	}

}
export default ServerCards;