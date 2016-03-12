var util = require('../src/util/seeds');

exports.seed = function(knex, Promise) {
  return util.insertOrUpdate(knex, 'action_types', {
    id: 1,
    name: 'BUTTON_PUSH',
    value: 1,
    cooldown: 30000
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'action_types', {
      id: 2,
      name: 'BEER',
      value: 10,
      cooldown: 5 * 60 * 1000
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'action_types', {
      id: 3,
      name: 'CIDER',
      value: 10,
      cooldown: 5 * 60 * 1000
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'action_types', {
      id: 4,
      name: 'SODA',
      value: 10,
      cooldown: 5 * 60 * 1000
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'action_types', {
      id: 5,
      name: 'IMAGE',
      value: 10,
      cooldown: 1 * 60 * 1000
    });
  });
};
