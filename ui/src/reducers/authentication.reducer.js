
import producer from 'immer' //Immutability Library
import {
  GET_USER_SUCCESSFUL,
  LOGOUT,
  UNAUTHORIZED
} from '../actions/authentication.actions'

const initialState = {
  /* 
    Change the roles to see color based on roles Roles: 
    MANUFACTURER: 'MANUFACTURER',
    DISTRIBUTOR: 'DISTRIBUTOR',
    RETAILER: 'RETAILER',
    REGULATOR: 'REGULATOR',
    ADMIN: 'ADMIN' 

    TODO: Remove when API is ready to use
  */
  user: {
    role: 'REGULATOR'
  },
  loginUrl: null,
  logoutUrl: null,
  isGetUserComplete: false,
  isAuthenticated: false,
}

const reducer = (state = initialState, action) => {
  return producer(state, draft => {
    switch(action.type) {
      case GET_USER_SUCCESSFUL:
        draft.user = action.payload
        draft.isGetUserComplete = true
        draft.isAuthenticated = true
        break
      case LOGOUT:
        draft.user = null
        draft.isGetUserComplete = false
        draft.logoutUrl = action.logoutUrl
        draft.isAuthenticated = false
        break
      case UNAUTHORIZED:
        draft.user = null
        draft.isGetUserComplete = true
        draft.loginUrl = action.loginUrl
        draft.isAuthenticated = false
        break
      default:
        break
    }
  })
}

export default reducer