
exports.up = function(knex, Promise) {
  return knex.schema.table('actions', function(table) {
    table.string('ip', 15);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('actions', function(table) {
    table.dropColumn('ip');
  });
};

