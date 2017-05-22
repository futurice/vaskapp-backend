var util = require('../src/util/seeds');


exports.seed = function(knex, Promise) {
  const cities = {};

  return knex('cities').select('*')
  .then(rows => {
    rows.forEach(city => {
      cities[city.name] = city.id;
    });
  })
  .then(() => util.removeIfExists(knex, 'radios', {
    id: 1,
    name: 'Rakkauden Wappuradio',
    city_id: cities['Tampere'],
    stream: 'http://stream.wappuradio.fi/wappuradio.mp3',
    website: 'https://wappuradio.fi/',
  }))
  .then(() => util.removeIfExists(knex, 'radios', {
    id: 2,
    name: 'Radiodiodi',
    city_id: cities['Otaniemi'],
    stream: 'http://virta.radiodiodi.fi/stream.mp3',
    website: 'https://radiodiodi.fi/',
  }));
}
