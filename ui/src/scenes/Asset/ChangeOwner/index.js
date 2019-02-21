import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { Field, reduxForm, Form } from 'redux-form'
import ReduxedTextField from "../../../components/ReduxedTextField";
import { openChangeOwnerOverlay, closeChangeOwnerOverlay, changeOwner } from "../../../actions/asset.actions";
import './changeOwner.css';

class ChangeOwnerModal extends Component {

  submit = (data) => {
    const { asset } = this.props;
    this.props.changeOwner({ sku: asset.sku, owner: data.owner });
  }

  render() {
    const { isOpen, openChangeOwnerOverlay, closeChangeOwnerOverlay, handleSubmit } = this.props;

    return (
      <div className="owner-container">
        <Button variant="contained" color="primary" onClick={() => {
          openChangeOwnerOverlay();
        }}>
          Change Owner
        </Button>
        <Dialog
          open={isOpen}
          onClose={closeChangeOwnerOverlay}
          aria-labelledby="form-dialog-title"
        >
          <Form onSubmit={handleSubmit(this.submit)}>
            <DialogTitle id="form-dialog-title">Change Owner</DialogTitle>
            <DialogContent>
              <Field
                name="owner"
                type="text"
                placeholder="Enter address of the owner"
                margin="normal"
                component={ReduxedTextField}
                fullWidth
                required
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={closeChangeOwnerOverlay} color="primary"> Cancel </Button>
              <Button type="submit" color="primary"> Change Owner </Button>
            </DialogActions>
          </Form>
        </Dialog>
      </div >
    )
  }
}

const mapStateToProps = (state) => {
  return {
    isOpen: state.asset.isChangeOwnerModalOpen
  };
};

const formed = reduxForm({ form: 'change-owner' })(ChangeOwnerModal);
const connected = connect(mapStateToProps, {
  openChangeOwnerOverlay,
  closeChangeOwnerOverlay,
  changeOwner
})(formed);

export default withRouter(connected);
