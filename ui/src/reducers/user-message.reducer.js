import producer from 'immer';
import { RESET_USER_MESSAGE, SET_USER_MESSAGE } from '../actions/user-message.actions';

const initialState = {
  success: false,
  message: null,
  isOpen: false
}

const reducer = (state = initialState, action) => {
  return producer(state, draft => {
    switch (action.type) {
      case RESET_USER_MESSAGE:
        draft.success = false
        draft.isOpen = false
        break
      case SET_USER_MESSAGE:
        draft.success = action.success
        draft.message = action.message
        draft.isOpen = true;
        break
      default:
        break
    }
  })
}

export default reducer