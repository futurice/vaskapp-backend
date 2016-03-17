import * as feedCore from '../core/feed-core';
import {createJsonRoute} from '../util/express';
import {assert} from '../validation';

let getFeed = createJsonRoute(function(req, res) {
  const feedParams = assert({
    beforeId: req.query.beforeId,
    limit: req.query.limit
  }, 'feedParams');

  return feedCore.getFeed(feedParams);
});

export {
  getFeed
};
