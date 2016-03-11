// # imagesService
//      everything related to image manipulation
//
'use strict';

import BPromise from 'bluebird';
import * as gcs from '../util/gcs';
import * as actionCore from '../core/action-core';
import {createJsonRoute, throwStatus} from '../util/express';
import * as userCore from '../core/user-core';
import {assert} from '../validation';
import {decodeBase64Image} from '../util/base64';

const gm = require('gm').subClass({ imageMagick: true });

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/gif', 'image/png']);

function getAndValidateActionType(type) {
  console.log("Validating type", type);
  return actionCore.getActionType(type)
    .then(typeId => {
      console.log("Got type", typeId);
        if (typeId === null) {
          throwStatus(400, `Action type ${ typeId } does not exist`);
        }

        return typeId;
    });
}

function getAndValidateUser(uuid) {
  console.log("Validating user", uuid);
  return userCore.findByUuid(uuid)
    .then(user => {
      console.log("Got user", user);

      if (user === null) {
        throwStatus(400, `User with uuid ${ uuid } does not exist`);
      }

      return user;
    });
}

const postImage = function(req, res) {
  const action = assert(req.body, 'action');
  console.log("req.body:", action);
  const imageBuffer = decodeBase64Image(req.body.imageData);
  console.log(imageBuffer.mimetype);

  const result = {};
  return getAndValidateActionType(action.type)
    .then(type => {
      result.type = type;
      return getAndValidateUser(action.user);
    })
    .then(user => {
      result.user = user;
      const fileName = `${ user.id }-${ Date.now() }`;
      return uploadImage(fileName, imageBuffer);
    })
    .then(image => {
      console.log(image);
      return actionCore.createAction({
        team: action.team,
        type: action.type,
        user: result.user.id,
        location: action.location,
        image_url: image.imageName
      }).then(rowsInserted => undefined);
    });
};

function uploadImage(imageName, imageFile) {
  console.log("Uploading", imageName);

  return Promise.resolve()
    .then(() => validateMimeType(imageFile.mimetype))
    .then(() => autoOrient(imageFile.buffer))
    .then(buffer => gcs.uploadImageBuffer(imageName, buffer));
};


function validateMimeType(mimetype) {
  if (ALLOWED_MIME_TYPES.has(mimetype)) {
    console.log("Valid mime");
    return Promise.resolve();
  } else {
    throw new Error(`Unsupported file type ${mimetype} uploaded`);
  }
}

function autoOrient(imageBuffer) {
    console.log("AUto orienting", imageBuffer);
    return imageBuffer;
  return new Promise((resolve, reject) => {
    try {
      gm(imageBuffer)
        .autoOrient()
        .toBuffer('JPG', ((error, resultBuffer) => {
          error ? reject(error) : resolve(resultBuffer);
        }));
    } catch (err) {
      console.log("ERROR");
      reject(err);
    }
  });
}

export {
  postImage
};
