import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Paper, Grid, AppBar, Typography, Toolbar, Button } from '@material-ui/core';
import { getAssets } from "../../../actions/asset.actions";
import './detail.css';
import AuditLog from "../AuditLog";
import PlaceBidModal from "../../Bid/PlaceBidModal";
import SnackbarMessage from '../../../components/SnackbarMessage';

class AssetDetail extends Component {

  requestBid = () => {
    const { USER_ROLE } = this.props;
    const role = parseInt(this.props.user['role'], 10);
    if (role === USER_ROLE.RETAILER || role === USER_ROLE.DISTRIBUTOR) {
      return (
        <Button variant="contained" color="primary">
          Request Bids
        </Button>
      )
    }
  }

  placeBid = (asset) => {
    const { USER_ROLE } = this.props;
    const role = parseInt(this.props.user['role'], 10);
    if (role === USER_ROLE.MANUFACTURER || role === USER_ROLE.DISTRIBUTOR) {
      return (
        <PlaceBidModal asset={asset} />
      )
    }
  }

  componentDidMount() {
    this.props.getAssets();
  }

  render() {
    const { asset } = this.props;

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
        <SnackbarMessage />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const assetAddress = ownProps.match.params.address;
  let asset = state.asset.assets.filter((row) => row.address === assetAddress)[0];
  return {
    asset: asset,
    user: state.authentication.user,
    USER_ROLE: state.constants.TT.TtRole
  };
};

const connected = connect(mapStateToProps, { getAssets })(AssetDetail);

export default withRouter(connected);
