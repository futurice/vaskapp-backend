const {knex} = require('../util/database').connect();
import {deepChangeKeyCase} from '../util';
import _ from 'lodash';


function getStations(opts) {
  return knex('radios').select('*').where(_getWhereClause(opts))
    .then(rows =>
      _.map(rows, row =>
        deepChangeKeyCase(row, 'camelCase')
      )
    );
}

function _getWhereClause(filters) {
  let whereClauses = {};

  if (filters.city) {
    whereClauses.city_id = filters.city;
  }

  if (filters.id) {
    whereClauses.id = filters.id;
  }

   return whereClauses;
}

export {
  getStations,
};
