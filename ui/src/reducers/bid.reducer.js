
import producer from 'immer';
import {
  OPEN_BID_OVERLAY,
  CLOSE_BID_OVERLAY,
  BID_FAILURE,
  BID_SUCCESS
} from '../actions/bid.actions';

const initialState = {
  isBidOverlayOpen: false
}

const reducer = (state = initialState, action) => {
  return producer(state, draft => {
    switch (action.type) {
      case BID_SUCCESS:
        draft.isBidOverlayOpen = false;
        break;
      case BID_FAILURE:
        draft.isBidOverlayOpen = true;
        break;
      case OPEN_BID_OVERLAY:
        draft.isBidOverlayOpen = action.isOpen
        break;
      case CLOSE_BID_OVERLAY:
        draft.isBidOverlayOpen = action.isOpen
        break
      default:
        break
    }
  })
}

export default reducer