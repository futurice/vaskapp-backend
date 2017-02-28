import _ from 'lodash';
const {knex} = require('../util/database').connect();
import CONST from '../constants';

function createOrUpdateVote(vote) {

  const updateVoteSql = `
    WITH upsert AS
      (UPDATE votes SET value = ? WHERE user_id = ? AND feed_item_id = ? RETURNING *)
      INSERT INTO votes (value, user_id, feed_item_id)
      SELECT ?, ?, ? WHERE NOT EXISTS (SELECT * FROM upsert)
  `;

  const selectVotesSql = `
    SELECT
      feed_items.id as id,
      COALESCE(SUM(votes.value), 0) as absolute_votes,
      EXTRACT (EPOCH FROM feed_items.created_at) as age
    FROM feed_items
    LEFT OUTER JOIN votes ON votes.feed_item_id = feed_items.id
    WHERE feed_items.id = ?
    GROUP BY feed_items.id
  `;

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
        return knex('feed_items')
          .where('id', '=', vote.feed_item_id)
          .update({
            hot_score: _calculateHotnessScore(
              result.rows[0]['absolute_votes'],
              result.rows[0]['age']
            )
          })
          .transacting(trx);
      })
      .then(result => undefined)
      .catch(err => undefined);
  });
}

function _calculateHotnessScore(votes, age) {
  let order = Math.log10(Math.max(Math.abs(votes), 1));
  let sign = Math.sign(votes);
  return Math.round(order + sign * age / CONST.FEED_DECAY_INTERVAL);
}

export {
  createOrUpdateVote
};
