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
import * as citiesHttp from './http/cities-http';
import * as radioHttp from './http/radio-http';
import * as wappuMood from './http/wappu-mood-http';
import * as imageHttp from './http/image-http';
import * as auth from './auth/auth-service';

function createRouter() {
  const router = express.Router();

  router.get('/events', eventHttp.getEvents);
  router.get('/events/:id', eventHttp.getEvent);

  router.post('/actions', actionHttp.postAction);
  router.get('/teams', teamHttp.getTeams);

  router.get('/users', userHttp.getUserById);
  router.put('/users/:uuid', userHttp.putUser);
  router.get('/users/:uuid', userHttp.getUserByUuid);

  router.get('/action_types', actionTypeHttp.getActionTypes);

  router.get('/feed', auth.isAuthenticated(), feedHttp.getFeed);
  router.delete('/feed/:id', feedHttp.deleteFeedItem);
  router.get('/feed/:id', feedHttp.getFeedItem);

  router.get('/image/:id', imageHttp.getImage);

  router.get('/announcements', announcementHttp.getAnnouncements);

  router.get('/markers', markerHttp.getMarkers);

  router.get('/cities', citiesHttp.getCities)

  router.put('/vote', voteHttp.putVote);

  router.get('/radio', radioHttp.getStations);
  router.get('/radio/:id', radioHttp.getStation);

  router.put('/mood', wappuMood.putMood);
  router.get('/mood', wappuMood.getMood);

  return router;
}

export default createRouter;
