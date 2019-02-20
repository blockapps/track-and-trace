import React, { Component } from 'react';
import Header from '../components/Header';
import Routes from '../routes';
import { withRouter } from 'react-router-dom'
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import ThemedComponent from './theme';
import { themeColor } from '../utils/roles.utils';
import { getConstants } from '../actions/constants.actions';

class App extends Component {

  componentDidMount() {
    this.props.getConstants();
  }

  render() {
    const { classes, user, constants, history } = this.props;
    let userRole = user && user['role'];
    const USER_ROLE = constants && constants.TT.TtRole;

    return (
      <div>
        {
          USER_ROLE ? (<ThemedComponent color={themeColor(userRole, USER_ROLE)} >
            <div className={classes.docRoot}>
              <Header history={history} />
            </div>
            <Grid>
              <Routes />
            </Grid>
          </ThemedComponent>) : ''
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.authentication.user,
    constants: state.constants
  };
};

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  docRoot: {
    top: 0,
    bottom: 0
  }
});

const connected = connect(mapStateToProps, {
  getConstants
})(
  withStyles(styles)(App)
);

export default withRouter(connected);
