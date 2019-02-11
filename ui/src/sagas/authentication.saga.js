import {
  call,
  takeLatest,
  put
} from 'redux-saga/effects';
import {
  GET_USER,
  getUserSuccessful,
  unauthorized,
  LOGOUT,
  logoutSuccessful
} from '../actions/authentication.actions';
import { apiUrl, HTTP_METHODS } from '../constants';

const userUrl = `${apiUrl}/users/me`;
const logoutUrl = `${apiUrl}/authentication/logout`;

function fetchUser(params) {
  return fetch(userUrl, { method: HTTP_METHODS.GET })
    .then((response) => {
      return response.json()
    })
    .catch(err => {
      throw err
    });
}

function logoutUser() {
  return fetch(logoutUrl, { method: HTTP_METHODS.GET })
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
    if (response.success) {
      yield put(getUserSuccessful(response.data))
    } else {
      yield put(unauthorized(response.error.loginUrl))
    }
  } catch (err) {
    // TODO: handle unexpected error
  }
}

function* getLogout() {
  try {
    const response = yield call(logoutUser);
    if (response.success) {
      yield put(logoutSuccessful(response.data.logoutUrl))
    }
  } catch (err) {
    // TODO: handle unexpected error
  }
}

export default function* () {
  yield takeLatest(GET_USER, getUser)
  yield takeLatest(LOGOUT, getLogout)
}