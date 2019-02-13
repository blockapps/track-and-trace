export const GET_USER_SUCCESS = 'authentication/GET_USER_SUCCESS'
export const LOGOUT_REQUEST = 'authentication/LOGOUT_REQUEST'
export const LOGOUT_SUCCESS = 'authentication/LOGOUT_SUCCESS'
export const UNAUTHORIZED = 'authentication/UNAUTHORIZED';
export const GET_USER_REQUEST = `authentication/GET_USER_REQUEST`;

export const getUser = (payload) => {
  return {
    type: GET_USER_REQUEST
  }
}

export const getUserSuccessful = (payload) => {
  return {
    type: GET_USER_SUCCESS,
    payload
  }
}

export const logout = () => {
  return {
    type: LOGOUT_REQUEST
  }
}

export const logoutSuccessful = (logoutUrl) => {
  return {
    type: LOGOUT_SUCCESS,
    logoutUrl
  }
}

export const unauthorized = (loginUrl) => {
  return {
    type: UNAUTHORIZED,
    loginUrl
  }
}