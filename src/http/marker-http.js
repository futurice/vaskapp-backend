import * as markerCore from '../core/marker-core';
import {createJsonRoute} from '../util/express';

let getMarkers = createJsonRoute(function(req, res) {
  const markerParams = {
    client: req.client
  };

  return markerCore.getMarkers(markerParams);
});

export {
  getMarkers
};
