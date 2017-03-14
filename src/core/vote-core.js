const {knex} = require('../util/database').connect();
import {hotScore} from './hot-score';

function createOrUpdateVote(opts) {

  const updateVoteSql = `
    WITH upsert AS
      (UPDATE votes SET value = ? WHERE user_id = ? AND feed_item_id = ? RETURNING *)
      INSERT INTO votes (value, user_id, feed_item_id)
      SELECT ?, ?, ? WHERE NOT EXISTS (SELECT * FROM upsert)
  `;

  const selectVotesSql = `
    SELECT
      feed_items.id as id,
      vote_score(feed_items) as votes,
      EXTRACT (EPOCH FROM feed_items.created_at) as age
    FROM feed_items
    WHERE feed_items.id = ?
    GROUP BY feed_items.id
  `;

  const updateFeedItemSql = `
    UPDATE feed_items
    SET hot_score = ?
    WHERE id = ?
  `;

  let vote = opts.vote;
  const updateVoteParams = [vote.value, vote.user_id, vote.feed_item_id,
    vote.value, vote.user_id, vote.feed_item_id];

  return knex.transaction(function(trx) {
    return trx.raw(updateVoteSql, updateVoteParams)
      .then(result => trx.raw(selectVotesSql, [vote.feed_item_id]))
      .then(result =>
        trx.raw(updateFeedItemSql, [
            hotScore(
              result.rows[0]['votes'],
              result.rows[0]['age']
            ),
            vote.feed_item_id,
          ])
      )
      .then(result => undefined)
      .catch(err => {
        let error = new Error('No such feed item id: ' + vote.feed_item_id);
        error.status = 404;
        throw error;
      });
  });
}

export {
  createOrUpdateVote
};
