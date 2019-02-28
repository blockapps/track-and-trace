import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import { Grid, AppBar, Typography, Toolbar } from '@material-ui/core';

import CreateAssetModal from '../Asset/Create';
import AssetsList from '../../scenes/Asset/List';
import './dashboard.css';
import SnackbarMessage from "../../components/SnackbarMessage";
class Dashboard extends Component {

  get isManufacturer() {
    const { USER_ROLE } = this.props;
    return parseInt(this.props.authentication.user['role'], 10) === USER_ROLE.MANUFACTURER;
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
  // (typography) is depricated. So immediate switch to typography v2 you can simply pass useNextVariants: true when calling 
  typography: {
    useNextVariants: true,
  },
});

const mapStateToProps = (state) => {
  return {
    authentication: state.authentication,
    USER_ROLE: state.constants.TT.TtRole
  };
};

const connected = connect(mapStateToProps, {})(
  withStyles(styles)(Dashboard)
);

export default withRouter(connected);
