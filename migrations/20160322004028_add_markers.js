exports.up = function(knex, Promise) {
  return knex.schema.createTable('markers', function(table) {
    table.increments('id').primary().index();
    table.string('type').notNullable();
    table.string('title').notNullable();
    table.string('subtitle').notNullable();
    table.specificType('location', 'point').notNullable().index('markers_location_index', 'GIST');
    table.string('url');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('markers');
};
