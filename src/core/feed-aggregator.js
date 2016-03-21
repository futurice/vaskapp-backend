import _ from 'lodash';
const logger = require('../util/logger')(__filename);
const {knex} = require('../util/database').connect();
import {createFeedItem} from './feed-core';
import {markAsAggregated} from './action-core';

function queryStats() {
  let sqlString = `SELECT
      actions.id as id,
      actions.location as location,
      actions.aggregated as aggregated,
      action_types.code as action_type_code,
      users.id as user_id,
      users.name as user_name,
      teams.id as team_id,
      teams.name as team_name
    FROM actions
    JOIN action_types ON action_types.id = actions.action_type_id
    JOIN users ON users.id = actions.user_id
    JOIN teams ON teams.id = actions.team_id
    WHERE action_types.code = 'BEER'
    ORDER BY id`;

  return knex.raw(sqlString)
    .then(result => {
      const rows = result.rows;

      const stats = buildStats(rows);

      return stats;
    });
}

function buildStats(rows) {
  const getStats = function(stats, key, name) {
    const existing = stats[key];
    if (existing) {
      return existing;
    }

    const newStats = {
      name: name,
      drinksAggregated: 0,
      newDrinks: 0,
      newActions: []
    };

    stats[key] = newStats;
    return newStats;
  }

  const teamStats = {};
  const userStats = {};

  rows.forEach(row => {
    const team = getStats(teamStats, row.team_id, row.team_name);
    const user = getStats(userStats, row.user_id, row.user_name);

    if (row.aggregated) {
      team.drinksAggregated++;
      user.drinksAggregated++;
    } else {
      team.newDrinks++;
      user.newDrinks++;

      team.newActions.push(row);
      user.newActions.push(row);
    }
  });

  return {
    teamStats,
    userStats
  };
}

function handleAction(action, trx) {
  if (action.type === 'IMAGE' || action.type === 'TEXT') {
    return createFeedItem(action, trx)
      .then(() => markAsAggregated(action.id, trx));
  }

  return Promise.resolve();
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

function integerDivide(num, denominator) {
  return Math.floor(num / denominator);
}

function createFeedItemForUser(feedItem, userId, newActions) {
  const maxId = _.last(newActions).id;

  return knex.transaction(function(trx) {
    return createFeedItem(feedItem, trx)
      .then(() => {
        return trx('actions')
          .update('aggregated', true)
          .where('id', '<=', maxId)
          .andWhere('aggregated', false)
          .andWhere('user_id', userId);
      });
  });
}

function createFeedItemForTeam(feedItem, teamId, newActions) {
  const maxId = _.last(newActions).id;

  return knex.transaction(function(trx) {
    return createFeedItem(feedItem, trx)
      .then(() => {
        return trx('actions')
          .update('aggregated', true)
          .where('id', '<=', maxId)
          .andWhere('aggregated', false)
          .andWhere('team_id', teamId);
      });
  });
}

function createDrinkAggregates(stats) {
  const feedItemsToCreate = [];

  _.forEach(stats.userStats, (userStats, userId) => {
    if (userStats.drinksAggregated === userStats.newDrinks) {
      return;
    }

    const username = userStats.name;
    const drinksBefore = userStats.drinksAggregated;
    const drinksAfter  = drinksBefore + userStats.newDrinks;
    let feedItem;

    if (drinksBefore === 0) {
      const text = `${ username } starts wappu! Congratulations on the first sima!`;
      feedItem = feedItemParam(userStats.newActions[0], text);
    }
    else if (integerDivide(drinksBefore, 100) !== integerDivide(drinksAfter, 100)) {
      const text = `Such wow. ${ username } has had already ${ integerDivide(drinksAfter, 100) * 100 } simas.`;
      const idx = 100 - drinksBefore % 100;
      feedItem = feedItemParam(userStats.newActions[idx - 1], text);
    }

    if (feedItem) {
      feedItemsToCreate.push(
        createFeedItemForUser(feedItem, userId, userStats.newActions)
      )
    }
  });

  _.forEach(stats.teamStats, (teamStats, teamId) => {
    if (teamStats.drinksAggregated === teamStats.newDrinks) {
      return;
    }

    const name = teamStats.name;
    const drinksBefore = teamStats.drinksAggregated;
    const drinksAfter  = drinksBefore + teamStats.newDrinks;
    let feedItem;

    if (drinksBefore === 0) {
      const text = `${ name } starts wappu! Congratulations on the first sima!`;
      feedItem = feedItemParam(teamStats.newActions[0], text);
    }
    else if (integerDivide(drinksBefore, 100) !== integerDivide(drinksAfter, 100)) {
      const text = `Such wow. ${ name } has had already ${ integerDivide(drinksAfter, 100) * 100 } simas.`;
      const idx = 100 - drinksBefore % 100;
      feedItem = feedItemParam(teamStats.newActions[idx - 1], text);
    }

    if (feedItem) {
      feedItemsToCreate.push(
        createFeedItemForTeam(feedItem, teamId, teamStats.newActions)
      )
    }
  });

  return Promise.all(feedItemsToCreate);
}

function aggregate() {
  // TODO: It's suboptimal to query all actions on every poll.
  // Should use caching here.
  queryStats()
    .then(createDrinkAggregates);
}

let isRunning = false;

function start() {
  if (isRunning) {
    throw new Error("Already running");
  }

  isRunning = true;

  function aggregatePoll() {
    try {
      aggregate();
    } catch (error) {
      logger.error(error);
    }

    setTimeout(aggregatePoll, 60 * 1000);
  }

  aggregatePoll();
}

export {
  start,
  handleAction
};
