// # imagesService
//      everything related to image manipulation
//
'use strict';

import BPromise from 'bluebird';
import gcs from '../util/gcs';
import * as actionCore from '../core/action-core';
import {createJsonRoute, throwStatus} from '../util/express';
import userCore from '../core/user-core';
import {assert} from '../validation';
import {decodeBase64Image} from '../utils/base64';

const gm = require('gm').subClass({ imageMagick: true });

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/gif', 'image/png'];

function getAndValidateActionType(type) {
  return actionCore.getActionType(action.type)
    .then(type => {
        if (type === null) {
          throwStatus(400, `Action type ${ action.type } does not exist`);
        }

        return type;
    });
}

const postImage(function(req, res) {
  const action = assert(req.body, 'action');
  const imageBuffer = decodeBase64Image(req.body.imageData);

  return BPromise.join(
    getAndValidateActionType(),
    uploadImage("diidadaapa", imageBuffer),
    function(type, image) {
      return actionCore.createAction(Object.assign({},
        req.body,
        { "image_url":  }
      )).then(rowsInserted => undefined);
    }
  )
  actionCore.getActionType(action.type)
    .then(type => {
        if (type === null) {
          throwStatus(400, `Action type ${ action.type } does not exist`);
        }

        return type;
    })
  uploadImage("diidadaapa", imageBuffer)
    .then(image => {
      console.log(image);
      return actionCore.getActionType(action.type)
        .then(type => {
        })
        .then(() => {
        });
    })
});

function uploadImage(imageName, imageFile) {

  return Promise.resolve()
    .then(() => validateMimeType(imageFile.mimetype))
    .then(() => autoOrient(imageFile.buffer))
    .then(buffers => gcs.uploadImage(imageName, imageFile.buffer));
};


function validateMimeType(mimetype) {
  if (ALLOWED_MIME_TYPES.has(mimetype)) {
    return Promise.resolve();
  } else {
    throw new Error(`Unsupported file type ${mimetype} uploaded`);
  }
}

function autoOrient(imageBuffer) {
  return new Promise((resolve, reject) => {
    gm(imageBuffer)
      .autoOrient()
      .toBuffer('JPG', ((error, resultBuffer) => {
        error ? reject(error) : resolve(resultBuffer);
      }));
  });
}

export {
  postImage
};
