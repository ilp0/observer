import React, { Component } from 'react';
import { Card, Button, CardHeader, CardFooter, CardBody, CardTitle, CardText } from 'reactstrap';
import { Alert } from 'reactstrap';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';


//Määrittää mitä returnataan.
const Server = () => (
	<Card>
			<CardHeader>{this.props.ip}-{this.props.id}</CardHeader>
			<CardBody>
			<CardTitle>Server Health <Alert color="success">GOOD</Alert></CardTitle>
			<CardText>{this.props.cpu_us}% | Memory: {this.props.mem_us}/{this.props.mem_tot}</CardText>
			<Button>Open Server</Button>
			</CardBody>
	</Card>

)


const mapStateToProps = (state) => {
	return {
	  id: state.id,
	  mem_us: state.mem_us,
	  mem_tot: state.mem_tot,
	  cpu_us: state.cpu_us,
	  ip: state.ip
	}
  }

const mapDispatchToProps = (dispatch) => {
	return {
	  //datan muutokset
	  onUpdateCard: () => dispatch({type:'UPDATE_CARD'}),
	}
}
//määrittää tarvittavat propertyt
Server.propTypes = {
	id: PropTypes.string.isRequired,
	ip: PropTypes.string.isRequired,
	cpu_us: PropTypes.string.isRequired,
	mem_us: PropTypes.string.isRequired,
	mem_tot: PropTypes.string.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Server);