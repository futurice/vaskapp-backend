import _ from 'lodash';
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

        if (mood.is_new && _hasDescription(mood)) {
          feedCore.createFeedItem(_feedTemplate(mood, opts));
        }

        return undefined;
      }));
}

function getMood(opts) {
  const sql = `
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
    ) dates JOIN LATERAL (
       SELECT
         ROUND(AVG(wappu_mood.rating)::numeric, 4) AS rating_city
       FROM
         wappu_mood
         JOIN users ON users.id = wappu_mood.user_id
         JOIN teams ON teams.id = users.team_id
       WHERE
         teams.city_id = ? AND
         wappu_mood.created_at_coarse = date
    ) city_score ON true JOIN LATERAL (
       SELECT
         ROUND(AVG(wappu_mood.rating)::numeric, 4) AS rating_team
       FROM
         wappu_mood
         JOIN users ON users.id = wappu_mood.user_id
       WHERE
         users.team_id = ? AND date = wappu_mood.created_at_coarse
    ) team_score ON true JOIN LATERAL (
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
    trx.raw(sql, _getParams(opts))
      .then(result => _rowsToMoodObjects(result.rows)));
}

function _getParams(opts) {
  const cityId = _getCityId(opts);
  const teamId = _getTeamId(opts);
  return [cityId, teamId, opts.client.id];
}

function _getCityId(opts) {
  if (opts.city) {
    return opts.city;
  } else {
    return knex.raw('(SELECT city_id FROM teams WHERE id = ?)', [opts.client.team]);
  }
}

function _getTeamId(opts) {
  if (opts.team) {
    return opts.team;
  } else {
    return opts.client.team;
  }
}

function _rowsToMoodObjects(rows) {
  return rows.map(row => deepChangeKeyCase(row, 'camelCase'));
}

function _feedTemplate(row, opts) {
  const name = opts.client.name;
  const rating = _formatRating(row.rating);
  const desc = _.trim(row.description);

  return {
    location: opts.location,
    user:  opts.client.uuid,
    type: 'TEXT',
    text: `${ name }'s Whappu Vibe is ${ rating } - ${ desc }`,
    client: opts.client,
  }
}

function _formatRating(rating) {
  return `${ Math.round(rating * 10) }%`;
}

function _hasDescription(row) {
  return row.description && _.trim(row.description).length > 0;
}

export {
  createOrUpdateMood,
  getMood,
};
