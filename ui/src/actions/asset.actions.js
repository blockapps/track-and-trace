export const GET_ASSETS = 'GET_ASSETS';
export const GET_ASSETS_SUCCESS = 'GET_ASSETS_SUCCESS';
export const GET_ASSETS_FAILURE = 'GET_ASSETS_FAILURE';
export const OPEN_CREATE_ASSET_OVERLAY = 'OPEN_CREATE_ASSET_OVERLAY';
export const CLOSE_CREATE_ASSET_OVERLAY = 'CLOSE_CREATE_ASSET_OVERLAY';
export const CREATE_ASSET = 'CREATE_ASSET'
export const CREATE_ASSET_SUCCESS = 'CREATE_ASSET_SUCCESS'
export const CREATE_ASSET_FAILURE = 'CREATE_ASSET_FAILURE'

export const getAssets = () => {
  return {
    type: GET_ASSETS
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
    type: CREATE_ASSET,
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