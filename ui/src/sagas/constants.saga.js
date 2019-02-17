import {
  call,
  takeLatest,
  put
} from 'redux-saga/effects';
import { apiUrl, HTTP_METHODS } from '../constants';

import { GET_CONSTANTS_REQUEST, getConstantsSuccess, getConstantsFailure } from '../actions/constants.actions';
import { setUserMessage } from '../actions/user-message.actions';

const constantsUrl = `${apiUrl}/constants`;

function fetchConstants() {
  return fetch(constantsUrl,
    {
      method: HTTP_METHODS.GET
    })
    .then((response) => {
      return response.json()
    })
    .catch(err => {
      throw err
    });
}

function* getConstants() {
  try {
    const response = yield call(fetchConstants);
    if (response.success) {
      yield put(getConstantsSuccess(response.data));
    } else {
      yield put(getConstantsFailure(response.error));
      yield put(setUserMessage('Failed to fetch constants'))
    }
  } catch (err) {
    yield put(getConstantsFailure(err));
  }
}

export default function* watchConstants() {
  yield takeLatest(GET_CONSTANTS_REQUEST, getConstants)
}
