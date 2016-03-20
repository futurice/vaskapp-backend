import _ from 'lodash';
const {knex} = require('../util/database').connect();
import {GCS_CONFIG} from '../util/gcs';

const FEED_ITEM_TYPES = new Set(['IMAGE', 'TEXT', 'CHECK_IN']);

function getFeed(opts) {
  opts = _.merge({
    limit: 20
  }, opts);

  let sqlString = `SELECT
      feed_items.id as id,
      feed_items.location as location,
      feed_items.created_at as created_at,
      feed_items.image_path as image_path,
      feed_items.text as text,
      feed_items.type as action_type_code,
      COALESCE(users.name, 'SYSTEM') as user_name,
      users.uuid as user_uuid,
      teams.name as team_name
    FROM feed_items
    LEFT JOIN users ON users.id = feed_items.user_id
    LEFT JOIN teams ON teams.id = users.team_id`;
  let params = [];

  if (opts.beforeId) {
    sqlString += ` AND actions.id < ? `
    params.push(opts.beforeId);
  }

  sqlString += ` ORDER BY feed_items.id DESC LIMIT ?`;
  params.push(opts.limit);

  return knex.raw(sqlString, params)
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
