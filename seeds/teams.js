var util = require('../src/util/seeds');
var _ = require('lodash');

const CONST = {
  CITIES_ID: {
    TAMPERE: 1,
  }
}

exports.seed = function(knex, Promise) {

  const sqlString = `
    SELECT *
    FROM cities
  `;

  var cities = {};

  return knex.raw(sqlString)
  .then((result) => {
    result.rows.forEach((city) => {
      cities[city.name] = city.id;
    })
    return null;
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 1,
      city: cities['tampere'],
      name: 'TiTe',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/tite.png',
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 2,
      city: cities['tampere'],
      name: 'Skilta',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/skilta.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 3,
      city: cities['tampere'],
      name: 'Autek',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/autek.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 4,
      city: cities['tampere'],
      name: 'Bioner',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/bioner.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 5,
      city: cities['tampere'],
      name: 'Hiukkanen',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/hiukkanen.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 6,
      city: cities['tampere'],
      name: 'Indecs',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/indecs.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 7,
      city: cities['tampere'],
      name: 'KoRK',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/kork.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 8,
      city: cities['tampere'],
      name: 'Man@ger',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/manager.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 9,
      city: cities['tampere'],
      name: 'MIK',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/mik.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 10,
      city: cities['tampere'],
      name: 'TamArk',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/tamark.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 11,
      city: cities['tampere'],
      name: 'TARAKI',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/taraki.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 12,
      city: cities['tampere'],
      name: 'YKI',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/yki.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 13,
      city: cities['tampere'],
      name: 'TeLE',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/tele.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 14,
      city: cities['tampere'],
      name: 'ESN INTO',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/esn.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 15,
      city: cities['tampere'],
      name: 'Wapputiimi',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/wapputiimi.png'
    });
  })
  ;
};
