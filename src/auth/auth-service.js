const expressJwt = require('express-jwt');
const compose = require('composable-middleware');
const validateJwt = expressJwt({ secret: process.env.AUTH0_SECRET_KEY });

// # Validates JWT

const isAuthenticated = validateJwt;

function _isAuthenticated() {
  return compose()
  .use(function(req, res, next) {
    // Allow access_token to be passed through query parameter as well
    if (req.query && req.query.hasOwnProperty('access_token')) {
      req.headers.authorization = 'Bearer ' + req.query.access_token;
    }
    validateJwt(req, res, next);
  })
  // .use(function(err, req, res, next) {
  //   if (err.name === 'UnauthorizedError') {
  //     return res.status(401).send('invalid token...');
  //   }
  //   next()
  // });
}


export {
  isAuthenticated
};
