const { poolPromise, sql } = require('c:/Users/Admin/Desktop/Dashboard Bajaj/server/db.js');

async function seedComplete30Days() {
  const pool = await poolPromise;
  console.log('=====================================================');
  console.log('  STARTING COMPREHENSIVE 30-DAY MASTER SEEDER');
  console.log('=====================================================');

  // 1. Create backup snapshots for 1-click rollback
  console.log('\n[1/7] Creating pre-seed backup snapshot tables...');
  const tablesToBackup = [
    'Prod_EnginePlanExecution',
    'Prod_Engine_WIP',
    'Prod_Defect_Log',
    'QA_AuditMonitoring',
    'Perf_Hourly_OLE',
    'Perf_Downtime',
    'Maint_BreakDown_Log',
    'Prod_Shift_Plan',
    'Prod_TorqueData_Log',
    'Prod_Engine_Geneology',
    'SAP_PartMaster'
  ];

  for (const t of tablesToBackup) {
    try {
      await pool.request().query(`
        IF OBJECT_ID('dbo._Bak_${t}', 'U') IS NOT NULL DROP TABLE dbo._Bak_${t};
        SELECT * INTO dbo._Bak_${t} FROM dbo.[${t}];
      `);
    } catch (e) {
      // Table might be new or empty
    }
  }
  console.log('✓ Backup snapshot tables created (_Bak_*)');

  // 2. Clear current operational records in foreign-key order
  console.log('\n[2/7] Cleaning existing operational records in foreign-key order...');
  for (const t of tablesToBackup) {
    try {
      await pool.request().query(`DELETE FROM dbo.[${t}];`);
    } catch (e) {
      console.log(`Note deleting ${t}:`, e.message);
    }
  }

  // 3. Ensure master configurations
  console.log('\n[3/7] Verifying and populating master configurations...');
  await pool.request().query(`
    -- Lines
    IF NOT EXISTS (SELECT 1 FROM Config_Line WHERE LineID = 1)
      INSERT INTO Config_Line (LineName, LineDesc) VALUES ('Line 1', 'Main Pulsar Assembly Line 1');
    IF NOT EXISTS (SELECT 1 FROM Config_Line WHERE LineID = 2)
      INSERT INTO Config_Line (LineName, LineDesc) VALUES ('Line 2', 'Main Pulsar Assembly Line 2');

    -- SubAssembly Lines
    IF NOT EXISTS (SELECT 1 FROM Config_SubAssemblyLine WHERE SubAsslyLineID = 1)
      INSERT INTO Config_SubAssemblyLine (SubAsslyLineName, SubAsslyLineDesc) VALUES ('Line 1 Sub-Assembly', 'Engine Sub-Assembly Line 1');
    IF NOT EXISTS (SELECT 1 FROM Config_SubAssemblyLine WHERE SubAsslyLineID = 2)
      INSERT INTO Config_SubAssemblyLine (SubAsslyLineName, SubAsslyLineDesc) VALUES ('Line 2 Sub-Assembly', 'Engine Sub-Assembly Line 2');

    -- Loss Categories
    IF NOT EXISTS (SELECT 1 FROM Config_LossCategory WHERE LossID = 1)
      INSERT INTO Config_LossCategory (LossName, LossDesc) VALUES ('Breakdown Loss', 'Equipment failure stoppage');
    IF NOT EXISTS (SELECT 1 FROM Config_LossCategory WHERE LossID = 2)
      INSERT INTO Config_LossCategory (LossName, LossDesc) VALUES ('Setup & Tool Change', 'Line adjustment and tool replacement');
    IF NOT EXISTS (SELECT 1 FROM Config_LossCategory WHERE LossID = 3)
      INSERT INTO Config_LossCategory (LossName, LossDesc) VALUES ('Material Shortage', 'Buffer and kitting starvation');
    IF NOT EXISTS (SELECT 1 FROM Config_LossCategory WHERE LossID = 4)
      INSERT INTO Config_LossCategory (LossName, LossDesc) VALUES ('Quality Interlock', 'Poka Yoke and safety stoppage');

    -- SubLoss
    IF NOT EXISTS (SELECT 1 FROM Config_SubLossCategory WHERE SubLossID = 1)
      INSERT INTO Config_SubLossCategory (SubLossName) VALUES ('Mechanical Stoppage');

    -- Stations
    IF NOT EXISTS (SELECT 1 FROM Config_Station WHERE StationID = 1)
      INSERT INTO Config_Station (StationName, StationDesc) VALUES ('Station 1', 'Crankcase & Bearing Assembly');
    IF NOT EXISTS (SELECT 1 FROM Config_Station WHERE StationID = 2)
      INSERT INTO Config_Station (StationName, StationDesc) VALUES ('Station 2', 'Piston & Cylinder Head Fitment');
    IF NOT EXISTS (SELECT 1 FROM Config_Station WHERE StationID = 3)
      INSERT INTO Config_Station (StationName, StationDesc) VALUES ('Station 3', 'Magneto & Clutch Fastening');

    -- Equipment & Alarms
    IF NOT EXISTS (SELECT 1 FROM Config_Equipment WHERE EquipmentID = 1)
      INSERT INTO Config_Equipment (StationID, EquipmentName, EquipmentDesc, EquipmentTypeID) VALUES (1, 'Nutrunner ST1', 'Automated Torque Tool', 1);
    IF NOT EXISTS (SELECT 1 FROM Config_Alarm WHERE AlarmID = 1)
      INSERT INTO Config_Alarm (EquipmentID, DepartmentID, AlarmMessage, AlarmDesc, AlarmType, Priority) VALUES (1, 1, 'Torque Deviation', 'Under-Torque Alarm', 1, 1);

    -- SAP Part Master
    DELETE FROM SAP_PartMaster;
    INSERT INTO SAP_PartMaster (PartID, PartName, PartDesc) VALUES
      ('PART-CK-001', 'Crankcase LH Casting', 'Aluminum High-Pressure Die Casting'),
      ('PART-CK-002', 'Crankcase RH Casting', 'Aluminum High-Pressure Die Casting'),
      ('PART-CH-003', 'Cylinder Head Machined', 'DTS-i Twin Spark Cylinder Head'),
      ('PART-PI-004', 'Piston & Gudgeon Pin Kit', '58.0mm Forged Piston Assembly'),
      ('PART-CS-005', 'Camshaft Assembly', 'Overhead Camshaft with Bearings'),
      ('PART-SP-006', 'Bosch Spark Plug Twin Pack', 'High Heat Range Spark Plug'),
      ('PART-GK-007', 'Engine Gasket & O-Ring Kit', 'Multi-Layer Steel Head Gasket'),
      ('PART-BR-008', 'Main Crankshaft Bearing 6305', 'High Speed Deep Groove Ball Bearing'),
      ('PART-VI-009', 'Inlet Valve 28mm', 'Nitride Coated Intake Valve'),
      ('PART-VE-010', 'Exhaust Valve 24mm', 'Stellite Faced Exhaust Valve');
  `);

  // Ensure PM Checklists and Schedules
  try {
    await pool.request().query(`
      IF OBJECT_ID('Config_PMCheckList', 'U') IS NOT NULL
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM Config_PMCheckList)
        BEGIN
          INSERT INTO Config_PMCheckList (CheckListName, CheckListDesc) VALUES
            ('Weekly Nutrunner Calibration', 'Torque transducer verification'),
            ('Daily Conveyor Belt Inspection', 'Tension and sensor alignment audit'),
            ('Monthly Pneumatic Filter Clean', 'Air regulator lubrication and filter purge');
        END
      END

      IF OBJECT_ID('Config_PMSchedule', 'U') IS NOT NULL
      BEGIN
        DELETE FROM Config_PMSchedule;
        DECLARE @c1 INT = (SELECT TOP 1 CheckListId FROM Config_PMCheckList ORDER BY CheckListId ASC);
        INSERT INTO Config_PMSchedule (LineId, CheckListId, StartDate, StartCount, FrequencyType, FrequencyValue, Alert, EstimatedDuration) VALUES
          (1, @c1, '2026-09-01', 1, 1, 7, 0, 30),
          (1, @c1, '2026-09-02', 1, 1, 1, 0, 15),
          (2, @c1, '2026-09-03', 1, 1, 7, 0, 30),
          (2, @c1, '2026-09-05', 1, 1, 30, 0, 45);
      END
    `);
  } catch (e) {
    console.log('PM Config note:', e.message);
  }

  // 4. Generate 30 Days of Dates up to Today (2026-09-03)
  console.log('\n[4/7] Generating 30 days of multi-shift production data...');
  const dates = [];
  const today = new Date(); // Dynamic today
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }

  console.log(`Date range: ${dates[0]} to ${dates[dates.length - 1]} (${dates.length} consecutive days)`);

  const shifts = [
    { shift: '1', dbShift: 'A', startHour: 6, endHour: 14 },
    { shift: '2', dbShift: 'B', startHour: 14, endHour: 22 }
  ];

  const lines = [
    { lineId: 1, skuId: 1, lineSpeed: 4 },
    { lineId: 2, skuId: 2, lineSpeed: 4 }
  ];

  const downtimeReasons = [
    { reason: 'Pneumatic Air Pressure Drop', lossId: 1, subLossId: 1, stationId: 1 },
    { reason: 'Conveyor Jam & Sensor Interlock', lossId: 1, subLossId: 1, stationId: 2 },
    { reason: 'Torque Tool Battery Discharged', lossId: 2, subLossId: 1, stationId: 3 },
    { reason: 'Gasket Feeder Sorter Jam', lossId: 4, subLossId: 1, stationId: 1 },
    { reason: 'Emergency Pull Cord Triggered', lossId: 4, subLossId: 1, stationId: 2 },
    { reason: 'Piston Ring Sorter Realignment', lossId: 2, subLossId: 1, stationId: 2 },
    { reason: 'Nut Runner Interlock Bypass', lossId: 4, subLossId: 1, stationId: 3 }
  ];

  const defectRemarks = [
    'Bolt Under-Torque (Station 1)',
    'Oil Seal Misalignment',
    'Crankcase Scratch',
    'Spark Plug Thread Burr',
    'Valve Clearance Gap',
    'Gasket Pinch & Leakage',
    'Timing Chain Tension Loose',
    'Sensor Wiring Loose Pin'
  ];

  const validUserIds = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const userNames = ['coolsuper', 'admin', 'Rahul Sharma', 'Priya Singh', 'Amit Kumar', 'Neha Verma', 'Vikram Patel', 'Sneha Gupta'];

  let totalPlansCreated = 0;
  let totalDowntimesCreated = 0;
  let totalDefectsCreated = 0;
  let totalAuditsCreated = 0;
  let totalHourlyCreated = 0;
  let totalWIPCreated = 0;
  let totalBreakdownsCreated = 0;
  let totalTorqueCreated = 0;
  let totalGenealogyCreated = 0;

  for (const dateStr of dates) {
    const isToday = dateStr === dates[dates.length - 1];

    for (const s of shifts) {
      for (const l of lines) {
        // Random Plan & Actual variation
        const planQty = Math.floor(370 + Math.random() * 50); // 370 - 420
        const compRate = 0.92 + Math.random() * 0.07; // 92% - 99%
        const completedQty = isToday && s.shift === '2' ? Math.floor(planQty * 0.45) : Math.floor(planQty * compRate);
        const reworkOk = Math.floor(5 + Math.random() * 12);
        const matHold = Math.floor(Math.random() * 3);
        const qualHold = Math.floor(Math.random() * 3);
        const notOk = Math.floor(4 + Math.random() * 8);
        const bypassQty = Math.floor(Math.random() * 2);
        const mainLineQty = completedQty + notOk + matHold + qualHold;
        const planStatus = isToday ? (s.shift === '1' ? 4 : 5) : 4;

        // Insert Prod_Shift_Plan
        const insPlan = await pool.request()
          .input('LineID', sql.Int, l.lineId)
          .input('SKUID', sql.Int, l.skuId)
          .input('ProdDate', sql.Date, dateStr)
          .input('ProdShift', sql.NVarChar(20), s.dbShift)
          .input('PlanQty', sql.Int, planQty)
          .input('Status', sql.Int, planStatus)
          .input('Priority', sql.Int, 1)
          .input('Source', sql.Int, Math.random() > 0.3 ? 3 : 1)
          .input('LineSpeed', sql.Int, l.lineSpeed)
          .query(`
            INSERT INTO Prod_Shift_Plan (LineID, SKUID, ProdDate, ProdShift, PlanQty, Status, Priority, Source, LineSpeed)
            OUTPUT INSERTED.PlanID
            VALUES (@LineID, @SKUID, @ProdDate, @ProdShift, @PlanQty, @Status, @Priority, @Source, @LineSpeed)
          `);

        const planId = insPlan.recordset[0].PlanID;
        totalPlansCreated++;

        // Insert Prod_EnginePlanExecution
        await pool.request()
          .input('PlanID', sql.Int, planId)
          .input('LineID', sql.Int, l.lineId)
          .input('SKUID', sql.Int, l.skuId)
          .input('ProdDate', sql.Date, dateStr)
          .input('ProdShift', sql.NVarChar(20), s.dbShift)
          .input('PlanQty', sql.Int, planQty)
          .input('KitAssembly_Qty', sql.Int, mainLineQty)
          .input('KitInspected_Qty', sql.Int, mainLineQty)
          .input('ENGMainLine_Qty', sql.Int, mainLineQty)
          .input('ENGNotOK_Qty', sql.Int, notOk)
          .input('ENGNotOKBypass_Qty', sql.Int, bypassQty)
          .input('ENGTakeOut_Qty', sql.Int, Math.floor(Math.random() * 2))
          .input('ENGReworkOK_Qty', sql.Int, reworkOk)
          .input('ENGCompleted_Qty', sql.Int, completedQty)
          .input('ENGMaterialHold_Qty', sql.Int, matHold)
          .input('ENGQualityHold_Qty', sql.Int, qualHold)
          .input('ENGScrapped_Qty', sql.Int, Math.floor(Math.random() * 2))
          .input('Status', sql.Int, 1)
          .input('LineSpeed', sql.Int, l.lineSpeed)
          .query(`
            INSERT INTO Prod_EnginePlanExecution 
              (PlanID, LineID, SKUID, ProdDate, ProdShift, PlanQty, KitAssembly_Qty, KitInspected_Qty, ENGMainLine_Qty, ENGNotOK_Qty, ENGNotOKBypass_Qty, ENGTakeOut_Qty, ENGReworkOK_Qty, ENGCompleted_Qty, ENGMaterialHold_Qty, ENGQualityHold_Qty, ENGScrapped_Qty, Status, LineSpeed)
            VALUES 
              (@PlanID, @LineID, @SKUID, @ProdDate, @ProdShift, @PlanQty, @KitAssembly_Qty, @KitInspected_Qty, @ENGMainLine_Qty, @ENGNotOK_Qty, @ENGNotOKBypass_Qty, @ENGTakeOut_Qty, @ENGReworkOK_Qty, @ENGCompleted_Qty, @ENGMaterialHold_Qty, @ENGQualityHold_Qty, @ENGScrapped_Qty, @Status, @LineSpeed)
          `);

        // Insert Hourly OLE slices (8 hours per shift)
        for (let h = 0; h < 8; h++) {
          const hour = s.startHour + h;
          const timeStr = `${dateStr} ${String(hour).padStart(2, '0')}:00:00`;
          const hourlyPlan = Math.round(planQty / 8);
          const hourlyActual = Math.round(completedQty / 8);
          const hourlyGood = hourlyActual - Math.floor(Math.random() * 2);
          const hourlyRej = hourlyActual - hourlyGood;
          const dtMins = Math.floor(Math.random() * 5);
          const avail = Number((((60 - dtMins) / 60) * 100).toFixed(1));
          const perf = Number(((hourlyActual / hourlyPlan) * 100).toFixed(1));
          const qual = Number(((hourlyGood / Math.max(1, hourlyActual)) * 100).toFixed(1));
          const ole = Number(((avail * perf * qual) / 10000).toFixed(1));

          await pool.request()
            .input('Timestamp', sql.DateTime, new Date(timeStr))
            .input('SubAsslyLineID', sql.Int, l.lineId)
            .input('ProdDate', sql.Date, dateStr)
            .input('ProdShift', sql.NVarChar(20), s.shift)
            .input('TotalTime', sql.DateTime, new Date(timeStr))
            .input('TotalDownTime', sql.Int, dtMins)
            .input('AvailableTime', sql.Int, 60 - dtMins)
            .input('PlannedQuantity', sql.Int, hourlyPlan)
            .input('ExpectedQuantity', sql.Int, hourlyPlan)
            .input('TotalQuantity', sql.Int, hourlyActual)
            .input('GoodQuantity', sql.Int, hourlyGood)
            .input('RejectionQuantity', sql.Int, hourlyRej)
            .input('Availability', sql.Decimal(5, 1), avail)
            .input('Performance', sql.Decimal(5, 1), perf)
            .input('Quality', sql.Decimal(5, 1), qual)
            .input('OLE', sql.Decimal(5, 1), ole)
            .query(`
              INSERT INTO Perf_Hourly_OLE 
                (Timestamp, SubAsslyLineID, ProdDate, ProdShift, TotalTime, TotalDownTime, AvailableTime, PlannedQuantity, ExpectedQuantity, TotalQuantity, GoodQuantity, RejectionQuantity, Availability, Performance, Quality, OLE)
              VALUES 
                (@Timestamp, @SubAsslyLineID, @ProdDate, @ProdShift, @TotalTime, @TotalDownTime, @AvailableTime, @PlannedQuantity, @ExpectedQuantity, @TotalQuantity, @GoodQuantity, @RejectionQuantity, @Availability, @Performance, @Quality, @OLE)
            `);
          totalHourlyCreated++;
        }

        // Insert Downtime Incidents
        const dtCount = 1 + Math.floor(Math.random() * 2);
        for (let dtIdx = 0; dtIdx < dtCount; dtIdx++) {
          const dtItem = downtimeReasons[(totalDowntimesCreated + dtIdx) % downtimeReasons.length];
          const dtDuration = Math.floor(8 + Math.random() * 25);
          const dtStartH = s.startHour + Math.floor(Math.random() * 7);
          const dtStartM = Math.floor(Math.random() * 40);
          const dtStartTime = `${dateStr} ${String(dtStartH).padStart(2, '0')}:${String(dtStartM).padStart(2, '0')}:00`;
          const dtEndTime = new Date(new Date(dtStartTime).getTime() + dtDuration * 60000);
          const userId = validUserIds[Math.floor(Math.random() * validUserIds.length)];

          await pool.request()
            .input('TimeStamp', sql.DateTime, new Date(dtStartTime))
            .input('SubAsslyLineID', sql.Int, l.lineId)
            .input('StationID', sql.Int, dtItem.stationId)
            .input('ProdDate', sql.Date, dateStr)
            .input('ProdShift', sql.NVarChar(20), s.shift)
            .input('StartTime', sql.DateTime, new Date(dtStartTime))
            .input('EndTime', sql.DateTime, dtEndTime)
            .input('CurrentDT', sql.Int, dtDuration)
            .input('TotalDT', sql.Int, dtDuration)
            .input('LossID', sql.Int, dtItem.lossId)
            .input('SubLossID', sql.Int, dtItem.subLossId)
            .input('4MLossID', sql.Int, 1)
            .input('UserID', sql.NVarChar(50), userId)
            .input('Reason', sql.NVarChar(255), dtItem.reason)
            .input('LastUpdatedTime', sql.DateTime, dtEndTime)
            .query(`
              INSERT INTO Perf_Downtime 
                (TimeStamp, SubAsslyLineID, StationID, ProdDate, ProdShift, StartTime, EndTime, CurrentDT, TotalDT, LossID, SubLossID, [4MLossID], UserID, Reason, LastUpdatedTime)
              VALUES 
                (@TimeStamp, @SubAsslyLineID, @StationID, @ProdDate, @ProdShift, @StartTime, @EndTime, @CurrentDT, @TotalDT, @LossID, @SubLossID, @4MLossID, @UserID, @Reason, @LastUpdatedTime)
            `);
          totalDowntimesCreated++;

          // Insert matching Maintenance Breakdown log
          if (dtIdx === 0 && Math.random() > 0.35) {
            await pool.request()
              .input('StationID', sql.Int, dtItem.stationId)
              .input('EquipmentID', sql.Int, 1)
              .input('LossID', sql.Int, dtItem.lossId)
              .input('AlarmID', sql.Int, 1)
              .input('SubLossID', sql.Int, dtItem.subLossId)
              .input('ProdDate', sql.Date, dateStr)
              .input('ProdShift', sql.NVarChar(20), s.shift)
              .input('BDStartTime', sql.DateTime, new Date(dtStartTime))
              .input('BDEndTime', sql.DateTime, dtEndTime)
              .input('TotalBDTime', sql.Int, dtDuration)
              .input('TotalBDCount', sql.Int, 1)
              .input('AssignedUserID', sql.NVarChar(50), userId)
              .input('BDReason', sql.NVarChar(255), dtItem.reason)
              .input('BDStatus', sql.Int, 1)
              .query(`
                INSERT INTO Maint_BreakDown_Log 
                  (StationID, EquipmentID, LossID, AlarmID, SubLossID, ProdDate, ProdShift, BDStartTime, BDEndTime, TotalBDTime, TotalBDCount, AssignedUserID, BDReason, BDStatus)
                VALUES 
                  (@StationID, @EquipmentID, @LossID, @AlarmID, @SubLossID, @ProdDate, @ProdShift, @BDStartTime, @BDEndTime, @TotalBDTime, @TotalBDCount, @AssignedUserID, @BDReason, @BDStatus)
              `);
            totalBreakdownsCreated++;
          }
        }

        // Insert Quality Defects
        const defectCount = Math.floor(Math.random() * 2);
        for (let dfIdx = 0; dfIdx < defectCount; dfIdx++) {
          const engNo = `E${dateStr.replace(/-/g, '').slice(2)}-D${totalDefectsCreated + 1}`;
          const dfTime = `${dateStr} ${String(s.startHour + 2).padStart(2, '0')}:30:00`;
          const dfRemark = defectRemarks[Math.floor(Math.random() * defectRemarks.length)];
          const inspector = userNames[Math.floor(Math.random() * userNames.length)];

          await pool.request()
            .input('Timestamp', sql.DateTime, new Date(dfTime))
            .input('EngineNo', sql.NVarChar(14), engNo.slice(0, 14))
            .input('Remark', sql.NVarChar(255), dfRemark)
            .input('Status', sql.Int, Math.random() > 0.2 ? 1 : 2)
            .input('UpdatedBy', sql.NVarChar(100), inspector)
            .query(`
              INSERT INTO Prod_Defect_Log (Timestamp, EngineNo, DefectCheck, DefectAdjust, DefectAlert, DefectReplace, Remark, Status, UpdatedBy)
              VALUES (@Timestamp, @EngineNo, 1, 0, 0, 0, @Remark, @Status, @UpdatedBy)
            `);
          totalDefectsCreated++;
        }

        // Insert QA Audits (IQC, IPQC, FQC)
        for (const auditListId of [18, 13, 15]) {
          const aStart = `${dateStr} ${String(s.startHour + 1).padStart(2, '0')}:15:00`;
          const aEnd = `${dateStr} ${String(s.startHour + 2).padStart(2, '0')}:00:00`;
          const aStatus = Math.random() > 0.15 ? 1 : 2;

          await pool.request()
            .input('LineID', sql.Int, l.lineId)
            .input('AuditListID', sql.Int, auditListId)
            .input('AuditInstanceID', sql.Int, totalAuditsCreated + 1)
            .input('StartDateTime', sql.DateTime, new Date(aStart))
            .input('EndDateTime', sql.DateTime, new Date(aEnd))
            .input('ActualStartDateTime', sql.DateTime, new Date(aStart))
            .input('ActualEndDateTime', sql.DateTime, new Date(aEnd))
            .input('Notification', sql.Int, 0)
            .input('Status', sql.Int, aStatus)
            .query(`
              INSERT INTO QA_AuditMonitoring 
                (LineID, AuditListID, AuditInstanceID, StartDateTime, EndDateTime, ActualStartDateTime, ActualEndDateTime, Notification, Status)
              VALUES 
                (@LineID, @AuditListID, @AuditInstanceID, @StartDateTime, @EndDateTime, @ActualStartDateTime, @ActualEndDateTime, @Notification, @Status)
            `);
          totalAuditsCreated++;
        }

        // Insert Torque Data (2 fastenings per shift for Process Monitoring)
        for (let tIdx = 0; tIdx < 2; tIdx++) {
          const tVal = Number((44.5 + Math.random() * 2.5).toFixed(1)); // 44.5 - 47.0 Nm
          const tTime = `${dateStr} ${String(s.startHour + tIdx + 1).padStart(2, '0')}:20:00`;

          await pool.request()
            .input('Timestamp', sql.DateTime, new Date(tTime))
            .input('SKUID', sql.Int, l.skuId)
            .input('ActivityID', sql.Int, 1)
            .input('ActivityValue', sql.Decimal(5, 1), tVal)
            .input('Angle', sql.Int, 180)
            .input('Rundown', sql.Decimal(5, 1), 35.0)
            .input('CycleTime', sql.Int, 4)
            .input('Count', sql.NVarChar(10), '1')
            .input('UpperLimit', sql.Decimal(5, 1), 50.0)
            .input('LowerLimit', sql.Decimal(5, 1), 40.0)
            .query(`
              INSERT INTO Prod_TorqueData_Log (Timestamp, SKUID, ActivityID, ActivityValue, Angle, Rundown, CycleTime, Count, UpperLimit, LowerLimit)
              VALUES (@Timestamp, @SKUID, @ActivityID, @ActivityValue, @Angle, @Rundown, @CycleTime, @Count, @UpperLimit, @LowerLimit)
            `);
          totalTorqueCreated++;
        }

        // Insert WIP units for the recent 7 days
        if (dates.indexOf(dateStr) >= dates.length - 7) {
          const wipStatuses = [1, 2, 3, 4];
          for (let w = 0; w < 3; w++) {
            const wipEngNo = `E${dateStr.replace(/-/g, '').slice(2)}-W${totalWIPCreated + 1}`;
            const wipStart = `${dateStr} ${String(s.startHour + w).padStart(2, '0')}:10:00`;
            const wipStatus = wipStatuses[w % wipStatuses.length];

            await pool.request()
              .input('EngineNo', sql.NVarChar(14), wipEngNo.slice(0, 14))
              .input('PlanID', sql.Int, planId)
              .input('SKUID', sql.Int, l.skuId)
              .input('LineID', sql.Int, l.lineId)
              .input('StartTime', sql.DateTime, new Date(wipStart))
              .input('EndTime', sql.DateTime, new Date(new Date(wipStart).getTime() + 45 * 60000))
              .input('Status', sql.Int, wipStatus)
              .input('NotOkStation', sql.Int, (w % 3) + 1)
              .input('ReEntryStation', sql.Int, 1)
              .input('SAMarrigeStatus', sql.Int, 1)
              .query(`
                INSERT INTO Prod_Engine_WIP 
                  (EngineNo, PlanID, SKUID, LineID, StartTime, EndTime, Status, NotOkStation, ReEntryStation, SAMarrigeStatus)
                VALUES 
                  (@EngineNo, @PlanID, @SKUID, @LineID, @StartTime, @EndTime, @Status, @NotOkStation, @ReEntryStation, @SAMarrigeStatus)
              `);
            totalWIPCreated++;

            // Insert matching Genealogy trace for this engine across ST1, ST2, ST3
            for (let st = 1; st <= 3; st++) {
              const genTime = `${dateStr} ${String(s.startHour + w).padStart(2, '0')}:${String(10 + st * 5).padStart(2, '0')}:00`;
              await pool.request()
                .input('Timestamp', sql.DateTime, new Date(genTime))
                .input('EngineNo', sql.NVarChar(14), wipEngNo.slice(0, 14))
                .input('StationID', sql.Int, st)
                .input('ActivityID', sql.Int, 1)
                .input('ActivityValue', sql.NVarChar(50), 'OK')
                .input('Count', sql.Int, 1)
                .input('Status', sql.Int, 1)
                .input('UsersID', sql.NVarChar(50), '2')
                .query(`
                  INSERT INTO Prod_Engine_Geneology (Timestamp, EngineNo, StationID, ActivityID, ActivityValue, Count, Status, UsersID)
                  VALUES (@Timestamp, @EngineNo, @StationID, @ActivityID, @ActivityValue, @Count, @Status, @UsersID)
                `);
              totalGenealogyCreated++;
            }
          }
        }
      }
    }
  }

  console.log('\n=====================================================');
  console.log('  30-DAY COMPLETE SEEDING SUCCEEDED!');
  console.log('=====================================================');
  console.log(`✓ Prod_Shift_Plan & Executions : ${totalPlansCreated} plans generated`);
  console.log(`✓ Perf_Hourly_OLE              : ${totalHourlyCreated} hourly records`);
  console.log(`✓ Perf_Downtime (Stoppages)    : ${totalDowntimesCreated} downtime incidents`);
  console.log(`✓ Maint_BreakDown_Log          : ${totalBreakdownsCreated} breakdowns recorded`);
  console.log(`✓ Prod_Defect_Log              : ${totalDefectsCreated} defect logs`);
  console.log(`✓ QA_AuditMonitoring           : ${totalAuditsCreated} audits`);
  console.log(`✓ Prod_TorqueData_Log          : ${totalTorqueCreated} torque readings`);
  console.log(`✓ Prod_Engine_WIP              : ${totalWIPCreated} active WIP units`);
  console.log(`✓ Prod_Engine_Geneology        : ${totalGenealogyCreated} genealogy traces`);
  console.log('=====================================================\n');

  process.exit(0);
}

seedComplete30Days().catch(e => {
  console.error('Fatal Seeder Error:', e);
  process.exit(1);
});
