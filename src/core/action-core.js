import _ from 'lodash';
const {knex} = require('../util/database').connect();
import {createFeedItem} from './feed-core';

function createAction(action) {
  const actionRow = {
    'team_id':        knex.raw('(SELECT team_id from users WHERE uuid = ?)', [action.user]),
    'action_type_id': knex.raw('(SELECT id from action_types WHERE code = ?)', [action.type]),
    'user_id':        knex.raw('(SELECT id from users WHERE uuid = ?)', [action.user]),
    'image_path':     action.imagePath,
    'text':           action.text,
    'ip':             action.ip,
    'event_id':       action.eventId,
  };

  const location = action.location;
  if (location) {
    // Tuple is in longitude, latitude format in Postgis
    actionRow.location = location.longitude + ',' + location.latitude;
  }
  if (action.isBanned) {
    actionRow.is_banned = action.isBanned;
    actionRow.aggregated = true;
  }

  return knex.transaction(function(trx) {
    return trx('actions').returning('*').insert(actionRow)
      .then(rows => {
        if (_.isEmpty(rows)) {
          throw new Error('Action row creation failed: ' + actionRow);
        }

        action.id = rows[0].id;
        if (action.type === 'IMAGE' || action.type === 'TEXT') {
          createFeedItem(action, trx);
        }

        return Promise.resolve();
    })
  })
  .then(() => undefined)
  .catch(err => {
    if (err.constraint === 'only_one_check_in_per_event') {
      err.status = 403;
      err.message = 'Duplicate check in attempted';
    }
    throw err;
  });
}

function markAsAggregated(actionId, trx) {
  trx = trx || knex;

  return trx('actions')
    .where('id', actionId)
    .update('aggregated', true)
    .returning('id')
    .then(rows => {
      if (_.isEmpty(rows)) {
        throw new Error('Marking action as aggregated failed: ' + actionId);
      }

      return rows.length;
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
  getActionType,
  markAsAggregated
};
