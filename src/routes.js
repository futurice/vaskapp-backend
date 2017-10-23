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
import * as appsHttp from './http/apps-http';
import * as citiesHttp from './http/cities-http';
import * as radioHttp from './http/radio-http';
import * as wappuMood from './http/wappu-mood-http';
import * as imageHttp from './http/image-http';
import * as authService from './auth/auth-service';
import * as authHttp from './http/auth-http';

function createRouter() {
  const router = express.Router();

  router.get('/events', authService.isAuthenticated(), eventHttp.getEvents);
  router.get('/events/:id', authService.isAuthenticated(), eventHttp.getEvent);

  router.post('/actions', authService.isAuthenticated(), actionHttp.postAction);
  router.get('/teams', authService.isAuthenticated(), teamHttp.getTeams);

  router.get('/users', authService.isAuthenticated(), userHttp.getUserById);
  router.put('/users/:uuid', authService.isAuthenticated(), userHttp.putUser);
  router.get('/users/:uuid', authService.isAuthenticated(), userHttp.getUserByUuid);

  router.post('/auth/:refreshToken', authHttp.refreshAuthToken); // no auth, because token should be expired

  router.get('/action_types', authService.isAuthenticated(), actionTypeHttp.getActionTypes);

  router.get('/feed', authService.isAuthenticated(), feedHttp.getFeed);
  router.delete('/feed/:id', authService.isAuthenticated(), feedHttp.deleteFeedItem);
  router.get('/feed/:id', authService.isAuthenticated(), feedHttp.getFeedItem);

  router.get('/image/:id', authService.isAuthenticated(), imageHttp.getImage);

  router.get('/announcements', authService.isAuthenticated(), announcementHttp.getAnnouncements);

  router.get('/markers', authService.isAuthenticated(), markerHttp.getMarkers);
  router.get('/apps', authService.isAuthenticated(), appsHttp.getApps);

  router.get('/cities', authService.isAuthenticated(), citiesHttp.getCities)

  router.put('/vote', authService.isAuthenticated(), voteHttp.putVote);

  router.get('/radio', authService.isAuthenticated(), radioHttp.getStations);
  router.get('/radio/:id', authService.isAuthenticated(), radioHttp.getStation);

  router.put('/mood', authService.isAuthenticated(), wappuMood.putMood);
  router.get('/mood', authService.isAuthenticated(), wappuMood.getMood);

  return router;
}

export default createRouter;
