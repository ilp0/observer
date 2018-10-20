import {addServerCard} from '../actions'
import React, { Component } from 'react';
import {connect} from 'react-redux'
import {Server} from '../components/ServerCard'

class WSConnection extends Component {
		//new websocket connection
		constructor({dispatch}){
			super(dispatch);
			this.dispatch = dispatch;
		}
		componentDidMount(){
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
			//temp serve
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
			if (isNew) dispatch(addServerCard(s));
			
		  }
		  
	  }
		}

}

export default connect() (WSConnection)