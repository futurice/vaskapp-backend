import * as appsCore from '../core/apps-core';
import {createJsonRoute} from '../util/express';

let getApps = createJsonRoute(function(req, res) {
  return appsCore.getApps();
});

export {
  getApps
};
