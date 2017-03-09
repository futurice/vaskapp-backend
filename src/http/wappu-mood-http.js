import _ from 'lodash';
import * as wappuMood from '../core/wappu-mood-core';
import {createJsonRoute, throwStatus} from '../util/express';
import {assert} from '../validation';


const putMood = createJsonRoute(function(req, res) {

  if (req.query.personal && !req.client.id) {
    throwStatus(403, `Only registered user may save moods`);
  }

  let moodParams = assert(req.body, 'upsertMoodParams');

  let coreParams = _.merge(moodParams, {
    client: req.client
  });

  return wappuMood.createOrUpdateMood(coreParams)
    .then(result => undefined)
    .catch(err => {
      throw err
    });
});

const getMood = createJsonRoute(function(req, res) {

  if (req.query.personal && !req.client.id) {
    throwStatus(403, `Only registered user may have personal mood log`);
  }

  let moodParams = assert(req.query, 'getMoodParams');
  let coreParams = _.merge(moodParams, {
    client: req.client
  });

  return wappuMood.getMood(coreParams)
    .then(result => result)
    .catch(err => {
      throw err
    });
});

export {
  putMood,
  getMood,
};
