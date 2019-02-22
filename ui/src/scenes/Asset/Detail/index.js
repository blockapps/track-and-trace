import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Paper, Grid, AppBar, Typography, Toolbar, Button } from '@material-ui/core';
import { getAssets, getAssetDetail, assetEventRequest, changeOwner } from "../../../actions/asset.actions";
import AuditLog from "../AuditLog";
import PlaceBidModal from "../../Bid/PlaceBidModal";
import SnackbarMessage from '../../../components/SnackbarMessage';
import { getBids, bidEventRequest } from "../../../actions/bid.actions";
import BidTable from "../../Bid/BidTable";
import './detail.css';
import SpecTable from "../Spec";

class AssetDetail extends Component {

  componentDidMount() {
    const sku = this.props.match.params.sku;
    this.props.getAssetDetail(sku);
    this.props.getBids();
  }

  requestBid = (asset) => {
    const { assetEvent, assetEventRequest, assetState, user } = this.props;
    const checkState = (parseInt(asset.assetState, 10) === assetState.CREATED) || (parseInt(asset.assetState, 10) === assetState.OWNER_UPDATED);
    if (checkState && (user.account === asset.owner)) {
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
    const { account } = this.props.user;
    if (account !== asset.owner) {
      return (
        <PlaceBidModal asset={asset} />
      )
    }
  }

  handleEvent = (address, chainId, bidEvent, initiator) => {
    const { bidEventRequest, changeOwner, asset } = this.props;

    const payload = { address, chainId, bidEvent };
    bidEventRequest(payload);

    if (bidEvent === this.props.bidEvent.ACCEPT) {
      changeOwner({ sku: asset.sku, owner: initiator })
    }
  }

  render() {
    const { asset, bids, bidEvent, user, bidState } = this.props;

    return (
      <div className="asset-container">
        <Grid container>
          <AppBar position="static" color="default">
            <Toolbar>
              <Typography variant="h6" color="inherit" className="appbar-name">
                Asset Detail - {asset && asset.name}
              </Typography>
              <div className="appbar-content">
                {this.requestBid(asset)}
                {this.placeBid(asset)}
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
              <BidTable
                bids={bids}
                bidEvent={bidEvent}
                bidState={bidState}
                handleEvent={this.handleEvent}
                user={user}
              />
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
    bidState: state.constants.Bid.BidState,
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
  bidEventRequest,
  changeOwner
})(AssetDetail);

export default withRouter(connected);
