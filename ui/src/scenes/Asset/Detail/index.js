import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Paper, Grid, AppBar, Typography, Toolbar, Button } from '@material-ui/core';
import { getAssets } from "../../../actions/asset.actions";
import './Detail.css';
import AuditLog from "../AuditLog";

class AssetDetail extends Component {

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
                {/* TODO: Mange buttons with their roles */}
                <Button variant="contained" color="primary">
                  Request Bids
                </Button>
                <Button variant="contained" color="primary">
                  Place Bids
                </Button>
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
              <Typography component="p">
                {/* TODO: apply table here for Spec */}
                Table for Spec
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
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const assetId = ownProps.match.params.id;
  let asset = state.asset.assets.filter((row) => row.id === parseInt(assetId))[0];
  return {
    asset: asset
  };
};

const connected = connect(mapStateToProps, { getAssets })(AssetDetail);

export default withRouter(connected);
