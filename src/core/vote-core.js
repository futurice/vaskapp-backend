import _ from 'lodash';
const {knex} = require('../util/database').connect();

function createOrUpdateVote(vote) {

  const updateSql = `
    WITH upsert AS
      (UPDATE votes SET value = ? WHERE user_id = ? AND feed_item_id = ? RETURNING *)
      INSERT INTO votes (value, user_id, feed_item_id)
      SELECT ?, ?, ? WHERE NOT EXISTS (SELECT * FROM upsert)
  `;

  const updateParams = [vote.value, vote.user_id, vote.feed_item_id,
    vote.value, vote.user_id, vote.feed_item_id];

  return knex.transaction(function(trx) {
    return knex.select()
      .from('feed_items')
      .where({ id: vote.feed_item_id })
      .first()
      .then(row => {
        if (!!row && row.type === 'SYSTEM') Promise.reject();
        return knex.raw(updateSql, updateParams)
          .transacting(trx);
      })
      .catch(err => {
        return undefined;
      })
      .then(result => {
        return undefined;
      });
  });
}

export {
  createOrUpdateVote
};
