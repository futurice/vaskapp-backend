import _ from 'lodash';
const {knex} = require('../util/database').connect();
import {GCS_CONFIG} from '../util/gcs';
const logger = require('../util/logger')(__filename);

function getFeed(opts) {
  opts = _.merge({
    limit: 20
  }, opts);

  let sqlString = `SELECT
      actions.id as id,
      actions.location as location,
      actions.created_at as created_at,
      actions.image_path as image_path,
      actions.text as text,
      action_types.code as action_type_code,
      users.name as user_name,
      users.uuid as user_uuid,
      teams.name as team_name
    FROM actions
    JOIN action_types ON action_types.id = actions.action_type_id
    JOIN users ON users.id = actions.user_id
    JOIN teams ON teams.id = actions.team_id
    WHERE
      (action_types.code = 'IMAGE' OR
      action_types.code = 'TEXT')`;
  let params = [];

  if (opts.beforeId) {
    sqlString += ` AND actions.id < ? `
    params.push(opts.beforeId);
  }

  sqlString += `ORDER BY actions.id DESC LIMIT ?`;
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

function deleteFeedItem(id, clientUuid) {
  return knex('actions').delete().where({
    'id': id,
    'user_id': knex.raw('(SELECT id from users WHERE uuid = ?)', [clientUuid])
  })
  .then(deletedCount => {
    if (deletedCount > 1) {
      logger.error('Deleted feed item', id, 'client uuid:', clientUuid);
      throw new Error('Unexpected amount of deletes happened: ' + deletedCount)
    }

    return deletedCount;
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
  deleteFeedItem
};
