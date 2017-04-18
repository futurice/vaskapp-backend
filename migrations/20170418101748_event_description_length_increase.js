
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE events
    ALTER COLUMN description TYPE varchar(10000);
  `);
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE events
    ALTER COLUMN description TYPE varchar(5000);
  `);
};
