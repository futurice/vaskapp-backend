import * as userCore from '../core/user-core';

function createRequireClientHeaders(opts) {
  return function requireClientHeaders(req, res, next) {
    // Enforce uuid header in other methods than GET
    if (req.method !== 'GET' && !req.headers['x-user-uuid']) {
      const err = new Error('x-user-uuid header is required');
      err.status = 400;
      return next(err);
    }

    const uuid = req.headers['x-user-uuid'] || 'anonymous';

    userCore.findByUuid(uuid)
      .then(user => {
        if (user) {
          req.client = user;
        } else {
          // If header is not set, set it to "anonymous". It is better then null
          // because NULL value of uuid in database means system user.
          req.client = {
            id: null,
            isBanned: false,
            uuid: 'anonymous'
          };
        }

        console.log(req.client);
        next();
      });
  };
}

module.exports = createRequireClientHeaders;
