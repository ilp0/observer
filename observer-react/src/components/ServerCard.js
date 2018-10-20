import React, { Component } from 'react';
import { Card, Button, CardHeader, CardFooter, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';


//Määrittää mitä returnataan.
const Server = ({id, ip, cpu_us, mem_us, mem_tot}) => (
	<Card>
			<CardHeader>{ip}-{id}</CardHeader>
			<CardBody>
			<CardTitle>Server Health <Alert color="success">GOOD</Alert></CardTitle>
			<CardText>{cpu_us}% | Memory: {mem_us}/{mem_tot}</CardText>
			<Button>Open Server</Button>
			</CardBody>
	</Card>

)
//määrittää tarvittavat propertyt
Server.propTypes = {
	id: PropTypes.string.isRequired,
	ip: PropTypes.string.isRequired,
	cpu_us: PropTypes.string.isRequired,
	mem_us: PropTypes.string.isRequired,
	mem_tot: PropTypes.string.isRequired
}

export default Server;