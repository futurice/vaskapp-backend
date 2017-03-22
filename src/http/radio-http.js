import * as radioCore from '../core/radio-core';
import {createJsonRoute} from '../util/express';
import {assert} from '../validation';

const getStations = createJsonRoute(function(req, res) {
  const params = assert({
    city: req.query.city,
  }, 'radioParams');

  return radioCore.getStations(params);
});

const getStation = createJsonRoute(function(req, res) {
  const params = assert({
    id: req.params.id,
  }, 'radioParams');

  return radioCore.getStations(params)
    .then(results => {
      if (results.length > 1) {
        throw new Error('Unexpected number of rows');
      }

      return results[0];
    });
});

export {
  getStations,
  getStation,
};
