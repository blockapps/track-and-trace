import {
  call,
  takeLatest,
  put
} from 'redux-saga/effects';
import { apiUrl, HTTP_METHODS } from '../constants';
import { GET_ASSETS, getAssetsSuccess, getAssetsFailure, CREATE_ASSET, createAssetSuccess, createAssetFailure } from '../actions/asset.actions';

// TODO: create an API to list the assets
const assetsUrl = `${apiUrl}/assets`;
// TODO: replace with the url created for this
const createAssetUrl = `${apiUrl}/asset/create`;

function fetchAssets() {
  return fetch(assetsUrl, { method: HTTP_METHODS.GET })
    .then((response) => {
      return response.json()
    })
    .catch(err => {
      throw err
    });
}

function createAssetApiCall(asset) {
  return fetch(createAssetUrl,
    {
      method: HTTP_METHODS.POST,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ asset })
    })
    .then(function (response) {
      return response.json()
    })
    .catch(function (error) {
      throw error;
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

function* createAsset(action) {
  try {
    const response = yield call(createAssetApiCall, action.asset);
    if (response.success) {
      yield put(createAssetSuccess(response.assets));
    } else {
      yield put(createAssetFailure());
    }
  } catch (err) {
    // TODO: handle unexpected error
    yield put(createAssetFailure(err));
  }
}

export default function* watchAssets() {
  yield takeLatest(GET_ASSETS, getAssets)
  yield takeLatest(CREATE_ASSET, createAsset)
}
