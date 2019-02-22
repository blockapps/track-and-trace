import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import Dashboard from './scenes/Dashboard'
import EnsureAuthenticated from './scenes/EnsureAuthenticated'
import AssetDetail from './scenes/Asset/Detail'
import Audit from './scenes/Asset/Audit';

class Routes extends Component {
  render() {
    return (
      <EnsureAuthenticated>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/asset/:sku" component={AssetDetail} />
        {/* TODO: Full Audit log for regulator right now not getting history*/}
        <Route exact path="/asset/audit/:sku" component={Audit} />
      </EnsureAuthenticated>
    );
  }
}

export default Routes