import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import { getAssets } from "../../actions/assets.actions";
import './assets.css';

class Assets extends Component {

  constructor(props) {
    super(props);

    this.state = {
      page: 0,
      rowsPerPage: 2
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

  redirectToAssetDetail = (event, id) => {
    // TODO: Navigate to new page
    this.props.history.push(`/asset/${id}`);
  };

  renderRows = (assets) => {
    const { page, rowsPerPage } = this.state;

    if (assets.length) {
      return (assets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((row, key) => {
          return (
            <TableRow key={key} hover onClick={event => this.redirectToAssetDetail(event, assets.id)}>
              <TableCell align="left"> {row.name} </TableCell>
              <TableCell align="left">{row.description}</TableCell>
              <TableCell align="left">{row.price}</TableCell>
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
    assets: state.assets.assets
  };
};

const connected = connect(mapStateToProps, { getAssets })(Assets);

export default withRouter(connected);
