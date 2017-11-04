const jwt = require('express-jwt');
const compose = require('composable-middleware');
const validateJwt = jwt({ secret: process.env.AUTH0_SECRET_KEY });

// # Validates JWT
function isAuthenticated() {
  return compose()
  .use(function(req, res, next) {

    // Do not require token in development or test env
    if (process.env.DISABLE_AUTH === 'true') {
      return next();
    }

    // Allow access_token to be passed through query parameter as well
    if (req.query && req.query.hasOwnProperty('access_token')) {
      req.headers.authorization = 'Bearer ' + req.query.access_token;
    }

    validateJwt(req, res, next);
  });
}

export {
  isAuthenticated
};
