
export const sqlConfig = {
    user: 'sa',
    password: '12345',
    database: 'ElectronicProduct',
    server: 'localhost',
    options: { 
        encrypt: false,
        trustServerCertificate: true
    },
    port: 1433
};

// Mục tiêu: Single Source of config (cấu hình kết nối SQL)
// Step: khai báo    - user/password
//                   - Database
//                   - Server/Port
//                   - Options bảo mật
// -> Ko executive chỉ Export config