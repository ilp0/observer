import React from 'react';
import Server from './Server'
import {Col, Row} from 'reactstrap'

class ServerCards extends React.Component {

	constructor(props){
		super(props);
		this.servers = props.servers;
		this.view = props.view;
		this.state = {ser: this.servers, view: this.view}
		this.handleClick = this.handleClick.bind(this);
	}

	render(){
		//ALL SERVERS AND SMALL VIEW
		if (this.state.view[0] === 0) return this.getAllServerCards();
		//ONE SERVER VIEW
		else return this.getOneServerCard();
	}
	// FUNCTION FOR RENDERING DATA FROM ALL CARDS -----AKA OVERVIEW----- (DEFAULT)
	getAllServerCards(){
		return (<div><Row>
			{
				this.state.ser.map((slave, index) =>
				
				<Col key={slave.id} lg="4">
				<Server {...slave} selectServer={this.handleClick} extendedView="0"></Server>
				</Col>
				)
			}
		</Row></div>)
	}

	// FUNCTION FOR RENDERING DATA FROM SINGLE CARD
	getOneServerCard(){
		let ss = false;
			this.state.ser.map((s) => {
				if (this.state.view[0] === s.id && ss === false){
					console.log("success " + s.id);
					ss = s;
				} else {
					console.log("not" + s.id);
				}
				
			});
			return (<div><Server {...ss} selectServer={this.handleClick} extendedView="1"></Server></div>);

	}

	// HANDLE SERVER BUTTON CLICK (OVERVIEW)
	handleClick(id){
		console.log("clicked server card button" + id);
		//PASSES ACTION TO APP.JS
		//this.view[0] = id;
		this.props.handleServerClick(id);
	}

	//WHEN SERVERCARDS COMPONENT MOUNTS, SO DOES A WEBSOCKET

	componentDidMount(){
		//UPDATE CARDS EVERY 1000MS
		this.timerID = setInterval(
			  () => this.tick(),
			  1000
			);
		}
	
		//CLEARS THE 1 SECOND TIMER
		componentWillUnmount() {
			clearInterval(this.timerID);
		}
		//THIS RUNS EVERY 1 SECONDS.
		tick() {
			this.setState({ser: this.state.ser});
		}
		  
	  
}
export default ServerCards;