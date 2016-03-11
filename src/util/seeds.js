var VERBOSE = process.env.VERBOSE_SEEDS === 'true';

// Inserts or updates a row to table
function insertOrUpdate(knex, table, row) {
  return knex(table).select().where('id', row.id)
    .then(rows => {
      if (rows.length > 0) {
        maybeLog('Update row id', row.id, 'in', table);
        return knex(table).where('id', row.id).update(row);
      } else {
        maybeLog('Insert row with id', row.id, 'to', table);
        return knex(table).insert(row);
      }
    });
}

function maybeLog() {
  if (VERBOSE) {
    console.log.apply(this, arguments);
  }
}

module.exports = {
  insertOrUpdate: insertOrUpdate
};
