import React, { Component } from 'react';
import Nav from './components/Nav.js';
import { Container, Row, Col } from 'reactstrap';
import { Card, Button, CardHeader, CardFooter, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';
import './App.css';
import ServerCards from './components/ServerCards';
import Server from './components/Server';


class App extends Component {

  constructor(props){
    super(props);
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
                <ServerCards></ServerCards>
              </div>
          </Col>
        </Row>
        </Col>
      </Row>
      </Container>
      </div>
    );
  }
}



export default (App);
