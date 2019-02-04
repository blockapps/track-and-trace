import React, { Component } from 'react';
import Header from '../components/Header';
import Routes from '../routes';
import { withRouter } from 'react-router-dom'
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

class App extends Component {
  render() {
    const { classes } = this.props;

    return (
      <div>
        <div className={classes.docRoot}>
          <Header />
        </div>
        <Grid>
          <Routes />
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  docRoot:{
    top:0,
    bottom: 0
  }
});

const connected = connect(mapStateToProps, {})(
  withStyles(styles)(App)
);

export default withRouter(connected);
