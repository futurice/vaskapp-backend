import request from 'request';
import {createJsonRoute} from '../util/express';

const refreshAuthToken = createJsonRoute(function(req, res) {
  const token = req.params.refreshToken;

  // var options = {
  //   method: 'POST',
  //   url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
  //   headers: { 'content-type': 'application/json' },
  //   body: {
  //     refresh_token: token,
  //     grant_type: 'refresh_token',
  //     client_id: process.env.AUTH0_CLIENT_ID,
  //     client_secret: process.env.AUTH0_SECRET_KEY,
  //   },
  //   json: true
  // };


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
