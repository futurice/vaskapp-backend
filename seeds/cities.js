var util = require('../src/util/seeds');


exports.seed = function(knex, Promise) {
  return util.insertOrUpdate(knex, 'cities', {
    id: 1,
    name: 'Futurice',
    domain: 'futurice.com'
  }).then(() => util.insertOrUpdate(knex, 'cities', {
    id: 2,
    name: 'Gmail',
    domain: 'gmail.com'
  }))
}
