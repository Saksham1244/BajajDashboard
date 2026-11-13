const fs = require('fs');
const path = require('path');
const { poolPromise } = require('./server/db');

async function backupAllSPs() {
  const pool = await poolPromise;
  if (!pool) {
    console.error('Cannot connect to DB');
    process.exit(1);
  }

  console.log('Querying all stored procedures from PPMS_BajajPant...');
  const result = await pool.request().query(`
    SELECT 
      p.name,
      p.object_id,
      p.create_date,
      p.modify_date,
      OBJECT_DEFINITION(p.object_id) AS definition
    FROM sys.procedures p
    ORDER BY p.name ASC
  `);

  const procs = result.recordset;
  console.log(`Found ${procs.length} stored procedures in database.`);

  const docsDir = path.join(__dirname, 'docs', 'stored_procedures_backup');
  const serverDir = path.join(__dirname, 'server', 'stored_procedures_backup');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  if (!fs.existsSync(serverDir)) fs.mkdirSync(serverDir, { recursive: true });

  // 1. Write ALL_STORED_PROCEDURES_BACKUP.sql
  let combinedSql = `-- ========================================================================\n`;
  combinedSql += `-- BAJAJ AUTO LTD - PPMS_BajajPant DATABASE\n`;
  combinedSql += `-- COMPLETE STORED PROCEDURES BACKUP ARCHIVE\n`;
  combinedSql += `-- Total Procedures: ${procs.length}\n`;
  combinedSql += `-- Backup Timestamp: ${new Date().toISOString()}\n`;
  combinedSql += `-- Database Server: localhost (PPMS_BajajPant)\n`;
  combinedSql += `-- ========================================================================\n\n`;

  const indexList = [];

  for (let i = 0; i < procs.length; i++) {
    const p = procs[i];
    indexList.push({
      index: i + 1,
      name: p.name,
      createDate: p.create_date,
      modifyDate: p.modify_date,
      lines: p.definition ? p.definition.split('\n').length : 0
    });

    combinedSql += `-- ------------------------------------------------------------------------\n`;
    combinedSql += `-- [${i + 1}/${procs.length}] Stored Procedure: [dbo].[${p.name}]\n`;
    combinedSql += `-- Created: ${p.create_date} | Last Modified: ${p.modify_date}\n`;
    combinedSql += `-- ------------------------------------------------------------------------\n`;
    if (p.definition) {
      combinedSql += p.definition.trim() + '\nGO\n\n';
    } else {
      combinedSql += `-- (Definition encrypted or system protected)\nGO\n\n`;
    }

    // Save individual file if it's a DS_ procedure or relevant dashboard SP
    if (p.name.startsWith('DS_') || p.name.includes('EngineStatusCountBySKU') || p.name === 'GV_ProdShiftPlan') {
      const sanitizedName = p.name.replace(/[^a-zA-Z0-9_]/g, '_');
      const filename = `${sanitizedName}.sql`;
      const individualSql = `-- ========================================================================\n` +
        `-- Stored Procedure: [dbo].[${p.name}]\n` +
        `-- Database: PPMS_BajajPant\n` +
        `-- Created: ${p.create_date} | Last Modified: ${p.modify_date}\n` +
        `-- ========================================================================\n\n` +
        (p.definition || '-- No definition').trim() + '\nGO\n';

      fs.writeFileSync(path.join(docsDir, filename), individualSql, 'utf8');
      fs.writeFileSync(path.join(serverDir, filename), individualSql, 'utf8');
      console.log(`Saved individual SP file: ${filename}`);
    }
  }

  // Write combined SQL
  fs.writeFileSync(path.join(docsDir, 'ALL_STORED_PROCEDURES_BACKUP.sql'), combinedSql, 'utf8');
  fs.writeFileSync(path.join(serverDir, 'ALL_STORED_PROCEDURES_BACKUP.sql'), combinedSql, 'utf8');

  // Write index JSON
  fs.writeFileSync(path.join(docsDir, 'sp_index.json'), JSON.stringify(indexList, null, 2), 'utf8');
  fs.writeFileSync(path.join(serverDir, 'sp_index.json'), JSON.stringify(indexList, null, 2), 'utf8');

  console.log(`Backup completed successfully! Exported ${procs.length} SPs.`);
  process.exit(0);
}

backupAllSPs().catch(err => {
  console.error('Backup failed:', err);
  process.exit(1);
});
