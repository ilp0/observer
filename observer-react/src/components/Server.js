import React from 'react';
import { Col, Row, Card, Button, CardHeader, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';
import ChartCard from './ChartCard'

const PI = Math.PI;
//Määrittää mitä returnataan.
class Server extends React.Component {
	//SET ALL PROPS
	constructor(props){
		super(props);
		this.id = props.id;
		this.ip = props.ip;
		this.friendlyname = props.friendlyname;
		this.status = props.status;
		this.cpu_us = props.cpu_us;
		this.mem_us = props.mem_us;
		this.colors = {
			green: {
				background: "#d4edda",
				color: "#155724",
				borderColor: "#d4edda"
			},
			red: {
				background: "#edd4da",
				color: "#571524",
				borderColor: "#e6c3cb"
			}
		};
		this.mem_tot = props.mem_tot;
		this.openServer = this.openServer.bind(this);
		this.extendedView = props.extendedView;
		this.his = props.his;
	
	}
	//EXECUTES METHOD IN SERVERCARDS
	openServer(){
		this.props.selectServer(this.id);
	}

	render (){

		if(this.extendedView === "0"){
			return (
				<div>
				<Card className="serverCard">
				<CardHeader>{this.friendlyname}<br>{this.ip}</CardHeader>
				<CardBody>
				<CardTitle>Status<Alert style={this.props.status == "ONLINE" ? this.colors.green : this.colors.red}>{this.props.status}</Alert></CardTitle>
				<CardTitle>Server Health<Alert color="success">GOOD</Alert></CardTitle>
				
					<Row>
						<Col lg="6">
						CPU: {this.props.cpu_us}%
						</Col>
						<Col lg="6"> 
						Memory: {this.props.mem_us}/{this.props.mem_tot}
						</Col>
					</Row>
				
				<Button onClick={() => this.openServer()}>Open Server</Button>
				</CardBody>
				</Card></div>)
		} else {
			let mem_max = this.his.mem_tot[0].data;
			return (
				<div>
				<h2>{this.ip}</h2>
				<h2>{this.friendlyname}</h2><Button>Edit</Button>
				<p>{this.id}</p>
				<Row>
				<Col lg="6">
					<h3>Memory</h3>
					<ChartCard data={this.his.mem_us} max={mem_max} title="MB"></ChartCard>
					
				</Col>
				<Col lg="6">
					<h3>CPU</h3>
					<ChartCard data={this.his.cpu_us} max="100" title="%"></ChartCard>
					
				</Col>
				</Row>
				</div>
			)
		}
	}
}


export default Server;