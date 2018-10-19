import React, { Component } from 'react';
import Nav from './Components/Nav.js';
import { Container, Row, Col } from 'reactstrap';
import { Card, Button, CardHeader, CardFooter, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';
import './App.css';
import ObserverConnect from './Components/ObserverConnect.js';
import Server from './Components/ServerCard.js';
import ServerCardContainer from './Components/ServerCardContainer.js'
import { connect } from 'react-redux';

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
              
              
              <div>
                <ServerCardContainer cards={this.slaves}></ServerCardContainer>
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
  componentDidMount(){
		slaves.push(new Server());
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
			/*
			*
			*
			* TÄHÄN REDUX STOREEN MAPPAUS
			* 
			*
			*/
			let jn = JSON.parse(event.data);
      //jos parsetussa javascriptissä on 'pkey'
      if(jn['pkey']){
        //temp server
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
        if (isNew) slaves.push(s);
        else updateCard();
        }
        
      }
/*
      //vanhat
			if(jn['ip']) {
				console.log(event.data);
				let slv = null;
				for(let x = 0; x < slaves.length; x++) {
					if(slaves[x].ip == jn['ip']) {
						slv = slaves[x];
						break;
					}
					slaves[x].setState({ip: jn['ip']});
					if(jn['cmd'] == "FREEM") {
						slaves[x].setState({mem_tot: jn['data']['tot']});
						slaves[x].setState({mem_us: jn['data']['used']});
					}
					if(jn['cmd'] == "CPU") {
						slaves[x].setState({cpu_us: jn['data']['us']});
					} 

				}
				if(slv == null) {
					slv = new Server(jn['ip']);
					if(jn['cmd'] == "FREEM") {
						slv.setState({mem_tot: jn['data']['tot']});
						slv.setState({mem_us: jn['data']['used']});
					}
					if(jn['cmd'] == "CPU") {
						slv.setState({cpu_us: jn['data']['us']});
					} 
					let cc = new Server(slv);
					slaves.push(cc);
				}	
				t.setState(t.state);		
			}
			//document.getElementById("data").innerHTML = event.data;
		}
*/
  }
}

function updateCard(state){
  slaves.map((s) => {
    if (s.id === state.id){
      s.onUpdateCard();
    }
  });
}

const slaves = [];

export default connect() (App);
