import * as teamCore from '../core/team-core';
import {createJsonRoute} from '../util/express';

let getTeams = createJsonRoute(function(req, res) {
  return teamCore.getTeams(req.client);
});

export {
  getTeams
};
