import _ from 'lodash';
const {knex} = require('../util/database').connect();
import {hotScore} from '../sort';
import {actionToFeedObject} from './feed-core';

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
    FROM feed_items as feed_item
    LEFT JOIN users ON users.id = feed_item.user_id
    LEFT JOIN teams ON teams.id = users.team_id
    WHERE
      feed_items.id = ? AND feed_items.id = feed_item.id
    RETURNING
      feed_items.id as id,
      feed_items.location as location,
      feed_items.created_at as created_at,
      feed_items.image_path as image_path,
      feed_items.text as text,
      feed_items.type as action_type_code,
      COALESCE(users.name, 'SYSTEM') as user_name,
      users.uuid as user_uuid,
      teams.name as team_name,
      votes(feed_items) as votes,
      feed_items.hot_score as hot_score,
      feed_items.is_sticky
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
      .then(result =>
        knex.raw(updateFeedItemSql, [
            hotScore(
              result.rows[0]['votes'],
              result.rows[0]['age']
            ),
            vote.feed_item_id,
          ])
          .transacting(trx)
      )
      .then(result => actionToFeedObject(result.rows[0], opts.client))
      .catch(err => undefined);
  });
}

export {
  createOrUpdateVote
};
