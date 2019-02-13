export const GET_USER_SUCCESSFUL = 'authentication/GET_USER_SUCCESSFUL'
export const LOGOUT = 'authentication/LOGOUT'
export const LOGOUT_SUCCESSFUL = 'authentication/LOGOUT_SUCCESSFUL'
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

export const logout = () => {
  return {
    type: LOGOUT
  }
}

export const logoutSuccessful = (logoutUrl) => {
  return {
    type: LOGOUT_SUCCESSFUL,
    logoutUrl
  }
}

export const unauthorized = (loginUrl) => {
  return {
    type: UNAUTHORIZED,
    loginUrl
  }
}