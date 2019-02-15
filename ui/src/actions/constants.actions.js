export const GET_CONSTANTS_REQUEST = 'GET_CONSTANTS_REQUEST';
export const GET_CONSTANTS_SUCCESS = 'GET_CONSTANTS_SUCCESS';
export const GET_CONSTANTS_FAILURE = 'GET_CONSTANTS_FAILURE';

export const getConstants = () => {
  return {
    type: GET_CONSTANTS_REQUEST
  }
}

export const getConstantsSuccess = (constants) => {
  return {
    type: GET_CONSTANTS_SUCCESS,
    constants
  }
}

export const getConstantsFailure = () => {
  return {
    type: GET_CONSTANTS_FAILURE
  }
}