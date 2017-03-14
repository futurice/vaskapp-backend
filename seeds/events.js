const BPromise = require('bluebird');
const util = require('../src/util/seeds');
const fs = require('fs');
const path = require('path');
const logger = require('../src/util/logger');
const DATA_DIR = path.join(__dirname, '../data');

exports.seed = function(knex, Promise) {
  return knex('cities')
    .select('id')
    .select('name')
    .then(cities => cities.filter(city => _fileExists(city.name)))
    .then(cities => {
      return BPromise.map(cities, city => {
        return BPromise.map(_readEvents(city), (event, index) => {
          return util.insertOrUpdate(knex, 'events', {
            code: `${ city.name }_${ index }`,
            city_id: city.id,
            name: event.name,
            location_name: event.locationName,
            start_time: event.startTime,
            end_time: event.endTime,
            description: event.description,
            organizer: event.organizer,
            contact_details: event.contactDetails,
            teemu: event.teemu,
            location: event.location.longitude + ',' + event.location.latitude,
            cover_image: event.coverImage,
            fb_event_id: event.facebookId,
          }, 'code');
        });
      });
    });
};

function _readEvents(city) {
  return _parseJSON(_readFile(city.name), city.name);
}

function _fileExists(cityName) {
  return fs.existsSync(path.join(DATA_DIR, `${cityName}-events.json`));
}

function _readFile(cityName) {
  return fs.readFileSync(path.join(DATA_DIR, `${cityName}-events.json`), {encoding: 'utf8'})
}

function _parseJSON(jsonString, cityName) {
  let json;
  try {
    json = JSON.parse(jsonString);
  } catch (e) {
    logger.error(`Error when parsing ${cityName}-event.json!`);
    logger.error(jsonString);
    throw e;
  }

  return json;
}
