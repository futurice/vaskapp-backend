const {knex} = require('../util/database').connect();

const getCities = (opts) => {
  let sqlString = `
    SELECT
      id,
      name
    FROM cities
  `;
  let params = [];
  let whereClauses = [];

  if (opts.cityId) {
    whereClauses.push(`id = ?`);
    params.push(opts.cityId);
  }

  if (opts.cityName) {
    whereClauses.push(`name = ?`);
    params.push(opts.cityName);
  }

  if (whereClauses.length > 0) {
    sqlString += ` WHERE ${ whereClauses.join(' AND ')}`;
  }

  return knex.raw(sqlString, params)
    .then(result => result)
    .catch(err => undefined);
}

export {
  getCities,
};
