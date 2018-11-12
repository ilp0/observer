import React, { Component } from 'react';
import Nav from './components/Nav.js';
import { CardColumns, Container, Row, Col } from 'reactstrap';
import './App.css';
import ServerCards from './components/ServerCards';

//SERVER VARIABLES ARE STORED HERE!!
let servers = [];
//VIEW VARIABLE: ONLY FIRST(0) OBJECT IS EVER USED. WEIRD STUFF WITH PASSING DOWN SINGLE VARIABLES. PASSING DOWN ARRAYS SEEMS TO WORK ???
let view = [];

class App extends Component {

  constructor(props){
    super(props);
    this.handleServerClick = this.handleServerClick.bind(this);
  }

  handleServerClick(id){
    view[0] = id;
  }

  render() {
    return (
      <div className="App">
      <Container>
      <Row>
        <Col md="3">
          <Nav servers={servers} allClick={this.handleServerClick}/>
        </Col>
        <Col md="9">
        	<ServerCards view={view} servers={servers} handleServerClick={this.handleServerClick}></ServerCards>
        </Col>
      </Row>
      </Container>
      </div>
    );
  }

  componentWillMount(){
    //VIEW ARRAY NEEDS TO BE INITIALIZED
    let x = 0;
    view.push(x);
  }

  componentDidMount(){
		//OPEN WEB SOCKET AT START
		let ws = new WebSocket("ws://192.168.1.13:6152/");
		ws.onopen = function (){
		  let jt = {
			"cmd": "AUTH",
			"auth": "68hv7Et8gj9fL35g9c8kO3lfoc7j5Klnm"
		  };
			ws.send(JSON.stringify(jt));
			
			let gse = {
				"cmd": "MISC",
				"sub": "SERVERS"
			};
			ws.send(JSON.stringify(gse));
		} 
    //ON ERROR, PRINT IN CONSOLE. SHOULD NOT HAPPEN!
		ws.onerror = function (){
			console.log("********CONNECTION LOST!!!!!!!!!!!!!***************");
		}
		//ON MESSAGE RECEIVED, PARSE MESSAGE, SHOULD HAPPEN!!
		ws.onmessage = function (event) {
			let jn = JSON.parse(event.data);
			if(jn['cmd'] == "MISC") {
				if(jn['sub'] == "SERVERS") {
					for(let i = 0; i < jn['servers'].length; i++) {
						let ser = jn['servers'][i];
						console.log(ser);
						servers.push({id: ser.uni_id, ip: ser.ip, friendlyname: ser.friendlyname, his: {mem_us: [], mem_tot: [], cpu_us: []}, status: "OFFLINE"});
					}
					return;
				}
			}

      //console.log(jn);
		  if(jn['pkey']){
			let s = {};
			let isNew = true;
			let index = 0;
			servers.map((ss, i) =>{
			  if (ss.id === jn['pkey']) {
				index = i;
				s = ss;
				isNew = false;
			  }
			});
			
			  s.id = jn['pkey'];
				s.ip = jn['ip'];
				s.status = "ONLINE";
				if (isNew){
					s.his = {mem_us: [], mem_tot: [], cpu_us: []}
				}
			//IF THE MESSAGE CONTAINS CMD (COMMAND), THEN SET APPROPRIATE DATA TO SERVER
			switch (jn['cmd']) {
				case "FREEM":
				let mus = jn['data']['used'];
				let mtot =  jn['data']['tot'];
				s.mem_us = mus;
				s.mem_tot = mtot;
				s.his.mem_us.push({data: mus, time: Date.now()});
				s.his.mem_tot.push({data: mtot, time: Date.now()});
				break;
			  case "CPU":
				s.cpu_us = jn['data']['us'].toFixed(2);
				s.his.cpu_us.push({data: jn['data']['us'], time: Date.now()});
				break;
			  default:
			  break;
			} 
			//console.log(s);
			//IF NEW, CREATE NEW SERVER, ELSE REWRITE OLD SERVER WITH NEW DATA.
			console.log(s.his);
			if(isNew) servers.push(s);
      else s = servers[index];
		  }
	
	  }}
		  
	  
}

export default (App);
