const {knex} = require('../util/database').connect();
import _ from 'lodash';
import {deepChangeKeyCase} from '../util';

function getTeams(opts) {
  const isBanned = opts.client && !!opts.client.isBanned;

  let sqlString = `
    SELECT teams.id, teams.name, teams.image_path,
      SUM(COALESCE(action_types.value, 0)) AS score,
      teams.city_id AS city,
      tmps.value
    FROM teams
    LEFT JOIN actions ON teams.id = actions.team_id ${isBanned ? '' : 'AND NOT actions.is_banned'}
    LEFT JOIN action_types ON actions.action_type_id = action_types.id
    LEFT JOIN (
      SELECT
        wilsons(
          COUNT(CASE votes.value WHEN 1 THEN 1 ELSE null END)::int,
          COUNT(CASE votes.value WHEN -1 THEN -1 ELSE null END)::int) * COUNT(votes)::numeric AS value,
        users.team_id AS team
      FROM feed_items
      LEFT JOIN users ON users.id = feed_items.user_id
      LEFT JOIN votes ON votes.feed_item_id = feed_items.id
      GROUP BY users.team_id
    ) AS tmps ON tmps.team = teams.id
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
    GROUP BY teams.id, teams.name, tmps.value
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
