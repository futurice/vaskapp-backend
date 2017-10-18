exports.up = function(knex, Promise) {
  return knex.schema.table('comments', (table) => {
    table.string('image_path');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('comments', (table) => {
    table.dropColumn('image_path');
  });
};
