const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const compose = require('composable-middleware');
const validateJwt = jwt({ secret: process.env.AUTH0_SECRET_KEY });

// # Validates JWT
// function isAuthenticated() {
//   return compose()
//   .use(function(req, res, next) {
//     // Allow access_token to be passed through query parameter as well
//     if (req.query && req.query.hasOwnProperty('access_token')) {
//       req.headers.authorization = 'Bearer ' + req.query.access_token;
//     }

//     validateJwt(req, res, next);
//   });
// }

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: 'https://praha-app-qa.herokuapp.com/api',
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

function isAuthenticated() {
  return compose()
  .use(function(req, res, next) {
    // Allow access_token to be passed through query parameter as well
    if (req.query && req.query.hasOwnProperty('access_token')) {
      req.headers.authorization = 'Bearer ' + req.query.access_token;
    }

    jwtCheck(req, res, next);
  });
}

export {
  isAuthenticated
};
