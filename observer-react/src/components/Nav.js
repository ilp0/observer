import React from 'react';
import { Nav, NavItem, NavLink, Button } from 'reactstrap';


export default class Example extends React.Component {

  constructor(props){
    super(props);
    this.Click = this.Click.bind(this);
    this.servers = props.servers;
    this.state = {ser: this.servers};
  }

  Click(id){
    this.props.allClick(id);
  }

  render() {
    return (
      <div>
        <h1><a onClick={() =>this.Click(0)}>Observer</a></h1>
        <Nav pills fixed="true" vertical color="primary">
        {
        this.state.ser.map((slave, index) =>
        <NavItem key={index}>
        <Button onClick={() =>this.Click(slave.id)}>{slave.ip}</Button>
        </NavItem>)
        }
        </Nav>
        <hr />
      </div>
    );
  }

  componentDidMount(){
		//UPDATE CARDS EVERY 1000MS
		this.timerID = setInterval(
			  () => this.tick(),
			  1000
			);
		}
	
		//CLEARS THE 1 SECOND TIMER
		componentWillUnmount() {
			clearInterval(this.timerID);
		}
		//THIS RUNS EVERY 1 SECONDS.
		tick() {
			this.setState({ser: this.state.ser, view: this.state.view});
	
		}
}
