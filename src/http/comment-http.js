import _ from 'lodash';
import * as commentCore from '../core/comment-core';
import {createJsonRoute} from '../util/express';


let getConversations = createJsonRoute(function(req, res) {
  const conversationParams = assert({
    limit: req.query.limit,
  }, 'conversations');

  const coreParams = _.merge(conversationParams, {
    client: req.client
  });

  return commentCore.getConversations(coreParams);
});

export {
  getConversations,
};
