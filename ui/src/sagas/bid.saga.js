import { call, takeLatest, put, delay } from "redux-saga/effects";
import { apiUrl, HTTP_METHODS } from "../constants";
import { setUserMessage } from "../actions/user-message.actions";
import {
  BID_SUBMIT_REQUEST,
  bidSubmitSuccess,
  bidSubmitFailure,
  getBidsSuccess,
  getBidsFailure,
  GET_BIDS_REQUEST,
  BID_EVENT_REQUEST,
  bidEventSuccess,
  bidEventFailure,
  getBids
} from "../actions/bid.actions";
import { getAssetDetail } from "../actions/asset.actions";

const placeBidUrl = `${apiUrl}/bids`;
const bidEventUrl = `${apiUrl}/bids/:address/event`;

function placeBidApiCall(payload) {
  return fetch(placeBidUrl, {
    method: HTTP_METHODS.POST,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(response => {
      return response.json();
    })
    .catch(err => {
      throw err;
    });
}

function fetchBidsApiCall(assetAddress) {
  return fetch(`${placeBidUrl}?asset=eq.${assetAddress}`, {
    method: HTTP_METHODS.GET,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      return response.json();
    })
    .catch(err => {
      throw err;
    });
}

function bidEventApiCall(payload) {
  const url = bidEventUrl.replace(":address", payload.address);
  return fetch(url, {
    method: HTTP_METHODS.POST,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(response => {
      return response.json();
    })
    .catch(err => {
      throw err;
    });
}

function* placeBid(action) {
  try {
    const response = yield call(placeBidApiCall, action.payload);
    if (response.success) {
      yield put(bidSubmitSuccess(response.data));
      yield put(setUserMessage("Bid has been placed", true));
      // Update bids
      yield put(getBids(action.payload.address));
      // Update asset
      yield put(getAssetDetail(action.sku));
    } else {
      yield put(bidSubmitFailure());
      yield put(setUserMessage(response.error));
    }
  } catch (err) {
    yield put(bidSubmitFailure(err));
    yield put(setUserMessage("Unable to place bid"));
  }
}

function* fetchBids(action) {
  try {
    const response = yield call(fetchBidsApiCall, action.assetAddress);
    if (response.success) {
      yield put(getBidsSuccess(response.data));
    } else {
      yield put(getBidsFailure());
    }
  } catch (err) {
    yield put(getBidsFailure());
  }
}

function* bidEvent(action) {
  try {
    const response = yield call(bidEventApiCall, action.payload);
    if (response.success) {
      yield put(bidEventSuccess(response.data));
      // Check status accepted
      if (parseInt(response.data) === action.BID_STATE.ACCEPTED)
        yield put(
          setUserMessage(`Bid accepted and Owner has been changed`, true)
        );
      // Check event and display snackbar
      if (action.payload.bidEvent === action.BID_EVENT.REJECT)
        yield put(setUserMessage("Bid has been Rejected", true));

      yield put(getAssetDetail(action.sku));
      yield delay(1000);
      yield put(getBids(action.assetAddress));
    } else {
      yield put(bidEventFailure(response.error));
      yield put(setUserMessage("Unable to accept bid"));
    }
  } catch (err) {
    yield put(bidEventFailure(err));
  }
}

export default function* watchBids() {
  yield takeLatest(BID_SUBMIT_REQUEST, placeBid);
  yield takeLatest(GET_BIDS_REQUEST, fetchBids);
  yield takeLatest(BID_EVENT_REQUEST, bidEvent);
}
