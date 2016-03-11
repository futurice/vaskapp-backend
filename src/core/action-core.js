const {knex} = require('../util/database').connect();

function createAction(action) {
  return knex('actions').insert(action);
}

export {
  createAction
};
