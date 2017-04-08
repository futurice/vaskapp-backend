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

function uploadImage(imageName, imageFile, imageText) {
  logger.info('Uploading', imageName);

  return Promise.resolve()
    .then(() => validateMimeType(imageFile.mimetype))
    .then(() => {
      if (imageFile.mimetype === 'image/gif') {
        return imageFile.buffer;
      } else if (imageText) {
        return processImageText(imageFile.buffer, imageText);
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

function processImageText(imageBuffer, imageText) {

  const BAR_HEIGHT = 60;
  const BAR_COLOR = 'rgba(221, 73, 151, .6)';
  const FONT_SIZE = 38;
  const DEFAULT_WIDTH = 1024;
  const DEFAULT_HEIGHT = 1024;
  const TEXT_COLOR = '#FEFF77';
  const VERTICAL_TEXT_OFFSET = 2;
  const FONT_FAMILY = './CabinCondensed.ttf';

  let imageSize;
  return new Promise((resolve, reject) => {
    try {
      gm(imageBuffer)
        .autoOrient()
        .resize(DEFAULT_WIDTH, DEFAULT_HEIGHT)
        .toBuffer('JPG', (resizeError, resizedBuffer) => {
          if (resizeError) {
            reject(resizeError);
            return;
          }

          gm(resizedBuffer)
          .size((err, value) => {
            if (!value || err) {
              imageSize = { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT }
            } else {
              imageSize = value;
            }
            gm(resizedBuffer)
            .fill(BAR_COLOR)
            .drawRectangle(
              0,
              imageSize.height / 2 - BAR_HEIGHT / 2,
              imageSize.width,
              imageSize.height / 2 + BAR_HEIGHT / 2
              )
            .fill(TEXT_COLOR)
            .fontSize(FONT_SIZE)
            .font(FONT_FAMILY)
            .drawText(0, VERTICAL_TEXT_OFFSET, imageText, 'Center')
            .toBuffer('JPG', (error, resultBuffer) => {
              error ? reject(error) : resolve(resultBuffer);
            });
          })
      })
    } catch (err) {
      logger.error('Error in auto-orient:', err);
      logger.error(err.stack);
      reject(err);
    }
  });
}

const getImage = createJsonRoute(function(req, res) {
  const params = assert({
    imageId: req.params.id
  }, 'imageParams');

  return imageCore.getImageById(params.imageId)
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
  const { imageText } = req.body;
  const inputData = {};

  return getAndValidateActionType(action.type)
    .then(type => {
      inputData.type = type;

      return getAndValidateUser(action.user);
    })
    .then(user => {
      inputData.user = user;

      const fileName = `${ imageCore.targetFolder }/${ uuidV1() }`;
      return uploadImage(fileName, image, imageText);
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
