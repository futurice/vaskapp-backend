import * as eventCore from '../core/event-core';
import {createJsonRoute} from '../util/express';
import {assert} from '../validation';

let getEvents = createJsonRoute(function(req, res) {
  return eventCore.getEvents(assert(req.query, 'eventsParams'));
});

export {
  getEvents
};
