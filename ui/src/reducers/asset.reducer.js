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
      case CREATE_ASSET_FAILURE:
        draft.error = action.error;
        draft.isCreateAssetModalOpen = true;
      case GET_ASSETS_SUCCESS:
        // draft.assets = action.assets;
        // TODO: change when you use API
        draft.assets =
          [
            { id: 1, name: 'Frozen yoghurt', description: 159, price: 6.0 },
            { id: 2, name: 'Ice cream sandwich', description: 159, price: 6.0 },
            { id: 3, name: 'Eclair', description: 159, price: 6.0 },
            { id: 4, name: 'Cupcake', description: 159, price: 6.0 },
            { id: 5, name: 'Gingerbread', description: 159, price: 6.0 }
          ];
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