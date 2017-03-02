
exports.up = function(knex, Promise) {
  return knex.schema.raw(`
      CREATE FUNCTION votes(feed_items)
      RETURNS int8 AS
      $func$
        SELECT COALESCE(SUM(votes.value), 0)
        FROM   votes
        WHERE  votes.feed_item_id = $1.id
      $func$ LANGUAGE SQL STABLE;
    `);
};

exports.down = function(knex, Promise) {
  return knex.schema.raw(`
      DROP FUNCTION votes(feed_items)
    `);
};
