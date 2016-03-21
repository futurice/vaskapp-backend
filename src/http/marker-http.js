import * as actionTypeCore from '../core/action-type-core';
import {createJsonRoute} from '../util/express';

let getMarkers = createJsonRoute(function(req, res) {
  return actionTypeCore.getMarkers();
});

export {
  getMarkers
};
