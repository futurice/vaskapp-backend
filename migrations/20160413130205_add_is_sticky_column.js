
exports.up = function(knex, Promise) {
  return knex.schema.table('feed_items', function(table) {
    table.boolean('is_sticky').defaultTo(false).notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('feed_items', function(table) {
    table.dropColumn('is_sticky');
  });
};
