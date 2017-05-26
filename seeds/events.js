const BPromise = require('bluebird');
const events = require('../data/events.json');
var util = require('../src/util/seeds');

exports.seed = function(knex, Promise) {
  return BPromise.map(events, (event, index) => {
    const row = {
      id: index + 1,
      code: index + 1, // Hacky, should just remove column
      name: event.name,
      location_name: event.locationName,
      start_time: event.startTime,
      end_time: event.endTime,
      description: event.description,
      organizer: event.organizer,
      contact_details: event.contactDetails,
      location: event.location.longitude + ',' + event.location.latitude,
      cover_image: event.coverImage,
    };

    return util.insertOrUpdate(knex, 'events', row);
  }, {concurrency: 1})
};
