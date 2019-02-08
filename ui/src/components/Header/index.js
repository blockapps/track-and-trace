import React, { Component } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { connect } from "react-redux";

class Header extends Component {
  render() {
    const {user, classes, isAuthenticated} = this.props;

    return (
      <AppBar position="static">
        <Toolbar className={classes.toolbar} >
          <Typography variant="h6" color="inherit">
            Track And Trace
          </Typography>

          {
            isAuthenticated &&
            (
              <div className={classes.accountDiv}>
                <Button color="inherit">
                  {user.username}
                  <AccountCircle className={classes.accountIcon} />
                </Button>
              </div>
            )
          }   
        </Toolbar>
      </AppBar>
    )
  }
}


const mapStateToProps = (state, ownProps) => {
  return {
    isAuthenticated: state.authentication.isAuthenticated,
    user: state.authentication.user
  };
};

const styles = theme => ({
  accountIcon: {
    marginLeft: theme.spacing.unit
  },
  accountDiv: {
    float : '1px solid black'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between'
  }
});

const connected = connect(mapStateToProps, {})(Header)

export default withStyles(styles)(connected);