import _ from 'lodash';
const {knex} = require('../util/database').connect();
import {deepChangeKeyCase} from '../util';
import * as feedCore from './feed-core';
const requireEnvs = require('../util/require-envs');
const moment = require('moment-timezone');

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
          wappu_mood(user_id, rating, description, created_at_coarse)
        SELECT ?, ?, ?, CURRENT_TIMESTAMP + interval '3 hour' WHERE NOT EXISTS( SELECT * FROM upsert )
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
  let params = [];
  let sqlFragments = [];
  let select = [];

  if (!opts.city && !opts.team && !opts.user) {
    params = [
      _getCityMoodParams(opts),
      _getTeamMoodParams(opts),
      _getPersonalMoodParams(opts),
    ];

    sqlFragments = [
      _getCityMoodSql(),
      _getTeamMoodSql(),
      _getPersonalMoodSql(),
    ];

    select = [
      'rating_city',
      'rating_team',
      'rating_personal',
    ];

  } else {
    if (opts.city) {
      params.push(_getCityMoodParams(opts));
      sqlFragments.push(_getCityMoodSql());
      select.push('rating_city');
    }

    if (opts.team) {
      params.push(_getTeamMoodParams(opts));
      sqlFragments.push(_getTeamMoodSql());
      select.push('rating_team');
    }

    if (opts.user) {
      params.push(_getPersonalMoodParams(opts));
      sqlFragments.push(_getPersonalMoodSql());
      select.push('rating_personal');
    }
  }

  const sql = `
    SELECT
      date,
      ${ select.join(', ') }
    FROM (
      SELECT date
      FROM   generate_series(
        '${process.env.MOOD_START_DATE}'::DATE + interval '3 hour',
        '${process.env.MOOD_END_DATE}'::DATE + interval '3 hour',
        interval '1 day'
      ) date
    ) dates
    ${ sqlFragments.join(' ') }
    ORDER BY date ASC;
  `;

  return knex.transaction(trx =>
    trx.raw(sql, params)
      .then(result => {
        // // Hack to include 0 mood for a day before start date
        const oneDayBefore = moment(result.rows[0].date)
          .utc().subtract(1, 'd');
        const zeroRating = {
          date: oneDayBefore.format()
        };

        if (!opts.city && !opts.team && !opts.user) {
          zeroRating.rating_city = "0";
          zeroRating.rating_team = "0";
          zeroRating.rating_personal = "0";
        } else {
          if (opts.city) {
            zeroRating.rating_city = "0";
          }

          if (opts.team) {
            zeroRating.rating_team = "0";
          }

          if (opts.user) {
            zeroRating.rating_personal = "0";
          }
        }

        result.rows = [zeroRating].concat(result.rows);
        const moods = _rowsToMoodObjects(result.rows);
        return _interpolateIntermediate(moods);
      }));
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

function _getCityMoodSql() {
  return `
    JOIN LATERAL (
      SELECT
        ROUND(AVG(wappu_mood.rating)::numeric, 4) AS rating_city
      FROM
        wappu_mood
      JOIN users ON users.id = wappu_mood.user_id
      JOIN teams ON teams.id = users.team_id
      WHERE teams.city_id = ? AND wappu_mood.created_at_coarse + interval '3 hour' = date
    ) city_score ON true
  `;
}

function _getCityMoodParams(opts) {
  return _getCityId(opts);
}

function _getTeamMoodSql() {
  return `
    JOIN LATERAL (
      SELECT
        ROUND(AVG(wappu_mood.rating)::numeric, 4) AS rating_team
      FROM
        wappu_mood
      JOIN users ON users.id = wappu_mood.user_id
      WHERE users.team_id = ? AND date = wappu_mood.created_at_coarse + interval '3 hour'
    ) team_score ON true
  `;
}

function _getTeamMoodParams(opts) {
  return _getTeamId(opts);
}

function _getPersonalMoodSql() {
  return `
    JOIN LATERAL (
      SELECT
        ROUND(AVG(wappu_mood.rating)::numeric, 4) AS rating_personal
      FROM
        wappu_mood
      WHERE
        wappu_mood.user_id = ? AND date = wappu_mood.created_at_coarse + interval '3 hour'
    ) personal_score ON true
  `;
}

function _getPersonalMoodParams(opts) {
  return opts.user || opts.client.id;
}

function _rowsToMoodObjects(rows) {
  return rows.map(row => deepChangeKeyCase(row, 'camelCase'));
}

function _feedTemplate(row, opts) {
  const rating = _formatRating(row.rating);
  const desc = _.trim(row.description);

  return {
    location: opts.location,
    user:  opts.client.uuid,
    type: 'TEXT',
    text: `My Whappu Vibe is ${ rating } - ${ desc }`,
    client: opts.client,
  }
}

function _formatRating(rating) {
  return `${ Math.round(rating * 10) }%`;
}

function _hasDescription(row) {
  return row.description && _.trim(row.description).length > 0;
}

function _interpolateIntermediate(moods) {
  const getIndexOfToday = array => {
    const today = moment().utcOffset(3); // Hacky

    return _.findIndex(array, element =>
      moment(element.date).isSame(today, 'day')
    ) || 0
  };

  const todayIndex = getIndexOfToday(moods);
  const datesPast = _fillEmpties(moods.slice(0, todayIndex + 1));
  const datesFuture = moods.slice(todayIndex + 1);

  return  _.union(datesPast, datesFuture);
}

function _fillEmpties(dates) {

  if (dates.length <= 1) {
    // Too small sample size to interpolate missing values
    return dates;
  }

  const interpolateCity = !!dates[0].ratingCity;
  const interpolateTeam = !!dates[0].ratingTeam;
  const interpolatePersonal = !!dates[0].ratingPersonal;

  let lastKnownCity = 0;
  let lastKnownTeam = 0;
  let lastKnownPersonal = 0;


  return _.map(dates.reverse(), (element, index) => {
    const copy = _.cloneDeep(element);

    if (interpolateCity ) {
      lastKnownCity = copy.ratingCity === null
         ? _interpolateValue(lastKnownCity, _getNextValue(dates.slice(index), 'ratingCity'))
         : copy.ratingCity;

      copy.ratingCity = String(lastKnownCity);
    }

    if (interpolateTeam) {
      lastKnownTeam = copy.ratingTeam === null
         ? _interpolateValue(lastKnownTeam, _getNextValue(dates.slice(index), 'ratingTeam'))
         : copy.ratingTeam;

      copy.ratingTeam = String(lastKnownTeam);
    }

    if (interpolatePersonal) {
      lastKnownPersonal = copy.ratingPersonal === null
         ? _interpolateValue(lastKnownPersonal, _getNextValue(dates.slice(index), 'ratingPersonal'))
         : copy.ratingPersonal;

      copy.ratingPersonal = String(lastKnownPersonal);
    }

    return copy;
  }).reverse();
}

function _interpolateValue(start, end) {
  return (Number(start) + Number(end)) / 2;
}

function _getNextValue(values, col) {
  return _.find(values, element => element[col] !== null)[col] || 0;
}

export {
  createOrUpdateMood,
  getMood,
};
