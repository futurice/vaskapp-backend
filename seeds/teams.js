var util = require('../src/util/seeds');


exports.seed = function(knex, Promise) {

  const sqlString = `
    SELECT *
    FROM cities
  `;

  var cities = {};

  return knex.raw(sqlString)
  .then((result) => {
    result.rows.forEach(city => {
      cities[city.name] = city.id;
    })
    return null;
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 1,
      city_id: cities['tampere'],
      name: 'TiTe',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/tite.png',
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 2,
      city_id: cities['tampere'],
      name: 'Skilta',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/skilta.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 3,
      city_id: cities['tampere'],
      name: 'Autek',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/autek.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 4,
      city_id: cities['tampere'],
      name: 'Bioner',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/bioner.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 5,
      city_id: cities['tampere'],
      name: 'Hiukkanen',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/hiukkanen.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 6,
      city_id: cities['tampere'],
      name: 'Indecs',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/indecs.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 7,
      city_id: cities['tampere'],
      name: 'KoRK',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/kork.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 8,
      city_id: cities['tampere'],
      name: 'Man@ger',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/manager.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 9,
      city_id: cities['tampere'],
      name: 'MIK',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/mik.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 10,
      city_id: cities['tampere'],
      name: 'TamArk',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/tamark.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 11,
      city_id: cities['tampere'],
      name: 'TARAKI',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/taraki.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 12,
      city_id: cities['tampere'],
      name: 'YKI',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/yki.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 13,
      city_id: cities['tampere'],
      name: 'TeLE',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/tele.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 14,
      city_id: cities['tampere'],
      name: 'ESN INTO',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/esn.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 15,
      city_id: cities['tampere'],
      name: 'Wapputiimi',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/wapputiimi.png'
    });
  })
  ;
};
