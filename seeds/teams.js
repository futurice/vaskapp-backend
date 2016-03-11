var util = require('../src/util/seeds');

exports.seed = function(knex, Promise) {
  return util.insertOrUpdate(knex, 'teams', {
    id: 1,
    name: 'Tietoteekkarikilta'
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 2,
      name: 'Sähkökilta'
    });
  });
};
