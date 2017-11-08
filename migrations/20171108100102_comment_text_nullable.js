exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE comments
    ALTER COLUMN text DROP NOT NULL
  `);
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE comments
    ALTER COLUMN text SET NOT NULL
  `);
};
