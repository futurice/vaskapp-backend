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
      table.string('code').notNullable().unique().index();
      table.string('name').notNullable();
      table.integer('value').unsigned().notNullable();
      table.integer('cooldown').unsigned().notNullable(); // ms

      table.timestamp('created_at').index().notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').index().notNullable().defaultTo(knex.fn.now());
    });
  })
  .then(() => {
    return knex.schema.createTable('users', function(table) {
      table.bigIncrements('id').primary().index();
      table.string('uuid').notNullable().unique().index();
      table.string('name').notNullable();
      table.integer('team_id').unsigned().notNullable().index();
      table.foreign('team_id')
        .references('id')
        .inTable('teams')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');

      table.timestamp('created_at').index().notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').index().notNullable().defaultTo(knex.fn.now());
    });
  })
  .then(() => {
    return knex.schema.createTable('actions', function(table) {
      table.bigIncrements('id').primary().index();

      table.integer('user_id').unsigned().index();
      table.foreign('user_id')
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');

      table.integer('team_id').unsigned().notNullable();
      table.foreign('team_id')
        .references('id')
        .inTable('teams')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');

      table.specificType('location', 'point').index('actions_index_location', 'GIST');
      table.integer('action_type_id').unsigned().notNullable();
      table.foreign('action_type_id')
        .references('id')
        .inTable('action_types')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');

      table.string('image_path');
      table.string('text', 151);
      // Has action been aggregated to feed
      table.boolean('aggregated').notNullable().defaultTo(false);

      table.timestamp('created_at').index().notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').index().notNullable().defaultTo(knex.fn.now());
    });
  })
  .then(() => {
    return knex.schema.createTable('feed_items', function(table) {
      table.bigIncrements('id').primary().index();

      // Null for 'system' user
      table.integer('user_id').unsigned().index();
      table.foreign('user_id')
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');

      table.specificType('location', 'point').index('feed_items_index_location', 'GIST');

      table.string('image_path');
      table.string('text', 151)
      // TODO: Should have IN constraint ('TEXT', 'IMAGE', 'CHECK_IN')
      table.string('type', 10);

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
    return knex.schema.dropTable('feed_items');
  })
  .then(() => {
    return knex.schema.dropTable('users');
  })
  .then(() => {
    return knex.schema.dropTable('teams');
  });
};
