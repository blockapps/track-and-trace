//Immutability Library
import producer from "immer";
import {
  GET_ASSETS_SUCCESS,
  GET_ASSETS_FAILURE,
  OPEN_CREATE_ASSET_OVERLAY,
  CLOSE_CREATE_ASSET_OVERLAY,
  OPEN_IMPORT_ASSETS_OVERLAY,
  CLOSE_IMPORT_ASSETS_OVERLAY,
  CREATE_ASSET_SUCCESS,
  CREATE_ASSET_FAILURE,
  GET_ASSET_DETAIL_SUCCESS,
  GET_ASSET_DETAIL_FAILURE,
  GET_ASSET_DETAIL_REQUEST,
  CHANGE_OWNER_SUCCESS,
  IMPORT_ASSETS_REQUEST,
  IMPORT_ASSETS_SUCCESS,
  IMPORT_ASSETS_FAILURE,
  UPDATE_ASSET_IMPORT_COUNT
} from "../actions/asset.actions";

const initialState = {
  assets: [],
  error: null,
  isAssetImportInProgress: false,
  assetsUploaded: 0,
  isCreateAssetModalOpen: false,
  isImportAssetsModalOpen: false,
  isChangeOwnerModalOpen: false,
  asset: {},
  changedOwner: false
};

const reducer = (state = initialState, action) => {
  return producer(state, draft => {
    switch (action.type) {
      case GET_ASSET_DETAIL_REQUEST:
        draft.asset = action.isDataUpdate ? {} : draft.asset;
        draft.error = null;
        break;
      case GET_ASSET_DETAIL_SUCCESS:
        draft.asset = action.asset;
        draft.error = null;
        break;
      case GET_ASSET_DETAIL_FAILURE:
        draft.asset = {};
        draft.error = action.error;
        break;
      case OPEN_CREATE_ASSET_OVERLAY:
      case CLOSE_CREATE_ASSET_OVERLAY:
        draft.isCreateAssetModalOpen = action.isOpen;
        break;
      case OPEN_IMPORT_ASSETS_OVERLAY:
      case CLOSE_IMPORT_ASSETS_OVERLAY:
        draft.isImportAssetsModalOpen = action.isOpen;
        break;
      case IMPORT_ASSETS_REQUEST:
        draft.isAssetImportInProgress = true;
        draft.assetsUploaded = 0;
        break;
      case CREATE_ASSET_SUCCESS:
        draft.isCreateAssetModalOpen = false;
        draft.error = null;
        break;
      case IMPORT_ASSETS_SUCCESS:
        draft.isImportAssetsModalOpen = false;
        draft.error = null;
        break;
      case CREATE_ASSET_FAILURE:
        draft.error = action.error;
        draft.isCreateAssetModalOpen = true;
        break;
      case IMPORT_ASSETS_FAILURE:
        draft.error = action.error;
        draft.isImportAssetsModalOpen = true;
        break;
      case GET_ASSETS_SUCCESS:
        draft.assets = action.assets;
        draft.error = null;
        break;
      case GET_ASSETS_FAILURE:
        draft.user = null;
        draft.error = action.error;
        break;
      case CHANGE_OWNER_SUCCESS:
        draft.changedOwner = true;
        break;
      case UPDATE_ASSET_IMPORT_COUNT:
        draft.assetsUploaded = action.count;
        break;
      default:
        break;
    }
  });
};

export default reducer;
