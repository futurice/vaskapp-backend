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
      ${ _getSelectSql(opts) }
    FROM wappu_feeling
    LEFT JOIN teams ON teams.id = wappu_feeling.user_id
    ${ _getWhereSql(opts) }
    GROUP BY
      wappu_feeling.created_at_fine,
      wappu_feeling.description,
      wappu_feeling.rating
  `;

  return knex.transaction(trx =>
    trx.raw(getFeelingSql)
    .then(result => result.rows)
    .catch(err => undefined)
  );
}

function _getSelectSql(opts) {
  let publicSql = `
    DATE_TRUNC('day', wappu_feeling.created_at_fine) AS date,
    ROUND(AVG(wappu_feeling.rating)::numeric, 4) AS avg_rating,
    COUNT(wappu_feeling.rating) AS votes_cast
  `;

  let personalSql = `
    DATE_TRUNC('day', created_at_fine) AS date,
    wappu_feeling.rating,
    wappu_feeling.description
  `;

  return opts.personal ? personalSql : publicSql;

}

function _getWhereSql(opts) {
  // Personal is the strictest, hence no other filter is required;
  if (opts.personal) {
    if (!opts.client) throw new Error('No client information passed');
    return knex.raw(
      ` WHERE wappu_feeling.user_id = ? `,
      [opts.client.id]
    ).toString();
  }

  let filters = [];
  let params = [];

  if (opts.cityId) {
    // TODO Pending PR
    // filters.push(``);
    // params.push();
  }

  if (opts.cityName) {
    // TODO Pending PR
    // filters.push(``);
    // params.push();
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
