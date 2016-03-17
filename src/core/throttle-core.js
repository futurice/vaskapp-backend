// WARNING: This throttle core is creating an local instance state which
// is not shared between servers. In practice this is acceptable for this use
// case.

'use strict';

import * as actionTypeCore from './action-type-core';

// Cache of throttles
// Key: user uuid
// Value: object where key is action type and value is when executed last
const cache = {};

// Cache of action types
// Key: action type code
// Value: throttle time
let actionTypeCache;

/**
 * Initializes throttle core, by loading cache
 */
function initialize() {
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
	const cacheItem = cache[uuid];
	if (!cacheItem) {
		return true;
	}

	const lastExecuted = cacheItem[actionType];
	if (!lastExecuted) {
		return true;
	}

	const cooldownTime = actionTypeCache[actionType];
	if (!cooldownTime) {
		return false;
	}

	return _hasCooldownPassed(cooldownTime, lastExecuted);
}

/**
 * Marks given user's given action as executed as this moment.
 */
function executeAction(uuid, actiontype) {
	let cacheItem = cache[uuid];
	if (!cacheItem) {
		cacheItem = {};
		cache[uuid] = cacheItem;
	}

	const timeNow = Date.now();
	cacheItem[actiontype] = timeNow;
}

export {
	initialize,
	canDoAction,
	executeAction
};
