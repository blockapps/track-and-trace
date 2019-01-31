import React, { Component } from 'react';
import {connect} from 'react-redux';
import { withRouter } from 'react-router-dom'
import {
  getUser
} from '../../actions/authentication.actions';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

class EnsureAuthenticated extends Component {
  componentDidMount() {
    this.props.getUser();
  }

  render() {
    const {
      authentication,
      children,
      classes
    } = this.props;

    const {
      isAuthenticated,
      isGetUserComplete,
      loginUrl
    } = authentication;

    if(!isGetUserComplete) {
      return (
        <Grid item xs={12} className={classes.item}>
          <Grid container justify="center" alignItems="center" className={classes.container}>
            <Grid item>
              <Paper className={classes.paper}>
                <Typography variant="h5" component="h3">
                  Checking login status
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      );
    }

    if(isGetUserComplete && !isAuthenticated) {
      window.location = loginUrl;
      return null;
    }

    return children;
  }
}

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 2,
  },
  container: {
    height: 400,
  },
  item: {
  }
});

function mapStateToProp(state) {
  return {
    authentication: state.authentication
  }
}

export default withRouter(
  connect(
    mapStateToProp,
    {
      getUser
    }
  )(
    withStyles(styles)(EnsureAuthenticated)
  )
);
