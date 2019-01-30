import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import authReducer from './authentication.reducer';
import assetsReducer from './assets.reducer';

export default (history) => combineReducers({
  router: connectRouter(history),
  authentication: authReducer,
  assets: assetsReducer
});