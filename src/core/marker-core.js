import _ from 'lodash';
const {knex} = require('../util/database').connect();

function getMarkers() {
  return knex('markers')
    .select('*')
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
  };

  if (row.url) {
    obj.url = row.url
  }

  return obj;
}

export {
  getMarkers
};
