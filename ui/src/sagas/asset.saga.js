import {
  call,
  takeLatest,
  put
} from 'redux-saga/effects';
import { apiUrl, HTTP_METHODS } from '../constants';
import { 
  GET_ASSETS_REQUEST, 
  getAssetsSuccess, 
  getAssetsFailure, 
  CREATE_ASSET_REQUEST, 
  createAssetSuccess, 
  createAssetFailure
} from '../actions/asset.actions';

const assetsUrl = `${apiUrl}/assets`;
const createAssetUrl = `${apiUrl}/assets`;

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
      body: JSON.stringify({ 
        asset: {
          sku: asset.SKU, 
          description:asset.description, 
          name: asset.name, 
          price: asset.price 
        }
      })
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
      yield put(getAssetsSuccess(response.data));
    } else {
      console.log(response);
      yield put(getAssetsFailure());
    }
  } catch (err) {
    yield put(getAssetsFailure(err));
  }
}

function* createAsset(action) {
  try {
    const response = yield call(createAssetApiCall, action.asset);
    console.log(response);
    if (response.success) {
      yield put(createAssetSuccess(response.assets));
    } else {
      yield put(createAssetFailure(response.data));
    }
  } catch (err) {
    console.log(err);
    // TODO: handle unexpected error
    yield put(createAssetFailure(err));
  }
}

export default function* watchAssets() {
  yield takeLatest(GET_ASSETS_REQUEST, getAssets)
  yield takeLatest(CREATE_ASSET_REQUEST, createAsset)
}
