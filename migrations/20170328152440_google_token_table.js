
exports.up = function(knex, Promise) {
  return knex.schema.createTable('oauth_tokens', function(table) {
    table.increments('id').primary().index();
    table.string('token').notNullable().index();
    table.string('client_id').notNullable().index();
    table.unique(['client_id']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('tokens');
};
