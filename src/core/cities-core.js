const {knex} = require('../util/database').connect();
import {deepChangeKeyCase} from '../util';
import _ from 'lodash';

const getCities = (opts) => {
  let sqlString = `
    SELECT
      id,
      name
    FROM cities
  `;
  let params = [];
  let whereClauses = [];

  if (opts.cityId) {
    whereClauses.push(`id = ?`);
    params.push(opts.cityId);
  }

  if (opts.cityName) {
    whereClauses.push(`name = ?`);
    params.push(opts.cityName);
  }

  if (whereClauses.length > 0) {
    sqlString += ` WHERE ${ whereClauses.join(' AND ')}`;
  }

  return knex.raw(sqlString, params)
    .then(results => _.map(results.rows, row =>
      deepChangeKeyCase(row, 'camelCase')
    ))
    .catch(err => {
      err.message = 'Error reading database';
      err.status = 500;
      throw err
    });
};

export {
  getCities,
};
