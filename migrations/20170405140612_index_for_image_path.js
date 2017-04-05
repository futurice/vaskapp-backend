exports.up = function(knex, Promise) {
  return knex.schema.raw(`
    CREATE INDEX feed_items_image_path ON feed_items(image_path) WHERE image_path IS NOT NULL
  `);
};

exports.down = function(knex, Promise) {
  return knex.schema.raw(`
    DROP INDEX feed_items_image_path
  `);
};
