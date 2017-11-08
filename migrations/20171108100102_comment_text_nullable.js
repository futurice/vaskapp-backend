exports.up = function(knex, Promise) {
  return knex.schema.alterTable('comments', function(table) {
    table.string('text').nullable().alter();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('comments', function(table) {
    table.string('text').notNullable().alter();
  });
};
