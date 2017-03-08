
exports.up = function(knex, Promise) {
  return knex.schema.createTable('cities', table => {
    table.increments('id').primary().index();
    table.string('name').notNullable().index();
  }).then(() => knex.schema.table('teams', (table) => {
      table.integer('city_id').unsigned().notNullable().index();
      table.foreign('city_id')
        .references('id')
        .inTable('cities')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');
    })
  );
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('cities')
  .then(() => knex.schema.table('teams', (table) => {
      table.dropColumn('city');
    })
  );
};
