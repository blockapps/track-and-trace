import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import {
  Button,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Icon,
  Input,
  LinearProgress,
  Typography
} from "@material-ui/core";
import { reduxForm, Form, Field, FieldArray } from "redux-form";
import ReduxedTextField from "../../../components/ReduxedTextField";
import {
  openCreateAssetOverlay,
  closeCreateAssetOverlay,
  openImportAssetsOverlay,
  closeImportAssetsOverlay,
  createAsset,
  getAssets,
  importAssets
} from "../../../actions/asset.actions";
import "./Create.css";
import { setUserMessage } from "../../../actions/user-message.actions";
import { readString } from "react-papaparse";
import moment from "moment";

class CreateAssetModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      assetData: {},
      isValidated: true,
    };
  }

  onFileLoad = e => {
    const event = e.nativeEvent || e;
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type !== "text/csv") {
        this.props.setUserMessage(
          "Invalid file type. File must be of type text/csv"
        );
        return;
      }
      this.setState({ isValidated: true });
      const reader = new FileReader();
      reader.onload = evt => {
        const contents = readString(evt.target.result, { header: true });

        if (contents.data.length === 0) {
          this.props.setUserMessage("No records to import");
          return;
        }
        if (!contents.data[0].name) {
          this.props.setUserMessage("Missing required column 'name'");
          return;
        }
        if (!contents.data[0].description) {
          this.props.setUserMessage("Missing required column 'description'");
          return;
        }
        if (!contents.data[0].price) {
          this.props.setUserMessage("Missing required column 'price'");
          return;
        }

        const assetData = [];

        for (let i = 0; i < contents.data.length - 1; i++) {
          const row = contents.data[i];

          const price = parseInt(row.price);
          if (isNaN(price)) {
            this.setState({ isValidated: false });
            this.props.setUserMessage("'Price' should be an number");
            break;
          }

          const keys = Object.keys(row).filter(
            k => k !== "name" && k !== "description" && k !== "price"
          );

          assetData.push({
            sku: `${moment().valueOf()}_${file.name}_${i}`,
            description: row.description,
            name: row.name,
            price: row.price,
            keys: keys,
            values: keys.map(k => row[k])
          });
        }

        this.setState({ assetData });
      };
      reader.readAsText(file, "UTF-8");
    }
  };

  startImport = () => {
    this.props.importAssets(this.state.assetData);
  };

  submitFields = asset => {
    const { specs } = asset;

    const params = {
      sku: asset.sku,
      description: asset.description,
      name: asset.name,
      price: asset.price,
      keys: specs.map(s => s.key),
      values: specs.map(s => s.value)
    };

    this.props.createAsset(params);
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.isCreateAssetModalOpen &&
      !this.props.isCreateAssetModalOpen &&
      !this.props.error
    ) {
      this.props.getAssets();
      return;
    }
    if (
      prevProps.isImportAssetsModalOpen &&
      !this.props.isImportAssetsModalOpen &&
      !this.props.error
    ) {
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
            Add Spec
          </Button>
        </div>
      </div>
    );
  };

  closeImportAssetsOverlay = () => {
    this.setState({ isValidated: true, assetData: {} })
    this.props.closeImportAssetsOverlay();
  }

  render() {
    const {
      handleSubmit,
      isCreateAssetModalOpen,
      isImportAssetsModalOpen,
      openCreateAssetOverlay,
      closeCreateAssetOverlay,
      openImportAssetsOverlay,
      assetsUploaded,
      isAssetImportInProgress
    } = this.props;

    const {
      isValidated
    } = this.state;

    return (
      <div>
        <ButtonGroup>
          <Button
            variant="contained"
            color="primary"
            style={{ marginRight: '15px' }}
            onClick={() => {
              openImportAssetsOverlay();
              this.props.reset();
            }}
          >
            Import Assets
          </Button>
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
        </ButtonGroup>
        <Dialog
          open={isImportAssetsModalOpen}
          onClose={this.closeImportAssetsOverlay}
          aria-labelledby="form-dialog-title"
          disableBackdropClick={true}
          disableEscapeKeyDown={true}
        >
          <Form onSubmit={handleSubmit(this.startImport)}>
            <DialogTitle id="form-dialog-title">Import Assets</DialogTitle>
            <DialogContent>
              <div>
                <Input
                  color="primary"
                  type="file"
                  onChange={this.onFileLoad}
                  accept=".csv"
                  id="icon-button-file"
                  required
                />
              </div>
              {isValidated && this.state.assetData.length > 0 ? (
                <div style={{ marginTop: 16 }}>
                  <Typography variant="body2" color="textSecondary">
                    {isAssetImportInProgress
                      ? `${assetsUploaded} / ${this.state.assetData.length} records imported`
                      : `Click on IMPORT button to ingest ${this.state.assetData.length} records`}
                  </Typography>
                  <LinearProgress
                    color="primary"
                    variant="determinate"
                    value={(assetsUploaded * 100) / this.state.assetData.length}
                  />
                </div>
              ) : (
                  <div></div>
                )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={this.closeImportAssetsOverlay}
                color="primary"
                disabled={isAssetImportInProgress}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={
                  !isValidated || isAssetImportInProgress || this.state.assetData.length === 0
                }
              >
                Import
              </Button>
            </DialogActions>
          </Form>
        </Dialog>
        <Dialog
          open={isCreateAssetModalOpen}
          onClose={closeCreateAssetOverlay}
          aria-labelledby="form-dialog-title"
        >
          <Form onSubmit={handleSubmit(this.submitFields)}>
            <DialogTitle id="form-dialog-title">Create Asset</DialogTitle>
            <DialogContent>
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
            </DialogContent>
            <DialogActions>
              <Button onClick={closeCreateAssetOverlay} color="primary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Create
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
    isCreateAssetModalOpen: state.asset.isCreateAssetModalOpen,
    isImportAssetsModalOpen: state.asset.isImportAssetsModalOpen,
    isAssetImportInProgress: state.asset.isAssetImportInProgress,
    assetsUploaded: state.asset.assetsUploaded,
    error: state.asset.error
  };
};

const formed = reduxForm({ form: "create-asset" })(CreateAssetModal);
const connected = connect(mapStateToProps, {
  openCreateAssetOverlay,
  openImportAssetsOverlay,
  closeImportAssetsOverlay,
  closeCreateAssetOverlay,
  createAsset,
  getAssets,
  setUserMessage,
  importAssets
})(formed);

export default withRouter(connected);
