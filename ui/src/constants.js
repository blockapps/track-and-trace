export const apiUrl =
  process.env.REACT_APP_URL
    ? process.env.REACT_APP_URL + '/api/v1'
    : '/api/v1';

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST'
}

export const CREATE_ASSET_MODES = {
  USING_FIELDS: 'USING_FIELDS',
  USING_CSV: 'USING_CSV'
}