import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import { Grid, AppBar, Typography, Toolbar } from '@material-ui/core';

import CreateAssetModal from '../Asset/Create';
import AssetsList from '../../scenes/Asset/List';
import './Dashboard.css';
class Dashboard extends Component {

  render() {
    return (
      <div className="dashboard">
        <Grid container xs={12}>
          <AppBar position="static" color="default">
            <Toolbar>
              <Typography variant="h6" color="inherit" className="appbar-container">
                <CreateAssetModal />
              </Typography>
            </Toolbar>
          </AppBar>
        </Grid>
        <Grid container xs={12}>
          <AssetsList />
        </Grid>
      </div>
    )
  }
}

const styles = theme => ({
  // any local styling classes would go here
});

const mapStateToProps = (state) => {
  return {};
};

const connected = connect(mapStateToProps, {})(
  withStyles(styles)(Dashboard)
);

export default withRouter(connected);
