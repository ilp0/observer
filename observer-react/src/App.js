import React, { Component } from 'react';
import Nav from './components/Nav.js';
import { Container, Row, Col } from 'reactstrap';
import { Card, Button, CardHeader, CardFooter, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';
import './App.css';
import ServerCards from './components/ServerCards'

class App extends Component {

  constructor(props){
    super(props);
    this.servercards = React.createRef();
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
              <div>
                <ServerCards ref={this.servercards}></ServerCards>
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

  componentDidMount(){
    this._servercards = React.createRef();
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
      console.log(event.data);
      this._servercards.updateSlaves(event);

  }}
  
}

export default (App);
