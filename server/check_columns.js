const { poolPromise } = require('./db');
async function check() {
  const pool = await poolPromise;
  const res = await pool.request().query(`
    SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME IN ('QA_AuditMonitoring', 'Prod_Defect_Log', 'Prod_Engine_WIP', 'Perf_Hourly_OLE')
    ORDER BY TABLE_NAME, ORDINAL_POSITION
  `);
  console.log(res.recordset);
  process.exit(0);
}
check();
