import React, { Component } from 'react';

class Popup extends React.Component {

  constructor(props){
    super(props);
    this.text = props.text;
    this.closePopup = props.closePopup;
  }
    render() {
      return (
        <div className='popup'>
          <div className='popup_inner'>
            <h1>{this.props.text}</h1>
          <button onClick={this.props.closePopup}>close me</button>
          </div>
        </div>
      );
    }
  }

export default Popup;