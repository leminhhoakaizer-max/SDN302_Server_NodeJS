
export async function migrateTable(pool, sqlQuery, model, name) {
    const res = await pool.query(sqlQuery);
    const data = res.recordset;

    if (data.length > 0) {
        await model.deleteMany({});
        await model.insertMany(data);
        console.log(`Migrated "${name}" (${data.length} rows)`);
    } else {
        console.log(`Table "${name}" is empty. Skipped.`);
    }
}

// Mục tiêu: Define logic migrate chung cho 1 table
// Step: - Receive   - pool(SQL connection)
//                   - sqlQuery
//                   - Mongoose model
//                   - table name
//       - executive - Query SQL
//                   - Lấy recordset
//                   - Xóa Collection MongoDB
//                   - Insert all new data
// -> Reusable Migration Utility(Tiện ích di chuyển có thể tái dùng)