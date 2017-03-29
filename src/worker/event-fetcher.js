import _ from 'lodash';
import google from 'googleapis';
const requireEnvs = require('../util/require-envs');
const sheets = google.sheets('v4');
requireEnvs([
  // TODO
]);

function init() {
  getEvents();
}

function getEvents() {
  const request = {
    spreadsheetId: '1YkRmTDsSvePLZApAzqVqhoLik0hCrpTmeMEDaBzwwr0',
    ranges: ['A1:M60'],
    valueRenderOption: 'UNFORMATTED_VALUE',
    key: 'AIzaSyA9-DrTDkqGxndogAMQQ8fazfvMPv7085o',
  };

  sheets.spreadsheets.values.batchGet(request, (err, response) => {
    console.log(response.valueRanges[0].values);
  });
}

export {
  init,
  getEvents,
}
