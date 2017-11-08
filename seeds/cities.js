var util = require('../src/util/seeds');


exports.seed = function(knex, Promise) {
  return util.insertOrUpdate(knex, 'cities', {
    id: 1,
    name: 'Futurice',
  });
}
