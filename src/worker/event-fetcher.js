import _ from 'lodash';
import google from 'googleapis';
import * as util from '../util/seeds';
const {knex} = require('../util/database').connect();
const BPromise = require('bluebird');
const requireEnvs = require('../util/require-envs');
const sheets = google.sheets('v4');
requireEnvs([
  'GSHEETS_EVENTS',
  'GSHEETS_API_KEY',
]);

const eventSheets = JSON.parse(process.env.GSHEETS_EVENTS);
const cities = {};
const batchGetAsync = BPromise.promisify(sheets.spreadsheets.values.batchGet);


function init() {
  getEvents();
}

function getEvents() {
  return knex('cities').select('*')
  .then(rows => {
    rows.forEach(city => {
      cities[city.name] = city.id;
    });
  }).then(() => BPromise.map(eventSheets, eventSheet => {
    const request = {
      spreadsheetId: eventSheet.id,
      ranges: ['A1:M60'],
      valueRenderOption: 'FORMATTED_VALUE',
      key: process.env.GSHEETS_API_KEY,
    };

    batchGetAsync(request).then(response => {
      let payload = _.get(response, 'valueRanges[0].values', null);

      if (!payload || payload.length === 0) {
        BPromise.resolve();
      }

      const headers = _getHeaders(_.flatMap(_.pullAt(payload, [0])));
      const events = _getEvents(payload, headers);

      return BPromise.map(events, event => {
        return util.insertOrUpdate(knex, 'events', {
          code: `${ eventSheet.city }_${ event[headers["eventId"]] }`,
          city_id: cities[eventSheet.city],
          name: event[headers["name"]],
          location_name: event[headers["locationName"]],
          start_time: event[headers["startTime"]],
          end_time: event[headers["endTime"]],
          description: event[headers["description"]],
          organizer: event[headers["organizer"]],
          contact_details: event[headers["contactDetails"]],
          teemu: event[headers["teemu"]] || false,
          location: event[headers["locationLon"]] + ',' + event[headers["locationLat"]],
          cover_image: event[headers["coverImage"]],
          fb_event_id: event[headers["facebookId"]],
          radius: event[headers["radius"]] || process.env.DEFAULT_EVENT_RADIUS,
        }, 'code');
      });
    }).catch(err => console.log(err));
  }));
}

function _getHeaders(headers) {
  const indexedHeaders = {};
  _.forEach(headers, (header, index) => indexedHeaders[header] = index);
  return indexedHeaders;
}

function _getEvents(payload, headers) {
  // Filters out empty rows. Filters out duplicate event IDs. Does in this
  // in reversed order since Otaniemi's sheet appends updated events
  // rather  actually update the cell values.
  const events = _.filter(payload, row => !_.isEmpty(row))
  return _.uniqBy(_.reverse(events), event => event[headers["eventId"]]);
}

export {
  init,
  getEvents,
}
