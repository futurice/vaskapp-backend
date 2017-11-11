
exports.up = function(knex, Promise) {
  return knex.schema.table('apps', function(table) {
    table.integer('city_id').unsigned().index();
    table.foreign('city_id')
      .references('id')
      .inTable('cities')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('apps', function(table) {
    table.dropColumn('city_id');
  });
};
