import _ from 'lodash';
const {knex} = require('../util/database').connect();

function createOrUpdateVote(vote) {
  // TODO: Check that feed_item_id is image and not system

  const updateSql = `
    WITH upsert AS
      (UPDATE votes SET value = ? WHERE user_id = ? AND feed_item_id = ? RETURNING *)
      INSERT INTO votes (value, user_id, feed_item_id)
      SELECT ?, ?, ? WHERE NOT EXISTS (SELECT * FROM upsert)
  `;
  const updateParams = [vote.value, vote.user_id, vote.feed_item_id,
    vote.value, vote.user_id, vote.feed_item_id];

  return knex.transaction(function(trx) {
    return knex.raw(updateSql, updateParams)
      .transacting(trx)
      .then(result => {
        return undefined;
      });
  });
}

export {
  createOrUpdateVote
};
