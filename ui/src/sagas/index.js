
import {
  fork,
  all
} from 'redux-saga/effects';
import watchAuthActions from './authentication.saga';
import watchAssets from './asset.saga';
import watchConstants from './constants.saga';

const rootSaga = function* () {
  yield all([
    fork(watchAuthActions),
    fork(watchAssets),
    fork(watchConstants)
  ])
}

export default rootSaga