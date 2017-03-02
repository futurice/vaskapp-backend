var util = require('../src/util/seeds');


exports.seed = function(knex, Promise) {
  return util.insertOrUpdate(knex, 'cities', {
    id: 1,
    name: 'other',
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'cities', {
      id: 2,
      name: 'helsinki',
    })
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'cities', {
      id: 3,
      name: 'tampere',
    })
  });
}
