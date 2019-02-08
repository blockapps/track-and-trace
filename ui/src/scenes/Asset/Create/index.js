import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { Field, reduxForm, Form } from 'redux-form'
import ReduxedTextField from "../../../components/ReduxedTextField";
import { openCreateAssetOverlay, closeCreateAssetOverlay, createAsset } from "../../../actions/asset.actions";

class CreateAssetModal extends Component {

  submit = (asset) => {
    this.props.createAsset(asset);
  }

  render() {
    const { handleSubmit, isOpen, openCreateAssetOverlay, closeCreateAssetOverlay } = this.props;

    return (
      <div>
        <Button variant="contained" color="primary" onClick={() => {
          openCreateAssetOverlay();
          this.props.reset();
        }}>
          Create asset
        </Button>
        <Dialog
          open={isOpen}
          onClose={closeCreateAssetOverlay}
          aria-labelledby="form-dialog-title"
        >
          <Form onSubmit={handleSubmit(this.submit)}>
            <DialogTitle id="form-dialog-title">Create Asset</DialogTitle>
            <DialogContent>
              <Field
                name="SKU"
                type="text"
                placeholder="SKU"
                margin="normal"
                component={ReduxedTextField}
                fullWidth
                required
              />
              <Field
                name="name"
                type="text"
                placeholder="Name"
                margin="normal"
                component={ReduxedTextField}
                fullWidth
                required
              />
              <Field
                name="description"
                type="text"
                placeholder="Description"
                margin="normal"
                component={ReduxedTextField}
                fullWidth
                required
              />
              <Field
                name="price"
                type="text"
                placeholder="Price"
                margin="normal"
                component={ReduxedTextField}
                fullWidth
                required
              />
              {/* TODO: add Spec sheet - list of key value pairs */}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeCreateAssetOverlay} color="primary"> Cancel </Button>
              <Button type="submit" color="primary"> Create </Button>
            </DialogActions>
          </Form>
        </Dialog>
      </div >
    )
  }
}

const mapStateToProps = (state) => {
  return {
    isOpen: state.asset.isCreateAssetModalOpen
  };
};

const formed = reduxForm({ form: 'create-asset' })(CreateAssetModal);
const connected = connect(mapStateToProps, {
  openCreateAssetOverlay,
  closeCreateAssetOverlay,
  createAsset
})(formed);

export default withRouter(connected);
