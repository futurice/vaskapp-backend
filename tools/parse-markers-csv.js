#!/usr/bin/env node

// This tool transforms CSV export from markers spreadsheet
// Usage:
// node tools/parse-markers-csv.js ~/Downloads/markers.csv > data/markers.json

var BPromise = require('bluebird');
var fs = require('fs');
var _ = require('lodash');
var csv = require('csv');
BPromise.promisifyAll(csv);

if (!process.argv[2]) {
  console.error('Incorrect parameters');
  console.error('Usage: ./parse-markers-csv.js <csv-file>');
  process.exit(2);
}

function main() {
  var INPUT_CSV_PATH = process.argv[2];
  var fileContent = fs.readFileSync(INPUT_CSV_PATH, {encoding: 'utf8'});

  csv.parseAsync(fileContent, {
    comment: '#',
    delimiter: ',',
    'auto_parse': false,
    trim: true
  })
  .then(function(markersData) {
    var rows = _.filter(_.tail(markersData), row => !_.isEmpty(row[0]));

    var markers = _.map(rows, row => {
      var marker = {
        type: row[0],
        title: row[1],
        location: {
          latitude: row[2].split(',')[0].trim(),
          longitude: row[2].split(',')[1].trim(),
        }
      };

      if (row[3]) {
        marker.url = row[3];
      }

      return marker;
    });

    console.error('\n\n\n');
    console.log(JSON.stringify(markers, null, 2));
  });
}

main();
