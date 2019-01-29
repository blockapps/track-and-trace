
import { 
  fork, 
  all 
} from 'redux-saga/effects';
import watchAuthActions from './authentication.saga'

const rootSaga = function* () {
  yield all([
    fork (watchAuthActions)
  ])
}

export default rootSaga