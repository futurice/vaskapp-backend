exports.up = function(knex, Promise) {
  return knex.schema.table('cities', function(table) {
    table.string('domain').notNullable().unique().index();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('cities', function(table) {
    table.dropColumn('domain');
  });
}
