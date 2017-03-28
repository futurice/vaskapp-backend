import google from 'googleapis';
import * as events from '../worker/event-fetcher';
const BPromise = require('bluebird');
const {knex} = require('../util/database').connect();
const OAuth2 = google.auth.OAuth2;
const requireEnvs = require('./require-envs');

requireEnvs([
  // TODO
]);

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const oauth2Client = _getClient();

function init() {
  return knex('oauth_tokens')
    .select('token')
    .where('client_id', '=', process.env.GS_CLIENT_ID)
    .then(results => {
      if (results.length > 1) {
        throw new Error('Unexpected number of tokens');
      }
      else if (results.length === 1) {
        return setToken(results[0]);
      }
      else {
        console.log('Authenticate via this url:', _getAuthUrl(oauth2Client));
      }
    });
}

function setToken(token) {
  oauth2Client.getToken(token, (err, tokens) => {
    if (err) {
      throw err;
    }

    oauth2Client.setCredentials(tokens);
    google.options({ auth: oauth2Client });
    BPromise.resolve();
  });
}

function _getAuthUrl(authClient) {
  return authClient.generateAuthUrl({
    access_type: 'online',
    scope: SCOPES,
  });
}

function _getClient() {
  return new OAuth2(
    process.env.GS_CLIENT_ID,
    process.env.GS_CLIENT_SECRET,
    "http://localhost:9000/api/oauthcallback",
  );
}

export {
  init,
  setToken,
};
