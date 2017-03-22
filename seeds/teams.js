var util = require('../src/util/seeds');


exports.seed = function(knex, Promise) {
  const cities = {};

  return knex('cities').select('*')
  .then(rows => {
    rows.forEach(city => {
      cities[city.name] = city.id;
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 1,
      city_id: cities['Tampere'],
      name: 'TiTe',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/tite.png',
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 2,
      city_id: cities['Tampere'],
      name: 'Skilta',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/skilta.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 3,
      city_id: cities['Tampere'],
      name: 'Autek',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/autek.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 4,
      city_id: cities['Tampere'],
      name: 'Bioner',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/bioner.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 5,
      city_id: cities['Tampere'],
      name: 'Hiukkanen',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/hiukkanen.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 6,
      city_id: cities['Tampere'],
      name: 'Indecs',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/indecs.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 7,
      city_id: cities['Tampere'],
      name: 'KoRK',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/kork.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 8,
      city_id: cities['Tampere'],
      name: 'Man@ger',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/manager.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 9,
      city_id: cities['Tampere'],
      name: 'MIK',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/mik.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 10,
      city_id: cities['Tampere'],
      name: 'TamArk',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/tamark.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 11,
      city_id: cities['Tampere'],
      name: 'TARAKI',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/taraki.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 12,
      city_id: cities['Tampere'],
      name: 'YKI',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/yki.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 13,
      city_id: cities['Tampere'],
      name: 'TeLE',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/tele.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 14,
      city_id: cities['Tampere'],
      name: 'ESN INTO',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/esn.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 15,
      city_id: cities['Tampere'],
      name: 'Wapputiimi',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/wapputiimi.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 16,
      city_id: cities['Helsinki'],
      name: 'AK',
      image_path: null, // TODO
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 17,
      city_id: cities['Helsinki'],
      name: 'Athene',
      image_path: null, // TODO
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 18,
      city_id: cities['Helsinki'],
      name: 'AS',
      image_path: null, // TODO
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 19,
      city_id: cities['Helsinki'],
      name: 'FK',
      image_path: null, // TODO
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 20,
      city_id: cities['Helsinki'],
      name: 'Inkubio',
      image_path: null, // TODO
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 21,
      city_id: cities['Helsinki'],
      name: 'KK',
      image_path: null, // TODO
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 22,
      city_id: cities['Helsinki'],
      name: 'KIK',
      image_path: null, // TODO
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 23,
      city_id: cities['Helsinki'],
      name: 'KY',
      image_path: null, // TODO
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 24,
      city_id: cities['Helsinki'],
      name: 'MK',
      image_path: null, // TODO
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 25,
      city_id: cities['Helsinki'],
      name: 'PJK',
      image_path: null, // TODO
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 26,
      city_id: cities['Helsinki'],
      name: 'Prodeko',
      image_path: null, // TODO
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 27,
      city_id: cities['Helsinki'],
      name: 'PT',
      image_path: null, // TODO
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 28,
      city_id: cities['Helsinki'],
      name: 'IK',
      image_path: null, // TODO
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 29,
      city_id: cities['Helsinki'],
      name: 'SIK',
      image_path: null, // TODO
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 30,
      city_id: cities['Helsinki'],
      name: 'TF',
      image_path: null, // TODO
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 31,
      city_id: cities['Helsinki'],
      name: 'TiK',
      image_path: null, // TODO
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 32,
      city_id: cities['Helsinki'],
      name: 'VK',
      image_path: null, // TODO
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 33,
      city_id: cities['Helsinki'],
      name: 'TOKYO',
      image_path: null, // TODO
    });
  });
};
