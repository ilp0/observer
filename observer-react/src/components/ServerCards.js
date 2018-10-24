import React from 'react';
import Server from './Server'

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
		return (<div>
			{
				this.state.ser.map((slave, index) =>
				<Server key={slave.id} id={slave.id} ip={slave.ip} cpu_us={slave.cpu_us} mem_us={slave.mem_us} mem_tot={slave.mem_tot} selectServer={this.handleClick}></Server>)
			}
		</div>);
	}

	// FUNCTION FOR RENDERING DATA FROM SINGLE CARD
	getOneServerCard(){
		let ss = false;
			this.state.ser.map((s) => {
				if (this.state.view[0] === s.id && ss === false){
					console.log("success " + s.id);
					ss = s;
				}
				console.log("not" + s.id);
			});
			return (<div><Server key={ss.id} id={ss.id} ip={ss.ip} cpu_us={ss.cpu_us} mem_us={ss.mem_us} mem_tot={ss.mem_tot} selectServer={this.handleClick}></Server></div>);

	}

	// HANDLE SERVER BUTTON CLICK (OVERVIEW)
	handleClick(id){
		console.log("clicked server card button" + id);
		//PASSES ACTION TO APP.JS
		this.view[0] = id;
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