import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { TablePagination, Table, TableBody, TableHead, TableRow, TableCell, Paper } from '@material-ui/core';

import { getAssets } from "../../../actions/asset.actions";
import './List.css';

class AssetsList extends Component {

  constructor(props) {
    super(props);

    this.state = {
      page: 0,
      rowsPerPage: 5
    }
  }

  componentDidMount() {
    this.props.getAssets();
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  redirectToAssetDetail = (event, address) => {
    this.props.history.push(`/asset/${address}`);
  };

  renderRows = (assets) => {
    const { page, rowsPerPage } = this.state;

    if (assets.length) {
      return (assets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((asset, key) => {
          return (
            <TableRow key={key} hover onClick={event => this.redirectToAssetDetail(event, asset.address)}>
              <TableCell align="left"> {asset.name} </TableCell>
              <TableCell align="left">{asset.description}</TableCell>
              <TableCell align="left">{asset.price}</TableCell>
              <TableCell align="left">{asset.keys}</TableCell>
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
    const { assets } = this.props;

    return (
      <Paper className="assets-container">
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

const mapStateToProps = (state) => {
  return {
    assets: state.asset.assets
  };
};

const connected = connect(mapStateToProps, { getAssets })(AssetsList);

export default withRouter(connected);
