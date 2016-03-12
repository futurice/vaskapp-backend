import express from 'express';
import * as eventHttp from './http/event-http';
import * as actionHttp from './http/action-http';
import * as teamHttp from './http/team-http';
import * as userHttp from './http/user-http';
import * as actionTypeHttp from './http/action-type-http';

function createRouter() {
  const router = express.Router();

  router.get('/events', eventHttp.getEvents);
  router.post('/actions', actionHttp.postAction);
  router.get('/teams', teamHttp.getTeams);
  router.post('/users', userHttp.postUser);
	router.get('/action_types', actionTypeHttp.getActionTypes);

  return router;
}

export default createRouter;
