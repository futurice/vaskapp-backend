import _ from 'lodash';
import * as imageCore from './image-core';
import {pathToUrl} from '../util/gcs';
import * as imageHttp from '../http/image-http';
import {decodeBase64Image} from '../util/base64';
const {knex} = require('../util/database').connect();
const BPromise = require('bluebird');
const uuidV1 = require('uuid/v1');

function _makeCommentDbRow(action) {
  return {
    user_id: action.client.id,
    feed_item_id: action.feedItemId,
    text: action.text,
    image_path: action.imagePath
  };
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

// Get feed items
// Which have comments
// with user_id === req.client.id
function getConversations(opts) {
  let sqlString = `SELECT
      feed_items.id,
      feed_items.created_at as created_at,
      feed_items.image_path as image_path,
      feed_items.text as text,
      feed_items.type as action_type_code,
      users.id as user_id,
      users.name as user_name,
      users.profile_picture_url AS profile_picture_url,
      COUNT(comments) AS comment_count,
      comments.created_at AS comment_created_at,
      comments.text AS comment_text
    FROM feed_items
    LEFT JOIN users ON users.id = feed_items.user_id
    INNER JOIN comments ON comments.feed_item_id = feed_items.id AND comments.user_id = ?
    GROUP BY
        feed_items.id,
        users.name,
        users.id,
        comments.created_at,
        comments.text`;

  const params = [opts.client.id];

  return knex.raw(sqlString, params)
  .then(result => {
    const rows = result.rows;
    if (_.isEmpty(rows)) {
      return [];
    }

    return _.map(rows, _feedRowToObject);
  });
}


function _feedRowToObject(row) {
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
    commentCreatedAt: row['comment_created_at'],
    commentText: row['comment_text'],
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
