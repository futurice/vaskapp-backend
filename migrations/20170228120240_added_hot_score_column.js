
exports.up = function(knex, Promise) {
  return knex.schema.table('feed_items', function(table) {
    table.integer('hot_score').defaultTo(0);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('feed_items', function(table) {
    table.dropColumn('hot_score');
  });
}
