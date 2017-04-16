#!/usr/bin/env node

// This tool fetches the radio program from the interwebs and
// generates a data file to be used from it

const _ = require('lodash');
const BPromise = require('bluebird');
const fs = require('fs');
const path = require('path');
const request = require('request');
const requestAsync = BPromise.promisify(request, { multiArgs: true });

const RADIOS = [
  {
    name: 'radio-diodi',
    url: 'https://radiodiodi.fi/api/programmes',
    preBroadcastShow: {
      id: 'id',
      start: '2017-03-25T09:00:00.000Z',
      end: '2017-04-18T09:00:00+03:00',
      title: 'Live Tue April 18th at 9:00',
      host: '',
      prod: '',
      desc: '',
      photo: '',
      thumb: '',
    },
  },
  {
    name: 'wappu-radio',
    url: 'https://wappuradio.fi/api/programs',
    preBroadcastShow: {
      id: 'id',
      start: '2017-03-25T09:00:00.000Z',
      end: '2017-04-19T14:00:00+03:00',
      title: 'Live Wed April 19th at 14:00',
      host: '',
      prod: '',
      desc: '',
      photo: '',
      thumb: '',
    },
  },
];


function main() {
  _.forEach(RADIOS, function(radio) {
    const outputFile = path.resolve(__dirname, '..', 'data', `${radio.name}-program.json`);
    const url = radio.url;

    fetchProgram(url).then(programs => {
      const formattedPrograms = format(programs, radio.name);
      const programsJson = JSON.stringify(_.concat(radio.preBroadcastShow, formattedPrograms), null, 2);
      fs.writeFileSync(outputFile, programsJson);
    });
  });
}

function fetchProgram(url) {
  return requestAsync(url).then(responseAndBody => {
    const body = responseAndBody[1];

    return JSON.parse(body)
  });
}

function format(programs, radioName) {
  return _.map(programs, function(program) {
    switch (radioName) {
      case 'radio-diodi':
        return {
          id: 'id',
          start : program['start'],
          end: program['end'],
          title: program['title'],
          host: program['host'],
          prod: '',
          desc: '',
          photo: '',
          thumb: '',
        };
      case 'wappu-radio':
        return program;
      default:
        console.error('Attempted to format unrecognized radio\'s progmram');
        process.exit(2);
        break;
    }
  });
}

main();
