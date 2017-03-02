import _ from 'lodash';
const {knex} = require('../util/database').connect();
import {hotScore} from '../sort';

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
      votes(feed_items) as votes,
      EXTRACT (EPOCH FROM feed_items.created_at) as age
    FROM feed_items
    WHERE feed_items.id = ?
    GROUP BY feed_items.id
  `;

  const updateFeedItemSql = `
    UPDATE
      feed_items
    SET
      hot_score = ?
    WHERE
      id = ?
    RETURNING
      *,
      votes(feed_items)
  `;

  let vote = opts.vote;
  const updateVoteParams = [vote.value, vote.user_id, vote.feed_item_id,
    vote.value, vote.user_id, vote.feed_item_id];

  return knex.transaction(function(trx) {
    return knex.raw(updateVoteSql, updateVoteParams)
      .transacting(trx)
      .then(result => {
        return knex.raw(selectVotesSql, [vote.feed_item_id])
          .transacting(trx);
      })
      .then(result => {
        return knex.raw(updateFeedItemSql, [
            hotScore(
              result.rows[0]['votes'],
              result.rows[0]['age']
            ),
            vote.feed_item_id,
          ])
          .transacting(trx);
      })
      .then(result =>{
        console.log(result);
        return result;
      })
      .catch(err => {
        console.log(err);
        return undefined
      });
  });
}

export {
  createOrUpdateVote
};
