// Inserts or updates a row to table
function insertOrUpdate(knex, table, row) {
  return knex(table).select().where('id', row.id)
    .then(rows => {
      if (rows.length > 0) {
        return knex(table).where('id', row.id).update(row);
      } else {
        return knex(table).insert(row);
      }
    });
}

module.exports = {
  insertOrUpdate: insertOrUpdate
};
