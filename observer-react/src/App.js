import React, { Component } from 'react';
import Nav from './components/Nav.js';
import { Container, Row, Col } from 'reactstrap';
import { Card, Button, CardHeader, CardFooter, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';
import './App.css';
import { connect } from 'react-redux';
import VisibleServerCardContainer from './containers/VisibleServerCardContainer.js';
import {WSConnection} from './containers/WSConnection.js'

class App extends Component {

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
          <Card>
            <CardHeader>Server 1</CardHeader>
              <CardBody>
                <CardTitle>Server Health <Alert color="success">GOOD</Alert></CardTitle>
                <CardText>CPU: 54% | Memory: 299GB/1024GB</CardText>
                <Button>Open Server 1</Button>
              </CardBody>
          </Card>
          </Col>
          <Col md="4">
          <Card>
            <CardHeader>Server 1</CardHeader>
              <CardBody>
                <CardTitle>Server Health <Alert color="success">GOOD</Alert></CardTitle>
                <CardText>CPU: 54% | Memory: 299GB/1024GB</CardText>
                <Button>Open Server 1</Button>
              </CardBody>
              
              <WSConnection></WSConnection>
              <div>
                <VisibleServerCardContainer/>
              </div>
              
          </Card>
          </Col>
        </Row>
        </Col>
      </Row>
      </Container>
      </div>
    );
  }
  
  // divin sisällä servercardcontainerin kanssa <ObserverConnect cards={this.servercards}></ObserverConnect>
  /*componentDidMount(){
    //new websocket connection
    
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
      //jos parsetussa javascriptissä on 'pkey'
      if(jn['pkey']){
        //temp server
        /*
        let isNew = true;
        let s = new Server();
        s.props.id = jn['pkey'];
        for (let i = 0; i < slaves.props.length; i++){
          if (slaves[i].id == jn['pkey']) {
            s = slaves[i];
            isNew = false;
            break;
          }
        }
        s.props.ip = jn['ip'];
        switch(jn['cmd']){
          case "FREEM":
            s.props.mem_us = jn['data']['used'];
            s.props.mem_tot = jn['data']['tot'];
            break;
          case "CPU":
            s.props.cpu_us = jn['data']['us'];
            break;
          default:
          break;
        }
        if (isNew) addServerCard(s);
        */
}

export default connect() (App);
