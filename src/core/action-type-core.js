const {knex} = require('../util/database').connect();
import _ from 'lodash';

function getActionTypes() {
  return knex('action_types')
    .select('*')
    .where('is_user_action', true)
    .andWhere('code', '<>', 'COMMENT')
    .then(rows => {
      return _.map(rows, _actionTypeRowToObject);
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
  getActionTypes
};
