
exports.up = function(knex, Promise) {
  return knex.schema.table('feed_items', function(table) {
    table.decimal('top_score').defaultTo(0);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('feed_items', function(table) {
    table.dropColumn('top_score');
  });
}
