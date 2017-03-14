import * as radioCore from '../core/radio-core';
import {createJsonRoute} from '../util/express';
import {assert} from '../validation';

const getStations = createJsonRoute(function(req, res) {
  const params = assert({
    radioId: req.query.radioId,
    cityId: req.query.cityId,
    cityName: req.query.cityName,
  }, 'radioParams');

  return radioCore.getStations(params);
});

export {
  getStations,
};
