import _ from 'lodash';
const {knex} = require('../util/database').connect();

function getApps(opts) {
  const whereClause = `apps.city_id = (SELECT city_id FROM teams WHERE id = ?)`;
  const whereParams = [opts.client.team];

  return knex('apps')
    .select('*')
    .whereRaw(whereClause, whereParams)
    .orderBy('id', 'asc')
    .then(rows => {
      if (_.isEmpty(rows)) {
        return [];
      }

      return _.map(rows, _appRowToObject);
    });
}

function _appRowToObject(row) {
  let obj = {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    imageUrl: _.get(row, 'image_url', null),
    createdAt: row['created_at'],
  };

  if (row.url) {
    obj.url = row.url;
  }

  return obj;
}

export {
  getApps
};
