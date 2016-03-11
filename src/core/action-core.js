import _ from 'lodash';
const {knex} = require('../util/database').connect();

function createAction(action) {
    console.log(action);
  const dbRow = {
    'team_id': action.team,
    'action_type_id': knex.raw('(SELECT id from action_types WHERE name = ?)', [action.type]),
    'user_id': action.user,
    // Tuple is in longitude, latitude format in Postgis
    location: action.location.longitude + ',' + action.location.longitude,
    'image_url': action.image_url
  };

  if (action.payload) {
    dbRow.payload = action.payload;
  }

  return knex('actions').returning('*').insert(dbRow)
    .then(rows => {
      if (_.isEmpty(rows)) {
        throw new Error('Action row creation failed: ' + dbRow);
      }

      return rows.length;
    });
}

function getActionType(name) {
  return knex('action_types')
    .select('*')
    .limit(1)
    .where('name', name)
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
    name: row.name,
    value: row.value,
    cooldown: row.cooldown
  };
}

export {
  createAction,
  getActionType
};
