import _ from 'lodash';
const {knex} = require('../util/database').connect();

function createOrUpdateUser(user) {
  return findByUuid(user.uuid)
  .then(foundUser => {
    if (foundUser === null) {
      return createUser(user);
    } else {
      return updateUser(user);
    }
  });
}

function createUser(user) {
  const dbRow = {
    'uuid': user.uuid,
    'name': user.name
  };

  return knex('users').returning('id').insert(dbRow)
    .then(rows => {
      if (_.isEmpty(rows)) {
        throw new Error('User row creation failed: ' + dbRow);
      }

      return rows.length;
    });
}

function updateUser(user) {
  const dbRow = {
    'uuid': user.uuid,
    'name': user.name
  };

  return knex('users').returning('id').update(dbRow)
    .where('uuid', user.uuid)
    .then(rows => {
      if (_.isEmpty(rows)) {
        throw new Error('User row update failed: ' + dbRow);
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
      console.log(rows)

      return _userRowToObject(rows[0]);
    });
}

function _userRowToObject(row) {
  return {
    id: row.id,
    name: row.name,
    uuid: row.uuid
  };
}

export {
  createOrUpdateUser,
  findByUuid
};
