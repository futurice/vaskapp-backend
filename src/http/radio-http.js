import * as radioCore from '../core/radio-core';
import {createJsonRoute, throwStatus} from '../util/express';
import {assert} from '../validation';

const getStation = createJsonRoute(function(req, res) {
  return radioCore.getStationById(req.params.id)
    .then(station => {
      if (!station) {
        throwStatus(404, 'No such radio id');
      } else {
        return station;
      }
    });
});

const getStations = createJsonRoute(function(req, res) {
  const params = assert({
    id: req.params.id,
    city: req.query.cityId,
  }, 'radioParams');

  return radioCore.getStations(params).then(results => {
    if (req.params.id !== undefined) {
      if (results.length > 1) {
        throw new Error('Unexpected number of rows');
      }  else if (results.length === 0) {
        throwStatus(404, 'No such radio id');
      } else {
        return results[0];
      }
    } else {
      // Respond with an array of objects otherwise.
      return results;
    }
  });
});

export {
  getStation,
  getStations,
};
