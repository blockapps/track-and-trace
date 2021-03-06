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
  UPDATE_ASSET_IMPORT_COUNT,
  assetType,
  UPDATE_ASSET_UPLOAD_ERROR
} from "../actions/asset.actions";

const initialState = {
  readonlyAssets: {
    assets: [],
    limit: 5,
    offset: 0,
  },
  myAssets: {
    assets: [],
    limit: 5,
    offset: 0,
  },
  biddingAssets: {
    assets: [],
    limit: 5,
    offset: 0,
  },
  error: null,
  isAssetImportInProgress: false,
  assetsUploaded: 0,
  assetsUploadedErrors: [],
  isCreateAssetModalOpen: false,
  isImportAssetsModalOpen: false,
  isChangeOwnerModalOpen: false,
  asset: {},
  changedOwner: false,
};

const reducer = (state = initialState, action) => {
  return producer(state, (draft) => {
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
        draft.assetsUploadedErrors = [];
        draft.assetsUploaded = 0;
        break;
      case IMPORT_ASSETS_REQUEST:
        draft.isAssetImportInProgress = true;
        draft.assetsUploaded = 0;
        draft.assetsUploadedErrors = [];
        break;
      case CREATE_ASSET_SUCCESS:
        draft.isCreateAssetModalOpen = false;
        draft.error = null;
        break;
      case IMPORT_ASSETS_SUCCESS:
        draft.isAssetImportInProgress = false;
        draft.error = null;
        break;
      case CREATE_ASSET_FAILURE:
        draft.error = action.error;
        draft.isCreateAssetModalOpen = true;
        break;
      case IMPORT_ASSETS_FAILURE:
        draft.error = action.error;
        draft.isAssetImportInProgress = false;
        draft.isImportAssetsModalOpen = true;
        break;
      case GET_ASSETS_SUCCESS:
        switch (action.assetType) {
          case assetType.MINE:
            draft.myAssets.assets = action.assets;
            draft.myAssets.limit = action.limit;
            draft.myAssets.offset = action.offset;
            break;
          case assetType.BIDDING:
            draft.biddingAssets.assets = action.assets;
            draft.biddingAssets.limit = action.limit;
            draft.biddingAssets.offset = action.offset;
            break;
          case assetType.READ_ONLY:
            draft.readonlyAssets.assets = action.assets;
            draft.readonlyAssets.limit = action.limit;
            draft.readonlyAssets.offset = action.offset;
            break;
          default:
            break;
        }
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
      case UPDATE_ASSET_UPLOAD_ERROR:
        draft.assetsUploadedErrors = action.errors;
        break;
      default:
        break;
    }
  });
};

export default reducer;
