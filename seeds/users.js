var util = require('../src/util/seeds');

exports.seed = function(knex, Promise) {
  return util.insertOrUpdate(knex, 'users', {
    team_id: 1,
    name: 'Hessu Kypärä',
    uuid: 'hessu'
  });
};
