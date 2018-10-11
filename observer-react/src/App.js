import React, { Component } from 'react';
import Nav from './Nav.js';
import { Container, Row, Col } from 'reactstrap';
import { Card, Button, CardHeader, CardFooter, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';
import './App.css';
import ObserverConnect from './Connect.js';
const $ = window.$;

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
              <ObserverConnect></ObserverConnect>
          </Card>
          </Col>
        </Row>
        </Col>
      </Row>
      </Container>
      </div>
    );
  }
}

export default App;
