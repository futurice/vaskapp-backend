import * as feedCore from '../core/feed-core';
import {createJsonRoute} from '../util/express';

let getFeed = createJsonRoute(function(req, res) {
  return feedCore.getFeed();
});

export {
  getFeed
};
