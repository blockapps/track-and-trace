import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import { Snackbar, IconButton, Icon } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { resetUserMessage } from "../../actions/user-message.actions";

class SnackbarMessage extends Component {

  handleClose = () => {
    this.props.resetUserMessage();
  }

  render() {
    const { userMessage } = this.props;
    const isOpen = Boolean(userMessage);

    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={isOpen}
        autoHideDuration={3000}
        onClose={this.handleClose}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">{userMessage}</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={this.handleClose}
          >
            <CloseIcon />
          </IconButton>,
        ]}
      />
    )
  }
}

const styles = theme => ({
  // any local styling classes would go here
});

const mapStateToProps = (state) => {
  return {
    authentication: state.authentication,
    userMessage: state.userMessage.message
  };
};

const connected = connect(mapStateToProps, {
  resetUserMessage
})(
  withStyles(styles)(SnackbarMessage)
);

export default withRouter(connected);
