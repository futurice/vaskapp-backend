exports.up = function(knex, Promise) {
  return knex.schema.table('markers', (table) => {
    table.string('image_url');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('markers', (table) => {
    table.dropColumn('image_url');
  });
};
