const _ = require('lodash');
const requireEnvs = require('../util/require-envs');
requireEnvs(['API_TOKEN']);

const validTokens = process.env.API_TOKEN.split(',');
const oldTokens = new Set((process.env.OLD_API_TOKENS || '').split(','));

const oldVersionError =
  `You're using an old version of the app. Please upgrade to latest.`;

function createRequireApiToken(opts) {
  return function requireApiToken(req, res, next) {
    var userToken = req.headers['x-token'];

    if (oldTokens.has(userToken)) {
      const err = new Error(oldVersionError);
      err.status = 503;
      err.userMessage = oldVersionError;
      err.userHeader = 'Unsupported version detected';
      next(err);
    } else if (!_.includes(validTokens, userToken)) {
      var err = new Error('Invalid API token in x-token header.');
      err.status = 401;
      return next(err);
    } else {
      next();
    }
  };
}

module.exports = createRequireApiToken;
