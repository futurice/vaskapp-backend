#!/usr/bin/env node

// This tool fetches the radio program from the interwebs and
// generates a data file to be used from it

const BPromise = require('bluebird');
const fs = require('fs');
const path = require('path');
const request = require('request');
const requestAsync = BPromise.promisify(request, { multiArgs: true });

if (!process.argv[2]) {
  console.error('Incorrect parameters');
  console.error('Usage: ./parse-events-csv.js <url>');
  process.exit(2);
}

const OUTPUT_FILE = path.resolve(__dirname, '..', 'data', 'wappu-radio-program.json');

function main() {
  const url = process.argv[2];

  fetchProgram(url).then(programs => {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(programs, null, 2));
  });
}

function fetchProgram(url) {
  return requestAsync(url).then(responseAndBody => {
    const body = responseAndBody[1];

    return JSON.parse(body)
  });
}

main();
