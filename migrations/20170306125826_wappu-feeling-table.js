
exports.up = function(knex, Promise) {
  return knex.schema.createTable('wappu_mood', function(table) {
    table.increments('id').primary().index();
    table.integer('user_id').unsigned().notNullable().index();
    table.foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table.decimal('rating', [6], [4]).notNullable();
    table.string('description', 131);
    table.date('created_at_coarse')
      .index()
      .notNullable()
      .defaultTo(knex.raw(`CURRENT_DATE`));
    table.timestamp('created_at_fine')
      .index()
      .notNullable()
      .defaultTo(knex.fn.now());
    table.timestamp('updated_at')
      .index()
      .notNullable()
      .defaultTo(knex.fn.now());
  })
  .raw(`
    ALTER TABLE wappu_mood
    ADD CONSTRAINT wappu_mood_date_uniq UNIQUE (user_id, created_at_coarse)
  `);
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('wappu_mood');
};
