import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Icon, IconButton } from '@material-ui/core';
import { Field, reduxForm, Form, FieldArray } from 'redux-form'
import ReduxedTextField from "../../../components/ReduxedTextField";
import {
  openCreateAssetOverlay,
  closeCreateAssetOverlay,
  createAsset,
  getAssets
} from "../../../actions/asset.actions";
import './Create.css'

class CreateAssetModal extends Component {

  submit = (asset) => {
    const { specs } = asset;

    let spec = specs.map((spec) => {
      return ({ [spec.key]: spec.value });
    });

    const params = {
      _SKU: asset.SKU,
      _description: asset.description,
      _name: asset.name,
      _price: asset.price,
      _spec: spec
    }

    this.props.createAsset(params);
  }

  renderSpec = ({ fields }) => {
    return (
      <div>
        {fields.map((user, index) =>
          <div key={index}>
            <div>
              <Field
                id={`${user}.key`}
                name={`${user}.key`}
                type="text"
                label="Key"
                margin="normal"
                className="spec-field"
                component={ReduxedTextField}
              />
              <Field
                id={`${user}.value`}
                name={`${user}.value`}
                type="text"
                margin="normal"
                label="Value"
                component={ReduxedTextField}
              />
              <span className="spec-delete">
                <IconButton aria-label="Delete" className="remove-button" onClick={() => fields.remove(index)}>
                  <Icon color="action">delete</Icon>
                </IconButton>
              </span>
            </div>
          </div>
        )}
        <div>
          <Button variant="contained" color="primary" onClick={() => fields.push({})}>
            add spec
          </Button>
        </div>
      </div>
    )
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isOpen && !this.props.isOpen && !this.props.error) {
      this.props.getAssets();
    }
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
              {
                this.props.error && (
                  <div>error</div>
                )
              }
              <FieldArray name="specs" component={this.renderSpec} />
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
    isOpen: state.asset.isCreateAssetModalOpen,
    error: state.asset.error,
  };
};

const formed = reduxForm({ form: 'create-asset' })(CreateAssetModal);
const connected = connect(mapStateToProps, {
  openCreateAssetOverlay,
  closeCreateAssetOverlay,
  createAsset,
  getAssets
})(formed);

export default withRouter(connected);
