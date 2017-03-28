const {knex} = require('../util/database').connect();
import _ from 'lodash';
import {deepChangeKeyCase} from '../util';

function getTeams(opts) {
  const isBanned = opts.client && !!opts.client.isBanned;

  const voteScoreByTeam = `
      (SELECT
        teams.id AS team_id,
        SUM(votes.value::float) * 3 * (1 - @(SUM(votes.value::float) / GREATEST(COUNT(votes), 25))::float) AS value
      FROM
        votes
        LEFT JOIN feed_items ON feed_items.id = votes.feed_item_id
        LEFT JOIN users ON users.id = feed_items.id
        LEFT JOIN teams ON teams.id = users.team_id
      WHERE
        teams.id IS NOT NULL
      GROUP BY
        teams.id)
  `;

  let sqlString = `
    SELECT teams.id, teams.name, teams.image_path,
      COALESCE(vote_score.value, 0) + SUM(COALESCE(action_types.value, 0)) AS score,
      cities.id AS city
    FROM teams
    LEFT JOIN actions ON teams.id = actions.team_id ${isBanned ? '' : 'AND NOT actions.is_banned'}
    LEFT JOIN action_types ON actions.action_type_id = action_types.id
    LEFT JOIN ${voteScoreByTeam} vote_score ON vote_score.team_id = teams.id
    JOIN cities ON cities.id = teams.city_id
  `;

  let params = [];
  let whereClauses = [];

  if (opts.city) {
    whereClauses.push('cities.id = ?');
    params.push(opts.city);
  }

  if (whereClauses.length > 0) {
    sqlString += ` WHERE ${ whereClauses.join(' AND ')}`;
  }

  sqlString += `
    GROUP BY teams.id, teams.name, cities.id, vote_score.value
    ORDER BY score DESC, teams.id
  `;

  return knex.raw(sqlString, params)
  .then(result => {
    return _.map(result.rows, row => deepChangeKeyCase(row, 'camelCase'));
  });
}

export {
  getTeams
};
