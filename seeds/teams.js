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
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 3,
      name: 'Autek'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 4,
      name: 'Bioner'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 5,
      name: 'Hiukkanen'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 6,
      name: 'Indecs'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 7,
      name: 'Koneenrakentajakilta'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 8,
      name: 'Man@ger'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 9,
      name: 'Materiaali-insinöörikilta'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 10,
      name: 'TamArk'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 11,
      name: 'TARAKI'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 12,
      name: 'YKI'
    });
  });
};
