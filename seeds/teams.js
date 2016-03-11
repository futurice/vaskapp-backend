exports.seed = function(knex, Promise) {
  return maybeDeleteAll(knex)
    .then(() => {
      return knex('teams').insert({
        id: 1,
        name: 'Tietoteekkarikilta'
      });
    })
    .then(() => {
      return knex('teams').insert({
        id: 2,
        name: 'Sähkökilta'
      });
    });
};

function maybeDeleteAll(knex) {
  if (process.env.DELETE_ALL_TEAMS === 'true') {
    return deleteAll(knex);
  }

  return Promise.resolve();
}

function deleteAll(knex) {
  return knex('actions').del()
    .then(() => knex('teams').del());
}
