import React, { Component } from 'react';
import Nav from './components/Nav.js';
import { Container, Row, Col } from 'reactstrap';
import { Card, Button, CardHeader, CardFooter, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';
import './App.css';
import ServerCards from './components/ServerCards';
import Server from './components/Server';
  import Websocket from 'react-websocket';

let servers = [{id: 0, ip: 0}];

class App extends Component {

  constructor(props){
    super(props);
    this.state = {ser: servers}
    this.updateSlaves = this.updateSlaves.bind(this);
    this.dank = this.dank.bind(this);
  }

  updateSlaves(jn){
    
    //jos parsetussa javascriptissä on 'pkey'
    //if(jn['pkey']){
    //temp serve
    console.log(jn);
    let s = new Server({id: jn['pkey'], ip: jn['ip']});
    let isNew = true;
    /*slaves.map((slave, i) =>{
      if (slave.id === jn['pkey']) {
      s = slaves[i];
      isNew = false;
      }
    });
    /*switch(jn['cmd']){
      case "FREEM":
      s.setState({mem_us: jn['data']['used']});
      s.setState({mem_tot: jn['data']['tot']});
      break;
      case "CPU":
      s.setState({cpu_us: jn['data']['us']});
      break;
      default:
      break;
    }*/
    this.state.servers.push(s);
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
                <ServerCards servers={this.state.ser}></ServerCards>
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

  dank(){
    console.log("fasd");
    return null;
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
        
        console.log(jn);
        let s = new Server({id: jn['pkey'], ip: jn['ip']});
        let isNew = true;
    /*slaves.map((slave, i) =>{
      if (slave.id === jn['pkey']) {
      s = slaves[i];
      isNew = false;
      }
    });
    /*switch(jn['cmd']){
      case "FREEM":
      s.setState({mem_us: jn['data']['used']});
      s.setState({mem_tot: jn['data']['tot']});
      break;
      case "CPU":
      s.setState({cpu_us: jn['data']['us']});
      break;
      default:
      break;
    }*/
      servers.push(s);
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
