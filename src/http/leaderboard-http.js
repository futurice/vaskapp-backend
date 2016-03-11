import * as leaderboardCore from '../core/leaderboard-core';
import {createJsonRoute} from '../util';

let getLeaderboard = createJsonRoute(function(req, res) {
  return leaderboardCore.getLeaderboard();
});

export {
  getLeaderboard
};
