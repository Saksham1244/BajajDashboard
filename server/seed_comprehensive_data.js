const { poolPromise } = require('./db');

console.log(`\n========================================================================`);
console.log(`  BAJAJ PPMS: COMPREHENSIVE MULTI-MODULE DATABASE SEEDING ENGINE`);
console.log(`========================================================================\n`);

async function seedComprehensive() {
  try {
    const pool = await poolPromise;
    if (!pool) {
      console.error('Could not connect to SQL Server pool.');
      process.exit(1);
    }

    console.log('[1/5] Seeding Config_User with 8 real shop floor operators...');
    const users = [
      { id: '1', user: 'coolsuper', email: 'super@ullu.com', pass: '1234', role: 1 },
      { id: '2', user: 'admin', email: 'ullu@gmail.com', pass: '12345', role: 1 },
      { id: '3', user: 'Rahul Sharma', email: 'rahul.sharma@example.com', pass: 'Pass@123', role: 2 },
      { id: '4', user: 'Priya Singh', email: 'priya.singh@example.com', pass: 'Pass@123', role: 2 },
      { id: '5', user: 'Amit Kumar', email: 'amit.kumar@example.com', pass: 'Pass@123', role: 2 },
      { id: '6', user: 'Neha Verma', email: 'neha.verma@example.com', pass: 'Pass@123', role: 2 },
      { id: '7', user: 'Vikram Patel', email: 'vikram.patel@example.com', pass: 'Pass@123', role: 2 },
      { id: '8', user: 'Sneha Gupta', email: 'sneha.gupta@example.com', pass: 'Pass@123', role: 2 }
    ];

    for (const u of users) {
      await pool.request().query(`
        IF NOT EXISTS (SELECT 1 FROM Config_User WHERE UserID = '${u.id}')
          INSERT INTO Config_User (UserID, DepartmentID, DepartmentRoleID, UserName, EmailID, MobileNo, [Password])
          VALUES ('${u.id}', 1, ${u.role}, '${u.user}', '${u.email}', 9876543210 + ${u.id}, '${u.pass}');
      `);
    }

    console.log('[2/5] Seeding Prod_Engine_WIP with 22 Live Manufacturing Engines...');

    await pool.request().query(`DELETE FROM Prod_Engine_WIP;`);

    const wipEngines = [
      { no: 'ENG-2026-00142', sku: 1, line: 1, status: 1, hoursAgo: 0.8 },
      { no: 'ENG-2026-00143', sku: 1, line: 1, status: 1, hoursAgo: 1.2 },
      { no: 'ENG-2026-00144', sku: 2, line: 1, status: 1, hoursAgo: 1.5 },
      { no: 'ENG-2026-00145', sku: 1, line: 2, status: 1, hoursAgo: 0.5 },
      { no: 'ENG-2026-00146', sku: 2, line: 2, status: 1, hoursAgo: 1.9 },
      { no: 'ENG-2026-00147', sku: 1, line: 1, status: 1, hoursAgo: 0.4 },
      { no: 'ENG-2026-00148', sku: 2, line: 1, status: 1, hoursAgo: 2.1 },
      { no: 'ENG-2026-00149', sku: 1, line: 2, status: 1, hoursAgo: 1.1 },
      { no: 'ENG-2026-00150', sku: 2, line: 2, status: 1, hoursAgo: 0.7 },
      { no: 'ENG-3015', sku: 1, line: 1, status: 1, hoursAgo: 1.4 },
      { no: 'ENG-3016', sku: 2, line: 1, status: 1, hoursAgo: 1.8 },
      { no: 'ENG-3017', sku: 1, line: 2, status: 1, hoursAgo: 0.9 },
      { no: 'ENG-3018', sku: 1, line: 1, status: 2, hoursAgo: 2.4 }, // Rework
      { no: 'ENG-3019', sku: 2, line: 1, status: 2, hoursAgo: 1.6 }, // Rework
      { no: 'ENG-3020', sku: 2, line: 2, status: 2, hoursAgo: 2.0 }, // Rework
      { no: 'ENG-2026-00135', sku: 1, line: 1, status: 3, hoursAgo: 3.1 }, // Blocked
      { no: 'ENG-2026-00136', sku: 1, line: 2, status: 3, hoursAgo: 2.7 }, // Blocked
      { no: 'ENG-2026-00137', sku: 2, line: 1, status: 4, hoursAgo: 3.5 }, // Idle
      { no: 'ENG-2026-00138', sku: 2, line: 2, status: 4, hoursAgo: 4.0 }, // Idle
      { no: 'ENG-2026-00139', sku: 1, line: 1, status: 1, hoursAgo: 0.6 },
      { no: 'ENG-2026-00140', sku: 2, line: 1, status: 1, hoursAgo: 1.3 },
      { no: 'ENG-2026-00141', sku: 1, line: 2, status: 1, hoursAgo: 0.9 }
    ];

    for (const w of wipEngines) {
      await pool.request().query(`
        INSERT INTO Prod_Engine_WIP (EngineNo, PlanID, SKUID, LineID, StartTime, Status)
        VALUES ('${w.no}', 1, ${w.sku}, ${w.line}, DATEADD(minute, -${Math.round(w.hoursAgo * 60)}, GETDATE()), ${w.status});
      `);
    }

    console.log('[3/5] Seeding Prod_Defect_Log & Rework Records...');

    await pool.request().query(`DELETE FROM Prod_Defect_Log;`);

    const defectRecords = [
      { no: 'ENG-3018', remark: 'Torque Fail on Head Bolt #3', user: 'Rahul Sharma', hoursAgo: 2.4 },
      { no: 'ENG-3019', remark: 'Casing Scratch on Clutch Cover', user: 'Priya Singh', hoursAgo: 1.6 },
      { no: 'ENG-3020', remark: 'Leakage on Water Pump Seal', user: 'Amit Kumar', hoursAgo: 2.0 },
      { no: 'ENG-2026-00120', remark: 'Thread Mismatch on Crankcase', user: 'Neha Verma', hoursAgo: 5.2 },
      { no: 'ENG-2026-00125', remark: 'Valve Clearance Out of Spec', user: 'Vikram Patel', hoursAgo: 8.4 },
      { no: 'ENG-2026-00128', remark: 'Spark Plug Gap Irregular', user: 'Sneha Gupta', hoursAgo: 12.0 },
      { no: 'ENG-2026-00130', remark: 'Oil Sump Gasket Misaligned', user: 'Rahul Sharma', hoursAgo: 18.5 },
      { no: 'ENG-2026-00133', remark: 'Piston Ring Gap Exceeded', user: 'Amit Kumar', hoursAgo: 22.0 },
      { no: 'ENG-2026-00105', remark: 'Camshaft Timing Out by 1 Tooth', user: 'Priya Singh', hoursAgo: 36.0 },
      { no: 'ENG-2026-00110', remark: 'Stator Coil Lead Insulation Pinch', user: 'Neha Verma', hoursAgo: 48.0 }
    ];

    for (let d = 0; d < defectRecords.length; d++) {
      const def = defectRecords[d];
      await pool.request().query(`
        INSERT INTO Prod_Defect_Log (EngineNo, Remark, UpdatedBy, Timestamp)
        VALUES ('${def.no}', '${def.remark}', '${def.user}', DATEADD(minute, -${Math.round(def.hoursAgo * 60)}, GETDATE()));
      `);
    }

    console.log('[4/5] Seeding Maintenance Breakdown Logs...');

    await pool.request().query(`DELETE FROM Maint_BreakDown_Log;`);

    const breakdownLogs = [
      { stationId: 1, reason: 'Nutrunner Spindle #2 Stall', duration: 18, hoursAgo: 1.5, userId: '5' },
      { stationId: 2, reason: 'Conveyor Pallet Stop Cylinder Jam', duration: 25, hoursAgo: 3.8, userId: '3' },
      { stationId: 3, reason: 'Vision Camera Communication Timeout', duration: 12, hoursAgo: 6.2, userId: '4' },
      { stationId: 1, reason: 'Pneumatic Line Pressure Drop < 5 bar', duration: 32, hoursAgo: 10.0, userId: '7' },
      { stationId: 2, reason: 'Torque Tool Calibration Fault', duration: 15, hoursAgo: 14.5, userId: '6' },
      { stationId: 3, reason: 'Oil Dispenser Flow Sensor Error', duration: 22, hoursAgo: 26.0, userId: '8' },
      { stationId: 1, reason: 'Emergency Stop Engaged by Operator', duration: 8, hoursAgo: 38.0, userId: '3' },
      { stationId: 2, reason: 'Main Drive Chain Tensioner Slack', duration: 45, hoursAgo: 52.0, userId: '5' }
    ];

    for (let b = 0; b < breakdownLogs.length; b++) {
      const bl = breakdownLogs[b];
      await pool.request().query(`
        INSERT INTO Maint_BreakDown_Log (
          StationID, EquipmentID, LossID, AlarmID, SubLossID, ProdDate, ProdShift, BDStartTime, BDEndTime, TotalBDTime, TotalBDCount, AssignedUserID, BDReason, BDStatus
        ) VALUES (
          ${bl.stationId}, 
          1,
          1,
          1,
          1,
          CAST(GETDATE() AS DATE),
          'Shift 1',
          DATEADD(minute, -${Math.round(bl.hoursAgo * 60) + bl.duration}, GETDATE()), 
          DATEADD(minute, -${Math.round(bl.hoursAgo * 60)}, GETDATE()), 
          ${bl.duration},
          1,
          '${bl.userId}',
          '${bl.reason}', 
          1
        );
      `);
    }

    console.log('[5/5] Seeding SAP Part Master & QA Audits...');

    await pool.request().query(`DELETE FROM SAP_PartMaster;`);

    const allParts = [
      { id: 'BAJ-ENG-101', name: 'Cylinder Block 150cc', desc: 'Die-Cast Aluminum Block' },
      { id: 'BAJ-ENG-102', name: 'Piston Assembly 57mm', desc: 'Forged Piston with Rings' },
      { id: 'BAJ-ENG-103', name: 'Cylinder Head DOHC', desc: 'CNC Machined Cylinder Head' },
      { id: 'BAJ-ENG-104', name: 'Crankshaft & Connecting Rod', desc: 'Forged Alloy Steel Crankshaft' },
      { id: 'BAJ-ENG-105', name: 'Camshaft Timing Gear Set', desc: 'Precision Sprocket & Chain' },
      { id: 'BAJ-ENG-106', name: 'Clutch Assembly 6-Plate', desc: 'Multiplate Wet Clutch' },
      { id: 'BAJ-ENG-107', name: 'Stator Magneto Coil', desc: '12V AC Generator Assembly' },
      { id: 'BAJ-ENG-108', name: 'Spark Plug Twin-Spark', desc: 'Iridium Tip Spark Plug' },
      { id: 'BAJ-ENG-109', name: 'Oil Pump Trochoid Unit', desc: 'Positive Displacement Pump' },
      { id: 'BAJ-ENG-110', name: 'Starter Motor 12V 0.8kW', desc: 'Electric Self-Start Motor' }
    ];

    for (const p of allParts) {
      await pool.request().query(`
        INSERT INTO SAP_PartMaster (PartID, PartName, PartDesc)
        VALUES ('${p.id}', '${p.name}', '${p.desc}');
      `);
    }

    await pool.request().query(`DELETE FROM QA_AuditMonitoring;`);

    const validAuditIds = [13, 15, 16];
    for (let i = 1; i <= 20; i++) {
      const lineId = (i % 2 === 0) ? 2 : 1;
      const auditId = validAuditIds[i % validAuditIds.length];
      const hoursAgo = i * 2.5;
      await pool.request().query(`
        INSERT INTO QA_AuditMonitoring (
          LineID, AuditListID, AuditInstanceID, StartDateTime, EndDateTime, ActualStartDateTime, ActualEndDateTime, Notification, Status
        ) VALUES (
          ${lineId}, 
          ${auditId}, 
          ${1000 + i}, 
          DATEADD(minute, -${Math.round(hoursAgo * 60) + 45}, GETDATE()), 
          DATEADD(minute, -${Math.round(hoursAgo * 60)}, GETDATE()), 
          DATEADD(minute, -${Math.round(hoursAgo * 60) + 45}, GETDATE()), 
          DATEADD(minute, -${Math.round(hoursAgo * 60)}, GETDATE()), 
          0, 
          1
        );
      `);
    }

    console.log(`\n========================================================================`);
    console.log(`✅ COMPREHENSIVE SEEDING COMPLETED SUCCESSFULLY!`);
    console.log(`  - 22 Live In-Process & Rework Engines in Prod_Engine_WIP`);
    console.log(`  - 10 Realistic Defect & Rework Records in Prod_Defect_Log`);
    console.log(`  - 8 Breakdown Events in Maint_BreakDown_Log`);
    console.log(`  - 10 SAP Automotive Components in SAP_PartMaster`);
    console.log(`  - 20 Quality Compliance Audits in QA_AuditMonitoring`);
    console.log(`========================================================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('Comprehensive Seeding Error:', err.message || err);
    process.exit(1);
  }
}

seedComprehensive();
