import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Paper, Grid, AppBar, Typography, Toolbar, Button } from '@material-ui/core';
import { getAssets, getAssetDetail, assetEventRequest } from "../../../actions/asset.actions";
import AuditLog from "../AuditLog";
import PlaceBidModal from "../../Bid/PlaceBidModal";
import SnackbarMessage from '../../../components/SnackbarMessage';
import { getBids, bidEventRequest } from "../../../actions/bid.actions";
import BidTable from "../../Bid/BidTable";
import ChangeOwner from "../ChangeOwner";
import './detail.css';
import SpecTable from "../Spec";

class AssetDetail extends Component {

  componentDidMount() {
    const sku = this.props.match.params.sku;
    this.props.getAssetDetail(sku);
    this.props.getBids();
  }

  changeOwner = (asset) => {
    const { USER_ROLE } = this.props;
    const role = parseInt(this.props.user['role'], 10);
    if (role === USER_ROLE.MANUFACTURER) {
      return (
        <ChangeOwner asset={asset} />
      )
    }
  }

  requestBid = (asset) => {
    const { USER_ROLE, assetEvent, assetEventRequest } = this.props;
    const role = parseInt(this.props.user['role'], 10);
    if (role === USER_ROLE.MANUFACTURER || role === USER_ROLE.DISTRIBUTOR) {
      return (
        <Button variant="contained" color="primary" onClick={() => {
          assetEventRequest({ sku: asset.sku, assetEvent: assetEvent.REQUEST_BIDS })
        }}>
          Request Bids
        </Button>
      )
    }
  }

  placeBid = (asset) => {
    const { USER_ROLE } = this.props;
    const role = parseInt(this.props.user['role'], 10);
    if (role === USER_ROLE.RETAILER || role === USER_ROLE.DISTRIBUTOR) {
      return (
        <PlaceBidModal asset={asset} />
      )
    }
  }

  get isManufacturer() {
    const { USER_ROLE } = this.props;
    return parseInt(this.props.user['role'], 10) === USER_ROLE.MANUFACTURER;
  }

  handleEvent = (address, chainId, bidEvent) => {
    const { bidEventRequest } = this.props;

    const payload = { address, chainId, bidEvent };
    bidEventRequest(payload);
  }

  render() {
    const { asset, bids, bidEvent } = this.props;

    return (
      <div className="asset-container">
        <Grid container>
          <AppBar position="static" color="default">
            <Toolbar>
              <Typography variant="h6" color="inherit" className="appbar-name">
                Asset Detail - {asset && asset.name}
              </Typography>
              <div className="appbar-content">
                {/* TODO: Mange buttons with their state*/}
                {this.requestBid(asset)}
                {this.placeBid(asset)}
                {this.changeOwner(asset)}
              </div>
            </Toolbar>
          </AppBar>
        </Grid>
        <Grid container spacing={24} className="asset-detail">
          <Grid item xs={1}></Grid>
          <Grid item xs={4}>
            <Paper elevation={1} className="asset-description">
              <Typography variant="h5" component="h3">
                Description
              </Typography>
              <Typography component="p">
                {asset && asset.description}
              </Typography>
            </Paper>

            <Paper elevation={1} className="asset-description asset-spec">
              <Typography variant="h5" component="h3">
                Spec
              </Typography>
              <SpecTable asset={asset} />
            </Paper>
          </Grid>
          <Grid item xs={1}></Grid>
          <Grid item xs={4}>
            <Typography variant="h5" component="h3">
              Audit Log
            </Typography>
            <AuditLog />
          </Grid>
          <Grid item xs={2}></Grid>
        </Grid>
        <Grid container spacing={24} className="asset-detail">
          <Grid item xs={1}></Grid>
          <Grid item xs={10}>
            <Paper elevation={1} className="asset-description asset-spec">
              <Typography variant="h5" component="h3">
                Bids
              </Typography>
              <BidTable bids={bids} bidEvent={bidEvent} handleEvent={this.handleEvent} isManufacturer={this.isManufacturer} />
            </Paper>
          </Grid>
        </Grid>
        <Grid item xs={1}></Grid>
        <SnackbarMessage />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const asset = state.asset.asset;
  const bids = state.bid.bids.filter((bid) => bid.asset === asset.address)

  return {
    asset,
    user: state.authentication.user,
    USER_ROLE: state.constants.TT.TtRole,
    bidEvent: state.constants.Bid.BidEvent,
    assetEvent: state.constants.Asset.AssetEvent,
    assetState: state.constants.Asset.AssetState,
    bids
  };
};

const connected = connect(mapStateToProps, {
  getAssets,
  getBids,
  getAssetDetail,
  assetEventRequest,
  bidEventRequest
})(AssetDetail);

export default withRouter(connected);
