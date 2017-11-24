import _ from 'lodash';
import * as commentCore from '../core/comment-core';
import {createJsonRoute} from '../util/express';
import {assert} from '../validation';


let getConversations = createJsonRoute(function(req, res) {
  const coreParams = { client: req.client };

  return commentCore.getConversations(coreParams);
});


let getConversationsCount = createJsonRoute(function(req, res) {
  const conversationParams = assert({
    since: req.query.since,
  }, 'conversations');

  const coreParams = _.merge(conversationParams, {
    client: req.client
  });

  return commentCore.getConversationCountSince(coreParams);
});


export {
  getConversations,
  getConversationsCount,
};
