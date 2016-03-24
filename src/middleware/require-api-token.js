const _ = require('lodash');
const requireEnvs = require('../util/require-envs');
requireEnvs(['API_TOKEN']);

var validTokens = process.env.API_TOKEN.split(',');

function createRequireApiToken(opts) {
  return function requireApiToken(req, res, next) {
    var userToken = req.headers['x-token'];
    if (!_.includes(validTokens, userToken)) {
      var err = new Error('Invalid API token in x-token header.');
      err.status = 401;
      return next(err);
    }

    next();
  };
}

module.exports = createRequireApiToken;
