import _ from 'lodash';
import * as wappuMood from '../core/wappu-mood-core';
import {createJsonRoute} from '../util/express';
import {assert} from '../validation';


const putMood = createJsonRoute(function(req, res) {
  let moodParams = assert(req.body, 'upsertMood');
  let coreParams = _.merge(moodParams, {
    client: req.client
  });

  return wappuMood.createOrUpdateMood(coreParams)
    .then(result => undefined)
    .catch(err => undefined);
});

const getMood = createJsonRoute(function(req, res) {
  let moodParams = assert(req.query, 'getMood');
  let coreParams = _.merge(moodParams, {
    client: req.client
  });
  return wappuMood.getMood(coreParams)
    .then(result => result)
    .catch(err => undefined);
});

export {
  putMood,
  getMood,
};
