import _ from 'lodash';
import * as wappuFeeling from '../core/wappu-feeling-core';
import {createJsonRoute} from '../util/express';
import {assert} from '../validation';


const putFeeling = createJsonRoute(function(req, res) {
  let feelingParams = assert(req.body, 'feeling');

  let coreParams = _.merge(feelingParams, {
    client: req.client
  });

  return wappuFeeling.createOrUpdateFeeling(coreParams)
    .then(result => undefined)
    .catch(err => undefined);
});

const getFeeling = createJsonRoute(function(req, res) {
  return wappuFeeling.getFeeling()
    .then(result => result)
    .catch(err => undefined);
});

export {
  putFeeling,
  getFeeling,
};
