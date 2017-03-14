import * as radioCore from '../core/radio-core';
import {createJsonRoute} from '../util/express';

const getStations = createJsonRoute(function(req, res) {
  return radioCore.getStations();
});

export {
  getStations,
};
