import _ from 'lodash';
const BPromise = require('bluebird');
const {knex} = require('../util/database').connect();
import {getDistance} from '../util/geometry';
import moment from 'moment-timezone';
import { getFeed } from "./feed-core";

/**
 *
 * @param {number} opts.eventId
 * @param {number} opts.client.id
 */
function getEventById(opts = {}) {
  return getEvents(opts)
    .then(events => {
      if (_.isEmpty(events)) {
        return undefined;
      }

      const getImagesPromise = getFeed({
        eventId: opts.eventId,
        client:  opts.client,
        type:    'IMAGE',
        limit:   50
      });

      return BPromise.all([
        _rowToEvent(events[0]),
        getImagesPromise
      ]).spread((event, images) => {
        event.images = images;

        return event;
      });
    });
}

function getEvents(opts) {
  return knex('events')
    .select([
      'id',
      'name',
      'location_name',
      'start_time',
      'end_time',
      'description',
      'organizer',
      'contact_details',
      'teemu',
      'location',
      'cover_image',
      'city_id AS city',
      'fb_event_id',
      'attending_count',
      'radius',
    ])
    .where(_getWhereClause(opts))
    .orderBy('start_time', 'asc')
    .then(rows => _.map(rows, _rowToEvent));
};

function setAttendingCount(facebookEventId, attendingCount) {
  knex('events')
    .update('attending_count', attendingCount)
    .where('fb_event_id', '=', facebookEventId);
}

function _getWhereClause(filters) {
  let whereClauses = {};

  if (filters.city) {
    whereClauses.city_id = filters.city;
  }

  if (filters.id) {
    whereClauses.id = filters.id;
  }

  return whereClauses;
}

function _rowToEvent(row) {
  return {
    id:             row['id'],
    name:           row['name'],
    locationName:   row['location_name'],
    startTime:      row['start_time'],
    endTime:        row['end_time'],
    description:    row['description'],
    organizer:      row['organizer'],
    contactDetails: row['contact_details'],
    teemu:          row['teemu'],
    coverImage:     row['cover_image'],
    city:           row['city'],
    fbEventId:      row['fb_event_id'],
    attendingCount: row['attending_count'],
    radius:         row['radius'],
    location: {
      latitude:  row['location']['y'],
      longitude: row['location']['x'],
    },
  };
}

// Checks if checking in with the given parameters would be feasable.
// DOES NOT check if user has already checked in, thus the result
// is not a guarantee of a successfull check in.
function isValidCheckIn(action) {
  return knex('events').select('*').where('id', '=', action.eventId)
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
  const distanceToEvent = getDistance(
      actionLocation,
      eventLocation,
    );
  return distanceToEvent <= eventRadius;
}

export {
  getEventById,
  getEvents,
  setAttendingCount,
  isValidCheckIn
};
