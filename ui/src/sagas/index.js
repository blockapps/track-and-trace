
import { 
  // fork, 
  all 
} from 'redux-saga/effects';

const rootSaga = function* startForeman() {
  yield all([// YOUR SAGAS HERE
    // fork (watchSomeEvent)
  ])
};

export default rootSaga;