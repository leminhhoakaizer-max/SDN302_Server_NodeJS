import sql from "mssql";
import { sqlConfig } from "./sqlConfig.js";

export async function SQLConnection() {
    try {
        const pool = await sql.connect(sqlConfig);
        console.log("SQL Server connected.");
        return pool;
    } catch (error) {
        console.log("SQL connection error:", error);
    }
}

// Mục tiêu: Khởi tạo và quản lý connect SQL Server
// Step: - Dùng "mssql"  - connect SQL Server
//                       - return Connection Pool
//                       - Handle error connect
// -> infrastructure layer(lớp cơ sở hạ tầng)