import {
  call,
  takeLatest,
  put
} from 'redux-saga/effects';
import { apiUrl } from '../constants';
import { GET_ASSETS, getAssetsSuccess, getAssetsFailure } from '../actions/asset.actions';

// TODO: create an API to list the assets
const assetsUrl = `${apiUrl}/assets`;

function fetchAssets() {
  return ({
    success: true, assets: [
      { id: 1, name: 'Frozen yoghurt', description: 159, price: 6.0 },
      { id: 2, name: 'Ice cream sandwich', description: 159, price: 6.0 },
      { id: 3, name: 'Eclair', description: 159, price: 6.0 },
      { id: 4, name: 'Cupcake', description: 159, price: 6.0 },
      { id: 5, name: 'Gingerbread', description: 159, price: 6.0 }
    ]
  });
  // TODO: Uncomment when API implementation is Done
  // return fetch(assetsUrl, { method: 'GET' })
  //   .then((response) => {
  //     return response.json()
  //   })
  //   .catch(err => {
  //     throw err
  //   });
}

function* getAssets() {
  try {
    const response = yield call(fetchAssets);
    if (response.success) {
      yield put(getAssetsSuccess(response.assets));
    } else {
      yield put(getAssetsFailure());
    }
  } catch (err) {
    /* Remove when API is ready */
    yield put(getAssetsSuccess());
    // TODO: handle unexpected error
    yield put(getAssetsFailure(err));
  }
}

export default function* watchAssets() {
  yield takeLatest(GET_ASSETS, getAssets)
}
