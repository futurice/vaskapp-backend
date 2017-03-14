const {knex} = require('../util/database').connect();
import {deepChangeKeyCase} from '../util';
import _ from 'lodash';


function getStations(opts) {
  return knex('radios').select('*')
    .then(rows =>
      _.map(rows, row =>
        deepChangeKeyCase(row, 'camelCase')
      )
    );
}

export {
  getStations,
};
