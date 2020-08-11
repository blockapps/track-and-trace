import { call, takeLatest, put } from "redux-saga/effects";
import { apiUrl, HTTP_METHODS } from "../constants";
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
  ASSET_EVENT_REQUEST,
  CHANGE_OWNER_REQUEST,
  changeOwnerSuccess,
  changeOwnerFailure,
  getAssetDetail
} from "../actions/asset.actions";
import { setUserMessage } from "../actions/user-message.actions";

const assetsUrl = `${apiUrl}/assets`;
const createAssetUrl = `${apiUrl}/assets`;
const getAssetUrl = `${apiUrl}/assets/:sku`;
const handleAssetEventUrl = `${apiUrl}/assets/:sku/event`;
const changeAssetOwnerUrl = `${apiUrl}/assets/transferOwnership`;

function fetchAssets() {
  return fetch(assetsUrl, { method: HTTP_METHODS.GET })
    .then(response => {
      return response.json();
    })
    .catch(err => {
      throw err;
    });
}

function fetchAsset(sku) {
  const url = getAssetUrl.replace(":sku", sku);
  return fetch(url, { method: HTTP_METHODS.GET })
    .then(response => {
      return response.json();
    })
    .catch(err => {
      throw err;
    });
}

function handleEventApiCall(payload) {
  const url = handleAssetEventUrl.replace(":sku", payload.sku);
  return fetch(url, {
    method: HTTP_METHODS.POST,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(function(response) {
      return response.json();
    })
    .catch(function(error) {
      throw error;
    });
}

function createAssetApiCall(asset) {

  let formData = new FormData();
  formData.append("sku", asset.sku);
  formData.append("description", asset.description);
  formData.append("name", asset.name);
  formData.append("price", asset.price);
  formData.append("file", asset.file);

  return fetch(createAssetUrl, {
    method: HTTP_METHODS.POST,
    body: formData
  })
    .then(function(response) {
      return response.json();
    })
    .catch(function(error) {
      throw error;
    });
}

function changeOwnerApiCall(payload) {
  return fetch(changeAssetOwnerUrl, {
    method: HTTP_METHODS.POST,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(function(response) {
      return response.json();
    })
    .catch(function(error) {
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
      yield put(createAssetSuccess(response.data));
      yield put(
        setUserMessage(`'${response.data.length}  ${response.data.length > 1 ? 'assets' : 'asset'}' has been created`, true)
      );
    } else {
      yield put(createAssetFailure(response.error));
      // FIXME: if anything that could be better
      if (typeof response.error === "string")
        yield put(setUserMessage(response.error));
      else yield put(setUserMessage("Unable to create asset"));
    }
  } catch (err) {
    yield put(createAssetFailure(err));
  }
}

function* assetEvent(action) {
  try {
    const response = yield call(handleEventApiCall, action.payload);
    if (response.success) {
      yield put(assetEventSuccess(response.data));
      yield put(getAssetDetail(action.payload.sku));
      yield put(setUserMessage(`Ready to accept bid`, true));
    } else {
      yield put(assetEventFailure(response.error));
      yield put(setUserMessage(`Unable to request bid`));
    }
  } catch (err) {
    yield put(createAssetFailure(err));
  }
}

function* changeOwner(action) {
  try {
    const response = yield call(changeOwnerApiCall, action.payload);
    if (response.success) {
      yield put(changeOwnerSuccess(response.data));
      yield put(setUserMessage(`Owner has been changed`, true));
    } else {
      yield put(changeOwnerFailure(response.error));
      yield put(setUserMessage(`Unable to change ownership`));
    }
  } catch (err) {
    yield put(changeOwnerFailure(err));
  }
}

export default function* watchAssets() {
  yield takeLatest(GET_ASSETS_REQUEST, getAssets);
  yield takeLatest(CREATE_ASSET_REQUEST, createAsset);
  yield takeLatest(GET_ASSET_DETAIL_REQUEST, getAsset);
  yield takeLatest(ASSET_EVENT_REQUEST, assetEvent);
  yield takeLatest(CHANGE_OWNER_REQUEST, changeOwner);
}
