const { sql, poolPromise } = require('./db.js');
async function check() {
    const pool = await poolPromise;
    const res = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Prod_Shift_Plan'");
    console.log('Prod_Shift_Plan', res.recordset.map(r=>r.COLUMN_NAME));
    process.exit(0);
}
check();
