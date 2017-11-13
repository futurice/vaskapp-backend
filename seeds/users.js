const BPromise = require('bluebird');
const users = require('../data/users.json');
var util = require('../src/util/seeds');

exports.seed = function(knex, Promise) {
  return BPromise.map(users, (user, index) => {
    const row = {
      id: user.id || index + 1,
      team_id: user.team_id || 1,
      name: user.name,
      uuid: user.uuid
    };

    return util.insertOrUpdate(knex, 'users', row);
  }, {concurrency: 1})
};
