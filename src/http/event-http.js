import _ from 'lodash';
import * as eventCore from '../core/event-core';
import {createJsonRoute} from '../util/express';
import {assert} from '../validation';

const getEvents = createJsonRoute(function(req, res) {
  const eventParams = assert({
    id: req.params.id,
    city: req.query.city,
  }, 'eventsParams');

  const coreParams = _.merge(eventParams, {
    client: req.client,
  });

  return eventCore.getEvents(coreParams).then(results => {
    if (req.params.id !== undefined) {
      if (results.length > 1) {
        throw new Error('Unexpected number of rows');
      }
      // Respond with a single object if queried by id.
      return results[0];
    } else {
      // Respond with an array of objects otherwise.
      return results;
    }
  });
});

function isValidCheckIn(action) {
  return eventCore.isValidCheckIn(action);
};

export {
  getEvents,
  isValidCheckIn,
};
