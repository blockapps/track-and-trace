// TODO: this is likely not necessary
const handler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default handler;
