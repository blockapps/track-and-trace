import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

class Dashboard extends Component {
  render() {
    return (
      <div>
        <h3>Dashboard</h3>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {};
};

const connected = connect(mapStateToProps, {})(Dashboard);

export default withRouter(connected);
