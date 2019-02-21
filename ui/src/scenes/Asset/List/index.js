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
    const { assets, user } = this.props;

    const ownedAssets = assets.filter((asset) => asset.owner === user.account);
    const requestedAssets = assets.filter((asset) => parseInt(asset.assetState, 10) === BID_STATE.BIDS_REQUESTED);

    return (
      <Grid container>
        <AssetsTable assets={ownedAssets} title={'My assets'} redirectToAssetDetail={this.redirectToAssetDetail} />
        <AssetsTable assets={requestedAssets} title={'Bidding assets'} redirectToAssetDetail={this.redirectToAssetDetail} />
      </Grid>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    assets: state.asset.assets,
    user: state.authentication.user
  };
};

const connected = connect(mapStateToProps, { getAssets })(AssetsList);

export default withRouter(connected);
