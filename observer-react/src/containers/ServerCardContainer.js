import React, { Component } from 'react';
import '../App.css';
import Server from '../components/Server.js';
import PropTypes from 'prop-types';
//map = for each // Käydään läpi jokainen 


const ServerCardContainer = (cards) => (
	
		<div>
		{cards.map((server) => <Server {...server}></Server>)}
		
		</div>
		
)
//määrittää tarvittavat propertyt
ServerCardContainer.propTypes = {
	cards: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			ip: PropTypes.string.isRequired,
			cpu_us: PropTypes.string.isRequired,
			mem_us: PropTypes.string.isRequired,
			mem_tot: PropTypes.string.isRequired
		}).isRequired
	).isRequired
}


/*let p;

class ServerCardContainer extends Component {



	componentDidMount() {
		this.timerID = setInterval(
			() => this.tick(),
			10000
		);
	}

	componentWillUnmount() {
		clearInterval(this.timerID);
	}

	tick() {
		p.cards.map((card) => {
			
		});
	}

	render(){
		return null;
	}
}*/

export default ServerCardContainer;
