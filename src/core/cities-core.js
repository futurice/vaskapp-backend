const {knex} = require('../util/database').connect();

const getCities = (opts) => {
  let sqlString = `
    SELECT
      id,
      name
    FROM cities
  `;

  if (opts.cityId) sqlString += `WHERE cities.id = ${opts.cityId}`;

  return knex.raw(sqlString)
    .then(result => result)
    .catch(err => undefined);
}

export {
  getCities,
};
