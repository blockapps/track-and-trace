export const GET_ASSETS_REQUEST = 'GET_ASSETS_REQUEST';
export const GET_ASSETS_SUCCESS = 'GET_ASSETS_SUCCESS';
export const GET_ASSETS_FAILURE = 'GET_ASSETS_FAILURE';
export const GET_ASSET_DETAIL_REQUEST = 'GET_ASSET_DETAIL_REQUEST'
export const GET_ASSET_DETAIL_SUCCESS = 'GET_ASSET_DETAIL_SUCCESS'
export const GET_ASSET_DETAIL_FAILURE = 'GET_ASSET_DETAIL_FAILURE'
export const OPEN_CREATE_ASSET_OVERLAY = 'OPEN_CREATE_ASSET_OVERLAY';
export const CLOSE_CREATE_ASSET_OVERLAY = 'CLOSE_CREATE_ASSET_OVERLAY';
export const CREATE_ASSET_REQUEST = 'CREATE_ASSET_REQUEST';
export const CREATE_ASSET_SUCCESS = 'CREATE_ASSET_SUCCESS';
export const CREATE_ASSET_FAILURE = 'CREATE_ASSET_FAILURE';
export const ASSET_EVENT_REQUEST = 'ASSET_EVENT_REQUEST';
export const ASSET_EVENT_SUCCESS = 'ASSET_EVENT_SUCCESS';
export const ASSET_EVENT_FAILURE = 'ASSET_EVENT_FAILURE';
export const CHANGE_OWNER_REQUEST = 'CHANGE_OWNER_REQUEST';
export const CHANGE_OWNER_SUCCESS = 'CHANGE_OWNER_SUCCESS';
export const CHANGE_OWNER_FAILURE = 'CHANGE_OWNER_FAILURE';
export const OPEN_CHANGE_OWNER_OVERLAY = 'OPEN_CHANGE_OWNER_OVERLAY';
export const CLOSE_CHANGE_OWNER_OVERLAY = 'CLOSE_CHANGE_OWNER_OVERLAY';


export const getAssets = () => {
  return {
    type: GET_ASSETS_REQUEST
  }
}

export const getAssetsSuccess = (assets) => {
  return {
    type: GET_ASSETS_SUCCESS,
    assets
  }
}

export const getAssetsFailure = (error) => {
  return {
    type: GET_ASSETS_FAILURE,
    error
  }
}

export const getAssetDetail = (sku) => {
  return {
    type: GET_ASSET_DETAIL_REQUEST,
    sku
  }
}

export const getAssetDetailSuccess = (asset) => {
  return {
    type: GET_ASSET_DETAIL_SUCCESS,
    asset
  }
}

export const getAssetDetailFailure = (error) => {
  return {
    type: GET_ASSET_DETAIL_FAILURE,
    error
  }
}

export const openCreateAssetOverlay = function () {
  return {
    type: OPEN_CREATE_ASSET_OVERLAY,
    isOpen: true
  }
}

export const closeCreateAssetOverlay = function () {
  return {
    type: CLOSE_CREATE_ASSET_OVERLAY,
    isOpen: false
  }
}

export const createAsset = function (asset) {
  return {
    type: CREATE_ASSET_REQUEST,
    asset
  }
}

export const createAssetSuccess = function () {
  return {
    type: CREATE_ASSET_SUCCESS
  }
}

export const createAssetFailure = function (error) {
  return {
    type: CREATE_ASSET_FAILURE,
    error
  }
}

export const assetEventRequest = function (payload) {
  return {
    type: ASSET_EVENT_REQUEST,
    payload
  }
}

export const assetEventSuccess = function (newState) {
  return {
    type: ASSET_EVENT_SUCCESS,
    newState
  }
}

export const assetEventFailure = function (error) {
  return {
    type: ASSET_EVENT_FAILURE,
    error
  }
}

export const changeOwner = function (payload) {
  return {
    type: CHANGE_OWNER_REQUEST,
    payload
  }
}

export const changeOwnerSuccess = function (newState) {
  return {
    type: CHANGE_OWNER_SUCCESS,
    newState
  }
}

export const changeOwnerFailure = function (error) {
  return {
    type: CHANGE_OWNER_FAILURE,
    error
  }
}

export const openChangeOwnerOverlay = () => {
  return {
    type: OPEN_CHANGE_OWNER_OVERLAY,
    isOpen: true
  }
}

export const closeChangeOwnerOverlay = () => {
  return {
    type: CLOSE_CHANGE_OWNER_OVERLAY,
    isOpen: false
  }
}