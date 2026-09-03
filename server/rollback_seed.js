const { poolPromise } = require('./db.js');

async function rollbackDatabase() {
  const pool = await poolPromise;
  console.log('=====================================================');
  console.log('  STARTING DATABASE ROLLBACK TO PRE-SEED SNAPSHOT');
  console.log('=====================================================');

  const tables = [
    'Prod_Shift_Plan',
    'Prod_EnginePlanExecution',
    'Perf_Hourly_OLE',
    'Perf_Downtime',
    'Prod_Engine_WIP',
    'Prod_Defect_Log',
    'QA_AuditMonitoring',
    'Maint_BreakDown_Log'
  ];

  let restoredCount = 0;

  for (const t of tables) {
    const checkBak = await pool.request().query(`
      SELECT OBJECT_ID('dbo._Bak_${t}', 'U') as existsTable
    `);

    if (checkBak.recordset[0]?.existsTable) {
      console.log(`Restoring dbo.[${t}] from dbo.[_Bak_${t}]...`);

      const isIdentity = await pool.request().query(`
        SELECT COLUMNPROPERTY(object_id('dbo.[${t}]'), COLUMN_NAME, 'IsIdentity') as isId
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = '${t}' AND COLUMNPROPERTY(object_id('dbo.[${t}]'), COLUMN_NAME, 'IsIdentity') = 1
      `);

      const hasId = isIdentity.recordset.some(r => r.isId === 1);
      const colList = await getColumnList(pool, t);

      await pool.request().query(`
        DELETE FROM dbo.[${t}];
        ${hasId ? `SET IDENTITY_INSERT dbo.[${t}] ON;` : ''}
        INSERT INTO dbo.[${t}] (${colList})
        SELECT ${colList} FROM dbo.[_Bak_${t}];
        ${hasId ? `SET IDENTITY_INSERT dbo.[${t}] OFF;` : ''}
      `);
      restoredCount++;
      console.log(`? Restored dbo.[${t}]`);
    } else {
      console.log(`? No backup snapshot table found for _Bak_${t}, skipped.`);
    }
  }

  console.log('\n=====================================================');
  console.log(`  ROLLBACK COMPLETED: ${restoredCount} TABLES RESTORED`);
  console.log('=====================================================\n');
  process.exit(0);
}

async function getColumnList(pool, tableName) {
  const cols = await pool.request().query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = '${tableName}'
    ORDER BY ORDINAL_POSITION
  `);
  return cols.recordset.map(c => `[${c.COLUMN_NAME}]`).join(', ');
}

rollbackDatabase().catch(e => {
  console.error('Fatal Rollback Error:', e);
  process.exit(1);
});
