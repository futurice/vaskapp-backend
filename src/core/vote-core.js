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
      COALESCE(SUM(votes.value), 0) as votes,
      EXTRACT (EPOCH FROM feed_items.created_at) as age
    FROM feed_items
    LEFT OUTER JOIN votes ON votes.feed_item_id = feed_items.id
    WHERE feed_items.id = ?
    GROUP BY feed_items.id
  `;
  let vote = opts.vote;

  const updateVoteParams = [vote.value, vote.user_id, vote.feed_item_id,
    vote.value, vote.user_id, vote.feed_item_id];

  return knex.transaction(function(trx) {
    let tmp = knex('feed_items')
      .where('id', '=', vote.feed_item_id)
      .returning(['*'])
      .update({ hot_score: hotScore(0, 0) })
      .transacting(trx).toString();
    console.log(tmp);

    return knex.raw(updateVoteSql, updateVoteParams)
      .transacting(trx)
      .then(result => {
        return knex.raw(selectVotesSql, [vote.feed_item_id])
          .transacting(trx);
      })
      .then(result => {
        return knex('feed_items')
          .update({
            hot_score: hotScore(
              result.rows[0]['votes'],
              result.rows[0]['age']
            )
          })
          .where('id', '=', vote.feed_item_id)
          .returning(['*'])
          .transacting(trx);
      })
      // TODO
      // Sanitize the result and add vote count to the returned object
      .then(result => result)
      // TODO
      // 404
      .catch(err => undefined);
  });
}

export {
  createOrUpdateVote
};
