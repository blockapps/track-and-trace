import {
  call,
  takeLatest,
  put,
  delay
} from 'redux-saga/effects';
import { apiUrl, HTTP_METHODS } from '../constants';
import { setUserMessage } from '../actions/user-message.actions';
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
} from '../actions/bid.actions';

const placeBidUrl = `${apiUrl}/bids`;
const bidEventUrl = `${apiUrl}/bids/:address/event`;

function placeBidApiCall(payload) {
  return fetch(placeBidUrl,
    {
      method: HTTP_METHODS.POST,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then((response) => {
      return response.json()
    })
    .catch(err => {
      throw err
    });
}

function fetchBidsApiCall() {
  return fetch(placeBidUrl,
    {
      method: HTTP_METHODS.GET,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then((response) => {
      return response.json()
    })
    .catch(err => {
      throw err
    });
}

function bidEventApiCall(payload) {
  const url = bidEventUrl.replace(':address', payload.address)
  return fetch(url,
    {
      method: HTTP_METHODS.POST,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then((response) => {
      return response.json()
    })
    .catch(err => {
      throw err
    });
}

function* placeBid(action) {
  try {
    const response = yield call(placeBidApiCall, action.payload);
    if (response.success) {
      yield put(bidSubmitSuccess(response.data));
      yield put(setUserMessage('Bid has been placed', true));
      // Update bids
      yield put(getBids());
    } else {
      yield put(bidSubmitFailure());
      yield put(setUserMessage(response.error));
    }
  } catch (err) {
    yield put(bidSubmitFailure(err));
    yield put(setUserMessage('Unable to place bid'));
  }
}

function* fetchBids() {
  try {
    const response = yield call(fetchBidsApiCall);
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
      yield delay(500)
      yield put(getBids())
      // TODO: change hardcoded value
      if (action.payload.bidEvent === 1)
        yield put(setUserMessage('Bid has been Accepted', true));
      else
        yield put(setUserMessage('Bid has been Rejected', true));
    } else {
      yield put(bidEventFailure(response.error));
      yield put(setUserMessage('Unable to accept bid'));
    }
  } catch (err) {
    yield put(bidEventFailure(err));
  }
}

export default function* watchBids() {
  yield takeLatest(BID_SUBMIT_REQUEST, placeBid)
  yield takeLatest(GET_BIDS_REQUEST, fetchBids)
  yield takeLatest(BID_EVENT_REQUEST, bidEvent)
}
