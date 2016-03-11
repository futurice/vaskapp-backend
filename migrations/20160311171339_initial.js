exports.up = function(knex, Promise) {
  return knex.schema.createTable('teams', function(table) {
    table.increments('id').primary().index();
    table.string('name').notNullable().index();
    table.timestamp('created_at').index().notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').index().notNullable().defaultTo(knex.fn.now());
  })
  .then(() => {
    return knex.schema.createTable('action_types', function(table) {
      table.bigIncrements('id').primary().index();
      table.string('name').notNullable().unique();
      table.integer('value').unsigned().notNullable();
      table.integer('cooldown').unsigned().notNullable(); // ms

      table.timestamp('created_at').index().notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').index().notNullable().defaultTo(knex.fn.now());
    });
  })
  .then(() => {
    return knex.schema.createTable('actions', function(table) {
      table.bigIncrements('id').primary().index();
      table.string('user_uuid').notNullable().index();
      table.integer('team_id').unsigned().notNullable();
      table.foreign('team_id')
        .references('id')
        .inTable('teams')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');

      table.specificType('location', 'point').notNullable().index('index_location', 'GIST');
      table.integer('action_type_id').unsigned().notNullable();
      table.foreign('action_type_id')
        .references('id')
        .inTable('action_types')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');
      table.json('payload');

      table.timestamp('created_at').index().notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').index().notNullable().defaultTo(knex.fn.now());
    });
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('actions')
  .then(() => {
    return knex.schema.dropTable('action_types');
  })
  .then(() => {
    return knex.schema.dropTable('teams');
  });
};
