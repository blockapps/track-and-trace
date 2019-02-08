export const apiUrl =
  process.env.REACT_APP_URL
    ? process.env.REACT_APP_URL + '/api/v1'
    : 'http://localhost/api/v1';

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST'
}