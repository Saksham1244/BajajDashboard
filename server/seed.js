const { poolPromise } = require('c:/Users/Admin/Desktop/Dashboard Bajaj/server/db.js');

async function seedTwoDays() {
  const pool = await poolPromise;

  console.log('--- Cleaning previous execution/log records in FK order ---');
  await pool.request().query(`
    DELETE FROM Prod_Engine_WIP;
    DELETE FROM Prod_EnginePlanExecution;
    DELETE FROM Prod_Shift_Plan;
    DELETE FROM Perf_Hourly_OLE;
    DELETE FROM Perf_Downtime;
    DELETE FROM Maint_BreakDown_Log;
    DELETE FROM Prod_Defect_Log;
    DELETE FROM Prod_TorqueData_Log;
    DELETE FROM Prod_Engine_Geneology;
    DELETE FROM QA_AuditMonitoring;
  `);

  console.log('--- Seeding Production Plans & Execution for 2026-08-30 and 2026-08-31 ---');

  const plans = [
    // Yesterday: 2026-08-30
    { planId: 201, lineId: 1, skuId: 1, date: '2026-08-30', shift: 'A', plan: 450, comp: 442, rework: 6, notOk: 2, speed: 4 },
    { planId: 202, lineId: 1, skuId: 1, date: '2026-08-30', shift: 'B', plan: 400, comp: 395, rework: 4, notOk: 1, speed: 4 },
    { planId: 203, lineId: 2, skuId: 1, date: '2026-08-30', shift: 'A', plan: 360, comp: 348, rework: 8, notOk: 4, speed: 3 },
    { planId: 204, lineId: 2, skuId: 1, date: '2026-08-30', shift: 'B', plan: 320, comp: 312, rework: 5, notOk: 3, speed: 3 },
    
    // Today: 2026-08-31
    { planId: 301, lineId: 1, skuId: 1, date: '2026-08-31', shift: 'A', plan: 480, comp: 468, rework: 9, notOk: 3, speed: 4 },
    { planId: 302, lineId: 1, skuId: 1, date: '2026-08-31', shift: 'B', plan: 430, comp: 422, rework: 5, notOk: 3, speed: 4 },
    { planId: 303, lineId: 2, skuId: 1, date: '2026-08-31', shift: 'A', plan: 390, comp: 380, rework: 7, notOk: 3, speed: 3 },
    { planId: 304, lineId: 2, skuId: 1, date: '2026-08-31', shift: 'B', plan: 340, comp: 335, rework: 4, notOk: 1, speed: 3 }
  ];

  for (const p of plans) {
    await pool.request().query(`
      SET IDENTITY_INSERT Prod_Shift_Plan ON;
      INSERT INTO Prod_Shift_Plan (PlanID, LineID, SKUID, ProdDate, ProdShift, PlanQty, Status, Priority, Source, LineSpeed)
      VALUES (${p.planId}, ${p.lineId}, ${p.skuId}, '${p.date}', '${p.shift}', ${p.plan}, 1, 1, 1, ${p.speed});
      SET IDENTITY_INSERT Prod_Shift_Plan OFF;
    `);

    await pool.request().query(`
      INSERT INTO Prod_EnginePlanExecution (
        PlanID, LineID, SKUID, ProdDate, ProdShift, PlanQty,
        KitAssembly_Qty, KitInspected_Qty, ENGMainLine_Qty, ENGNotOK_Qty, 
        ENGNotOKBypass_Qty, ENGTakeOut_Qty, ENGReworkOK_Qty, ENGCompleted_Qty,
        ENGMaterialHold_Qty, ENGQualityHold_Qty, ENGScrapped_Qty, Status, LineSpeed
      ) VALUES (
        ${p.planId}, ${p.lineId}, ${p.skuId}, '${p.date}', '${p.shift}', ${p.plan},
        ${p.plan}, ${p.plan}, ${p.comp + p.rework}, ${p.notOk}, 
        0, 1, ${p.rework}, ${p.comp},
        0, 0, ${p.notOk > 2 ? 1 : 0}, 1, ${p.speed}
      );
    `);
  }

  console.log('--- Seeding Downtime & Losses ---');
  const downtimes = [
    // Yesterday (2026-08-30)
    { lineId: 1, stId: 1, date: '2026-08-30', shift: 'A', start: '2026-08-30 07:30', end: '2026-08-30 07:55', dt: 25, lossId: 1, reason: 'Tool Wear & Replacement' },
    { lineId: 1, stId: 2, date: '2026-08-30', shift: 'A', start: '2026-08-30 10:15', end: '2026-08-30 10:33', dt: 18, lossId: 1, reason: 'Conveyor Jam' },
    { lineId: 2, stId: 1, date: '2026-08-30', shift: 'B', start: '2026-08-30 15:00', end: '2026-08-30 15:14', dt: 14, lossId: 1, reason: 'Sensor Misalignment' },
    { lineId: 2, stId: 2, date: '2026-08-30', shift: 'B', start: '2026-08-30 17:40', end: '2026-08-30 18:00', dt: 20, lossId: 1, reason: 'Spindle Lube Inspection' },

    // Today (2026-08-31)
    { lineId: 1, stId: 1, date: '2026-08-31', shift: 'A', start: '2026-08-31 07:10', end: '2026-08-31 07:45', dt: 35, lossId: 1, reason: 'Preventive Maintenance' },
    { lineId: 1, stId: 2, date: '2026-08-31', shift: 'A', start: '2026-08-31 09:20', end: '2026-08-31 09:42', dt: 22, lossId: 1, reason: 'Quality Inspection Delay' },
    { lineId: 1, stId: 1, date: '2026-08-31', shift: 'B', start: '2026-08-31 14:10', end: '2026-08-31 14:38', dt: 28, lossId: 1, reason: 'Line Changeover' },
    { lineId: 2, stId: 1, date: '2026-08-31', shift: 'B', start: '2026-08-31 16:30', end: '2026-08-31 16:49', dt: 19, lossId: 1, reason: 'Material Buffer Stockout' },
    { lineId: 2, stId: 2, date: '2026-08-31', shift: 'A', start: '2026-08-31 11:05', end: '2026-08-31 11:21', dt: 16, lossId: 1, reason: 'Torque Spindle Calibration' }
  ];

  for (const d of downtimes) {
    await pool.request().query(`
      INSERT INTO Perf_Downtime (
        TimeStamp, SubAsslyLineID, StationID, ProdDate, ProdShift,
        StartTime, EndTime, CurrentDT, TotalDT, LossID, SubLossID, [4MLossID], UserID, Reason, LastUpdatedTime
      ) VALUES (
        '${d.start}', ${d.lineId}, ${d.stId}, '${d.date}', '${d.shift}',
        '${d.start}', '${d.end}', ${d.dt}, ${d.dt}, ${d.lossId}, 1, 1, '1', '${d.reason}', '${d.end}'
      );
    `);
  }

  console.log('--- Seeding Maintenance Breakdowns ---');
  const breakdowns = [
    // Yesterday
    { stId: 1, date: '2026-08-30', shift: 'A', start: '2026-08-30 08:15', end: '2026-08-30 08:40', dur: 25, reason: 'Pneumatic Cylinder Stoppage', status: 1 },
    { stId: 2, date: '2026-08-30', shift: 'B', start: '2026-08-30 14:20', end: '2026-08-30 14:38', dur: 18, reason: 'Motor Drive Error', status: 1 },

    // Today
    { stId: 1, date: '2026-08-31', shift: 'A', start: '2026-08-31 07:10', end: '2026-08-31 07:45', dur: 35, reason: 'Spindle Bearing Noise', status: 1 },
    { stId: 2, date: '2026-08-31', shift: 'A', start: '2026-08-31 10:15', end: '2026-08-31 10:37', dur: 22, reason: 'Pallet Clamp Release Jam', status: 1 },
    { stId: 1, date: '2026-08-31', shift: 'B', start: '2026-08-31 15:30', end: '2026-08-31 15:49', dur: 19, reason: 'Feeder Track Alignment', status: 1 }
  ];

  for (const b of breakdowns) {
    await pool.request().query(`
      INSERT INTO Maint_BreakDown_Log (
        StationID, EquipmentID, LossID, AlarmID, SubLossID,
        ProdDate, ProdShift, BDStartTime, BDEndTime, TotalBDTime,
        TotalBDCount, AssignedUserID, BDReason, BDStatus
      ) VALUES (
        ${b.stId}, 1, 1, 1, 1,
        '${b.date}', '${b.shift}', '${b.start}', '${b.end}', ${b.dur},
        1, '1', '${b.reason}', ${b.status}
      );
    `);
  }

  console.log('--- Seeding Defect Logs ---');
  const defects = [
    // Yesterday (5 defects)
    { date: '2026-08-30 08:30', engine: 'ENG-260830-01', remark: 'Oil Seal Misalignment', check: 1 },
    { date: '2026-08-30 10:15', engine: 'ENG-260830-02', remark: 'Tappet Cover Scratch', check: 1 },
    { date: '2026-08-30 11:45', engine: 'ENG-260830-03', remark: 'Spark Plug Thread Burr', check: 1 },
    { date: '2026-08-30 14:50', engine: 'ENG-260830-04', remark: 'Valve Clearance High', check: 1 },
    { date: '2026-08-30 16:30', engine: 'ENG-260830-05', remark: 'Crankcase Sealing Leak', check: 1 },

    // Today (8 defects)
    { date: '2026-08-31 07:45', engine: 'ENG-260831-01', remark: 'Cylinder Head Torque Outlier', check: 1 },
    { date: '2026-08-31 08:50', engine: 'ENG-260831-02', remark: 'Clutch Lever Play High', check: 1 },
    { date: '2026-08-31 09:30', engine: 'ENG-260831-03', remark: 'Gasket Pinch', check: 1 },
    { date: '2026-08-31 10:40', engine: 'ENG-260831-04', remark: 'Camshaft End Play', check: 1 },
    { date: '2026-08-31 12:15', engine: 'ENG-260831-05', remark: 'Magneto Rotor Gap Outlier', check: 1 },
    { date: '2026-08-31 14:10', engine: 'ENG-260831-06', remark: 'Piston Ring Gap Mismatch', check: 1 },
    { date: '2026-08-31 15:35', engine: 'ENG-260831-07', remark: 'Drain Plug Loose', check: 1 },
    { date: '2026-08-31 16:50', engine: 'ENG-260831-08', remark: 'Header Pipe Stud Misaligned', check: 1 }
  ];

  for (const df of defects) {
    await pool.request().query(`
      INSERT INTO Prod_Defect_Log (
        Timestamp, InspectionPointID, DefectID, EngineNo, DefectCheck, DefectAdjust, DefectAlert, DefectReplace, Remark, Status, UpdatedBy
      ) VALUES (
        '${df.date}', NULL, NULL, '${df.engine}', ${df.check}, 0, 0, 0, '${df.remark}', 1, 'Inspector Rahul'
      );
    `);
  }

  console.log('--- Seeding WIP Engines ---');
  const wipList = [
    { eng: 'E26-WIP-01', planId: 301, lineId: 1, start: '2026-08-31 06:15' },
    { eng: 'E26-WIP-02', planId: 301, lineId: 1, start: '2026-08-31 07:00' },
    { eng: 'E26-WIP-03', planId: 301, lineId: 1, start: '2026-08-31 07:45' },
    { eng: 'E26-WIP-04', planId: 301, lineId: 1, start: '2026-08-31 08:30' },
    { eng: 'E26-WIP-05', planId: 301, lineId: 1, start: '2026-08-31 09:15' },
    { eng: 'E26-WIP-06', planId: 302, lineId: 1, start: '2026-08-31 14:00' },
    { eng: 'E26-WIP-07', planId: 303, lineId: 2, start: '2026-08-31 06:30' },
    { eng: 'E26-WIP-08', planId: 303, lineId: 2, start: '2026-08-31 08:00' },
    { eng: 'E26-WIP-09', planId: 304, lineId: 2, start: '2026-08-31 14:30' },
    { eng: 'E26-WIP-10', planId: 304, lineId: 2, start: '2026-08-31 15:45' }
  ];

  for (const w of wipList) {
    await pool.request().query(`
      INSERT INTO Prod_Engine_WIP (
        EngineNo, PlanID, SKUID, LineID, StartTime, EndTime, Status, NotOkStation, ReEntryStation, SAMarrigeStatus
      ) VALUES (
        '${w.eng}', ${w.planId}, 1, ${w.lineId}, '${w.start}', '${w.start}', 1, NULL, NULL, 1
      );
    `);
  }

  console.log('--- Seeding Hourly OLE Records ---');
  await pool.request().query(`
    INSERT INTO Perf_Hourly_OLE (
      SubAsslyLineID, ProdDate, ProdShift, TotalTime, TotalDownTime,
      AvailableTime, PlannedQuantity, ExpectedQuantity, TotalQuantity,
      GoodQuantity, RejectionQuantity, Availability, Performance, Quality, OLE
    ) VALUES 
    -- Yesterday (2026-08-30)
    (1, '2026-08-30', 'A', '2026-08-30 08:00', 25, 455, 225, 225, 222, 220, 2, 94.7, 98.6, 99.1, 92.5),
    (1, '2026-08-30', 'B', '2026-08-30 16:00', 18, 462, 200, 200, 198, 196, 2, 96.2, 99.0, 98.9, 94.2),
    (2, '2026-08-30', 'A', '2026-08-30 08:00', 14, 466, 180, 180, 175, 172, 3, 97.0, 97.2, 98.2, 92.6),
    (2, '2026-08-30', 'B', '2026-08-30 16:00', 20, 460, 160, 160, 157, 155, 2, 95.8, 98.1, 98.7, 92.8),
    
    -- Today (2026-08-31)
    (1, '2026-08-31', 'A', '2026-08-31 08:00', 35, 445, 240, 240, 235, 232, 3, 92.7, 97.9, 98.7, 89.6),
    (1, '2026-08-31', 'B', '2026-08-31 16:00', 28, 452, 215, 215, 212, 210, 2, 94.1, 98.6, 99.0, 91.8),
    (2, '2026-08-31', 'A', '2026-08-31 08:00', 16, 464, 195, 195, 191, 188, 3, 96.6, 97.9, 98.4, 93.0),
    (2, '2026-08-31', 'B', '2026-08-31 16:00', 19, 461, 170, 170, 168, 166, 2, 96.0, 98.8, 98.8, 93.7);
  `);

  console.log('--- Seeding QA Audit Monitoring ---');
  await pool.request().query(`
    INSERT INTO QA_AuditMonitoring (
      LineID, AuditListID, AuditInstanceID, StartDateTime, EndDateTime,
      ActualStartDateTime, ActualEndDateTime, Notification, Status
    ) VALUES
    -- Yesterday
    (1, 13, 101, '2026-08-30 08:00', '2026-08-30 09:00', '2026-08-30 08:05', '2026-08-30 08:55', 0, 1),
    (1, 15, 102, '2026-08-30 10:00', '2026-08-30 11:00', '2026-08-30 10:00', '2026-08-30 10:48', 0, 1),
    (2, 16, 103, '2026-08-30 14:00', '2026-08-30 15:00', '2026-08-30 14:10', '2026-08-30 15:02', 0, 1),
    
    -- Today
    (1, 13, 201, '2026-08-31 07:30', '2026-08-31 08:30', '2026-08-31 07:35', '2026-08-31 08:28', 0, 1),
    (1, 15, 202, '2026-08-31 10:30', '2026-08-31 11:30', '2026-08-31 10:30', '2026-08-31 11:20', 0, 1),
    (1, 16, 203, '2026-08-31 13:00', '2026-08-31 14:00', '2026-08-31 13:05', '2026-08-31 13:50', 0, 1),
    (2, 13, 204, '2026-08-31 09:00', '2026-08-31 10:00', '2026-08-31 09:02', '2026-08-31 09:55', 0, 1),
    (2, 15, 205, '2026-08-31 15:00', '2026-08-31 16:00', '2026-08-31 15:10', '2026-08-31 15:58', 0, 1);
  `);

  console.log('--- Seeding Torque & Traceability ---');
  await pool.request().query(`
    INSERT INTO Prod_TorqueData_Log (
      Timestamp, SKUID, ActivityID, ActivityValue, Angle, Rundown, CycleTime, Count, UpperLimit, LowerLimit
    ) VALUES
    ('2026-08-30 08:15', 1, 1, 48.5, 90, 48.5, 12, '1', 52.0, 45.0),
    ('2026-08-30 11:20', 1, 1, 47.8, 88, 47.8, 11, '2', 52.0, 45.0),
    ('2026-08-30 15:10', 1, 1, 49.2, 92, 49.2, 13, '3', 52.0, 45.0),
    ('2026-08-31 07:30', 1, 1, 48.0, 90, 48.0, 12, '1', 52.0, 45.0),
    ('2026-08-31 09:45', 1, 1, 53.2, 98, 53.2, 15, '2', 52.0, 45.0),
    ('2026-08-31 11:15', 1, 1, 48.6, 91, 48.6, 12, '3', 52.0, 45.0),
    ('2026-08-31 14:20', 1, 1, 47.5, 89, 47.5, 11, '4', 52.0, 45.0),
    ('2026-08-31 16:00', 1, 1, 48.9, 90, 48.9, 12, '5', 52.0, 45.0);
  `);

  console.log('✓ Seeding completed successfully for Yesterday (2026-08-30) and Today (2026-08-31)!');
  process.exit(0);
}

seedTwoDays().catch(err => {
  console.error('Error during 2-day seeding:', err);
  process.exit(1);
});
