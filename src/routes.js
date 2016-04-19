import express from 'express';
import * as eventHttp from './http/event-http';
import * as actionHttp from './http/action-http';
import * as teamHttp from './http/team-http';
import * as userHttp from './http/user-http';
import * as actionTypeHttp from './http/action-type-http';
import * as feedHttp from './http/feed-http';
import * as announcementHttp from './http/announcement-http';
import * as voteHttp from './http/vote-http';
import * as markerHttp from './http/marker-http';

function createRouter() {
  const router = express.Router();

  router.get('/events', eventHttp.getEvents);
  router.post('/actions', actionHttp.postAction);
  router.get('/teams', teamHttp.getTeams);

  router.put('/users/:uuid', userHttp.putUser);
  router.get('/users/:uuid', userHttp.getUser);

  router.get('/action_types', actionTypeHttp.getActionTypes);

  router.get('/feed', feedHttp.getFeed);
  router.delete('/feed/:id', feedHttp.deleteFeedItem);

  router.get('/announcements', announcementHttp.getAnnouncements);

  router.get('/markers', markerHttp.getMarkers);

  router.put('/vote', voteHttp.putVote);

  return router;
}

export default createRouter;
