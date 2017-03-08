import * as citiesCore from '../core/cities-core';
import {createJsonRoute} from '../util/express';
import {assert} from '../validation';

const getCities = createJsonRoute(function(req, res) {
  const citiesParams = assert({
    cityId: req.query.id,
    cityName: req.query.name,
  }, 'citiesParams');

  return citiesCore.getCities(citiesParams)
    .then(result => result)
    .catch(err => {
      throw err
    });
});


export {
  getCities,
};
