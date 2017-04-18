'use strict';
const {knex} = require('../util/database').connect();
import * as _ from 'lodash';
import * as Facebook from '../util/fb';

let cities = {};
const getCities = knex('cities').select('id', 'name')
  .then(result => {
    _.forEach(result, city => {
      cities[city.id] = city.name;
    });
  });

function getAnnouncements(client) {
  return getCities.then(() => knex('teams').select('city_id').where('id', '=', client.team))
    .then(result => {
      const teamCityId = _.get(result, '[0].city_id', -1);
      const announcements = Facebook.getAnnouncements(cities[teamCityId]);
      return !_.isEmpty(announcements) ? announcements[0] : [];
    });
}

export {
  getAnnouncements
};
