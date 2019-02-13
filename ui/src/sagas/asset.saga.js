import {
  call,
  takeLatest,
  put
} from 'redux-saga/effects';
import { apiUrl, HTTP_METHODS } from '../constants';
<<<<<<< HEAD
import {
  GET_ASSETS,
  getAssetsSuccess,
  getAssetsFailure,
  CREATE_ASSET,
  createAssetSuccess,
=======
import { 
  GET_ASSETS_REQUEST, 
  getAssetsSuccess, 
  getAssetsFailure, 
  CREATE_ASSET_REQUEST, 
  createAssetSuccess, 
>>>>>>> master
  createAssetFailure
} from '../actions/asset.actions';
import { setUserMessage } from '../actions/user-message.actions';

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
<<<<<<< HEAD
          description:asset.description,
          name: asset.name,
          price: asset.price ,
          keys: asset.keys,
          values: asset.values
=======
          description: asset.description,
          name: asset.name,
          price: asset.price
>>>>>>> master
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
      yield put(getAssetsFailure());
    }
  } catch (err) {
    yield put(getAssetsFailure(err));
  }
}

function* createAsset(action) {
  try {
    const response = yield call(createAssetApiCall, action.asset);
    if (response.success) {
      yield put(createAssetSuccess(response.assets));
      yield put(setUserMessage('Asset Created Successfully', true))
    } else {
      yield put(createAssetFailure(response.error));
      // FIXME: if anything that could be better
      if ((typeof response.error) === 'string')
        yield put(setUserMessage(response.error))
      else
        yield put(setUserMessage('Fail to create'))
    }
  } catch (err) {
    yield put(createAssetFailure(err));
  }
}

export default function* watchAssets() {
  yield takeLatest(GET_ASSETS_REQUEST, getAssets)
  yield takeLatest(CREATE_ASSET_REQUEST, createAsset)
}
