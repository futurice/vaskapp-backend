import _ from 'lodash';
const {knex} = require('../util/database').connect();
import {createFeedItem} from './feed-core';

function createAction(action) {
  const actionRow = {
    'team_id':        knex.raw('(SELECT team_id from users WHERE uuid = ?)', [action.user]),
    'action_type_id': knex.raw('(SELECT id from action_types WHERE code = ?)', [action.type]),
    'user_id':        knex.raw('(SELECT id from users WHERE uuid = ?)', [action.user]),
    // Tuple is in longitude, latitude format in Postgis
    'location':       action.location.longitude + ',' + action.location.longitude,
    'image_path':     action.imagePath,
    'text':           action.text
  };

  // These are inserted directly into feed as well
  const feedActions = new Set(['IMAGE', 'TEXT']);

  return knex.transaction(function(trx) {
    return trx('actions').returning('*').insert(actionRow)
      .then(rows => {
        if (_.isEmpty(rows)) {
          throw new Error('Action row creation failed: ' + actionRow);
        }

        if (feedActions.has(action.type)) {
          return createFeedItem(action, trx);
        } else {
          return rows.length;
        }
      });
  });
}

function getActionType(code) {
  return knex('action_types')
    .select('*')
    .limit(1)
    .where('code', code)
    .then(rows => {
      if (_.isEmpty(rows)) {
        return null;
      }

      return _actionTypeRowToObject(rows[0]);
    });
}

function _actionTypeRowToObject(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    value: row.value,
    cooldown: row.cooldown
  };
}

export {
  createAction,
  getActionType
};
