import express from 'express';
import * as eventHttp from './http/event-http';
import * as leaderboardHttp from './http/leaderboard-http';

function createRouter() {
  const router = express.Router();
  router.get('/events', eventHttp.getEvents);
  router.get('/leaderboard', leaderboardHttp.getLeaderboard);
  return router;
}

export default createRouter;
