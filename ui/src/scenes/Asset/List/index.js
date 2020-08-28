import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Grid } from "@material-ui/core";
import AssetsTable from "./table";

import { getAssets, assetType } from "../../../actions/asset.actions";
import "./list.css";

class AssetsList extends Component {
  componentDidMount() {
    const {
      user,
      USER_ROLE,
      myAssets,
      biddingAssets,
      readonlyAssets,
      ASSET_STATE,
    } = this.props;
    if (parseInt(user.role, 10) !== USER_ROLE.REGULATOR) {
      this.props.getAssets(
        assetType.MINE,
        myAssets.limit,
        myAssets.offset,
        user.account
      );
      this.props.getAssets(
        assetType.BIDDING,
        biddingAssets.limit,
        biddingAssets.offset,
        user.account,
        ASSET_STATE.BIDS_REQUESTED
      );
    } else {
      this.props.getAssets(
        assetType.READ_ONLY,
        readonlyAssets.limit,
        readonlyAssets.offset,
        user.account
      );
    }
  }

  redirectToAssetDetail = (event, sku) => {
    this.props.history.push(`/asset/${sku}`);
  };

  onChangePage = (aType, page) => {
    const {
      user,
      myAssets,
      biddingAssets,
      readonlyAssets,
      ASSET_STATE,
    } = this.props;
    switch (aType) {
      case assetType.MINE:
        this.props.getAssets(
          assetType.MINE,
          myAssets.limit,
          page * myAssets.limit,
          user.account
        );
        break;
      case assetType.BIDDING:
        this.props.getAssets(
          assetType.BIDDING,
          biddingAssets.limit,
          biddingAssets.limit * page,
          user.account,
          ASSET_STATE.BIDS_REQUESTED
        );
        break;
      case assetType.READ_ONLY:
        this.props.getAssets(
          assetType.READ_ONLY,
          readonlyAssets.limit,
          readonlyAssets.limit * page,
          user.account
        );
        break;
      default:
        break;
    }
  };

  getNextPage = (type, limit, offset) => {
    this.props.getAssets(type, limit, offset);
  };

  renderTable = () => {
    const {
      myAssets,
      biddingAssets,
      readonlyAssets,
      user,
      USER_ROLE,
      ASSET_STATE,
    } = this.props;

    if (parseInt(user.role, 10) === USER_ROLE.REGULATOR) {
      return (
        <AssetsTable
          assets={readonlyAssets.assets}
          title={"Asset List"}
          redirectToAssetDetail={this.redirectToAssetDetail}
          ASSET_STATE={ASSET_STATE}
          limit={readonlyAssets.limit}
          offset={readonlyAssets.offset}
          onChangePage={this.onChangePage}
          assetType={assetType.READ_ONLY}
        />
      );
    }

    return (
      <div className="dashboard-container">
        <AssetsTable
          assets={myAssets.assets}
          title={"My assets"}
          redirectToAssetDetail={this.redirectToAssetDetail}
          ASSET_STATE={ASSET_STATE}
          limit={myAssets.limit}
          offset={myAssets.offset}
          onChangePage={this.onChangePage}
          assetType={assetType.MINE}
        />
        <AssetsTable
          assets={biddingAssets.assets}
          title={"Bidding assets"}
          redirectToAssetDetail={this.redirectToAssetDetail}
          ASSET_STATE={ASSET_STATE}
          limit={biddingAssets.limit}
          offset={biddingAssets.offset}
          onChangePage={this.onChangePage}
          assetType={assetType.BIDDING}
        />
      </div>
    );
  };

  render() {
    return <Grid container>{this.renderTable()}</Grid>;
  }
}

const mapStateToProps = (state) => {
  return {
    myAssets: state.asset.myAssets,
    biddingAssets: state.asset.biddingAssets,
    readonlyAssets: state.asset.readonlyAssets,
    user: state.authentication.user,
    USER_ROLE: state.constants.TT.TtRole,
    BID_STATE: state.constants.Bid.BidState,
    ASSET_STATE: state.constants.Asset.AssetState,
  };
};

const connected = connect(
  mapStateToProps,
  { getAssets }
)(AssetsList);

export default withRouter(connected);
