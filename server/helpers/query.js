
import { util } from 'blockapps-rest';

const getPostgrestQueryString = function (params) {
  const queryString = Object.getOwnPropertyNames(params).reduce((qs, prop) => {
    if (Array.isArray(params[prop])) {
      qs += `${qs.length === 0 ? '' : '&'}${prop}=in.${util.toCsv(params[prop])}`;
      return qs;
    }
    if (typeof params[prop] === 'object') {
      return qs;
    }
    qs += `${qs.length === 0 ? '' : '&'}${prop}=eq.${params[prop]}`;
    return qs;
  }, '')

  return queryString;
}

module.exports = {
  getPostgrestQueryString
}