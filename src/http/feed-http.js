import _ from 'lodash';
import * as feedCore from '../core/feed-core';
import {createJsonRoute, throwStatus} from '../util/express';
import {assert} from '../validation';


const getFeed = createJsonRoute(function(req, res) {
  const feedParams = assert({
    beforeId: req.query.beforeId,
    limit: req.query.limit,
    city: req.query.city,
    sort: req.query.sort,
  }, 'feedParams');

  const coreParams = _.merge(feedParams, {
    client: req.client
  });
  return feedCore.getFeed(coreParams);
});

const deleteFeedItem = createJsonRoute(function(req, res) {
  const id = assert(req.params.id, 'common.primaryKeyId');

  return feedCore.deleteFeedItem(id, {client: req.client})
  .then(deletedCount => {
    if (deletedCount === 0) {
      // NOTE: deletedCount === 0, might also mean "forbidden" because the uuid
      // restriction is done in the SQL
      // In both cases, we just inform the user with Not Found
      return throwStatus(404, 'Not Found');
    } else {
      // Return 200 OK
      return undefined;
    }
  });
});

export {
  getFeed,
  deleteFeedItem
};
