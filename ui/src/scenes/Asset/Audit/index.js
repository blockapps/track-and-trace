import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Paper, Grid, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import { getAssetDetail } from "../../../actions/asset.actions";

class AuditTable extends Component {

  componentDidMount() {
    const sku = this.props.match.params.sku;
    this.props.getAssetDetail(sku);
  }

  render() {
    const { asset } = this.props;
    const history = Object.keys(asset).length ? asset.history : [];
    // TODO: Audit logs API is not ready yet 
    return (
      <div className="asset-container">
        <Grid container spacing={24} className="asset-detail">
          <Grid item xs={1}></Grid>
          <Grid item xs={10}>
            <Paper elevation={1} className="asset-description asset-spec">
              <Typography variant="h5" component="h3">
                Audit trail
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Asset Address</TableCell>
                    <TableCell>Initiator</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((bid, key) =>
                    <TableRow key={key}>
                      <TableCell> {'bid.asset'} </TableCell>
                      <TableCell> {'bid.initiator'} </TableCell>
                      <TableCell>{'bid.value'}</TableCell>
                    </TableRow>
                  )}
                  {
                    !history.length &&
                    <TableRow>
                      <TableCell colSpan={5} align="center"> No bids found </TableCell>
                    </TableRow>
                  }
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
        <Grid item xs={1}></Grid>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    asset: state.asset.asset
  };
};

const connected = connect(mapStateToProps, {
  getAssetDetail
})(AuditTable);

export default withRouter(connected);
