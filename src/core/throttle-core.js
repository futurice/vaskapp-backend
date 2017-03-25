'use strict';

import * as actionTypeCore from './action-type-core';
var BPromise = require('bluebird');

let redisClient;

function getKey(uuid) {
  return `throttle--${ uuid }`;
}

// Cache of action types
// Key: action type code
// Value: throttle time
let actionTypeCache;

/**
 * Initializes throttle core, by loading cache
 */
function initialize() {
  if (process.env.DISABLE_THROTTLE === 'true') {
    return;
  }

  redisClient = require('../util/redis').connect().client;

  return actionTypeCore.getActionTypes()
    .then(types => {
      actionTypeCache = {};

      types.forEach(type => {
        actionTypeCache[type.code] = type.cooldown;
      });
    });
}

function _hasCooldownPassed(cooldownTime, lastExecuted) {
  const timeNow = Date.now();
  const executeAllowed = lastExecuted + cooldownTime;

  return timeNow >= executeAllowed;
}

/**
 * Checks if throttle time has passed for given users
 * given action type.
 */
function canDoAction(uuid, actionType) {
  if (process.env.DISABLE_THROTTLE === 'true') {
    return BPromise.resolve(true);
  }

  const cooldownTime = actionTypeCache[actionType];
  if (cooldownTime === undefined || cooldownTime === null) {
    return BPromise.resolve(false);
  }

  return redisClient.hgetallAsync(getKey(uuid))
    .then(lastThrottlesByActionType => {
      if (!lastThrottlesByActionType) {
        return true;
      }
      const lastExecutedTime = lastThrottlesByActionType[actionType];
      if (!lastExecutedTime) {
        return true;
      }

      const lastExecuted = Number(lastExecutedTime);
      return _hasCooldownPassed(cooldownTime, lastExecuted);
    });
}

/**
 * Marks given user's given action as executed as this moment.
 */
function executeAction(uuid, actionType) {
  const timeNow = Date.now().toString();

  return redisClient.hmsetAsync(getKey(uuid), actionType, timeNow);
}

export {
  initialize,
  canDoAction,
  executeAction
};
