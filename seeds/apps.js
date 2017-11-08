const BPromise = require('bluebird');
const apps = require('../data/apps.json');
var util = require('../src/util/seeds');

exports.seed = function(knex, Promise) {
  return BPromise.map(apps, (app, index) => {
    const row = {
      id: index + 1,
      type: app.type,
      name: app.name,
      url: app.url,
      description: app.description,
      image_url: app.image_url,
    };

    return util.insertOrUpdate(knex, 'apps', row);
  }, {concurrency: 1})
};
