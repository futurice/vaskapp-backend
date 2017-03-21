var util = require('../src/util/seeds');


exports.seed = function(knex, Promise) {
  return util.insertOrUpdate(knex, 'cities', {
    id: 1,
    name: 'Otaniemi',
  })
  .then(() => util.insertOrUpdate(knex, 'cities', {
    id: 2,
    name: 'Tampere',
  }));
}
