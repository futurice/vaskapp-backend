var util = require('../src/util/seeds');


exports.seed = function(knex, Promise) {
  const cities = {};

  return knex('cities').select('*')
  .then(rows => {
    rows.forEach(city => {
      cities[city.name] = city.id;
    });
  })
  .then(() => util.insertOrUpdate(knex, 'radios', {
    id: 1,
    name: 'Rakkauden Wappuradio',
    city_id: cities['Tampere'],
    stream: null,   // TODO
    website: 'https://wappuradio.fi/',
  }))
  .then(() => util.insertOrUpdate(knex, 'radios', {
    id: 2,
    name: 'Radiodiodi',
    city_id: cities['Helsinki'],
    stream: null,   // TODO
    website: 'https://radiodiodi.fi/',
  }));
}
