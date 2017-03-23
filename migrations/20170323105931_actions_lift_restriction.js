
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE actions DROP CONSTRAINT actions_action_type_id_foreign
  `).then(() => knex.schema.alterTable('actions', function(table) {
    table.foreign('action_type_id')
      .references('id')
      .inTable('action_types')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  }));
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE actions DROP CONSTRAINT actions_action_type_id_foreign
  `)
  .then(() => knex.schema.alterTable('actions', function(table) {
    table.foreign('action_type_id')
      .references('id')
      .inTable('action_types')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE')
  }));
};
