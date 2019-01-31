export const GET_ASSETS = 'GET_ASSETS';
export const GET_ASSETS_SUCCESS = 'GET_ASSETS_SUCCESS';
export const GET_ASSETS_FAILURE = 'GET_ASSETS_FAILURE';

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