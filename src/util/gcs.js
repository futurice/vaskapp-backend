'use strict';

import streamifier from 'streamifier';
import base64 from './base64';

const API_KEY = base64.decodeBase64String(process.env.GCS_API_KEY);
const gcloud = require('gcloud')(API_KEY);

const gcs = gcloud.storage();
const bucket = gcs.bucket(process.env.GCS_PROJECT_ID);

// # API
//
// uploadImage
function uploadImageBuffer(imageName, imageBuffer) {
  return new Promise(function(resolve, reject) {
    const file = bucket.file(imageName);

    streamifier.createReadStream(imageBuffer)
      .pipe(file.createWriteStream({
        metadata: { contentType: 'image/jpeg' }
      }))
      .on('error', function(error) {
        reject(error);
      })
      .on('finish', function() {
        file.makePublic(function(error, response) {
          if (error) {
            return reject(error);
          }
          resolve({
            imageName,
            uploaded: true
          });
        })
      });
  });
};

export {
  uploadImageBuffer
};
