import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Icon,
  Select,
  MenuItem
} from "@material-ui/core";
import { reduxForm, Form, Field, FieldArray } from "redux-form";
import ReduxedTextField from "../../../components/ReduxedTextField";
import {
  openCreateAssetOverlay,
  closeCreateAssetOverlay,
  createAsset,
  getAssets
} from "../../../actions/asset.actions";
import "./Create.css";
import { CREATE_ASSET_MODES } from "../../../constants";

class CreateAssetModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      createAssetMode: CREATE_ASSET_MODES.USING_FIELDS
    };
  }

  onFileLoad = e => {
    this.setState({ file: e.target.files[0] });
  };

  submit = asset => {
    const { specs } = asset;
    const { file, createAssetMode } = this.state;

    const params =
      this.state.createAssetMode === CREATE_ASSET_MODES.USING_FIELDS
        ? {
            sku: asset.sku,
            description: asset.description,
            name: asset.name,
            price: asset.price,
            keys: specs.map(s => s.key),
            values: specs.map(s => s.value)
          }
        : { file };

    this.props.createAsset(params, createAssetMode);
  };

  componentDidUpdate(prevProps) {
    if (prevProps.isOpen && !this.props.isOpen && !this.props.error) {
      this.props.getAssets();
    }
  }

  renderSpec = ({ fields }) => {
    if (!fields.length) {
      fields.push({});
    }

    return (
      <div>
        {fields.map((user, index) => (
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
                required
              />
              <Field
                id={`${user}.value`}
                name={`${user}.value`}
                type="text"
                margin="normal"
                label="Value"
                component={ReduxedTextField}
                required
              />
              <span className="spec-delete">
                {index ? (
                  <IconButton
                    aria-label="Delete"
                    className="remove-button"
                    onClick={() => fields.remove(index)}
                  >
                    <Icon color="action">delete</Icon>
                  </IconButton>
                ) : (
                  ""
                )}
              </span>
            </div>
          </div>
        ))}
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={() => fields.push({})}
          >
            add spec
          </Button>
        </div>
      </div>
    );
  };

  handleChange = event => {
    this.setState({ createAssetMode: event.target.value });
  };

  render() {
    const {
      handleSubmit,
      isOpen,
      openCreateAssetOverlay,
      closeCreateAssetOverlay
    } = this.props;
    const { createAssetMode } = this.state;

    return (
      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            openCreateAssetOverlay();
            this.props.reset();
          }}
        >
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
              <Select
                className="select-mode-dropdown"
                value={this.state.createAssetMode}
                onChange={this.handleChange}
              >
                <MenuItem value={CREATE_ASSET_MODES.USING_FIELDS}>
                  Using fields
                </MenuItem>
                <MenuItem value={CREATE_ASSET_MODES.USING_CSV}>
                  Using CSV file
                </MenuItem>
              </Select>
              {createAssetMode === CREATE_ASSET_MODES.USING_FIELDS ? (
                <div>
                  <Field
                    name="sku"
                    type="text"
                    placeholder="Stock Keeping Unit"
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
                  {this.props.error && <div>error</div>}
                  <FieldArray name="specs" component={this.renderSpec} />
                </div>
              ) : (
                <div className="create-asset">
                  <input
                    type="file"
                    onChange={this.onFileLoad}
                    accept=".csv"
                    required
                  />
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeCreateAssetOverlay} color="primary">
                {" "}
                Cancel{" "}
              </Button>
              <Button type="submit" color="primary">
                {" "}
                {createAssetMode === CREATE_ASSET_MODES.USING_FIELDS
                  ? "Create"
                  : "Import"}{" "}
              </Button>
            </DialogActions>
          </Form>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    isOpen: state.asset.isCreateAssetModalOpen,
    error: state.asset.error
  };
};

const formed = reduxForm({ form: "create-asset" })(CreateAssetModal);
const connected = connect(mapStateToProps, {
  openCreateAssetOverlay,
  closeCreateAssetOverlay,
  createAsset,
  getAssets
})(formed);

export default withRouter(connected);
