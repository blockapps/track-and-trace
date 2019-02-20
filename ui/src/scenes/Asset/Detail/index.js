import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Paper, Grid, AppBar, Typography, Toolbar, Button } from '@material-ui/core';
import { getAssets, getAssetDetail } from "../../../actions/asset.actions";
import './detail.css';
import AuditLog from "../AuditLog";
import PlaceBidModal from "../../Bid/PlaceBidModal";
import SnackbarMessage from '../../../components/SnackbarMessage';
import { getBids } from "../../../actions/bid.actions";
import BidTable from "../../Bid/BidTable";

class AssetDetail extends Component {

  requestBid = () => {
    const { USER_ROLE } = this.props;
    const role = parseInt(this.props.user['role'], 10);
    if (role === USER_ROLE.MANUFACTURER || role === USER_ROLE.DISTRIBUTOR) {
      return (
        // TODO: Add button functionality
        <Button variant="contained" color="primary">
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

  acceptBid = (address, chainId) => {
    const { bidEvent } = this.props;
    console.log("----------------------", bidEvent.ACCEPT)
    console.log("-----------------------------")
    // TODO: Add API call 
  }

  componentDidMount() {
    const sku = this.props.match.params.sku;
    this.props.getAssets();
    this.props.getBids();
    this.props.getAssetDetail(sku);
  }

  render() {
    const { asset, bids } = this.props;

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
                {this.requestBid()}
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
              <Typography component="span">
                {asset && asset.keys}
              </Typography>
              <Typography component="span">
                {asset && asset.values}
              </Typography>
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
              <BidTable bids={bids} acceptBid={this.acceptBid} isManufacturer={this.isManufacturer} />
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
  const assetAddress = ownProps.match.params.sku;
  let asset = state.asset.assets.filter((row) => row.sku === assetAddress)[0];

  // TODO: filter with their (role) owners state.bid.bids.filter((row) => row.asset === assetAddress);
  let bids = state.bid.bids

  return {
    asset: asset,
    user: state.authentication.user,
    USER_ROLE: state.constants.TT.TtRole,
    bidEvent: state.constants.Bid.BidEvent,
    bids: bids
  };
};

const connected = connect(mapStateToProps, { getAssets, getBids, getAssetDetail })(AssetDetail);

export default withRouter(connected);
