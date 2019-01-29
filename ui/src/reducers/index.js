import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import authReducer from './authentication.reducer';

export default (history) => combineReducers({
  router: connectRouter(history),
  authentication: authReducer
});