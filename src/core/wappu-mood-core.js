const {knex} = require('../util/database').connect();
import {deepChangeKeyCase} from '../util';
import * as feedCore from './feed-core';
const requireEnvs = require('../util/require-envs');

requireEnvs(['MOOD_START_DATE', 'MOOD_END_DATE']);

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
        *,
        false AS is_new
    ), inserted AS (
        INSERT INTO
          wappu_mood(user_id, rating, description)
        SELECT ?, ?, ? WHERE NOT EXISTS( SELECT * FROM upsert )
        RETURNING
          *,
          true AS is_new
    )
    SELECT *
    FROM upsert
    UNION ALL
    SELECT *
    FROM inserted;
  `;

  let params = [
    opts.rating, opts.description, opts.client.id,
    opts.client.id, opts.rating, opts.description
  ];

  return knex.transaction(trx =>
    trx.raw(upsertMoodSql, params)
      .then(result => {
        const mood = result.rows[0];
        if (mood.is_new) feedCore.createFeedItem(_feedTemplate(mood, opts.client));
        return undefined;
      })
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
      date,
      rating_city,
      rating_team,
      rating_personal
    FROM (
      SELECT date::DATE
      FROM   generate_series(
        '${process.env.MOOD_START_DATE}'::DATE,
        '${process.env.MOOD_END_DATE}'::DATE,
        interval '1 day'
      ) date
    ) dates LEFT JOIN LATERAL (
       SELECT
         ROUND(AVG(wappu_mood.rating)::numeric, 4) AS rating_city
       FROM
         wappu_mood
         LEFT JOIN users ON users.id = wappu_mood.user_id
         LEFT JOIN teams ON teams.id = users.team_id
       WHERE
         teams.city_id = ? AND
         wappu_mood.created_at_coarse = date
    ) city_score ON true LEFT JOIN LATERAL (
       SELECT
         ROUND(AVG(wappu_mood.rating)::numeric, 4) AS rating_team
       FROM
         wappu_mood
         LEFT JOIN users ON users.id = wappu_mood.user_id
       WHERE
         users.team_id = ? AND date = wappu_mood.created_at_coarse
    ) team_score ON true LEFT JOIN LATERAL (
       SELECT
         ROUND(AVG(wappu_mood.rating)::numeric, 4) AS rating_personal
       FROM
         wappu_mood
       WHERE
         wappu_mood.user_id = ? AND date = wappu_mood.created_at_coarse
    ) personal_score ON true
    ORDER BY date ASC;
  `;

  return knex.transaction(trx =>
    trx.raw(getMoodSql, _getParams(opts))
      .then(result => _rowsToMoodObjects(result.rows))
      .catch(err => {
        err.message = 'Error reading database';
        err.status = 500;
        throw err;
      })
  );
}

function _getParams(opts) {
  const cityId = _getCityId(opts);
  const teamId = _getTeamId(opts);
  return [cityId, teamId, opts.client.id];
}

function _getCityId(opts) {
  if (opts.cityId) {
    return opts.cityId;
  } else if (opts.cityName) {
    return knex.raw('(SELECT id FROM cities WHERE name = ?)', [opts.cityName]);
  } else {
    return knex.raw('(SELECT city_id FROM teams WHERE id = ?)', [opts.client.team]);
  }
}

function _getTeamId(opts) {
  if (opts.teamId) {
    return opts.teamId;
  } else if (opts.teamName) {
    return knex.raw('(SELECT id FROM teams WHERE name = ?)', [opts.teamName]);
  } else {
    return opts.client.team;
  }
}

function _rowsToMoodObjects(rows) {
  return rows.map(row => deepChangeKeyCase(row, 'camelCase'));
}

function _feedTemplate(row, client) {
  return {
    user:  client.uuid,
    type: 'TEXT',
    text: `${ client.name }'s wappu fiba is ${ row.rating } - ${ row.description }`,
  }
}

export {
  createOrUpdateMood,
  getMood,
};
