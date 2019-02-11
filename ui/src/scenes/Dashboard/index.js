import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import { Grid, AppBar, Typography, Toolbar } from '@material-ui/core';

import CreateAssetModal from '../Asset/Create';
import AssetsList from '../../scenes/Asset/List';
import { ROLES_INDEX } from "../../utils/roles.utils";
import './dashboard.css';
import SnackbarMessage from "../../components/SnackbarMessage";
class Dashboard extends Component {

  get isManufacturer() {
    return parseInt(this.props.authentication.user['role'], 10) === ROLES_INDEX.MANUFACTURER;
  }

  render() {
    return (
      <div className="dashboard">
        <Grid container>
          <AppBar position="static" color="default">
            <Toolbar>
              <Typography variant="h6" color="inherit" className="appbar-container">
                {this.isManufacturer && <CreateAssetModal />}
              </Typography>
            </Toolbar>
          </AppBar>
        </Grid>
        <Grid container>
          <AssetsList />
        </Grid>
        <SnackbarMessage />
      </div>
    )
  }
}

const styles = theme => ({
  // any local styling classes would go here
});

const mapStateToProps = (state) => {
  return {
    authentication: state.authentication
  };
};

const connected = connect(mapStateToProps, {})(
  withStyles(styles)(Dashboard)
);

export default withRouter(connected);
