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
  createAssetFailure,
  GET_ASSET_DETAIL_REQUEST,
  getAssetDetailSuccess,
  getAssetDetailFailure,
  assetEventSuccess,
  assetEventFailure,
  ASSET_EVENT_REQUEST
} from '../actions/asset.actions';
import { setUserMessage } from '../actions/user-message.actions';

const assetsUrl = `${apiUrl}/assets`;
const createAssetUrl = `${apiUrl}/assets`;
const getAssetUrl = `${apiUrl}/assets/:sku`;
const handleAssetEventUrl = `${apiUrl}/assets/handleEvent`;

function fetchAssets() {
  return fetch(assetsUrl, { method: HTTP_METHODS.GET })
    .then((response) => {
      return response.json()
    })
    .catch(err => {
      throw err
    });
}

function fetchAsset(sku) {
  const url = getAssetUrl.replace(':sku', sku)
  return fetch(url, { method: HTTP_METHODS.GET })
    .then((response) => {
      return response.json()
    })
    .catch(err => {
      throw err
    });
}

function handleEventApiCall(payload) {
  return fetch(handleAssetEventUrl,
    {
      method: HTTP_METHODS.POST,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(function (response) {
      return response.json()
    })
    .catch(function (error) {
      throw error;
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
        asset
      })
    })
    .then(function (response) {
      return response.json()
    })
    .catch(function (error) {
      throw error;
    });
}

function* getAsset(action) {
  try {
    const response = yield call(fetchAsset, action.sku);
    if (response.success) {
      yield put(getAssetDetailSuccess(response.data));
    } else {
      yield put(getAssetDetailFailure(response.error));
    }
  } catch (err) {
    yield put(getAssetDetailFailure(err));
  }
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

function* assetEvent(action) {
  try {
    const response = yield call(handleEventApiCall, action.payload);
    if (response.success) {
      // TODO: change message
      yield put(assetEventSuccess(response.data))
      yield put(setUserMessage(`Event changed to BID_REQUESTED`, true))
    } else {
      yield put(assetEventFailure(response.error));
      yield put(setUserMessage(`Failed to change Event`))
    }
  } catch (err) {
    yield put(createAssetFailure(err));
  }
}

export default function* watchAssets() {
  yield takeLatest(GET_ASSETS_REQUEST, getAssets)
  yield takeLatest(CREATE_ASSET_REQUEST, createAsset)
  yield takeLatest(GET_ASSET_DETAIL_REQUEST, getAsset)
  yield takeLatest(ASSET_EVENT_REQUEST, assetEvent)
}
