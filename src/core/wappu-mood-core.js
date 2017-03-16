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

function getMood(client) {
  // TODO Why is the timeszone offset +4 GMT?
  const getMoodSql = `
    SELECT
      date,
      rating_city,
      rating_team,
      rating_personal
    FROM (
      SELECT
        wappu_mood.created_at_coarse AT TIME ZONE 'GMT-4' AS date,
        wappu_mood.created_at_coarse AS coarse,
        ROUND(AVG(wappu_mood.rating)::numeric, 4) AS rating_city
      FROM
        wappu_mood
        LEFT JOIN users ON users.id = wappu_mood.user_id
        LEFT JOIN teams ON teams.id = users.team_id
      WHERE
        teams.city_id = 3
      GROUP BY
        wappu_mood.created_at_coarse
    ) city_score LEFT JOIN LATERAL (
      SELECT
        ROUND(AVG(wappu_mood.rating)::numeric, 4) AS rating_team
      FROM
        wappu_mood
        LEFT JOIN users ON users.id = wappu_mood.user_id
      WHERE
        users.team_id = 1 AND coarse = wappu_mood.created_at_coarse
    ) team_score ON true LEFT JOIN LATERAL (
      SELECT
        ROUND(AVG(wappu_mood.rating)::numeric, 4) AS rating_personal
      FROM
        wappu_mood
      WHERE
        wappu_mood.user_id = 1 AND coarse = wappu_mood.created_at_coarse
    ) personal_score ON true
    ORDER BY date ASC;
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

function _getParams(clientId) {
  // TODO
}

function _rowsToMoodObjects(rows) {
  return rows.map(row => deepChangeKeyCase(row, 'camelCase'));
}

export {
  createOrUpdateMood,
  getMood,
};
