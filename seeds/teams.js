var util = require('../src/util/seeds');

exports.seed = function(knex, Promise) {
  return util.insertOrUpdate(knex, 'teams', {
    name: 'Tietoteekkarikilta'
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      name: 'Sähkökilta'
    });
  });
};
