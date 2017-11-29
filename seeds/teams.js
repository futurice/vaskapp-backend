const BPromise = require('bluebird');
const teams = require('../data/teams.json');
var util = require('../src/util/seeds');


exports.seed = function(knex, Promise) {
  const cities = {};

  return knex('cities').select('*')
  .then(rows => {
    rows.forEach(city => {
      cities[city.name] = city.id;
    });
  })
  .then(() => BPromise.map(teams, (team, index) => {
    const row = {
      city_id: team.city_id || cities['Futurice'],
      name: team.name,
      image_path: team.image_path
    };

    return util.insertOrUpdate(knex, 'teams', row, 'name')
  }, {concurrency: 1}));
};
