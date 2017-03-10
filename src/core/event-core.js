import moment from 'moment';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
const logger = require('../util/logger')(__filename);
const {knex} = require('../util/database').connect();

const DATA_DIR = path.join(__dirname, '../../data');

let eventsByCity;

const setUp = knex('cities')
  .select('id')
  .select('name')
  .then(cities => cities.filter(city => _fileExists(city.name)))
  .then(cities => {
    eventsByCity = cities.map(city => {
      return {
        cityName: city.name,
        cityId: city.id,
        events: _readEvents(city),
      };
    })
  });

function getEventsByCity(params) {
  return _.filter(_eventsForCity(params), event => {
    return moment(event.endTime).diff(moment(), 'hours') > -5;
  });
}

function getEvents() {
  return setUp.then(() =>
    _.flatten(eventsByCity.map(eventCity => eventCity.events))
  );
};

function setAttendingCount(facebookEventId, attendingCount) {
  const event = _.find(eventsByCity, { facebookId: facebookEventId });
  if (!event) {
    return;
  }

  event.attendingCount = attendingCount;
}

function _fileExists(fileName) {
  return fs.existsSync(path.join(DATA_DIR, `${fileName}-events.json`));
}

function _readFile(fileName) {
  return fs.readFileSync(path.join(DATA_DIR, `${fileName}-events.json`), {encoding: 'utf8'})
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

function _readEvents(city) {
  return _parseJSON(_readFile(city.name), city.name);
}

function _eventsForCity(params) {
  if (params.cityId) {
    // TODO parseInt since (for some reason) Joi returns the validated param as string
    return _.get(_.find(eventsByCity, { cityId: parseInt(params.cityId) }), 'events', []);
  } else if (params.cityName) {
    return _.get(_.find(eventsByCity, { cityName: params.cityName }), 'events', []);
  } else {
    return _.flatten(eventsByCity.map(eventCity => eventCity.events));
  }
}

export {
  getEventsByCity,
  setAttendingCount,
  getEvents,
};
