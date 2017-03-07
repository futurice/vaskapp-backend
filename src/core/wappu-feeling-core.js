const {knex} = require('../util/database').connect();


function createOrUpdateFeeling(opts) {
  const upsertFeelingSql = `
    WITH upsert AS
      (UPDATE
        wappu_feeling
      SET
        rating = ?,
        description = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE
        user_id = ? AND created_at_coarse = CURRENT_DATE
      RETURNING
        *
      )
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
    SELECT
      DATE_TRUNC('day', created_at_fine) AS date,
      ROUND(AVG(rating)::numeric, 4) AS avg_rating,
      COUNT(rating) AS votes_cast
    FROM wappu_feeling
    LEFT JOIN teams ON teams.id = wappu_feeling.user_id
    ${ _filterSql(opts) }
    GROUP BY wappu_feeling.created_at_fine
  `;

  return knex.transaction(trx =>
    trx.raw(getFeelingSql)
    .then(result => result.rows)
    .catch(err => {console.log(err); return undefined})
  );
}

function _filterSql(opts) {
  let filters = [];
  let params = [];

  if (opts.cityId) {
    // TODO Pending PR
    // filters.push(``);
  }

  if (opts.cityName) {
    // TODO Pending PR
    // filters.push(``);
  }

  if (opts.teamId) {
    filters.push(`teams.id = ?`);
    params.push(opts.teamId);
  }

  if (params.teamName) {
    filters.push(`teams.name = ?`);
    params.push(opts.teamName);
  }

  let sqlString = filters.length > 0 ? ` WHERE ${ filters.join(' AND ')} ` : ''

  return knex.raw(sqlString, params).toString();
}

export {
  createOrUpdateFeeling,
  getFeeling,
};
