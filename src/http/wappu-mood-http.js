import * as wappuMood from '../core/wappu-mood-core';
import {createJsonRoute, throwStatus} from '../util/express';
import {assert} from '../validation';
import _ from 'lodash';


const putMood = createJsonRoute(function(req, res) {
  if (!req.client.id) {
    throwStatus(403, `Only registered user may save moods`);
  }

  let moodParams = assert({
    rating: req.body.rating,
    description: req.body.description,
  }, 'upsertMoodParams');

  let coreParams = _.merge(moodParams, {
    client: req.client,
  });

  return wappuMood.createOrUpdateMood(coreParams);
});

const getMood = createJsonRoute(function(req, res) {
  let moodParams = assert({
    city: req.query.cityId,
    team: req.query.teamId,
  }, 'getMoodParams');
  let coreParams = _.merge(moodParams, {
    client: req.client,
  });

  return wappuMood.getMood(coreParams);
});

export {
  putMood,
  getMood,
};
