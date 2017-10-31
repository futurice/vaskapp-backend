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

  // req.client
  return knex('comments')
    .select('*')
    .where('user_id', opts.client.id)
    .orderBy('created_at', 'desc')
    .then(rows => {
      if (_.isEmpty(rows)) {
        return [];
      }

      return _.map(rows, _commentRowToObject);
    });
}

function _commentRowToObject(row) {
  let obj = {
    text: row['text'],
    userName: row['userName'],
    userId: row['userId'],
    createdAt: row['createdAt'],
    imagePath: pathToUrl(row['imagePath']),
    profilePicture: pathToUrl(row['profilePicture']),
  };

  if (row.url) {
    obj.url = row.url;
  }

  return obj;
}



export {
  newComment,
  getConversations,
};
