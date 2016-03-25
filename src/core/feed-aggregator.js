// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import _ from 'lodash';
const BPromise = require('bluebird');
const logger = require('../util/logger')(__filename);
const {knex} = require('../util/database').connect();
import {createFeedItem} from './feed-core';
import {markAsAggregated} from './action-core';

const SIMA_REPORT_INTERVAL = 100;
const SCORE_REPORT_INTERVAL = 1000;
const POLL_INTERVAL = 60 * 1000; // 1 min

function toInt(n) {
  return parseInt(n, 10) || 0;
}

function roundTo(n, target) {
  return integerDivide(n, target) * target;
}

function passesPoint(begin, end, point) {
  return integerDivide(begin, point) !== integerDivide(end, point)
}

function integerDivide(num, denominator) {
  return Math.floor(num / denominator);
}

function Stats(name) {
  const newActions = [];
  let scoreBefore  = 0;
  let drinksBefore = 0;
  let newDrinks    = 0;
  let newScore     = 0;

  function addOldActionStats(type, count, score) {
    if (type === 'SIMA') {
      drinksBefore += count;
    }

    scoreBefore += toInt(score);
  }

  function addNewAction(action) {
    if (action.type === 'SIMA') {
      newDrinks++;
    }

    newScore += action.score;
    newActions.push(action);
  }

  function getFirstAction() {
    return newActions[0];
  }

  function getLastAction() {
    return newActions[newActions.length - 1];
  }

  function getActionIds() {
    return newActions.map(a => a.id);
  }

  return Object.defineProperties({
      addNewAction,
      addOldActionStats,
      getActionIds,
      getFirstAction,
      getLastAction,
      toString: function() {
        return JSON.stringify({
          name: name,
          drinksBefore: drinksBefore,
          drinksAfter: drinksBefore + newDrinks,
          scoreBefore: scoreBefore,
          scoreAfter: scoreBefore + newScore,
          newActions: newActions
        }, null, 2);
      }
    },
    {
      name:         { get: () => name },
      drinksBefore: { get: () => drinksBefore },
      drinksAfter:  { get: () => drinksBefore + newDrinks },
      scoreBefore:  { get: () => scoreBefore },
      scoreAfter:   { get: () => scoreBefore + newScore }
    });
}

function queryNewActions(stats) {
  const sqlString = `SELECT
      actions.id as id,
      actions.location as location,
      action_types.code as type,
      action_types.value as score,
      users.id as user_id,
      users.name as user_name,
      teams.id as team_id,
      teams.name as team_name
    FROM actions
    JOIN action_types ON action_types.id = actions.action_type_id
    JOIN users ON users.id = actions.user_id
    JOIN teams ON teams.id = actions.team_id
    WHERE
      actions.aggregated = false
    ORDER BY id
  `;

  return knex.raw(sqlString)
    .then(result => {
      const rows = result.rows.map(row => ({
        id:       toInt(row.id),
        location: row.location,
        type:     row.type,
        score:    toInt(row.score),
        userId:   toInt(row.user_id),
        userName: row.user_name,
        teamId:   toInt(row.team_id),
        teamName: row.team_name
      }));

      return readNewActions(stats, rows);
    });
}

function readNewActions(stats, rows) {
  const teamStats = stats.teamStats;
  const userStats = stats.userStats;

  rows.forEach(row => {
    const team = getStats(teamStats, row.teamId, row.teamName);
    const user = getStats(userStats, row.userId, row.userName);

    team.addNewAction(row);
    user.addNewAction(row);
  });

  return stats
}

function queryStats() {
  let sqlString = `
    SELECT
      SUM(action_types.value) AS score,
      COUNT(*)          AS count,
      action_types.code AS type,
      users.id          AS user_id,
      users.name        AS user_name,
      teams.id          AS team_id,
      teams.name        AS team_name
    FROM actions
    JOIN action_types ON action_types.id = actions.action_type_id
    JOIN users ON users.id = actions.user_id
    JOIN teams ON teams.id = actions.team_id
    WHERE
      actions.aggregated = true
    GROUP BY
      action_types.code,
      users.id, users.name,
      teams.id, teams.name
  `;

  return knex.raw(sqlString)
    .then(result => {
      const rows = result.rows.map(row => ({
        score:    toInt(row.score),
        count:    toInt(row.count),
        type:     row.type,
        userId:   toInt(row.user_id),
        userName: row.user_name,
        teamId:   toInt(row.team_id),
        teamName: row.team_name
      }));

      const stats = buildStats(rows);

      return stats;
    });
}

function getStats(stats, key, name) {
  const existing = stats[key];
  if (existing) {
    return existing;
  }

  const newStats = Stats(name);
  stats[key] = newStats;
  return newStats;
}

function buildStats(rows) {

  const teamStats = {};
  const userStats = {};

  rows.forEach(row => {
    const team = getStats(teamStats, row.teamId, row.teamName);
    const user = getStats(userStats, row.userId, row.userName);

    team.addOldActionStats(row.type, row.count, row.score);
    user.addOldActionStats(row.type, row.count, row.score);
  });

  return {
    teamStats,
    userStats
  };
}

function feedItemParam(action, text) {
  const item = {
    text: text,
    type: 'TEXT'
  };

  if (action.location) {
    item.location = {
      longitude: action.location.x,
      latitude: action.location.y
    };
  }

  return item;
}

function createDrinkAggregates(allStats) {
  const feedItems = [];
  const actionIds = [];

  const createDrinkFeedItems = function(stats) {
    _.forEach(stats, itemStats => {
      const drinksBefore = itemStats.drinksBefore;
      const drinksAfter  = itemStats.drinksAfter;
      const username     = itemStats.name;

      if (drinksBefore === drinksAfter) {
        return;
      }

      let feedItem;

      if (drinksBefore === 0) {
        const text = `${ username } starts wappu! Congratulations on the first sima!`;
        feedItem = feedItemParam(itemStats.getFirstAction(), text);
      }
      else if (passesPoint(drinksBefore, drinksAfter, SIMA_REPORT_INTERVAL)) {
        const drinks = roundTo(drinksAfter, SIMA_REPORT_INTERVAL);
        const text = `Such wow. ${ username } has had already ${ drinks } simas.`;
        // Let's cheat a little and assume last sima was the one
        feedItem = feedItemParam(itemStats.getLastAction(), text);
      }

      if (feedItem) {
        feedItems.push(feedItem);
        actionIds.push(itemStats.getActionIds());
      }
    });
  };

  createDrinkFeedItems(allStats.teamStats);
  createDrinkFeedItems(allStats.userStats);

  return {
    feedItems,
    actionIds: _.flatten(actionIds)
  };
}

function createScoreAggregates(allStats) {
  const feedItems = [];
  const actionIds = [];

  const createScoreFeedItems = function(stats) {
    _.forEach(stats, itemStats => {
      const scoreBefore = itemStats.scoreBefore;
      const scoreAfter  = itemStats.scoreAfter;
      const username    = itemStats.name;

      if (scoreBefore === scoreAfter) {
        return;
      }

      let feedItem;

      if (passesPoint(scoreBefore, scoreAfter, SCORE_REPORT_INTERVAL)) {
        const points = roundTo(scoreAfter, SCORE_REPORT_INTERVAL);
        const text = `Oh my. ${ username } has already gathered ${ points } points.`;
        // Let's cheat a little and assume last action was the one
        feedItem = feedItemParam(itemStats.getLastAction(), text);
      }

      if (feedItem) {
        feedItems.push(feedItem);
        actionIds.push(itemStats.getActionIds());
      }
    });
  }

  createScoreFeedItems(allStats.userStats);
  createScoreFeedItems(allStats.teamStats);

  return {
    feedItems,
    actionIds: _.flatten(actionIds)
  };
}

function insertFeedItems(feedItems, actionIds) {
  // Update in database id order
  const uniqueIds = _(actionIds).uniq().sortBy().value();

  return knex.transaction(function(trx) {
    return BPromise.mapSeries(feedItems, item => createFeedItem(item, trx))
      .then(() => BPromise.mapSeries(uniqueIds, id => markAsAggregated(id, trx)));
  });
}

function aggregate() {
  // TODO: It's suboptimal to query all actions on every poll.
  // Should use caching here.
  queryStats()
    .then(queryNewActions)
    .then(stats => {
      const items = {
        drinkItems: createDrinkAggregates(stats),
        scoreItems: createScoreAggregates(stats)
      };

      return insertFeedItems(
        items.drinkItems.feedItems.concat(items.scoreItems.feedItems),
        items.drinkItems.actionIds.concat(items.scoreItems.actionIds)
      );
    });
}

let isRunning = false;

function start() {
  if (isRunning) {
    throw new Error('Already running');
  }

  isRunning = true;

  function aggregatePoll() {
    try {
      aggregate();
    } catch (error) {
      logger.error(error);
    }

    setTimeout(aggregatePoll, POLL_INTERVAL);
  }

  aggregatePoll();
}

function handleAction(action, trx) {
  if (action.type === 'IMAGE' || action.type === 'TEXT') {
    // Don't mark it as aggregated so that score can be counted
    return createFeedItem(action, trx);
  }

  return Promise.resolve();
}

export {
  start,
  handleAction
};
