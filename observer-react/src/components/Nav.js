import React from 'react';
import { Nav, NavItem, NavLink, Button } from 'reactstrap';
import logo from '../observer.svg';


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
        <img className="mainLogo" src={logo} onClick={() =>this.Click(0)}></img>
        <Nav pills fixed="true" vertical color="primary">
        {
        this.state.ser.map((slave, index) =>
        <NavItem className="navServerBtn" key={index}>
        <Button disabled={slave.status === "OFFLINE" ? true : false} className="navServerBtnInner" onClick={() =>this.Click(slave.id)}>{slave.friendlyname} - {slave.ip}</Button>
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
