export const GET_ASSETS_REQUEST = "GET_ASSETS_REQUEST";
export const GET_ASSETS_SUCCESS = "GET_ASSETS_SUCCESS";
export const GET_ASSETS_FAILURE = "GET_ASSETS_FAILURE";
export const GET_ASSET_DETAIL_REQUEST = "GET_ASSET_DETAIL_REQUEST";
export const GET_ASSET_DETAIL_SUCCESS = "GET_ASSET_DETAIL_SUCCESS";
export const GET_ASSET_DETAIL_FAILURE = "GET_ASSET_DETAIL_FAILURE";
export const OPEN_CREATE_ASSET_OVERLAY = "OPEN_CREATE_ASSET_OVERLAY";
export const CLOSE_CREATE_ASSET_OVERLAY = "CLOSE_CREATE_ASSET_OVERLAY";
export const OPEN_IMPORT_ASSETS_OVERLAY = "OPEN_IMPORT_ASSETS_OVERLAY";
export const CLOSE_IMPORT_ASSETS_OVERLAY = "CLOSE_IMPORT_ASSETS_OVERLAY";
export const CREATE_ASSET_REQUEST = "CREATE_ASSET_REQUEST";
export const CREATE_ASSET_SUCCESS = "CREATE_ASSET_SUCCESS";
export const CREATE_ASSET_FAILURE = "CREATE_ASSET_FAILURE";
export const ASSET_EVENT_REQUEST = "ASSET_EVENT_REQUEST";
export const ASSET_EVENT_SUCCESS = "ASSET_EVENT_SUCCESS";
export const ASSET_EVENT_FAILURE = "ASSET_EVENT_FAILURE";
export const CHANGE_OWNER_REQUEST = "CHANGE_OWNER_REQUEST";
export const CHANGE_OWNER_SUCCESS = "CHANGE_OWNER_SUCCESS";
export const CHANGE_OWNER_FAILURE = "CHANGE_OWNER_FAILURE";
export const IMPORT_ASSETS_REQUEST = "IMPORT_ASSETS_REQUEST";
export const IMPORT_ASSETS_SUCCESS = "IMPORT_ASSETS_SUCCESS";
export const IMPORT_ASSETS_FAILURE = "IMPORT_ASSETS_FAILURE";
export const UPDATE_ASSET_IMPORT_COUNT = "UPDATE_ASSET_IMPORT_COUNT";
export const ASSET_NEXT_PAGE = "ASSET_NEXT_PAGE";

export const assetType = {
  MINE: "MINE",
  BIDDING: "BIDDING",
  READ_ONLY: "READ_ONLY",
};

export const getAssets = (assetType, limit, offset, user, state) => {
  return {
    payload: { aType: assetType, limit, offset, user, state },
    type: GET_ASSETS_REQUEST,
  };
};

export const getAssetsSuccess = (assets, assetType, limit, offset) => {
  return {
    type: GET_ASSETS_SUCCESS,
    assets,
    assetType,
    limit,
    offset,
  };
};

export const getAssetsFailure = (error) => {
  return {
    type: GET_ASSETS_FAILURE,
    error,
  };
};

export const getAssetDetail = (sku, isDataUpdate) => {
  return {
    type: GET_ASSET_DETAIL_REQUEST,
    sku,
    isDataUpdate,
  };
};

export const getAssetDetailSuccess = (asset) => {
  return {
    type: GET_ASSET_DETAIL_SUCCESS,
    asset,
  };
};

export const getAssetDetailFailure = (error) => {
  return {
    type: GET_ASSET_DETAIL_FAILURE,
    error,
  };
};

export const openCreateAssetOverlay = function() {
  return {
    type: OPEN_CREATE_ASSET_OVERLAY,
    isOpen: true,
  };
};

export const closeCreateAssetOverlay = function() {
  return {
    type: CLOSE_CREATE_ASSET_OVERLAY,
    isOpen: false,
  };
};

export const openImportAssetsOverlay = function() {
  return {
    type: OPEN_IMPORT_ASSETS_OVERLAY,
    isOpen: true,
  };
};

export const closeImportAssetsOverlay = function() {
  return {
    type: CLOSE_IMPORT_ASSETS_OVERLAY,
    isOpen: false,
  };
};

export const createAsset = function(asset) {
  return {
    type: CREATE_ASSET_REQUEST,
    asset,
  };
};

export const createAssetSuccess = function() {
  return {
    type: CREATE_ASSET_SUCCESS,
  };
};

export const createAssetFailure = function(error) {
  return {
    type: CREATE_ASSET_FAILURE,
    error,
  };
};

export const importAssets = function(assets) {
  return {
    type: IMPORT_ASSETS_REQUEST,
    assets,
  };
};

export const importAssetsSuccess = function() {
  return {
    type: IMPORT_ASSETS_SUCCESS,
  };
};

export const importAssetsFailure = function(error) {
  return {
    type: IMPORT_ASSETS_FAILURE,
    error,
  };
};

export const assetEventRequest = function(payload) {
  return {
    type: ASSET_EVENT_REQUEST,
    payload,
  };
};

export const assetEventSuccess = function(newState) {
  return {
    type: ASSET_EVENT_SUCCESS,
    newState,
  };
};

export const assetEventFailure = function(error) {
  return {
    type: ASSET_EVENT_FAILURE,
    error,
  };
};

export const changeOwner = function(payload) {
  return {
    type: CHANGE_OWNER_REQUEST,
    payload,
  };
};

export const changeOwnerSuccess = function(newState) {
  return {
    type: CHANGE_OWNER_SUCCESS,
    newState,
  };
};

export const changeOwnerFailure = function(error) {
  return {
    type: CHANGE_OWNER_FAILURE,
    error,
  };
};

export const updateAssetImportCount = function(count) {
  return {
    type: UPDATE_ASSET_IMPORT_COUNT,
    count,
  };
};
