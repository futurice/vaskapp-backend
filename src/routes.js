import express from 'express';
import * as eventHttp from './http/event-http';
import * as actionHttp from './http/action-http';

function createRouter() {
  const router = express.Router();
  router.get('/events', eventHttp.getEvents);
  router.post('/actions', actionHttp.postAction);
  return router;
}

export default createRouter;
