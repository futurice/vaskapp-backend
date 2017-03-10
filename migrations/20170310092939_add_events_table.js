
exports.up = function(knex, Promise) {
  return knex.schema.createTable('events', table => {
    table.string('id').primary().index(); // Format cityName_indexInFile
    table.string('name', 100);
    table.string('location_name', 100);
    table.timestamp('start_time');
    table.timestamp('end_time');
    table.string('description', 5000);
    table.string('organizer', 100);
    table.string('contact_details', 200);
    table.boolean('teemu');
    table.specificType('location', 'point').index('event_location', 'GIST');
    table.string('cover_image', 200);
    table.boolean('show').defaultTo(true);
    table.integer('city_id').unsigned().index();
    table.string('fb_event_id', 50).index();
    table.integer('attending_count').defaultTo(0);
    table.foreign('city_id')
      .references('id')
      .inTable('cities')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('events');
};
