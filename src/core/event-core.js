import _ from 'lodash';
const {knex} = require('../util/database').connect();
import {deepChangeKeyCase} from '../util';


function getEvents(opts) {
  return knex('events')
    .select('*')
    .where(_getWhereClause(opts))
    .orderBy('start_time', 'asc')
    .then(results => _.map(results, row =>
      deepChangeKeyCase(row, 'camelCase')
    ));
};

function setAttendingCount(facebookEventId, attendingCount) {
  knex('events')
    .update('attending_count', attendingCount)
    .where('fb_event_id', '=', facebookEventId);
}

function _getWhereClause(filters) {
  let whereClauses = {};

  if (filters.cityId) {
    whereClauses.city_id = filters.cityId;
  }

  if (filters.cityName) {
    whereClauses.city_id = knex('cities').select('id').where('name', '=', filters.cityName);
  }

  return whereClauses;
}

export {
  getEvents,
  setAttendingCount,
};
