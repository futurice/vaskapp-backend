import _ from 'lodash';
import * as citiesCore from '../core/cities-core';

const jwt = require('express-jwt');
const compose = require('composable-middleware');
const validateJwt = jwt({ secret: process.env.AUTH0_SECRET_KEY });

// # Validates JWT
function isAuthenticated() {
  return compose()
  .use(function(req, res, next) {
    // Allow access_token to be passed through query parameter as well
    if (req.query && req.query.hasOwnProperty('access_token')) {
      req.headers.authorization = 'Bearer ' + req.query.access_token;
    }

    validateJwt(req, res, next);
  })
  .use(function(req, res, next) {
    // Parse domain from email address
    const email = _.get(req, ['user', 'email'], '');
    const domain = email.substring(email.lastIndexOf('@') + 1).toLowerCase();

    if (_.isEmpty(domain)) {
      next();
    }

    citiesCore.findCityAndTeamByDomain(domain)
    .then(city => {
      // Fetch or Create city & team for domain
      // Add it to req.client
      if (!req.client) {
        req.client = {};
      }

      // Should citiesCore be responsible of creating new ones??
      // Or require-client-headers?
      if (!city) {
        citiesCore.createCityAndTeam(domain)
        .then(newCity => {
          req.client.city = newCity.city;
          req.client.team = newCity.team;
          next();
        });
      } else {
        req.client.city = city.id;
        req.client.team = city.team;
        next();
      }
    });
  });
}

export {
  isAuthenticated
};
