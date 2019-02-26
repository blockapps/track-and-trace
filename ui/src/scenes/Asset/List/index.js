import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Grid } from '@material-ui/core';
import AssetsTable from './table';

import { getAssets } from "../../../actions/asset.actions";
import './list.css';

class AssetsList extends Component {

  componentDidMount() {
    this.props.getAssets();
  }

  redirectToAssetDetail = (event, sku, name) => {
    if (name) {
      this.props.history.push(`/asset/audit/${sku}`)
    } else {
      this.props.history.push(`/asset/${sku}`);
    }
  };

  renderTable = () => {
    const { assets, user, USER_ROLE, ASSET_STATE } = this.props;

    // Filter assets
    const ownedAssets = assets.filter((asset) => asset.owner === user.account);
    const requestedAssets = assets.filter((asset) => parseInt(asset.assetState, 10) === ASSET_STATE.BIDS_REQUESTED);

    if (parseInt(user.role, 10) === USER_ROLE.REGULATOR) {
      return (<AssetsTable assets={assets} name="regulator" title={'Audit Trail'} redirectToAssetDetail={this.redirectToAssetDetail} ASSET_STATE={ASSET_STATE} />)
    }

    return (
      <div className="dashboard-container">
        <AssetsTable assets={ownedAssets} title={'My assets'} redirectToAssetDetail={this.redirectToAssetDetail} ASSET_STATE={ASSET_STATE} />
        <AssetsTable assets={requestedAssets} title={'Bidding assets'} redirectToAssetDetail={this.redirectToAssetDetail} ASSET_STATE={ASSET_STATE} />
      </div>
    );
  }

  render() {
    return (
      <Grid container>
        {this.renderTable()}
      </Grid>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    assets: state.asset.assets,
    user: state.authentication.user,
    USER_ROLE: state.constants.TT.TtRole,
    BID_STATE: state.constants.Bid.BidState,
    ASSET_STATE: state.constants.Asset.AssetState
  };
};

const connected = connect(mapStateToProps, { getAssets })(AssetsList);

export default withRouter(connected);
