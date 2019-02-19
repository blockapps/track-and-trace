import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { Field, reduxForm, Form } from 'redux-form'
import ReduxedTextField from "../../../components/ReduxedTextField";
import { openBidOverlay, closeBidOverlay } from "../../../actions/bid.actions";

class PlaceBidModal extends Component {

  submit = (bid) => {
    const { bidValue } = bid;
    const { address, owner } = this.props.asset;
    console.log("----------------", address)
    console.log("----------------", owner)

  }

  render() {
    const { isOpen, openBidOverlay, closeBidOverlay, handleSubmit, asset } = this.props;

    return (
      <div>
        <Button variant="contained" color="primary" onClick={() => {
          openBidOverlay();
          this.props.reset();
        }}>
          Place bid
        </Button>
        <Dialog
          open={isOpen}
          onClose={closeBidOverlay}
          aria-labelledby="form-dialog-title"
        >
          <Form onSubmit={handleSubmit(this.submit)}>
            <DialogTitle id="form-dialog-title">Place Bid</DialogTitle>
            <DialogContent>
              <Field
                name="bidValue"
                type="number"
                placeholder="Enter amount"
                margin="normal"
                component={ReduxedTextField}
                fullWidth
                required
              />
              {
                this.props.error && (
                  <div>error</div>
                )
              }
            </DialogContent>
            <DialogActions>
              <Button onClick={closeBidOverlay} color="primary"> Cancel </Button>
              <Button type="submit" color="primary"> Bid </Button>
            </DialogActions>
          </Form>
        </Dialog>
      </div >
    )
  }
}

const mapStateToProps = (state) => {
  return {
    isOpen: state.bid.isBidOverlayOpen
  };
};

const formed = reduxForm({ form: 'place-bid' })(PlaceBidModal);
const connected = connect(mapStateToProps, {
  openBidOverlay,
  closeBidOverlay
})(formed);

export default withRouter(connected);
