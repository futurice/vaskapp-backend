
exports.up = function(knex, Promise) {
  return knex.schema.createTable('radios', function(table) {
    table.increments('id').primary().index();
    table.string('name').notNullable().index();
    table.string('url');
    table.string('now_playing');

    table.integer('city_id').unsigned().notNullable().index();
    table.foreign('city_id')
      .references('id')
      .inTable('cities')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('radios');
};
