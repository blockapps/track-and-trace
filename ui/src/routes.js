import React, { Component } from "react";
import { Route } from "react-router-dom";
import Dashboard from "./scenes/Dashboard";
import EnsureAuthenticated from "./components/EnsureAuthenticated";
import AssetDetail from "./scenes/Asset/Detail";
import Exstorage from "./components/Exstorage";

class Routes extends Component {
  render() {
    return (
      <EnsureAuthenticated>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/asset/:sku" component={AssetDetail} />
        <Route exact path='/exstorage' component={Exstorage}/>
      </EnsureAuthenticated>
    );
  }
}

export default Routes;
