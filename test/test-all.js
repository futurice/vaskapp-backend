const {config, knex} = require('../src/util/database').connect();
const knexUtils = require('./util/knex')(knex, config);
const logger = require('../src/util/logger')(__filename);
import testActions from './test-actions';

function resetDatabase() {
  return knexUtils.migrateAllDownAndUp()
    .then(() => {
      return knexUtils.runSeeds()
    });
}

describe('Wappuapp API', function testApi() {
  logger.info('Database is reset before each test case.');

  beforeEach(() => {
    return resetDatabase();
  });

  testActions();
});
