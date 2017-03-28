import google from 'googleapis';
import * as events from '../worker/event-fetcher';
const OAuth2 = google.auth.OAuth2;
const requireEnvs = require('./require-envs');

requireEnvs([
  // TODO
]);

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
let oauth2Client;

function init() {
  oauth2Client = new OAuth2(
    process.env.GS_CLIENT_ID,
    process.env.GS_CLIENT_SECRET,
    "http://localhost:9000/api/oauthcallback",
  );

  console.log('authorize google: ', oauth2Client.generateAuthUrl({
    access_type: 'online',
    scope: SCOPES,
  }));
}

function setToken(token) {
  oauth2Client.getToken(token, (err, tokens) => {
    if (!err) {
      oauth2Client.setCredentials(tokens);
    }

    google.options({
      auth: oauth2Client,
    });

    events.getEvents();
  });
}

export {
  init,
  setToken,
};
