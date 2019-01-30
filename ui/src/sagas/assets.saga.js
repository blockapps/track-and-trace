import {
  call,
  takeLatest,
  put
} from 'redux-saga/effects';
import { apiUrl } from '../constants';
import { GET_ASSETS, getAssetsSuccess, getAssetsFailure } from '../actions/assets.actions';

// TODO: create an API to list the assets
const assetsUrl = `${apiUrl}/assets`;

function fetchAssets() {
  return fetch(assetsUrl, { method: 'GET' })
    .then((response) => {
      return response.json()
    })
    .catch(err => {
      throw err
    });
}

function* getAssets() {
  try {
    const response = yield call(fetchAssets);
    if (response.success) {
      yield put(getAssetsSuccess(response.assets));
    } else {
      yield put(getAssetsFailure());
    }
  } catch (err) {
    /* Remove when API is ready */
    yield put(getAssetsSuccess());
    // TODO: handle unexpected error
    yield put(getAssetsFailure(err));
  }
}

export default function* watchAssets() {
  yield takeLatest(GET_ASSETS, getAssets)
}
