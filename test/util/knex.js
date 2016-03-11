import BPromise from 'bluebird';

function createKnexUtil(knex, knexConfig) {
  function migrateAllDownAndUp() {
    return migrateAllDown()
      .then(() => {
        return knex.migrate.latest(knexConfig);
      });
  }

  function migrateAllDown() {
    var promise = knex.migrate.currentVersion();
    return promise.then(version => {
      if (version !== 'none') {
        return knex.migrate.rollback()
          .then(() => {
            return migrateAllDown();
          });
      } else {
        return BPromise.resolve();
      }
    });
  }

  function runSeeds() {
    return knex.seed.run(knexConfig);
  }

  return {
    migrateAllDownAndUp,
    migrateAllDown,
    runSeeds
  };
}

module.exports = createKnexUtil;
