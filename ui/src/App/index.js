import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import Header from '../components/header';
import Routes from '../routes';
import ThemedComponent from './Theme';
import { themeColor } from '../utils/roles.utils';

class App extends Component {

  render() {
    const { classes, user } = this.props;
    const { role } = user;
    
    return (
      <ThemedComponent color={themeColor(role)} >
        <div className={classes.docRoot}>
          <Header />
          <Grid container className={classes.root} spacing={8}>
            <Routes />
          </Grid>
        </div>
      </ThemedComponent>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.authentication.user
  };
};

const styles = theme => ({
  root: {
    flexGrow: 1,
    paddingTop: theme.spacing.unit * 8,
  },
  docRoot: {
    top: 0,
    bottom: 0
  }
});

const connected = connect(mapStateToProps, {})(
  withStyles(styles)(App)
);

export default withRouter(connected);
