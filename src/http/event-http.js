import * as eventCore from '../core/event-core';
import {createJsonRoute} from '../util';

let getEvents = createJsonRoute(function(req, res) {
  return eventCore.getEvents();
});

export {
  getEvents
};
