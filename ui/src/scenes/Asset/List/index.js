import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Grid } from '@material-ui/core';
import AssetsTable from './table';

import { getAssets } from "../../../actions/asset.actions";
import './list.css';
import { BID_STATE } from "../../../utils/bids.utils";

class AssetsList extends Component {

  componentDidMount() {
    this.props.getAssets();
  }

  redirectToAssetDetail = (event, sku) => {
    this.props.history.push(`/asset/${sku}`);
  };

  render() {
    const { assets } = this.props;
    const requestedBids = assets.filter((asset) => parseInt(asset.assetState, 10) === BID_STATE.BIDS_REQUESTED);

    return (
      <Grid container>
        <AssetsTable assets={assets} title={'User owns assets'} redirectToAssetDetail={this.redirectToAssetDetail} />
        <AssetsTable assets={requestedBids} title={'Bidding assets'} redirectToAssetDetail={this.redirectToAssetDetail} />
      </Grid>
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
