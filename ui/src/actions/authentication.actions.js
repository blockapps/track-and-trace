export const GET_USER_SUCCESSFUL = 'authentication/GET_USER_SUCCESSFUL'
export const LOGOUT = 'authentication/LOGOUT'
export const UNAUTHORIZED = 'authentication/UNAUTHORIZED';
export const GET_USER = `authentication/GET_USER`;

export const getUser = (payload) => {
  return {
    type: GET_USER
  }
}

export const getUserSuccessful = (payload) => {
  return {
    type: GET_USER_SUCCESSFUL,
    payload
  }
}

export const logoutSuccessful = (logoutUrl) => {
  return {
    type: LOGOUT,
    logoutUrl
  }
}

export const unauthorized = (loginUrl) => {
  return {
    type: UNAUTHORIZED,
    loginUrl
  }
}