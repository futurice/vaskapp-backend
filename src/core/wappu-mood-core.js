const {knex} = require('../util/database').connect();
import {deepChangeKeyCase} from '../util';

function createOrUpdateMood(opts) {
  const upsertMoodSql = `
    WITH upsert AS
      (UPDATE
        wappu_mood
      SET
        rating = ?,
        description = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE
        user_id = ? AND created_at_coarse = CURRENT_DATE
      RETURNING
        *
      )
    INSERT INTO wappu_mood (user_id, rating, description)
    SELECT ?, ?, ? WHERE NOT EXISTS (SELECT * FROM upsert)
  `;

  let params = [
    opts.rating, opts.description, opts.client.id,
    opts.client.id, opts.rating, opts.description
  ];

  return knex.transaction(trx =>
    trx.raw(upsertMoodSql, params)
      .then(result => undefined)
      .catch(err => {
        err.message = 'Error updating database';
        err.status = 500;
        throw err;
      })
  );
}

function getMood(opts) {
  const getMoodSql = `
    SELECT
      ${ _getSelectSql(opts) }
    FROM wappu_mood
    LEFT JOIN teams ON teams.id = wappu_mood.user_id
    ${ _getWhereSql(opts) }
    GROUP BY
      wappu_mood.created_at_fine,
      wappu_mood.description,
      wappu_mood.rating
  `;

  return knex.transaction(trx =>
    trx.raw(getMoodSql)
      .then(result => _rowsToMoodObjects(result.rows))
      .catch(err => {
        err.message = 'Error reading database';
        err.status = 500;
        throw err;
      })
  );
}

function _getSelectSql(opts) {
  const publicSql = `
    DATE_TRUNC('day', wappu_mood.created_at_fine) AS date,
    ROUND(AVG(wappu_mood.rating)::numeric, 4) AS avg_rating,
    COUNT(wappu_mood.rating) AS votes_cast
  `;

  const personalSql = `
    DATE_TRUNC('day', created_at_fine) AS date,
    wappu_mood.rating,
    wappu_mood.description
  `;

  return opts.personal ? personalSql : publicSql;

}

function _getWhereSql(opts) {
  let filters = [];
  let params = [];

  if (opts.cityId) {
    filters.push(`teams.city_id = ?`);
    params.push(opts.cityId);
  }

  if (opts.cityName) {
    filters.push(`
      teams.city_id IN (
        SELECT cities.id
        FROM cities
        WHERE cities.name = ?
      )
    `);
    params.push(opts.cityName);
  }

  if (opts.teamId) {
    filters.push(`teams.id = ?`);
    params.push(opts.teamId);
  }

  if (params.teamName) {
    filters.push(`teams.name = ?`);
    params.push(opts.teamName);
  }

  let sqlString = filters.length > 0 ? ` WHERE ${ filters.join(' AND ')} ` : ''

  return knex.raw(sqlString, params).toString();
}

function _rowsToMoodObjects(rows) {
  return rows.map(row => deepChangeKeyCase(row, 'camelCase'));
}

export {
  createOrUpdateMood,
  getMood,
};
