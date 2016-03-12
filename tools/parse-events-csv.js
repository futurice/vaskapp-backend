#!/usr/bin/env node

// This tool transforms CSV export from events Excel file to json
// You need to export the Excel file with "Windows CSV format"
// node tools/parse-events-csv.js ~/Downloads/events.csv > data/events.json

var BPromise = require('bluebird');
var fs = require('fs');
var path = require('path');
var iconv = require('iconv-lite');
var _ = require('lodash');
var moment = require('moment-timezone');
var Fuse = require('fuse.js');
var csv = require('csv');
BPromise.promisifyAll(csv);

if (!process.argv[2]) {
  console.error('Incorrect parameters');
  console.error('Usage: ./parse-events-csv.js <csv-file>');
  process.exit(2);
}

var DATE_FORMAT = 'DD/MM/YY HH:mm';

function main() {
  var INPUT_CSV_PATH = process.argv[2];
  var fileContentBuf = fs.readFileSync(INPUT_CSV_PATH);
  var fileContent = iconv.decode(fileContentBuf, 'cp1250');

  var locations = readJsonFile('location-fuzzy-map.json');
  var locationsFuse = new Fuse(locations, {threshold: 0.4, keys: ['locationName']});

  var coverImages = readJsonFile('cover-image-fuzzy-map.json');
  var coverImagesFuse = new Fuse(coverImages, {threshold: 0.2, keys: ['eventName']});

  csv.parseAsync(fileContent, {
    comment: '#',
    delimiter: ';',
    'auto_parse': false,
    trim: true
  })
  .then(function(eventsData) {
    var rows = _.filter(_.tail(eventsData), row => !_.isEmpty(row[0]));
    var rowCount = rows.length;
    rows = _.uniqBy(rows, row => row[0]);

    var diff = rowCount - rows.length;
    console.error('Removed', diff, 'duplicate events from the source data');

    var events = _.map(rows, row => {
      var startTime = moment.tz(row[2] + ' ' + row[4], DATE_FORMAT, 'Europe/Helsinki');
      // Start date is same as in the end, the end time might go to the next
      // day too, so we have to take that into account.
      // e.g. start is 21:00 and end is 01:00
      var endTime = moment.tz(row[2] + ' ' + row[5], DATE_FORMAT, 'Europe/Helsinki');
      if (endTime.diff(startTime) < 0) {
        console.error('endTime', endTime.toISOString(), '<', startTime.toISOString());
        endTime = endTime.add(1, 'day');
        console.error('New endTime:', endTime.toISOString());
      }

      var event = {
        name: row[0],
        locationName: row[1],
        startTime: startTime,
        endTime: endTime,
        description: row[7],
        organizer: row[8],
        contactDetails: row[9],
        teemu: row[10].indexOf('Yes') > 0,
      };

      var results = locationsFuse.search(event.locationName);
      if (_.isEmpty(results)) {
        console.error('Searched for:', event.locationName);
        throw new Error('Could not match event to location: ' + JSON.stringify(event));
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

      results = coverImagesFuse.search(event.name);
      if (_.isEmpty(results)) {
        console.error('Searched for:', event.name);
        throw new Error('Could not match event name to cover image: ' + JSON.stringify(event));
      }
      event.coverImage = 'https://storage.googleapis.com/wappuapp/assets/' +
        results[0].coverImage;

      return event;
    });

    var sortedEvents = _.sortBy(events, event => {
      return event.startTime.unix();
    });

    console.error('\n\n\n');
    console.log(JSON.stringify(sortedEvents, null, 2));
  });
}

function readJsonFile(dataName) {
  var filepath = path.join(__dirname, '../data/', dataName);
  return JSON.parse(fs.readFileSync(filepath, {encoding: 'utf8'}));
}

main();
