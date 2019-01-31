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
        // draft.assets = action.assets;
        // TODO: change when you use API
        draft.assets = 
        [
          { id: 1, name: 'Frozen yoghurt', description: 159, price: 6.0},
          { id: 2, name: 'Ice cream sandwich', description: 159, price: 6.0},
          { id: 3, name: 'Eclair', description: 159, price: 6.0},
          { id: 4, name: 'Cupcake', description: 159, price: 6.0},
          { id: 5, name: 'Gingerbread', description: 159, price: 6.0}
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