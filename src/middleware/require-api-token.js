const requireEnvs = require('../util/require-envs');
requireEnvs(['API_TOKEN']);

function createRequireApiToken(opts) {
  return function requireApiToken(req, res, next) {
    if (req.headers['x-token'] === process.env.API_TOKEN) {
      return next();
    }

    const err = new Error('Incorrect x-token header');
    err.status = 401;
    return next(err);
  };
}

module.exports = createRequireApiToken;
