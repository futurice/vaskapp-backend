import * as appsCore from '../core/apps-core';
import {createJsonRoute} from '../util/express';

let getApps = createJsonRoute(function(req, res) {
  const appsParams = {
    client: req.client
  };

  return appsCore.getApps(appsParams);
});

export {
  getApps
};
