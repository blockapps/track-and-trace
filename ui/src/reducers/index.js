import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import { reducer as formReducer } from 'redux-form';

import authReducer from './authentication.reducer';
import assetReducer from './asset.reducer';
import userMessageReducer from './user-message.reducer';
import constantsReducer from './constants.reducer';
import { loadingBarReducer } from 'react-redux-loading-bar'

export default (history) => combineReducers({
  loadingBar: loadingBarReducer,
  form: formReducer,
  router: connectRouter(history),
  authentication: authReducer,
  asset: assetReducer,
  userMessage: userMessageReducer,
  constants: constantsReducer
});