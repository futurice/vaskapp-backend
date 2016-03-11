import moment from 'moment';
const {knex} = require('../util/database').connect();

function createAction(action) {
  console.log(action)
  const dbRow = {
    'team_id': action.team,
    type: action.type,
    'user_uuid': action.user,
    // Tuple is in longitude, latitude format in Postgis
    location: action.location.longitude + ',' + action.location.longitude,
    'updated_at': moment().toISOString()
  };

  if (action.payload) {
    dbRow.payload = action.payload;
  }

  return knex('actions').insert(dbRow);
}

export {
  createAction
};
