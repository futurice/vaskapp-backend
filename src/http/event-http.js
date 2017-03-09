import * as eventCore from '../core/event-core';
import {createJsonRoute} from '../util/express';
import {assert} from '../validation';

let getEvents = createJsonRoute(function(req, res) {
  return eventCore.getEventsByCity(assert(req.query, 'eventsParams'));
});

export {
  getEvents
};
