import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import authReducer from './authentication.reducer';
import assetReducer from './asset.reducer';

export default (history) => combineReducers({
  router: connectRouter(history),
  authentication: authReducer,
  asset: assetReducer
});