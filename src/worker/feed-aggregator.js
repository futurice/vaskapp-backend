// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
import _ from 'lodash';
const BPromise = require('bluebird');
const logger = require('../util/logger')(__filename);
const {knex} = require('../util/database').connect();
import {createFeedItem} from '../core/feed-core';
import {markAsAggregated} from '../core/action-core';

const SIMA_REPORT_INTERVAL = 50;
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

function arrayRandom(array) {
  const randomizedIndex = Math.round(Math.random() * (array.length - 1));
  return array[randomizedIndex];
}

function generateFirstSimaMessage(name) {
  const praises = [
    "<name> is on it. First sima down!",
    "<name> just started wappu with first sima.",
    "<name> starts wappu! Congratulations on the first sima!"
  ];

  const praise = arrayRandom(praises);
  return praise.replace("<name>", name);
}

function generateTeamSimaMessage(team, simas) {
  const teamPraises = [
    "<team> might have some issues with breathalyzer tests, considering their <simas> simas.",
    "<team> must be really thirsty! They've had <simas> simas.",
    "Keep <team> away from the bar. They're at <simas> simas already.",
    "<team> must have received a shipment from Estonia. They're chugging at <simas> simas already.",
    "<team> has gone full Sokka irti with <simas> simas.",
  ];

  const praise = arrayRandom(teamPraises);
  return praise.replace("<team>", team).replace("<simas>", simas);
}

function generateUserSimaMessage(name, simas) {
  const userPraises = [
    "Enjoy that <simas>th sima, <name>!",
    "<name> might have some issues with breathalyzer tests, considering her <simas> simas.",
    "<name> must be really thirsty! She's had <simas> simas.",
    "Keep <name> away from the bar. He’s at <simas> simas already.",
    "<name> must have received a shipment from Estonia. She’s chugging at <simas> simas already",
    "<name> has gone full Sokka irti with <simas> simas",
  ];

  const praise = arrayRandom(userPraises);
  return praise.replace("<name>", name).replace("<simas>", simas);
}

function generateTeamScoreMessage(team, points) {
  const teamPraises = [
    "Jeden tag so schnell! <team> is now at <points> points!",
    "Look at <team>! They just crossed <points> points!",
    "Those fine folks at <team> just can't stop. <points> points already!"
  ];

  const praise = arrayRandom(teamPraises);
  return praise.replace("<team>", team).replace("<points>", points);
}

function generateUserScoreMessage(name, points) {
  const userPraises = [
    "Jeden tag so schnell! <name> is now at <points> points!",
    "That <name> just keeps on scoring. <points> already!",
    "This fine person <name> just can't stop. <points> points already!"
  ];

  const praise = arrayRandom(userPraises);
  return praise.replace("<name>", name).replace("<points>", points);
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

  const createDrinkFeedItems = function(stats, msgGenerator) {
    _.forEach(stats, itemStats => {
      const drinksBefore = itemStats.drinksBefore;
      const drinksAfter  = itemStats.drinksAfter;
      const name         = itemStats.name;

      if (drinksBefore === drinksAfter) {
        return;
      }

      let feedItem;

      if (drinksBefore === 0) {
        const text = generateFirstSimaMessage(name);
        feedItem = feedItemParam(itemStats.getFirstAction(), text);
      }
      else if (passesPoint(drinksBefore, drinksAfter, SIMA_REPORT_INTERVAL)) {
        const drinks = roundTo(drinksAfter, SIMA_REPORT_INTERVAL);
        const text = msgGenerator(name, drinks);
        // Let's cheat a little and assume last sima was the one
        feedItem = feedItemParam(itemStats.getLastAction(), text);
      }

      if (feedItem) {
        feedItems.push(feedItem);
        actionIds.push(itemStats.getActionIds());
      }
    });
  };

  createDrinkFeedItems(allStats.teamStats, generateTeamSimaMessage);
  createDrinkFeedItems(allStats.userStats, generateUserSimaMessage);

  return {
    feedItems,
    actionIds: _.flatten(actionIds)
  };
}

function createScoreAggregates(allStats) {
  const feedItems = [];
  const actionIds = [];

  const createScoreFeedItems = function(stats, msgGenerator) {
    _.forEach(stats, itemStats => {
      const scoreBefore = itemStats.scoreBefore;
      const scoreAfter  = itemStats.scoreAfter;
      const name        = itemStats.name;

      if (scoreBefore === scoreAfter) {
        return;
      }

      let feedItem;

      if (passesPoint(scoreBefore, scoreAfter, SCORE_REPORT_INTERVAL)) {
        const points = roundTo(scoreAfter, SCORE_REPORT_INTERVAL);
        const text = msgGenerator(name, points);
        // Let's cheat a little and assume last action was the one
        feedItem = feedItemParam(itemStats.getLastAction(), text);
      }

      if (feedItem) {
        feedItems.push(feedItem);
        actionIds.push(itemStats.getActionIds());
      }
    });
  }

  createScoreFeedItems(allStats.userStats, generateUserScoreMessage);
  createScoreFeedItems(allStats.teamStats, generateTeamScoreMessage);

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

export {
  start
};
