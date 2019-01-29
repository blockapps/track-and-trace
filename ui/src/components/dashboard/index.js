import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

class Dashboard extends Component {
  render() {
    // const { classes } = this.props
    return (
      <Grid item xs={12}>
        <Paper>
          <Typography variant="h5" component="h3">
            Dashboard
          </Typography>
        </Paper>
      </Grid>
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
