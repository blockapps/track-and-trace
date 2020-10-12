import { call, takeLatest, put, takeEvery } from "redux-saga/effects";
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
  getAssetDetail,
  IMPORT_ASSETS_REQUEST,
  updateAssetImportCount,
  importAssetsSuccess,
  assetType,
  updateAssetUploadError
} from "../actions/asset.actions";
import { setUserMessage } from "../actions/user-message.actions";

const assetsUrl = `${apiUrl}/assets`;
const createAssetUrl = `${apiUrl}/assets`;
const getAssetUrl = `${apiUrl}/assets/:sku`;
const handleAssetEventUrl = `${apiUrl}/assets/:sku/event`;
const changeAssetOwnerUrl = `${apiUrl}/assets/transferOwnership`;

function fetchAssets(payload) {
  const { aType, limit, offset, user, state, searchQuery } = payload;
  let url = assetsUrl;

  const search = searchQuery ? `&or=(sku.ilike.${searchQuery},name.ilike.${searchQuery},description.ilike.${searchQuery})` : '';

  switch (aType) {
    case assetType.MINE:
      url = `${assetsUrl}?owner=eq.${user}&limit=${limit}&offset=${offset}${search}`;
      break;
    case assetType.BIDDING:
      url = `${assetsUrl}?limit=${limit}&offset=${offset}&assetState=eq.${state}${search}`;
      break;
    case assetType.READ_ONLY:
      url = `${assetsUrl}?limit=${limit}&offset=${offset}${search}`;
      break;
    default:
      url = assetsUrl;
  }

  return fetch(url, { method: HTTP_METHODS.GET })
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      throw err;
    });
}

function fetchAsset(sku) {
  const url = getAssetUrl.replace(":sku", sku);
  return fetch(url, { method: HTTP_METHODS.GET })
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      throw err;
    });
}

function handleEventApiCall(payload) {
  const url = handleAssetEventUrl.replace(":sku", payload.sku);
  return fetch(url, {
    method: HTTP_METHODS.POST,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then(function(response) {
      return response.json();
    })
    .catch(function(error) {
      throw error;
    });
}

function createAssetApiCall(asset) {
  return fetch(`${createAssetUrl}`, {
    method: HTTP_METHODS.POST,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      asset,
    }),
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
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
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

function* getAssets(action) {
  try {
    const response = yield call(fetchAssets, action.payload);
    console.log(response);
    if (response.success) {
      yield put(
        getAssetsSuccess(
          response.data,
          action.payload.aType,
          action.payload.limit,
          action.payload.offset
        )
      );
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
      const message = `Asset '${response.data.name}' has been created`;
      yield put(setUserMessage(message, true));
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

function* importAssets(action) {
  const errors = [];
  for (let i = 0; i < action.assets.length; i++) {
    try {
      const response = yield call(createAssetApiCall, action.assets[i]);
      if (response.success) {
        yield put(updateAssetImportCount(i + 1));
      } else {
        // TODO: send specific error from backend
        const error = response.error;
        errors.push({ status: error.status, error: error.data.method, sku: action.assets[i].sku })
      }
    } catch (err) {
      // do nothing
    }
  }
  yield put(importAssetsSuccess());
  yield put(updateAssetUploadError(errors));
  yield put(setUserMessage(`Imported ${action.assets.length} records`, true));
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
  yield takeEvery(GET_ASSETS_REQUEST, getAssets);
  yield takeLatest(CREATE_ASSET_REQUEST, createAsset);
  yield takeLatest(GET_ASSET_DETAIL_REQUEST, getAsset);
  yield takeLatest(ASSET_EVENT_REQUEST, assetEvent);
  yield takeLatest(CHANGE_OWNER_REQUEST, changeOwner);
  yield takeLatest(IMPORT_ASSETS_REQUEST, importAssets);
}
