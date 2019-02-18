
import producer from 'immer';
import {
  GET_CONSTANTS_SUCCESS,
  GET_CONSTANTS_FAILURE
} from '../actions/constants.actions';

const reducer = (state = null, action) => {
  return producer(state, () => {
    switch (action.type) {
      case GET_CONSTANTS_SUCCESS:
        return action.constants;
      case GET_CONSTANTS_FAILURE:
        return null;
      default:
        break
    }
  })
}

export default reducer;