const {knex} = require('../util/database').connect();
import {deepChangeKeyCase} from '../util';
import _ from 'lodash';
import moment from 'moment-timezone';

const wappuRadioPrograms =
  require("../../data/wappu-radio-program.json")
    .map(program => {
      program.start = moment(program.start).utc();
      program.end   = moment(program.end).utc();

      return program;
    });
const RadiodiodiPrograms = [];

// Hard coded ids for convenience
const programsByRadioId = {
  1: wappuRadioPrograms,
  2: RadiodiodiPrograms
};

function getStationById(id) {
  return getStations({ id })
    .then(results => {
      if (_.isEmpty(results)) {
        return undefined;
      } else {
        return results[0]
      }
    });
}

function getStations(opts) {
  return knex('radios').select('*').where(_getWhereClause(opts))
    .then(rows =>
      _.map(rows, row =>
        Object.assign(
          deepChangeKeyCase(row, 'camelCase'),
          {
            nowPlaying: _getStationNowPlaying(row.id)
          }
        )
      )
    );
}

function _getWhereClause(filters) {
  let whereClauses = {};

  if (filters.city) {
    whereClauses.city_id = filters.city;
  }

  if (filters.id) {
    whereClauses.id = filters.id;
  }

   return whereClauses;
}

function _getStationNowPlaying(stationId) {
  const programs = programsByRadioId[stationId];

  return _getNowPlaying(programs);
}

function _getNowPlaying(stationPrograms) {
  if (!stationPrograms) {
    return {
      program: null,
      song: null,
      left: null
    };
  }

  const now = moment().utc();
  const program = stationPrograms.find(p => _isProgramPlaying(now, p));
  if (!program) {
    return {
      program: null,
      song: null,
      left: null
    };
  }

  return {
    programTitle: program.title,
    programHost: program.host,
    song: null,
    left: program.end.diff(now)
  };
}

function _isProgramPlaying(now, program) {
  return now.isBetween(program.start, program.end);
}

export {
  getStationById,
  getStations,
};
