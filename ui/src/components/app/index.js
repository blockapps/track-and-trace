import React, { Component } from 'react';
import Header from '../header/';
import Routes from '../../routes';
import { withRouter } from 'react-router-dom'
import { connect } from "react-redux";

class App extends Component {
  render() {
    return (
      <div>
        <Header />
        <main id="outer-container">
          <Routes />
        </main>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};



const connected = connect(mapStateToProps, {})(App);

export default withRouter(connected);
