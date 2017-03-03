
exports.up = function(knex, Promise) {
  return knex.schema.createTable('votes', function(table) {
    table.increments('id').primary().index();
    table.integer('value').notNullable();

    table.integer('user_id').unsigned().notNullable().index();
    table.foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.integer('feed_item_id').unsigned().notNullable().index();
    table.foreign('feed_item_id')
      .references('id')
      .inTable('feed_items')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  })
  .raw('ALTER TABLE votes ADD CONSTRAINT votes_user_feed_item_uniq UNIQUE (user_id, feed_item_id)');
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('votes');
};
