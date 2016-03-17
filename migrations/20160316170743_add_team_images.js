
exports.up = function(knex, Promise) {
  return knex.schema.table('teams', function(table) {
    table.string('image_path');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('teams', function(table) {
    table.dropColumn('image_path');
  });
};
