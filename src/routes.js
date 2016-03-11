import express from 'express';
import * as eventHttp from './http/event-http';
import * as leaderboardHttp from './http/leaderboard-http';
import * as actionHttp from './http/action-http';
import * as teamHttp from './http/team-http';

function createRouter() {
  const router = express.Router();

  router.get('/events', eventHttp.getEvents);
  router.get('/leaderboard', leaderboardHttp.getLeaderboard);
  router.post('/actions', actionHttp.postAction);
  router.get('/teams', teamHttp.getTeams);

  return router;
}

export default createRouter;
