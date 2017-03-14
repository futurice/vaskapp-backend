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

  if (filters.cityId) whereClauses.city_id = filters.cityId;
  if (filters.radioId) whereClauses.id = filters.radioId;

  if (filters.cityName) {
    whereClauses.city_id = knex('cities')
      .select('id')
      .where('name', '=', filters.cityName);
   }

   return whereClauses;
}

export {
  getStations,
};
