var util = require('../src/util/seeds');

exports.seed = function(knex, Promise) {
  return util.insertOrUpdate(knex, 'teams', {
    id: 1,
    name: 'TiTe',
    image_path: 'https://storage.googleapis.com/wappuapp/assets/tite.png'
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 2,
      name: 'Skilta',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/skilta.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 3,
      name: 'Autek',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/autek.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 4,
      name: 'Bioner',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/bioner.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 5,
      name: 'Hiukkanen',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/hiukkanen.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 6,
      name: 'Indecs',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/indecs.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 7,
      name: 'KoRK',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/kork.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 8,
      name: 'Man@ger',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/manager.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 9,
      name: 'MIK',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/mik.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 10,
      name: 'TamArk',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/tamark.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 11,
      name: 'TARAKI',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/taraki.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 12,
      name: 'YKI',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/yki.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 13,
      name: 'TeLe',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/tele.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 14,
      name: 'ESN',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/esn.png'
    });
  })
  .then(() => {
    return util.insertOrUpdate(knex, 'teams', {
      id: 15,
      name: 'Wapputiimi',
      image_path: 'https://storage.googleapis.com/wappuapp/assets/wapputiimi.png'
    });
  })
  ;
};
