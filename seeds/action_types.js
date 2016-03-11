exports.seed = function(knex, Promise) {
  return maybeDeleteAll(knex)
    .then(() => {
      return knex('action_types').insert({
        id: 1,
        name: 'BUTTON_PUSH',
        value: 1,
        cooldown: 30000
      })
    })
    .then(() => {
      return knex('action_types').insert({
        id: 2,
        name: 'BEER',
        value: 10,
        cooldown: 5 * 60 * 1000
      });
    })
    .then(() => {
      return knex('action_types').insert({
        id: 3,
        name: 'CIDER',
        value: 10,
        cooldown: 5 * 60 * 1000
      });
    })
    .then(() => {
      return knex('action_types').insert({
        id: 4,
        name: 'SODA',
        value: 10,
        cooldown: 5 * 60 * 1000
      });
    })
    .then(() => {
      return knex('action_types').insert({
        id: 5,
        name: 'PICTURE',
        value: 10,
        cooldown: 1 * 60 * 1000
      });
    });
};

function maybeDeleteAll(knex) {
  if (process.env.DELETE_ALL_ACTION_TYPES === 'true') {
    return deleteAll(knex);
  }

  return Promise.resolve();
}

function deleteAll(knex) {
  return knex('actions').del()
    .then(() => knex('action_types').del());
}
