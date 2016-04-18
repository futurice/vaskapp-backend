
exports.up = function(knex, Promise) {
  return knex.schema.table('action_types', function(table) {
    table.boolean('is_user_action').defaultTo(true).notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('action_types', function(table) {
    table.dropColumn('is_user_action');
  });
};
