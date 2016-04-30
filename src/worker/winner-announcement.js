import _ from 'lodash';
const BPromise = require('bluebird');
import moment from 'moment-timezone';
const logger = require('../util/logger')(__filename);
const db = require('../util/database').connect();
import {createFeedItem} from '../core/feed-core';
import {getTeams} from '../core/team-core';
const knex = db.knex;

function main() {
  return shouldAnnounce()
  .then(doIt => {
    if (!doIt) {
      logger.info('Not announcing winner..');
      return;
    }

    return announceWinner();
  });
}

function shouldAnnounce() {
  if (moment().tz('Europe/Helsinki').format('YYYY-MM-DD') !== '2016-05-01') {
    logger.info('Not yet the correct date.');
    return BPromise.resolve(false);
  }

  logger.info('Date is correct.');
  return knex('feed_items').select('*').where('text', 'like', 'HUGE con%').whereNull('user_id')
  .then(res => {
    console.log(res)
    return res.length === 0;
  });
}

function announceWinner() {
  var winner;

  logger.info('Announcing winners!');

  return getTeams()
  .then(teams => {
    logger.info('TEAMS: ' + JSON.stringify(teams));
    winner = _.head(teams);

    return createFeedItem({
      type: 'IMAGE',
      text: null,
      imagePath: 'assets/winner.jpg',
      user: null,
      isSticky: true
    });
  })
  .then(res => {
    return createFeedItem({
      type: 'TEXT',
      text: `HUGE congratulations to ${winner.name}! They got amazing amount of points, incredible! Vyötäinen will be awarded to them ~14 in TeekkariKaste, be there!`,
      user: null,
      isSticky: true
    });
  });
}

main().finally(() => db.close());
