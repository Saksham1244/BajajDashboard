const { poolPromise } = require('./db');

async function test() {
  try {
    const pool = await poolPromise;
    console.log('Got pool, executing query...');
    const result = await pool.request().query('SELECT TOP 1 * FROM Prod_EnginePlanExecution');
    console.log('Query success:', result.recordset);
  } catch (err) {
    console.error('Query error:', err);
  } finally {
    process.exit(0);
  }
}

test();
