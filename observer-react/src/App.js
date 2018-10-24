import React, { Component } from 'react';
import Nav from './components/Nav.js';
import { Container, Row, Col } from 'reactstrap';
import { Card, Button, CardHeader, CardFooter, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';
import './App.css';
import ServerCards from './components/ServerCards';
import Server from './components/Server';

let servers = [];

class App extends Component {

  constructor(props){
    super(props);
    this.state = {ser: servers}
  }

  render() {
    return (
      <div className="App">
      <Container>
      <Row>
        <Col md="3">
          <Nav />
        </Col>
        <Col>
        <Row>
          <Col md="4">
          <div>
                <ServerCards servers={this.state.ser} onChange={this.handleChange}></ServerCards>
              </div>
          </Col>
        </Row>
        </Col>
      </Row>
      </Container>
      </div>
    );
  }

  componentDidMount(){
    
    this.timerID = setInterval(
		  () => this.tick(),
		  1000
		);
	  
    let ws = new WebSocket("ws://node.ilpo.codes:6152/");
    //on websocket open
    ws.onopen = function (){
      let jt = {
        "cmd": "AUTH",
        "auth": "68hv7Et8gj9fL35g9c8kO3lfoc7j5Klnm"
      };
      ws.send(JSON.stringify(jt));
    } 
    //on message received
    ws.onmessage = function (event) {
      let jn = JSON.parse(event.data);
      if(jn['pkey']){
        let s = new Server(0);
        console.log(jn);
        let isNew = true;
        let index = 0;
        servers.map((s, i) =>{
          if (s.id === jn['pkey']) {
            index = i;
            s = servers[i];
            isNew = false;
          }
        });
        if (isNew) {
          s.id = jn['pkey'];
          s.ip = jn['ip'];
        }
        switch (jn['cmd']) {
          case "FREEM":
            s.mem_us = jn['data']['used'];
            s.mem_tot = jn['data']['tot'];
            break;
          case "CPU":
            s.cpu_us = jn['data']['us'];
            break;
          default:
          break;
        } 

        if(isNew) servers.push(s);
        else s = servers[index];
      }

  }}


	
	  componentWillUnmount() {
		clearInterval(this.timerID);
	  }
	
	  tick() {
    this.setState({ser: servers});

	  }
	  
  
}



export default (App);
