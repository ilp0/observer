import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';


export default class Example extends React.Component {
  render() {
    return (
      <div>
        <h1>Observer</h1>
        <Nav pills fixed="true" vertical color="primary">
          <NavItem>
            <NavLink href="#" active>Server 1</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#">Server 2</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#">Server 3</NavLink>
          </NavItem>
          <NavItem>
            <NavLink disabled href="#">Server 4</NavLink>
          </NavItem>
        </Nav>
        <hr />
      </div>
    );
  }
}
