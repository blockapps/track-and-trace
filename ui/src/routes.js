import React, {Component} from 'react'
import { Route } from 'react-router-dom'
import Dashboard from './components/dashboard/'
import EnsureAuthenticated from './components/ensureAuthenticated/'

class Routes extends Component {
  render() {
    return (
        <EnsureAuthenticated>
          <Route exact path="/" component={Dashboard} />
        </EnsureAuthenticated>
    );
  }
}

export default Routes