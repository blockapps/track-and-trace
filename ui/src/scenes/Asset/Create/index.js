import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { reduxForm, Form } from 'redux-form'
import {
  openCreateAssetOverlay,
  closeCreateAssetOverlay,
  createAsset,
  getAssets
} from "../../../actions/asset.actions";
import './Create.css'

class CreateAssetModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      file: null
    }
  }

  onFileLoad = (e) => {
    this.setState({ file: e.target.files[0] });
  }

  submit = (asset) => {
    const { file } = this.state;

    const params = { file };
    this.props.createAsset(params);
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
          Import assets
        </Button>
        <Dialog
          open={isOpen}
          onClose={closeCreateAssetOverlay}
          aria-labelledby="form-dialog-title"
        >
          <Form onSubmit={handleSubmit(this.submit)}>
            <DialogTitle id="form-dialog-title">Import assets</DialogTitle>
            <DialogContent>
              <div className="create-asset">
                <input type="file" onChange={this.onFileLoad} accept=".csv" required />
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeCreateAssetOverlay} color="primary"> Cancel </Button>
              <Button type="submit" color="primary"> Import </Button>
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
