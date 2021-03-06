import React from 'react';
import { Col, Row, Card, Button, CardHeader, CardBody, CardTitle, CardText, Input, Form } from 'reactstrap';
import { Alert } from 'reactstrap';
import ChartCard from './ChartCard'
import { getHistoricalData } from '../App'
import Popup from "reactjs-popup";

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


		this.history_cpu = this.props.history_cpu;
		this.history_mem = this.props.history_mem;
		//this.history_date_change = this.history_date_change.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
		this.editName = "";
		this.services = props.services;
	}
	//EXECUTES METHOD IN SERVERCARDS
	openServer(){
		this.props.selectServer(this.id);
		let d = new Date();
		d.setHours(d.getHours() - 5);
		getHistoricalData("cpu_us", d, this.id);
		getHistoricalData("mem_us", d, this.id);
	}
	/*
	history_date_change (event) {
		let dd = new Date();
		dd.setHours(dd.getHours() - event.target.value);
		getHistoricalData("cpu_us", dd, this.id);
		getHistoricalData("mem_us", dd, this.id);
	}
	*/

    handleChange(event) {

        this.editName = event.target.value;
    }

    handleSubmit(event){
        console.log(this.editName);
        this.props.sendName(this.editName, this.id);
    }

	render (){

		if(this.extendedView === "0"){
			return (
				<div>
				<Card className="serverCard">
				<CardHeader>{this.friendlyname} - {this.ip}</CardHeader>
				<CardBody>
				<CardTitle>Status<Alert style={this.props.status == "ONLINE" ? this.colors.green : this.colors.red}>{this.props.status}</Alert></CardTitle>				
					<Row>
						<Col lg="6">
						CPU: {this.props.cpu_us}%
						</Col>
						<Col lg="6"> 
						Memory: {this.props.mem_us}/{this.props.mem_tot}
						</Col>
					</Row>
				
				<Button disabled={this.props.status === "OFFLINE" ? true : false} onClick={() => this.openServer()}>Open Server</Button>
				</CardBody>
				</Card></div>)
		} else {
			let mem_max = this.his.mem_tot[0].data;
			return (
				<div>
				<h2>{this.ip}</h2>
				<h2>{this.friendlyname}</h2>
				<Popup trigger={<Button>Edit</Button>} modal>
					<div id="popup-inside">
						<p>Edit Server Name</p>
						<Form onSubmit={this.handleSubmit}>
							<Input type="text" name="friendlyname" onChange={this.handleChange} />
                            <Input type="submit" value="Submit" /></Form>
						 
					</div>
				</Popup>
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
				<Row>
					<h3>Services</h3>
				</Row>
				<Row>
					{this.services.map((s, i) => 
					<Col lg="3">
						<div>
							<Card className="serverCard">
							<CardHeader>{s.name}</CardHeader>
							<CardBody>
								<CardTitle>Status<Alert style={s.state == "1" ? this.colors.green : this.colors.red}>{s.state == "1" ? "ACTIVE" : "OFFLINE"}</Alert></CardTitle>				
							</CardBody>
							</Card>
						</div>
					</Col>
					)}
				</Row>
				<Row>
				<h2>History</h2> 
				</Row>
				<Row>
                <Col lg="12">
                <Form>
                <Input className="dateInput" type="date" />
				<Button>Submit</Button>
                </Form>
				<p style={{fontSize: 0.8 + 'em'}}>(5h ago -> now)</p> 
				</Col>
                </Row>
				<Row>
				<Col lg="6">
					<h3>Memory History</h3>
					<ChartCard datatype='mem_us' data={this.history_mem} max={mem_max} title=""></ChartCard>
					
				</Col>
				<Col lg="6">
					<h3>CPU History</h3>
					<ChartCard datatype='cpu_us' data={this.history_cpu} max="100" title=""></ChartCard>
					
				</Col>
				
				</Row>
				</div>
			)
		}
	}
}


export default Server;
