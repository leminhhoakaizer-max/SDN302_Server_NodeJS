
import { DBConnection } from './DBContext.js';
import { SQLConnection } from './sql/connectSQL.js';

import Account from "../model/seeds/account.migration.model.js";
import Category from "../model/seeds/category.migration.model.js";
import Product from "../model/seeds/product.migration.model.js";

import { migrateTable } from '../utilities/migrateTables.js';

async function migrate() {

    //connect to [MongoDB]
    DBConnection();

    //connect to [SQL Server]
    const pool = await SQLConnection();

    try {
        // List of Tables
        const tables = [
            { sql: 'SELECT * FROM accounts', model: Account, name: 'accounts' },
            { sql: 'SELECT * FROM categories', model: Category, name: 'categories' },
            { sql: 'SELECT * FROM products', model: Product, name: 'products' }
        ];

        // Mỗi vòng lặp [for loop] => xử lý 1 table(accounts, categories, products)
        // List of Migrate Tables
        for (let t of tables) {
            await migrateTable(pool, t.sql, t.model, t.name);
        }

        console.log('All tables migrated successfully!');
        await pool.close(); // Đảm bảo đóng kết nối

    } catch (error) {
        console.log('Migration error: ', error);
        await pool.close();
    }
}

migrate();

// Mục tiêu: Điều phối(orchestrate) all process SQL -> MongoDB
// Step: - Import dependencies: [SQLConnection, DBConnection]
//       - Import MongoDB models: [model/seeds/...]
//       - Import migrate Utility: [migrateTable]
//       - Connect MongoDB
//       - Connect SQL Server 
//       - Khai báo List tables cần để migrate
//       - Lặp && migrate từng table
//       - Close SQL connect
//       - Log && finish
// -> Entry Point của migration