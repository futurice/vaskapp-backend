function createRequireClientHeaders(opts) {
  return function requireClientHeaders(req, res, next) {
    // Enforce uuid header in other methods than GET
    if (req.method !== 'GET' && !req.headers['x-user-uuid']) {
      const err = new Error('x-user-uuid header is required');
      err.status = 400;
      return next(err);
    }

    req.client = {
      uuid: req.headers['x-user-uuid']
    };

    next();
  };
}

module.exports = createRequireClientHeaders;
