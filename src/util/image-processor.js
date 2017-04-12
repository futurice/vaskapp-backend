'use strict';

const gm = require('gm').subClass({ imageMagick: true });
const logger = require('../util/logger')(__filename);

// # Image Caption settings
const BAR_HEIGHT = 60;
const BAR_COLOR = 'rgba(221, 73, 151, .6)';
const FONT_SIZE = 38;
const DEFAULT_WIDTH = 1024;
const DEFAULT_HEIGHT = 1024;
const TEXT_COLOR = '#FEFF77';

// # Helper functions to calculate position of Image Caption Elements

// y0 of rectangle
// prevent drawing over image
function getRectangleTop(imageHeight, rectPosition, rectHeight) {
  return Math.min(
    imageHeight * rectPosition,
    imageHeight - rectHeight
  );
}

// y1 of rectangle
// prevent drawing over image
function getRectangleBottom(imageHeight, rectPosition, rectHeight) {
  return Math.min(
    imageHeight * rectPosition + rectHeight,
    imageHeight
  );
}
// Text position
// Calculate vertical offset from center
// rectPosition [0, 1]
const textBaselineAdjust = 2;
function getTextPositionFromCenter (imageHeight, rectPosition, rectHeight) {
  return Math.min(
    (rectPosition - 0.5) * imageHeight + rectHeight / 2,
    imageHeight / 2 - rectHeight / 2
  ) + textBaselineAdjust;
}

const emojiReplacer = (text = '') =>
  text
  .replace(/😀/g, ':)')
  .replace(/😁/g, ':D')
  .replace(/😂/g, ':D')
  .replace(/🤣/g, ':D')
  .replace(/😃/g, '=D')
  .replace(/😄/g, '=)')
  .replace(/😅/g, ':)')
  .replace(/😆/g, 'x)')
  .replace(/😉/g, ';)')
  .replace(/😎/g, 'B)')
  .replace(/😍/g, ':)')
  .replace(/😘/g, ':)')
  .replace(/😗/g, ':)')
  .replace(/😙/g, ':)')
  .replace(/🙂/g, ':)')
  .replace(/🤗/g, ':)')
  .replace(/🤔/g, '')
  .replace(/😐/g, ':|')
  .replace(/😝/g, 'xP')
  .replace(/😜/g, ';P')
  .replace(/😓/g, ';(')
  .replace(/☹/g, ':(')
  .replace(/🙁/g, ':(')
  .replace(/😢/g, ':`(')
  .replace(/😦/g, ':(')
  .replace(/😩/g, ':(')
  .replace(/😬/g, ':()')
  .replace(/😰/g, ':()')
  .replace(/😵/g, 'x()');

// # Drawing image with Caption
// Images with caption are resized to default max dimensions
function processImageWithCaption(imageBuffer, { imageText = '', imageTextPosition = 0.5 }) {
  const textPosition = parseFloat(imageTextPosition);
  const formattedImageText = emojiReplacer(imageText);

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

          // Get size of resized image
          gm(resizedBuffer)
          .size((err, value) => {
            const imageSize = !value || err
              ? { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT }
              : value;

            // Start drawing on top of resized img
            gm(resizedBuffer)
            // Draw background for text
            .fill(BAR_COLOR)
            .drawRectangle(
              0,
              getRectangleTop(imageSize.height, textPosition, BAR_HEIGHT),
              imageSize.width,
              getRectangleBottom(imageSize.height, textPosition, BAR_HEIGHT)
            )
            // Draw text
            .fill(TEXT_COLOR)
            .fontSize(FONT_SIZE)
            .encoding('Unicode')
            .drawText(
              0,
              getTextPositionFromCenter(imageSize.height, textPosition, BAR_HEIGHT),
              formattedImageText,
              'Center'
            )
            .toBuffer('JPG', (error, resultBuffer) => {
              error ? reject(error) : resolve(resultBuffer);
            });
          })
      })
    } catch (err) {
      logger.error('Error with drawing image caption:', err);
      logger.error(err.stack);
      reject(err);
    }
  });
}

// Images without caption are just being autoOriented
// These images are not resized to default dimensions
function processImageWithoutCaption(imageBuffer) {
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

function processImage(imageBuffer, imageOpts = {}) {
  if (imageOpts.imageText) {
    return processImageWithCaption(imageBuffer, imageOpts);
  } else {
    return processImageWithoutCaption(imageBuffer);
  }
}


export {
  processImage
};
