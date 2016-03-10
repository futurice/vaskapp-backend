import express from 'express';
import * as eventHttp from './http/event-http';

function createRouter() {
  const router = express.Router();
  router.get('/events', eventHttp.getEvents);
  return router;
}

export default createRouter;
