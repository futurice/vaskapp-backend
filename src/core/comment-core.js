import _ from 'lodash';
import * as imageCore from './image-core';
import {pathToUrl} from '../util/gcs';
import * as imageHttp from '../http/image-http';
import {decodeBase64Image} from '../util/base64';
const {knex} = require('../util/database').connect();
const BPromise = require('bluebird');
const uuidV1 = require('uuid/v1');

function _makeCommentDbRow(action) {
  const row = {
    user_id: action.client.id,
    feed_item_id: action.feedItemId
  };

  if (action.text) {
    row.text = action.text;
  }

  if (action.imagePath) {
    row.image_path = action.imagePath;
  }

  return row;
}

function newComment(action) {
  // image if needed
  const filePath = `${ imageCore.targetFolder }/${ uuidV1() }`;

  const saveImage = action.imageData
    ? imageHttp.uploadImage(filePath, decodeBase64Image(action.imageData))
    : BPromise.resolve(null);

  return saveImage.then(imgPath => {
    const imgUpdate = imgPath ? { imagePath: imgPath.imageName } : {};
    const commentUpdate = _.merge({}, action, imgUpdate);
    const dbRow = _makeCommentDbRow(commentUpdate);

    knex('comments').insert(dbRow)
    .catch((err) => {
      if (err.constraint === 'comments_feed_item_id_foreign') {
        const error = new Error('No such feed item id');
        error.status = 404;
        throw error;
      }

      throw err;
    });

  });
}

// Get relevant feed items for user aka 'conversations'
// TODO
// - SQL get only one row per feed-item
// - require item to have comments from someone else than user
function getConversations(opts) {
  let sqlString = `SELECT
      feed_items.id,
      feed_items.created_at as created_at,
      feed_items.image_path as image_path,
      feed_items.text as text,
      feed_items.type as action_type_code,
      u1.id as user_id,
      u1.name as user_name,
      u1.profile_picture_url AS profile_picture_url,
      COUNT(comments) AS comment_count,
      comments.created_at AS comment_created_at,
      comments.text AS comment_text,
      comments.image_path AS comment_image,
      u2.name as comment_name
    FROM feed_items
    LEFT JOIN users as u1 ON u1.id = feed_items.user_id
    LEFT JOIN comments ON comments.feed_item_id = feed_items.id
    LEFT JOIN users as u2 ON u2.id = comments.user_id
    WHERE feed_items.id in (
      SELECT feed_items.id FROM feed_items WHERE feed_items.user_id = ?
      union all
      SELECT DISTINCT comments.feed_item_id FROM comments WHERE comments.user_id = ?
    )
    GROUP BY
        feed_items.id,
        u1.name,
        u1.id,
        comments.created_at,
        comments.text,
        comments.image_path,
        u2.id,
        u2.name
   HAVING COUNT(comments) >= 1`;

  const params = [opts.client.id, opts.client.id];

  return knex.raw(sqlString, params)
  .then(result => {
    const rows = result.rows;
    if (_.isEmpty(rows)) {
      return [];
    }

    const conversations = _processConversations(rows);

    return _.map(conversations, _conversationRowToObject);
  });
}

// Find unique feed items
// with latest comment
function _processConversations(data) {
  return _
    .chain(data)
    .groupBy(item => item.id)
    .map(itemsById => _.maxBy(itemsById, item => item.comment_created_at))
    .value();
}

function _conversationRowToObject(row) {
  var obj = {
    id: row['id'],
    type: row['action_type_code'],
    author: {
      id: row['user_id'],
      name: row['user_name'],
      profilePicture: pathToUrl(row['profile_picture_url']),
    },
    text: row.text,
    createdAt: row['created_at'],
    commentCount: row['comment_count'],
    comment : {
      createdAt: row['comment_created_at'],
      text: row['comment_text'],
      image: pathToUrl(row['comment_image']),
      name: row['comment_name']
    }
  };

  if (row['image_path']) {
    obj.url = pathToUrl(row['image_path']);
  }

  return obj;
}



export {
  newComment,
  getConversations,
};
