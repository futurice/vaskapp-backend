'use strict';
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
function getTextPositionFromCenter (imageHeight, rectPosition, rectHeight) {
  return Math.min(
    (rectPosition - 0.5) * imageHeight + rectHeight / 2,
    imageHeight / 2 - rectHeight / 2
  );
}

export {
  getRectangleTop,
  getRectangleBottom,
  getTextPositionFromCenter
};
