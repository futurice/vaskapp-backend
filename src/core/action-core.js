import _ from 'lodash';
const {knex} = require('../util/database').connect();

function createAction(action) {
  const dbRow = {
    'team_id': action.team,
    'action_type_id': knex.raw('(SELECT id from action_types WHERE code = ?)', [action.type]),
    'user_id': knex.raw('(SELECT id from users WHERE uuid = ?)', [action.user]),
    // Tuple is in longitude, latitude format in Postgis
    location: action.location.longitude + ',' + action.location.longitude,
    'image_url': action.image_url
  };

  return knex('actions').returning('*').insert(dbRow)
    .then(rows => {
      if (_.isEmpty(rows)) {
        throw new Error('Action row creation failed: ' + dbRow);
      }

      return rows.length;
    });
}

function getActionType(code) {
  return knex('action_types')
    .select('*')
    .limit(1)
    .where('code', code)
    .then(rows => {
      if (_.isEmpty(rows)) {
        return null;
      }

      return _actionTypeRowToObject(rows[0]);
    });
}

function _actionTypeRowToObject(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    value: row.value,
    cooldown: row.cooldown
  };
}

export {
  createAction,
  getActionType
};
