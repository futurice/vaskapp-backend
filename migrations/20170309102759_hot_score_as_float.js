
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE feed_items
    ALTER COLUMN hot_score TYPE decimal(10, 4);
  `);
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE feed_items
    ALTER COLUMN hot_score TYPE integer;
  `);
};
