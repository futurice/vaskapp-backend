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
    // stream: 'http://stream.wappuradio.fi/wappuradio.mp3',
    stream: null,
    website: 'https://wappuradio.fi/',
  }))
  .then(() => util.insertOrUpdate(knex, 'radios', {
    id: 2,
    name: 'Radiodiodi',
    city_id: cities['Otaniemi'],
    stream: null,   // TODO: Change to real
    website: 'https://radiodiodi.fi/',
  }));
}
