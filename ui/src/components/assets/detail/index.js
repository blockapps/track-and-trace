import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Paper from '@material-ui/core/Paper';
import './assets.css';

class AssetDetail extends Component {

  render() {
    return (
      <Paper className="assets-container">
        {/* asset details wil show here */}
      </Paper>
    )
  }
}

const mapStateToProps = (state) => {
  // TODO: will filter asset details using asset ID
  return {
    assets: state.assets.assets
  };
};

const connected = connect(mapStateToProps, {  })(AssetDetail);

export default withRouter(connected);
