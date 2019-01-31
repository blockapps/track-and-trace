//Immutability Library
import producer from 'immer';
import { GET_ASSETS, GET_ASSETS_SUCCESS, GET_ASSETS_FAILURE } from '../actions/asset.actions';

const initialState = {
  assets: [],
  error: null
}

const reducer = (state = initialState, action) => {
  return producer(state, draft => {
    switch (action.type) {
      case GET_ASSETS:
        // Add variable if any arguments needed
        break
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