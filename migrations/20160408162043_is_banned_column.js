
exports.up = function(knex, Promise) {
  return knex.schema.table('users', function(table) {
    table.boolean('is_banned').defaultTo(false).notNullable();
  }).then(() => {
    return knex.schema.table('actions', function(table) {
      table.boolean('is_banned').defaultTo(false).notNullable();
    });
  }).then(() => {
    return knex.schema.table('feed_items', function(table) {
      table.boolean('is_banned').defaultTo(false).notNullable();
    });
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('is_banned');
  }).then(() => {
    return knex.schema.table('actions', function(table) {
      table.dropColumn('is_banned');
    });
  }).then(() => {
    return knex.schema.table('feed_items', function(table) {
      table.dropColumn('is_banned');
    });
  });
};

