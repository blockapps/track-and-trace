import { rest } from "blockapps-rest";

const handler = (err, req, res, next) => {
  // TODO: use logger to log error
  console.log("********************");
  console.log(err);
  console.log("********************");

  if (err.name && err.name == "RestError") {
    rest.response.status(err.response.status, res, err.response);
    return;
  }

  rest.response.status(500, res, err.message);
};

export default handler;
