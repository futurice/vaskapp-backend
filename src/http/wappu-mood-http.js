import * as wappuMood from '../core/wappu-mood-core';
import {createJsonRoute, throwStatus} from '../util/express';


const putMood = createJsonRoute(function(req, res) {

  if (!req.client.id) {
    throwStatus(403, `Only registered user may save moods`);
  }

  return wappuMood.createOrUpdateMood(req.client)
    .then(result => undefined)
    .catch(err => {
      throw err
    });
});

const getMood = createJsonRoute(function(req, res) {

  if (!req.client.id) {
    throwStatus(403, `Only registered user may have personal mood log`);
  }

  return wappuMood.getMood(req.client)
    .then(result => result)
    .catch(err => {
      throw err
    });
});

export {
  putMood,
  getMood,
};
