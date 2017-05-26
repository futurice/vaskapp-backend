const BPromise = require('bluebird');
const markers = require('../data/markers.json');
var util = require('../src/util/seeds');

exports.seed = function(knex, Promise) {
  return BPromise.map(markers, (marker, index) => {
    const row = {
      id: index + 1,
      type: marker.type,
      location: marker.location.longitude + ',' + marker.location.latitude,
      title: marker.title,
      subtitle: marker.subtitle,
      image_url: marker.image_url,
    };

    if (marker.url) {
      row.url = marker.url;
    }

    return util.insertOrUpdate(knex, 'markers', row);
  }, {concurrency: 1})
};
