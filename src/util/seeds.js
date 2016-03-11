// Inserts or updates a row to table
function insertOrUpdate(knex, table, row) {
  return knex(table).select().where('id', row.id)
    .then(rows => {
      if (rows.length > 0) {
        console.log('Update row id', row.id, 'in', table);
        return knex(table).where('id', row.id).update(row);
      } else {
        console.log('Insert row with id', row.id, 'to', table);
        return knex(table).insert(row);
      }
    });
}

module.exports = {
  insertOrUpdate: insertOrUpdate
};
