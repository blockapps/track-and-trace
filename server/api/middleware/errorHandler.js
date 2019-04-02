import { rest } from 'blockapps-rest';

const handler = (
  err,
  req,
  res, 
  next
) => {
  if(err.err && !err.error) {
    err = err.err;
  }

  if (err.toString().startsWith('HttpError')) {
    err.statusCode = err.status;
    err.message = err.data;
  } else if (err.toString().startsWith('RestError')) {
    err.statusCode = err.status;
    err.message = err.data;
  } else if (err.toString().startsWith('RequestError')) {
    if(err.error.code == 'ENOTFOUND') {
      err.statusCode == 502;
    } else {
      err.statusCode = 504; //all other server errors mapped to 504 (EAI_AGAIN)
    }
  } else if (err.status) {
    err.statusCode = err.status;
    err.message = err.statusText;
  } else if (err.output && err.output.statusCode ) {
    err.statusCode = err.output.statusCode;
  } else if (err instanceof Error) {
    err.statusCode = 500;
  } else {
    err.statusCode = 500;
    err.message = 'Unknown'
  }

  // TODO: use logger to log error
  console.log('********************')
  console.log(err);
  console.log('********************')

  rest.response.status(err.statusCode, res, err.message);
}

module.exports = handler;