import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Paper, Grid, Icon } from '@material-ui/core';
import { getAssets } from "../../../actions/assets.actions";
import './detail.css';

class AssetDetail extends Component {

  componentDidMount() {
    this.props.getAssets();
  }

  render() {
    const { asset } = this.props;

    return (
      <div className={'asset'}>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <Icon onClick={() => { this.props.history.push(`/`) }}>arrow_back</Icon>
            <Paper className={'asset-paper'}>
              <Grid item xs={12}>
                <h3 className="asset-heading">
                  <div>Asset Detail</div>
                </h3>
              </Grid>
              <div className="detail">
                <label>Name</label>
                <p>{asset && asset.name}</p>
              </div>
              <div className="detail">
                <label>Description</label>
                <p>{asset && asset.description}</p>
              </div>
              <div className="detail">
                <label>Price</label>
                <p>{asset && asset.price}</p>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const assetId = ownProps.match.params.id;
  let asset = state.assets.assets.filter((row) => row.id == assetId)[0];
  return {
    asset: asset
  };
};

const connected = connect(mapStateToProps, { getAssets })(AssetDetail);

export default withRouter(connected);
