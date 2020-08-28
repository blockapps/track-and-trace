import React, { Component } from "react";
import {
  TablePagination,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  Typography,
} from "@material-ui/core";

class AssetsTable extends Component {
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

  render() {
    const {
      assets,
      title,
      onChangePage,
      limit,
      offset,
      assetType,
    } = this.props;

    return (
      <Paper className="assets-container">
        <div className="asset-table-title">
          <Typography variant="h6" id="tableTitle">
            {title}
          </Typography>
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
            onChangePage(assetType, page);
          }}
        />
      </Paper>
    );
  }
}

export default AssetsTable;
