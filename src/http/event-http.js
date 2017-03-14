import * as eventCore from '../core/event-core';
import {createJsonRoute} from '../util/express';
import {assert} from '../validation';

const getEvents = createJsonRoute(function(req, res) {
  return eventCore.getEvents(assert(req.query, 'eventsParams'));
});

function isValidCheckIn(action) {
  return eventCore.isValidCheckIn(action);
};

export {
  getEvents,
  isValidCheckIn,
};
