export const BID_SUBMIT_REQUEST = "BID_SUBMIT_REQUEST";
export const BID_SUCCESS = "BID_SUCCESS";
export const BID_FAILURE = "BID_FAILURE";
export const GET_BIDS_REQUEST = "GET_BIDS_REQUEST";
export const GET_BIDS_SUCCESS = "GET_BIDS_SUCCESS";
export const GET_BIDS_FAILURE = "GET_BIDS_FAILURE";
export const BID_EVENT_REQUEST = "BID_EVENT_REQUEST";
export const BID_EVENT_SUCCESS = "BID_EVENT_SUCCESS";
export const BID_EVENT_FAILURE = "BID_EVENT_FAILURE";
export const OPEN_BID_OVERLAY = 'OPEN_BID_OVERLAY';
export const CLOSE_BID_OVERLAY = 'CLOSE_BID_OVERLAY';

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

export const getBids = () => {
  return {
    type: GET_BIDS_REQUEST
  }
}

export const getBidsSuccess = (bids) => {
  return {
    type: GET_BIDS_SUCCESS,
    bids
  }
}

export const getBidsFailure = () => {
  return {
    type: GET_BIDS_FAILURE
  }
}

export const bidEventRequest = (payload, sku, initiator) => {
  return {
    type: BID_EVENT_REQUEST,
    payload,
    sku,
    initiator
  }
}

export const bidEventSuccess = (bidState) => {
  return {
    type: BID_EVENT_SUCCESS,
    bidState
  }
}

export const bidEventFailure = (error) => {
  return {
    type: BID_EVENT_FAILURE,
    error
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