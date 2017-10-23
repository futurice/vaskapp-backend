exports.up = function(knex, Promise) {
  return knex.schema.createTable('apps', function(table) {
    table.increments('id').primary().index();
    table.string('name').notNullable();
    table.string('image_url').notNullable();
    table.string('type');
    table.string('url');
    table.string('description');
    table.timestamp('created_at').index().notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').index().notNullable().defaultTo(knex.fn.now());
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('apps');
};
