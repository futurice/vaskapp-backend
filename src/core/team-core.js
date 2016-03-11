const {knex} = require('../util/database').connect();
import _ from 'lodash';
import {deepChangeKeyCase} from '../util';

function getTeams() {
  return knex('teams').select()
  .then(rows => {
    return _.map(rows, row => deepChangeKeyCase(row, 'camelCase'));
  });
}

export {
  getTeams
};
