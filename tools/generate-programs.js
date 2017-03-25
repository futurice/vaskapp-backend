#!/usr/bin/env node

"use strict";

// This tool fetches the radio program from the interwebs and
// generates a data file to be used from it

const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

if (!process.argv[4]) {
  console.error('Incorrect parameters');
  console.error('Usage: ./parse-events-csv.js <start> <end> <interval in minutes>');
  process.exit(2);
}

const OUTPUT_FILE = path.resolve(__dirname, '..', 'data', 'wappu-radio-program.json');

function main() {
  const start = moment(process.argv[2]).utc();
  const end = moment(process.argv[3]).utc();
  const intervalInMin = Number(process.argv[4]);

  const programs = generatePrograms(start, end, intervalInMin);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(programs, null, 2));
}

function generatePrograms(start, end, interval) {
  const generated = [];

  while (start < end) {
    const startTime = start.clone();
    const endTime = start.add(interval, 'm');

    const program = createProgram(startTime, endTime);
    generated.push(program);
  }

  return generated;
}

function createProgram(startTime, endTime) {
  const start = startTime.tz('Europe/Helsinki').format('HH:mm');
  const end   = endTime.tz('Europe/Helsinki').format('HH:mm');

  return {
    "id":    "id",
    "start": startTime.toISOString(),
    "end":   endTime.toISOString(),
    "title": `Title of ${ start }-${ end }`,
    "host":  "Host",
    "prod":  "Prod",
    "desc":  "Description",
    "photo": "photo-uri",
    "thumb": "thumb-uri"
  };
}

main();
