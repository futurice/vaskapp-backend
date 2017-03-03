import * as voteCore from '../core/vote-core';
import {createJsonRoute, throwStatus} from '../util/express';
import {assert} from '../validation';

let putVote = createJsonRoute(function(req, res) {
  const vote = assert(req.body, 'vote');

  if (!req.client.id) {
    throwStatus(403);
  }

  return voteCore.createOrUpdateVote({
      vote: {
        value: vote.value,
        user_id: req.client.id,
        feed_item_id: vote.feedItemId,
      },
      client: req.client,
    })
    .then(() => undefined)
    .catch( err => {
      throwStatus(err.status, err.message);
    });
});

export {
  putVote
};
