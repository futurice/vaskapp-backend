import * as feedCore from '../core/feed-core';

const targetFolder = 'user_content';

/**
 * Get image by it's id.
 *
 * NOTE: id can't contain possible path
 */
function getImageById(opts) {
  return feedCore.getFeed({
    client:        opts.client,
    imagePath:     `${ targetFolder }/${ opts.imageId }`,
    type:          'IMAGE',
    includeSticky: false,
  }).then(images => images[0]);
}

/**
 * Get images
 *
 * @param {number} opts.userId
 */
function getImages(opts) {

  return feedCore.getFeed({
    client:        opts.client,
    userId:        opts.userId,
    type:          'IMAGE',
    includeSticky: false,
  });
}

export {
  targetFolder,
  getImageById,
  getImages
};
