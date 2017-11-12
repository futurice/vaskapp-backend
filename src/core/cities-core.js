const {knex} = require('../util/database').connect();
import {deepChangeKeyCase} from '../util';
import {createTeam} from './team-core';
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

  if (opts.city) {
    whereClauses.push(`id = ?`);
    params.push(opts.city);
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

function _cityRowToObject(row) {
  const city = {
    id: row.id,
    name: row.name,
    domain: row.domain
  };

  return city;
}

// Find city by domain
function findByDomain(domain) {
  return knex('cities')
    .select(
      'cities.*'
    )
    .where({ domain: domain })
    .then(rows => {
      if (_.isEmpty(rows)) {
        return null;
      }

      return _cityRowToObject(rows[0]);
    });
}

function createCity(domain) {
  const name = _.capitalize(domain.substring(0, domain.lastIndexOf('.')));

  const cityRow = {
    'domain': domain,
    'name': name,
  };

  return knex.transaction(function(trx) {
    return trx('cities').returning('*').insert(cityRow)
      .then(rows => {
        if (_.isEmpty(rows)) {
          throw new Error('Action row creation failed: ' + cityRow);
        }

        const team = {
          city_id: rows[0].id,
          name: name
        };

        return createTeam(team, trx);
    })
  })
  .catch(err => {
    // TODO properly
    throw err;
  });
}


export {
  createCity,
  findByDomain,
  getCities,
};
