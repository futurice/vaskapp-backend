import * as citiesCore from '../core/cities-core';
import {createJsonRoute} from '../util/express';
import {assert} from '../validation';

const getCities = createJsonRoute(function(req, res) {
  const citiesParams = assert({
    city: req.query.id,
  }, 'citiesParams');

  return citiesCore.getCities(citiesParams);
});


export {
  getCities,
};
