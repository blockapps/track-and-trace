import React, { Component } from "react";
import {
  TablePagination,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  Typography, Grid
} from "@material-ui/core";
import { Field } from "redux-form";
import ReduxedTextField from "../../../components/ReduxedTextField";

class AssetsTable extends Component {
  constructor(props) {
    super(props);
    this.timeout = 0;
    this.state = {
      search: null
    }
  }

  renderRows = (assets) => {
    const { redirectToAssetDetail, ASSET_STATE } = this.props;

    if (assets.length) {
      return assets.map((asset, key) => {
        return (
          <TableRow
            key={key}
            hover
            onClick={(event) => redirectToAssetDetail(event, asset.sku)}
          >
            <TableCell align="left"> {asset.name} </TableCell>
            <TableCell align="left">{asset.description}</TableCell>
            <TableCell align="left">{asset.price}</TableCell>
            <TableCell align="left">{ASSET_STATE[asset.assetState]}</TableCell>
          </TableRow>
        );
      });
    }

    return (
      <TableRow>
        <TableCell colSpan={4} align="center">
          {" "}
          No Assets Found{" "}
        </TableCell>
      </TableRow>
    );
  };

  search = (event, search) => {
    const {
      limit,
      offset,
      assetType,
      onChangePage
    } = this.props;

    this.setState({ search })

    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      onChangePage(assetType, offset / limit, search);
    }, 1000);
  }

  render() {
    const {
      assets,
      title,
      onChangePage,
      limit,
      offset,
      assetType
    } = this.props;

    const {
      search
    } = this.state;

    return (
      <Paper className="assets-container">
        <div className="asset-table-title">
          <Grid container spacing={3}>
            <Grid item xs={9}>
              <Typography variant="h6" id="tableTitle">
                {title}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Field
                type="text"
                name={`search-${assetType}`}
                className="search-box"
                placeholder="Search by SKU, Name or Description"
                margin="normal"
                component={ReduxedTextField}
                onChange={this.search}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </div>
        <Table className="assets-table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Description</TableCell>
              <TableCell align="left">Price</TableCell>
              <TableCell align="left">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="assets-table-body">
            {this.renderRows(assets)}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[2]}
          component="div"
          count={-1}
          rowsPerPage={limit}
          page={offset / limit}
          backIconButtonProps={{
            "aria-label": "Previous Page",
          }}
          nextIconButtonProps={{
            "aria-label": "Next Page",
          }}
          onChangePage={(event, page) => {
            onChangePage(assetType, page, search);
          }}
        />
      </Paper>
    );
  }
}

export default AssetsTable;
