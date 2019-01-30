import React, {Component} from 'react'
import { Route } from 'react-router-dom'
import Dashboard from './components/dashboard/'
import EnsureAuthenticated from './components/ensureAuthenticated/'
import AssetDetail from './components/assets/detail'

class Routes extends Component {
  render() {
    return (
        <EnsureAuthenticated>
          <Route exact path="/" component={Dashboard} />
          <Route exact path="/asset/:id" component={AssetDetail} />
        </EnsureAuthenticated>
    );
  }
}

export default Routes