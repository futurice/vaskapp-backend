
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE markers
    ALTER COLUMN subtitle TYPE varchar(1000);
  `);
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE markers
    ALTER COLUMN subtitle TYPE varchar(255);
  `);
};
