import React, { Component } from 'react'
import { Typography, Popover, AppBar, Toolbar, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { connect } from "react-redux";
import { logout } from '../../actions/authentication.actions';
import LoadingBar from 'react-redux-loading-bar';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      popoverEl: null,
    };
  }

  handleClick = event => {
    this.setState({
      popoverEl: event.currentTarget,
    });
  };

  handleClose = () => {
    this.setState({
      popoverEl: null,
    });
  };

  render() {
    const { user, classes, isAuthenticated, logout, history } = this.props;
    const { popoverEl } = this.state;
    const isOpen = Boolean(popoverEl);

    return (
      <AppBar position="static">
        <Toolbar className={classes.toolbar} >
          <Typography variant="h6" color="inherit" onClick={() => { history.push('/') }} className={classes.heading}>
            Track And Trace
          </Typography>

          {
            isAuthenticated &&
            (
              <div className={classes.accountDiv}>
                <Button color="inherit" onClick={this.handleClick}>
                  {user.username}
                  <AccountCircle className={classes.accountIcon} />
                </Button>
                <Popover
                  id="simple-popper"
                  open={isOpen}
                  anchorEl={popoverEl}
                  onClose={this.handleClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                >
                  <Typography className={classes.typography}>
                    <Button color="inherit" onClick={logout}>logout</Button>
                  </Typography>
                </Popover>
              </div>
            )
          }
        </Toolbar>
        <LoadingBar className={classes.loadingBar} />
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
  // (typography) is depricated. So immediate switch to typography v2 you can simply pass useNextVariants: true when calling 
  typography: {
    useNextVariants: true,
    margin: '8px'
  },
  accountIcon: {
    marginLeft: theme.spacing.unit
  },
  accountDiv: {
    float: '1px solid black'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  loadingBar: {
    top: '0px',
    backgroundColor: '#E10050',
    zIndex: 999,
    height: '4px'
  },
  heading: {
    cursor: 'pointer'
  },
});

const connected = connect(mapStateToProps, {
  logout
})(Header)

export default withStyles(styles)(connected);