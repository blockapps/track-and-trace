export const BID_SUBMIT_REQUEST = "BID_SUBMIT_REQUEST";
export const BID_SUCCESS = "BID_SUCCESS";
export const BID_FAILURE = "BID_FAILURE";
export const CLOSE_BID_OVERLAY = 'CLOSE_BID_OVERLAY';
export const OPEN_BID_OVERLAY = 'OPEN_BID_OVERLAY';

export const bidSubmit = (payload) => {
  return {
    type: BID_SUBMIT_REQUEST,
    payload
  }
}

export const bidSubmitSuccess = (payload) => {
  return {
    type: BID_SUCCESS,
    payload
  }
}

export const bidSubmitFailure = () => {
  return {
    type: BID_FAILURE
  }
}

export const openBidOverlay = () => {
  return {
    type: OPEN_BID_OVERLAY,
    isOpen: true
  }
}

export const closeBidOverlay = () => {
  return {
    type: CLOSE_BID_OVERLAY,
    isOpen: false
  }
}