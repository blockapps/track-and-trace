//Immutability Library
import producer from 'immer';
import {
  GET_ASSETS_SUCCESS,
  GET_ASSETS_FAILURE,
  OPEN_CREATE_ASSET_OVERLAY,
  CLOSE_CREATE_ASSET_OVERLAY,
  CREATE_ASSET_SUCCESS,
  CREATE_ASSET_FAILURE
} from '../actions/asset.actions';

const initialState = {
  assets: [],
  error: null,
  isCreateAssetModalOpen: false
}

const reducer = (state = initialState, action) => {
  return producer(state, draft => {
    switch (action.type) {
      case OPEN_CREATE_ASSET_OVERLAY:
        draft.isCreateAssetModalOpen = action.isOpen;
        break;
      case CLOSE_CREATE_ASSET_OVERLAY:
        draft.isCreateAssetModalOpen = action.isOpen;
        break;
      case CREATE_ASSET_SUCCESS:
        draft.isCreateAssetModalOpen = false;
        draft.error = null;
        break;
      case CREATE_ASSET_FAILURE:
        draft.error = action.error;
        draft.isCreateAssetModalOpen = true;
        break;
      case GET_ASSETS_SUCCESS:
        draft.assets = action.assets;
        draft.error = null;
        break
      case GET_ASSETS_FAILURE:
        draft.user = null;
        draft.error = action.error;
        break
      default:
        break
    }
  })
}

export default reducer