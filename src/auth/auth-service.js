const expressJwt = require('express-jwt');
const compose = require('composable-middleware');
const validateJwt = expressJwt({ secret: process.env.AUTH0_SECRET_KEY });

// # Validates JWT
function isAuthenticated(req, res, next) {
  // Allow access_token to be passed through query parameter as well
  if (req.query && req.query.hasOwnProperty('access_token')) {
    req.headers.authorization = 'Bearer ' + req.query.access_token;
  }

  return validateJwt(req, res, next);
}

exports.isAuthenticated = isAuthenticated;
