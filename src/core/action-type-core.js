const {knex} = require('../util/database').connect();
import _ from 'lodash';

function getActionTypes(user) {
  return knex('action_types')
    .select('*')
    .where('is_user_action', true)
    .then(rows => {
      return _.map(rows, function(row) {
        return _actionTypeRowToObject(row, user);
      });
    });
}

function _actionTypeRowToObject(row, user) {
  return {
    user: user,
    id: row.id,
    code: row.code,
    name: row.name,
    value: row.value,
    cooldown: row.cooldown
  };
}

export {
  getActionTypes
};
