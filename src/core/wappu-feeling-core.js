const {knex} = require('../util/database').connect();


function createOrUpdateFeeling(opts) {
  const upsertFeelingSql = `
    WITH upsert AS
      (UPDATE
        wappu_feeling
      SET
        rating = ?,
        description = ?
      WHERE
        user_id = ? AND created_at_coarse = CURRENT_DATE
      RETURNING *)
      INSERT INTO wappu_feeling (user_id, rating, description)
      SELECT ?, ?, ? WHERE NOT EXISTS (SELECT * FROM upsert)
  `;

  const params = [
    opts.rating, opts.description, opts.client.id,
    opts.client.id, opts.rating, opts.description
  ];

  return knex.transaction(trx =>
    trx.raw(upsertFeelingSql, params)
    .then(result => undefined)
    .catch(err => undefined)
  );
}


function getFeeling(opts) {
  const getFeelingSql = `
    SELECT * FROM wappu_feeling
  `;

  return knex.transaction(trx =>
    trx.raw(getFeelingSql)
    .then(result => result.rows)
    .catch(err => undefined)
  );
}
export {
  createOrUpdateFeeling,
  getFeeling,
};
