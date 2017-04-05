'use strict';
const {knex} = require('../util/database').connect();
import * as _ from 'lodash';
import * as Facebook from '../util/fb';

let tampereId;
const getTampereId = knex('cities').select('id').where('name', '=', 'Tampere')
  .then(result => {
    tampereId = _.get(result, '[0].id', null);
  });

function getAnnouncements(client) {
  return getTampereId.then(() => knex('teams').select('city_id').where('id', '=', client.team))
    .then(result => {
      const teamCityId = _.get(result, '[0].city_id', -1);
      const announcements = Facebook.getAnnouncements();

      if (teamCityId === tampereId && !_.isEmpty(announcements)) {
        return announcements[0];
      } else {
        return [];
      }
    });
}

export {
  getAnnouncements
};
