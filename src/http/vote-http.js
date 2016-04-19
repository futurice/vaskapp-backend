import * as voteCore from '../core/vote-core';
import {createJsonRoute, throwStatus} from '../util/express';
import {assert} from '../validation';

let putVote = createJsonRoute(function(req, res) {
  const vote = assert(req.body, 'vote');
  console.log(vote);

  if (!req.client.id) {
    throwStatus(403);
  }

  return voteCore.createOrUpdateVote({
      value: vote.value,
      user_id: req.client.id,
      feed_item_id: vote.feedItemId
    })
    .then(rowsInserted => undefined);
});

export {
  putVote
};
