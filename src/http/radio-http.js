import * as radioCore from '../core/radio-core';
import {createJsonRoute} from '../util/express';
import {assert} from '../validation';

const getStations = createJsonRoute(function(req, res) {
  const params = assert({
    id: req.params.id,
    city: req.query.city,
  }, 'radioParams');

  return radioCore.getStations(params).then(results => {
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

export {
  getStations,
};
