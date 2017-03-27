
exports.up = function(knex, Promise) {
  return knex.schema.table('feed_items', function(table) {
    table.integer('event_id').index();
    table.foreign('event_id')
      .references('id')
      .inTable('events')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('feed_items', function(table) {
    table.dropColumn('event_id');
  });
}
