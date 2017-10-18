import _ from 'lodash';
import * as imageCore from './image-core';
import * as imageHttp from '../http/image-http';
import {decodeBase64Image} from '../util/base64';
const {knex} = require('../util/database').connect();
const BPromise = require('bluebird');
const uuidV1 = require('uuid/v1');

// const newComment = (action) =>  knex('comments').insert({
//   user_id: action.client.id,
//   feed_item_id: action.feedItemId,
//   text: action.text,
// })
// .catch((err) => {
//   if (err.constraint === 'comments_feed_item_id_foreign') {
//     const error = new Error('No such feed item id');
//     error.status = 404;
//     throw error;
//   }

//   throw err;
// });


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

  })
}






export {
  newComment,
};
