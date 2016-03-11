#!/usr/bin/env node

// This tool transforms CSV export from events Excel file to json
// You need to export the Excel file with "Windows CSV format"
// node tools/parse-events-csv.js ~/Downloads/events.csv > data/events.json

var BPromise = require('bluebird');
var fs = require('fs');
var path = require('path');
var iconv = require('iconv-lite');
var _ = require('lodash');
var Fuse = require('fuse.js');
var csv = require('csv');
BPromise.promisifyAll(csv);

if (!process.argv[2]) {
  console.error('Incorrect parameters');
  console.error('Usage: ./parse-events-csv.js <csv-file>');
  process.exit(2);
}

var INPUT_CSV_PATH = process.argv[2];
var fileContentBuf = fs.readFileSync(INPUT_CSV_PATH);
var fileContent = iconv.decode(fileContentBuf, 'cp1250');

var filepath = path.join(__dirname, '../data/location-fuzzy-map.json');
var locations = JSON.parse(fs.readFileSync(filepath, {encoding: 'utf8'}));
var locationsFuse = new Fuse(locations, {threshold: 0.4, keys: ['locationName']});

function main() {
  csv.parseAsync(fileContent, {
    comment: '#',
    delimiter: ';',
    'auto_parse': false,
    trim: true
  })
  .then(function(eventsData) {
    var rows = _.filter(_.tail(eventsData), row => !_.isEmpty(row[0]));
    var events = _.map(rows, row => {
      var event = {
        name: row[0],
        locationName: row[1]
      };

      var results = locationsFuse.search(event.locationName);
      if (_.isEmpty(results)) {
        console.error('Searched for:', event.locationName);
        throw new Error('Could not match event name to location: ' + JSON.stringify(event));
      }

      event.location = {
        latitude: results[0].latitude,
        longitude: results[0].longitude
      };

      if (event.locationName !== results[0].locationName) {
        console.error(
          'Match',
          event.locationName,
          '\n   ->',
          results[0].locationName,
          JSON.stringify(event.location)
        );
      }

      return event;
    });

    console.error('\n\n\n');
    console.log(JSON.stringify(events, null, 2));
  });
}

main();
