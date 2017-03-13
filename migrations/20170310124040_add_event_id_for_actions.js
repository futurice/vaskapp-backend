
exports.up = function(knex, Promise) {
  return knex.schema.table('actions', function(table) {
    table.string('event_id').index();
    table.foreign('event_id')
      .references('id')
      .inTable('events')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
  })
  .raw(`
    CREATE UNIQUE INDEX
      only_one_check_in_per_event
    ON
      actions(user_id, event_id)
    -- Magic number 9 is CHECK_IN_EVENT action type ID.
    WHERE action_type_id = 9;
  `);
};

exports.down = function(knex, Promise) {
  return knex.schema.table('actions', function(table) {
    table.dropColumn('event_id');
  });
}
