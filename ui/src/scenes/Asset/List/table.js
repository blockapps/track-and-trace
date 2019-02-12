import React, { Component } from "react";
import { TablePagination, Table, TableBody, TableHead, TableRow, TableCell, Paper, Typography } from '@material-ui/core';

class AssetsTable extends Component {

  constructor(props) {
    super(props);

    this.state = {
      page: 0,
      rowsPerPage: 5
    }
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  renderRows = (assets) => {
    const { page, rowsPerPage } = this.state;
    const { redirectToAssetDetail } = this.props;

    if (assets.length) {
      return (assets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((asset, key) => {
          return (
            <TableRow key={key} hover onClick={event => redirectToAssetDetail(event, asset.id)}>
              <TableCell align="left"> {asset.name} </TableCell>
              <TableCell align="left">{asset.description}</TableCell>
              <TableCell align="left">{asset.price}</TableCell>
            </TableRow>)
        }));
    }

    return (
      <TableRow>
        <TableCell colSpan={3} align="center"> No Assets Found </TableCell>
      </TableRow>
    )
  }

  render() {
    const { assets, title } = this.props;

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
            </TableRow>
          </TableHead>
          <TableBody className="assets-table-body">
            {this.renderRows(assets)}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[2]}
          component="div"
          count={assets.length}
          rowsPerPage={this.state.rowsPerPage}
          page={this.state.page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    )
  }
}

export default AssetsTable;
