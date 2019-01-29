import React, { Component } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

class Header extends Component {
  render() {
    return (
      <AppBar>
        <Toolbar>
          <Typography variant="h6" color="inherit">
            Track And Trace
          </Typography>
        </Toolbar>
      </AppBar>
    )
  }
}

const styles = theme => ({
  // any local styling classes would go here
});


export default withStyles(styles)(Header);