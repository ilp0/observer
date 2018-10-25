import React, { Component } from 'react';
import Nav from './components/Nav.js';
import { Container, Row, Col } from 'reactstrap';
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
    this.handleMenuClick = this.handleMenuClick.bind(this);
  }

  handleServerClick(id){
    view[0] = id;
  }

  handleMenuClick(id){
    view[0] = id;
    console.log(view);
  }

  render() {
    return (
      <div className="App">
      <Container>
      <Row>
        <Col md="3">
          <Nav servers={servers} allClick={this.handleMenuClick}/>
        </Col>
        <Col>
        <Row>
          <Col md="4">
          
          <ServerCards view={view} servers={servers} handleServerClick={this.handleServerClick}></ServerCards>
          
          </Col>
        </Row>
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
		let ws = new WebSocket("ws://node.ilpo.codes:6152/");
		ws.onopen = function (){
		  let jt = {
			"cmd": "AUTH",
			"auth": "68hv7Et8gj9fL35g9c8kO3lfoc7j5Klnm"
		  };
		  ws.send(JSON.stringify(jt));
		} 
    //ON ERROR, PRINT IN CONSOLE. SHOULD NOT HAPPEN!
		ws.onerror = function (){
			console.log("********CONNECTION LOST!!!!!!!!!!!!!***************");
		}
		//ON MESSAGE RECEIVED, PARSE MESSAGE, SHOULD HAPPEN!!
		ws.onmessage = function (event) {
      let jn = JSON.parse(event.data);
      console.log(jn);
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
			//IF THE MESSAGE CONTAINS CMD (COMMAND), THEN SET APPROPRIATE DATA TO SERVER
			switch (jn['cmd']) {
			  case "FREEM":
				s.mem_us = ((jn['data']['used'])/1000).toFixed(2) + "G";
				s.mem_tot = ((jn['data']['tot'])/1000).toFixed(2) + "G";
				break;
			  case "CPU":
				s.cpu_us = jn['data']['us'].toFixed(2);
				break;
			  default:
			  break;
			} 
			//console.log(s);
			//IF NEW, CREATE NEW SERVER, ELSE REWRITE OLD SERVER WITH NEW DATA.
			if(isNew) servers.push(s);
      else s = servers[index];
		  }
	
	  }}
		  
	  
}

export default (App);
