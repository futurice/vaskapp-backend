import _ from 'lodash';
const {knex} = require('../util/database').connect();
import {deepChangeKeyCase} from '../util';
import {equirectangularDistance} from '../util/geometry';
import moment from 'moment-timezone';


function getEvents(opts) {
  return knex('events')
    .select('*')
    .where(_getWhereClause(opts))
    .orderBy('start_time', 'asc')
    .then(results =>
      _.map(results, row =>
        deepChangeKeyCase(row, 'camelCase')
      )
    );
};

function setAttendingCount(facebookEventId, attendingCount) {
  knex('events')
    .update('attending_count', attendingCount)
    .where('fb_event_id', '=', facebookEventId);
}

function _getWhereClause(filters) {
  let whereClauses = {};

  if (filters.cityId) {
    whereClauses.city_id = filters.cityId;
  }

  if (filters.cityName) {
    whereClauses.city_id = knex('cities')
      .select('id')
      .where('name', '=', filters.cityName);
  }

  return whereClauses;
}

// Checks if checking in with the given parameters would be feasable.
// DOES NOT check if user has already checked in, thus the result
// is not a guarantee of a successfull check in.
function isValidCheckIn(action) {
  return knex('events').select(['*']).where('id', '=', action.eventId)
    .then(events => {
      if (events.length === 0) {
        let err = new Error(`No such event id: ${ action.eventId }`);
        err.status = 404;
        throw err;
      } else if (events.length > 1) {
        let err = new Error('Unexpected number of rows');
        err.status = 500;
        throw err;
      } else {
        return events[0];
      }
    })
    .then(event => {
      if (!_eventOnGoing(event)) throw new Error('Event not ongoing');
      return event;
    })
    .then(event => {
      let eventLocation = {
        latitude: event.location.y,
        longitude: event.location.x,
      };

      if (!_userInVicinity(action.location, eventLocation, event.radius)) {
        throw new Error('Not close enough to event for check in');
      }
      return event;
    })
    .catch(err => {
      err.status = err.status || 403;
      throw err;
    });
}

function _eventOnGoing(event) {
  return moment().utc().isBetween(
    moment(event.start_time).utc(),
    moment(event.end_time).utc()
  );
}

function _userInVicinity(actionLocation, eventLocation, eventRadius) {
  let earthRadius = 6372.8;
  let distanceToEvent = equirectangularDistance(
      actionLocation,
      eventLocation,
      earthRadius
    );
  return distanceToEvent <= eventRadius;
}

export {
  getEvents,
  setAttendingCount,
  isValidCheckIn
};
