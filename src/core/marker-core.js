import _ from 'lodash';
const {knex} = require('../util/database').connect();

function getMarkers(opts) {

  const cityQuery = `markers.city_id = (SELECT city_id FROM teams WHERE id = ?)`;
  const cityParams = [opts.client.team];

  return knex('markers')
    .select('*')
    .whereRaw(cityQuery, cityParams)
    .orderBy('id', 'asc')
    .then(rows => {
      if (_.isEmpty(rows)) {
        return [];
      }

      return _.map(rows, _markerRowToObject);
    });
}

function _markerRowToObject(row) {
  let obj = {
    id: row.id,
    // Postgis uses x(lng), y(lat)
    location: {
      latitude: row.location.y,
      longitude: row.location.x
    },
    type: row.type,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: _.get(row, 'image_url', null),
  };

  if (row.url) {
    obj.url = row.url;
  }

  return obj;
}

export {
  getMarkers
};
