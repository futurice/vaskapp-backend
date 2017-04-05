// # imagesService
//      everything related to image manipulation
//
'use strict';

import * as gcs from '../util/gcs';
import * as actionCore from '../core/action-core';
import {createJsonRoute, throwStatus} from '../util/express';
import * as userCore from '../core/user-core';
import * as imageCore from '../core/image-core';
import {assert} from '../validation';
import {decodeBase64Image} from '../util/base64';
const logger = require('../util/logger')(__filename);
const uuidV1 = require('uuid/v1');

const gm = require('gm').subClass({ imageMagick: true });

const TARGET_FOLDER = 'user_content';
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/gif', 'image/png']);

function getAndValidateActionType(typeName) {
  return actionCore.getActionType(typeName)
    .then(type => {
      if (type === null) {
        throwStatus(400, `Action type ${ typeName } does not exist`);
      }

      return type;
    });
}

function getAndValidateUser(uuid) {
  return userCore.findByUuid(uuid)
    .then(user => {
      if (user === null) {
        throwStatus(400, `User with uuid ${ uuid } does not exist`);
      }

      return user;
    });
}

function uploadImage(imageName, imageFile) {
  logger.info('Uploading', imageName);

  return Promise.resolve()
    .then(() => validateMimeType(imageFile.mimetype))
    .then(() => {
      if (imageFile.mimetype === 'image/gif') {
        return imageFile.buffer;
      } else {
        return autoOrient(imageFile.buffer);
      }
    })
    .then(buffer => gcs.uploadImageBuffer(imageName, buffer));
};

function validateMimeType(mimetype) {
  if (ALLOWED_MIME_TYPES.has(mimetype)) {
    return Promise.resolve();
  } else {
    throw new Error(`Unsupported file type ${ mimetype } uploaded`);
  }
}

function autoOrient(imageBuffer) {
  return new Promise((resolve, reject) => {
    try {
      gm(imageBuffer)
        .autoOrient()
        .toBuffer('JPG', (error, resultBuffer) => {
          error ? reject(error) : resolve(resultBuffer);
        });
    } catch (err) {
      logger.error('Error in auto-orient:', err);
      logger.error(err.stack);
      reject(err);
    }
  });
}

const getImage = createJsonRoute(function(req, res) {
  return imageCore.getImageById(req.params.id)
    .then(image => {
      if (!image) {
        throwStatus(404, 'No such image id');
      } else {
        return image;
      }
    });
});

function postImage(req, res) {
  const action = assert(req.body, 'action');

  const image = decodeBase64Image(req.body.imageData);
  const inputData = {};

  return getAndValidateActionType(action.type)
    .then(type => {
      inputData.type = type;

      return getAndValidateUser(action.user);
    })
    .then(user => {
      inputData.user = user;

      const fileName = `${ TARGET_FOLDER }/${ uuidV1() }`;
      return uploadImage(fileName, image);
    })
    .then(uploadedImage => {
      return actionCore.createAction({
        ip:        req.ip,
        isBanned:  req.client.isBanned,
        type:      action.type,
        user:      action.user,
        location:  action.location,
        imagePath: uploadedImage.imageName,
        city:      action.city,
        client:    req.client
      }).then(rowsInserted => undefined);
    });
};

export {
  getImage,
  postImage
};
