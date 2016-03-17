import _ from 'lodash';
const {knex} = require('../util/database').connect();
import {GCS_CONFIG} from '../util/gcs';

const FEED_ITEM_TYPES = new Set(['IMAGE', 'TEXT', 'CHECK_IN']);

function getFeed(name) {
  return knex.raw(`SELECT
      actions.id as id,
      actions.location as location,
      actions.created_at as created_at,
      actions.image_path as image_path,
      actions.text as text,
      action_types.code as action_type_code,
      users.name as user_name,
      teams.name as team_name
    FROM actions
    JOIN action_types ON action_types.id = actions.action_type_id
    JOIN users ON users.id = actions.user_id
    JOIN teams ON teams.id = actions.team_id
    WHERE
      action_types.code = 'IMAGE' OR
      action_types.code = 'TEXT'
    ORDER BY actions.created_at DESC
    LIMIT 100`
  )
  .then(result => {
    const rows = result.rows;

    if (_.isEmpty(rows)) {
      return [];
    }

    return _.map(rows, _actionToFeedObject);
  });
}

function createFeedItem(feedItem, trx) {
  if (!FEED_ITEM_TYPES.has(feedItem.type)) {
    throw new Error('Invalid feed item type ' + feedItem.type);
  }

  const dbRow = {
    'location':   feedItem.location.longitude + ',' + feedItem.location.latitude,
    'image_path': feedItem.imagePath,
    'text':       feedItem.text,
    'type':       feedItem.type
  };

  if (feedItem.user) {
    dbRow.user_id = knex.raw('(SELECT id from users WHERE uuid = ?)', [feedItem.user]);
  }

  trx = trx || knex;

  return trx.returning('id').insert(dbRow).into('feed_items')
    .then(rows => {
      if (_.isEmpty(rows)) {
        throw new Error('Feed item row creation failed: ' + dbRow);
      }

      return rows.length;
    });
}

function _actionToFeedObject(row) {
  var feedObj = {
    id: row['id'],
    type: row['action_type_code'],
    author: {
      name: row['user_name'],
      team: row['team_name']
    },
    location: {
      latitude: row.location.y,
      longitude: row.location.x
    },
    createdAt: row['created_at']
  };

  if (feedObj.type === 'IMAGE') {
    feedObj.url = GCS_CONFIG.baseUrl + '/' + GCS_CONFIG.bucketName + '/' + row['image_path']
  } else if (feedObj.type === 'TEXT') {
    feedObj.text = row.text;
  }

  return feedObj;
}

export {
  getFeed,
  createFeedItem
};
