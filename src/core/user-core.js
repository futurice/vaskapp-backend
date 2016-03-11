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

export {
  createUser
};
