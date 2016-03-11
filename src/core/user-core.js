import _ from 'lodash';
const {knex} = require('../util/database').connect();

function createUser(user) {
  const dbRow = {
    'uuid': user.uuid,
    'name': user.name
  };

  return knex('users').returning('id').insert(dbRow)
    .then(rows => {
      if (_.isEmpty(rows)) {
        throw new Error('Action row creation failed: ' + dbRow);
      }

      return rows.length;
    });
}

function findByUuid(uuid) {
  return knex('users')
    .select('*')
    .where({ uuid: uuid })
    .then(rows => {
      if (_.isEmpty(rows)) {
        return null;
      }

      return _userRowToObject(rows[0]);
    });
}

function _userRowToObject(row) {
  return {
    id: row.id,
    name: name,
    uuid: uuid
  };
}

export {
  createUser,
  findByUuid
};
