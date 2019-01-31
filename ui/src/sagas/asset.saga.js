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
  return ({
    success: true, assets: [
      { id: 1, name: 'Frozen yoghurt', description: 159, price: 6.0 },
      { id: 2, name: 'Ice cream sandwich', description: 159, price: 6.0 },
      { id: 3, name: 'Eclair', description: 159, price: 6.0 },
      { id: 4, name: 'Cupcake', description: 159, price: 6.0 },
      { id: 5, name: 'Gingerbread', description: 159, price: 6.0 }
    ]
  });
  // TODO: Uncomment when API implementation is Done
  // return fetch(assetsUrl, { method: 'GET' })
  //   .then((response) => {
  //     return response.json()
  //   })
  //   .catch(err => {
  //     throw err
  //   });
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
