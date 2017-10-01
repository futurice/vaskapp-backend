import request from 'request';
import {createJsonRoute} from '../util/express';

const refreshAuthToken = createJsonRoute(function(req, res) {
  const token = req.params.refreshToken;

  // https://auth0.com/docs/api/authentication#delegation
  var options = {
    method: 'POST',
    url: `https://${process.env.AUTH0_DOMAIN}/delegation`,
    headers: { 'content-type': 'application/json' },
    body: {
      refresh_token: token,
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      client_id: process.env.AUTH0_CLIENT_ID,
    },
    json: true
  };


  return new Promise(function(resolve, reject) {
    request(options, function (error, response, body) {
      if (error) {
        return reject(error);
      }

      return resolve(body);
    });
  });
});

export {
  refreshAuthToken,
};
