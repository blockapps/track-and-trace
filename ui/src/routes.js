import React, {Component} from 'react'
import { Route } from 'react-router-dom'
import Dashboard from './components/dashboard/'

class Routes extends Component {
  render() {
    return (
      <div>
      	<Route exact path="/" component={Dashboard} />
      </div>
    );
  }
}

export default Routes