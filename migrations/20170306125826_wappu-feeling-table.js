
exports.up = function(knex, Promise) {
  return knex.schema.createTable('wappu_feeling', function(table) {
    table.increments('id').primary().index();
    table.integer('user_id').unsigned().index();
    table.foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table.decimal('rating',[6], [4]).notNullable();
    table.string('description');
    table.date('created_at_coarse').index().notNullable().defaultTo(knex.fn.now());
    table.timestamp('created_at_fine').index().notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').index().notNullable().defaultTo(knex.fn.now());
  })
  .raw('');
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('wappu_feeling');
};
