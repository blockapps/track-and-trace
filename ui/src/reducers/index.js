import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import { reducer as formReducer } from 'redux-form';

import authReducer from './authentication.reducer';
import assetReducer from './asset.reducer';

export default (history) => combineReducers({
  form: formReducer,
  router: connectRouter(history),
  authentication: authReducer,
  asset: assetReducer
});