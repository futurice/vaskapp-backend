import _ from 'lodash';
import fs from 'fs';
import path from 'path';
const logger = require('../util/logger')(__filename);

const DATA_DIR = path.join(__dirname, '../../data');
const content = fs.readFileSync(path.join(DATA_DIR, 'events.json'), {encoding: 'utf8'});
let events;
try {
  events = JSON.parse(content);
} catch (e) {
  logger.error('Error when parsing events.json!');
  logger.error(content);
  throw e;
}

function getEvents() {
  return events;
}

function setAttendingCount(facebookEventId, attendingCount) {
  const event = _.find(events, { facebookId: facebookEventId });
  if (!event) {
    return;
  }

  event.attendingCount = attendingCount;
}

export {
  getEvents,
  setAttendingCount
};
