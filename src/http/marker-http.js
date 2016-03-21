import * as markerCore from '../core/marker-core';
import {createJsonRoute} from '../util/express';

let getMarkers = createJsonRoute(function(req, res) {
  return markerCore.getMarkers();
});

export {
  getMarkers
};
