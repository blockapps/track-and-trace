import {
  call,
  takeLatest,
  put
} from 'redux-saga/effects';
import {
  GET_USER,
  getUserSuccessful,
  unauthorized
} from '../actions/authentication.actions';
import { apiUrl, HTTP_METHODS } from '../constants';

const userUrl = `${apiUrl}/users/me`;
// const authUrl = `${apiUrl}/authentication`;

function fetchUser(params) {
  return fetch(userUrl, { method: HTTP_METHODS.GET })
    .then((response) => {
      return response.json()
    })
    .catch(err => {
      throw err
    });
}

function* getUser(action) {
  try {
    const response = yield call(fetchUser);
    console.log(response);
    if (response.success) {
      yield put(getUserSuccessful(response.data))
    } else {
      yield put(unauthorized(response.error.loginUrl))
    }
  } catch (err) {
    // TODO: handle unexpected error
  }
}

export default function* () {
  yield takeLatest(GET_USER, getUser)
}