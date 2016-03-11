import _ from 'lodash';
const {knex} = require('../util/database').connect();

function createAction(action) {
  const dbRow = {
    'team_id': action.team,
    type: action.type,
    'user_uuid': action.user,
    // Tuple is in longitude, latitude format in Postgis
    location: action.location.longitude + ',' + action.location.longitude
  };

  if (action.payload) {
    dbRow.payload = action.payload;
  }

  return knex('actions').returning('*').insert(dbRow)
    .then(rows => {
      if (_.isEmpty(rows)) {
        throw new Error('Action row creation failed: ' + dbRow);
      }

      return rows.length;
    });
}

export {
  createAction
};
