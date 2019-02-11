import producer from 'immer';
import { RESET_USER_MESSAGE, SET_USER_MESSAGE } from '../actions/user-message.actions';

const initialState = {
  success: false,
  message: null
}

const reducer = (state = initialState, action) => {
  return producer(state, draft => {
    switch (action.type) {
      case RESET_USER_MESSAGE:
        draft.success = false
        draft.message = null
        break
      case SET_USER_MESSAGE:
        draft.success = true
        draft.message = action.message
        break
      default:
        break
    }
  })
}

export default reducer