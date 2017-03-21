var VERBOSE = process.env.VERBOSE_SEEDS === 'true';

// Inserts or updates a row to table
function insertOrUpdate(knex, table, row, column) {
  column = column || 'id';

  return knex(table).select().where(column, row[column])
    .then(rows => {
      if (rows.length > 0) {
        maybeLog('Update row', column, row[column], 'in', table);
        return knex(table).where(column, row[column]).update(row);
      } else {
        maybeLog('Insert row', column, row[column], 'in', table);
        return knex(table).insert(row);
      }
    });
}

// Removes a row if one exists. USE WITH CARE as seeds will
// fail if you attempt to delete a row on which other
// entries depend upon.
function removeIfExists(knex, table, row, column) {
  column = column || 'id';

  return knex(table).where(column, row[column]).del()
    .then(deleted => {
      maybeLog('Removed', deleted, 'from', table, 'where', column, '=', row[column]);
    });
}

function maybeLog() {
  if (VERBOSE) {
    console.log.apply(this, arguments);
  }
}

module.exports = {
  insertOrUpdate: insertOrUpdate,
  removeIfExists: removeIfExists,
};
