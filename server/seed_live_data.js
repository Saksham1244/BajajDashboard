const msnodesql = require('msnodesqlv8');
require('dotenv').config();

const serverName = process.env.DB_SERVER || 'localhost';
const databaseName = process.env.DB_NAME || 'PPMS_BajajPant';
const connStr = `server=${serverName};Database=${databaseName};Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0};TrustServerCertificate=Yes;`;

console.log(`\n========================================================================`);
console.log(`  BAJAJ PPMS: 30-DAY LIVE DATABASE SEEDING ENGINE`);
console.log(`  Database: ${databaseName} on ${serverName}`);
console.log(`========================================================================\n`);

const runQuery = (sql) => {
  return new Promise((resolve, reject) => {
    msnodesql.query(connStr, sql, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function seedDatabase() {
  try {
    console.log('[1/5] Ensuring Configuration Master Data...');

    // 1. Config_Line
    await runQuery(`
      IF NOT EXISTS (SELECT 1 FROM Config_Line WHERE LineID = 1)
        INSERT INTO Config_Line (LineID, ShopID, LineName, LineDesc) VALUES (1, 1, 'Line 1', 'Main Assembly Line');
      IF NOT EXISTS (SELECT 1 FROM Config_Line WHERE LineID = 2)
        INSERT INTO Config_Line (LineID, ShopID, LineName, LineDesc) VALUES (2, 1, 'Line2', 'Secondary Assembly Line');
    `);

    // 2. Config_ModelFamily & Config_Model
    await runQuery(`
      IF NOT EXISTS (SELECT 1 FROM Config_ModelFamily WHERE ModelFamilyID = 1)
        INSERT INTO Config_ModelFamily (ModelFamilyID, ModelFamilyName, ModelFamilyDesc) VALUES (1, 'Bike', 'Motorcycle Assembly');
      IF NOT EXISTS (SELECT 1 FROM Config_Model WHERE ModelID = 1)
        INSERT INTO Config_Model (ModelID, ModelFamilyID, ModelName, ModelDesc) VALUES (1, 1, 'A', 'Model A 150cc');
    `);

    // 3. Config_SKU
    await runQuery(`
      IF NOT EXISTS (SELECT 1 FROM Config_SKU WHERE SKUID = 1)
        INSERT INTO Config_SKU (SKUID, ModelID, SKUName, SKUDesc) VALUES (1, 1, 'SKU1', 'Pulsar 150 Standard');
      IF NOT EXISTS (SELECT 1 FROM Config_SKU WHERE SKUID = 2)
        INSERT INTO Config_SKU (SKUID, ModelID, SKUName, SKUDesc) VALUES (2, 1, 'SKU2', 'Dominar 400 Premium');
    `);

    // 4. Config_Station
    await runQuery(`
      IF NOT EXISTS (SELECT 1 FROM Config_Station WHERE StationID = 1)
        INSERT INTO Config_Station (StationID, SubAsslyLineID, LineZoneID, StationName, StationDesc, StationType, StationSide, StageNo, SkillLevel)
        VALUES (1, 1, 1, 'Demo', 'Block Assembly', 1, '1', 1, 1);
      IF NOT EXISTS (SELECT 1 FROM Config_Station WHERE StationID = 2)
        INSERT INTO Config_Station (StationID, SubAsslyLineID, LineZoneID, StationName, StationDesc, StationType, StationSide, StageNo, SkillLevel)
        VALUES (2, 1, 1, 'Line2', 'Head Tightening', 1, 'LH', 2, 1);
      IF NOT EXISTS (SELECT 1 FROM Config_Station WHERE StationID = 3)
        INSERT INTO Config_Station (StationID, SubAsslyLineID, LineZoneID, StationName, StationDesc, StationType, StationSide, StageNo, SkillLevel)
        VALUES (3, 1, 1, 'Station2', 'Cold Test & Inspection', 2, 'RH', 3, 1);
    `);

    // 5. Config_SubLossCategory
    await runQuery(`
      IF NOT EXISTS (SELECT 1 FROM Config_SubLossCategory WHERE SubLossID = 1)
        INSERT INTO Config_SubLossCategory (SubLossID, SubLossName, SubLossDesc, LossID) VALUES (1, 'Mechanical Failure', 'Mechanical defect', 1);
      IF NOT EXISTS (SELECT 1 FROM Config_SubLossCategory WHERE SubLossID = 2)
        INSERT INTO Config_SubLossCategory (SubLossID, SubLossName, SubLossDesc, LossID) VALUES (2, 'Electrical Failure', 'Electrical defect', 1);
      IF NOT EXISTS (SELECT 1 FROM Config_SubLossCategory WHERE SubLossID = 3)
        INSERT INTO Config_SubLossCategory (SubLossID, SubLossName, SubLossDesc, LossID) VALUES (3, 'Setup & Changeover', 'Setup delay', 1);
    `);

    console.log('[2/5] Generating 30 Days of Shift Plans & Plan Execution Records...');
    
    // Helper function to format local YYYY-MM-DD
    const formatLocalDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Generate dates for the past 30 days up to today
    const dates = [];
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(formatLocalDate(d));
    }

    let insertedPlans = 0;
    let insertedDowntime = 0;

    const downtimeReasons = [
      'Conveyor Jam',
      'Motor Overload',
      'Tool Wear & Replacement',
      'Line Changeover',
      'Material Shortage',
      'Sensor Recalibration',
      'Quality Inspection Delay',
      'Preventive Maintenance'
    ];

    const todayStr = formatLocalDate(today);

    for (const dateStr of dates) {
      const isToday = (dateStr === todayStr);

      for (const shift of ['A', 'B']) {
        const isFutureShiftToday = isToday && shift === 'B';

        for (const lineId of [1, 2]) {
          for (const skuId of [1, 2]) {
            // Plan vs actual numbers
            const basePlan = skuId === 1 ? 450 : 380;
            const variance = Math.floor(Math.random() * 30) - 15;
            const planQty = basePlan + variance;

            // If Shift B today (upcoming shift), completed actuals are 0!
            const completedQty = isFutureShiftToday ? 0 : (planQty - Math.floor(Math.random() * 25 + 10));
            const reworkQty = isFutureShiftToday ? 0 : Math.floor(Math.random() * 12 + 4);
            const notOkQty = isFutureShiftToday ? 0 : Math.floor(Math.random() * 4 + 1);
            const matHold = isFutureShiftToday ? 0 : Math.floor(Math.random() * 3 + 1);
            const qcHold = isFutureShiftToday ? 0 : Math.floor(Math.random() * 3 + 1);
            const scrapQty = isFutureShiftToday ? 0 : (Math.random() > 0.8 ? 1 : 0);
            const mainlineQty = isFutureShiftToday ? 0 : (completedQty + Math.floor(Math.random() * 10 + 5));

            await runQuery(`
              DECLARE @CurPlanID INT;
              SELECT @CurPlanID = PlanID FROM Prod_Shift_Plan 
              WHERE ProdDate = '${dateStr}' AND ProdShift = '${shift}' AND LineID = ${lineId} AND SKUID = ${skuId};

              IF @CurPlanID IS NULL
              BEGIN
                INSERT INTO Prod_Shift_Plan (LineID, SKUID, ProdDate, ProdShift, PlanQty, Status, Priority, Source, LineSpeed)
                VALUES (${lineId}, ${skuId}, '${dateStr}', '${shift}', ${planQty}, 1, 1, 1, 5);
                SET @CurPlanID = SCOPE_IDENTITY();
              END

              IF NOT EXISTS (
                SELECT 1 FROM Prod_EnginePlanExecution 
                WHERE ProdDate = '${dateStr}' AND ProdShift = '${shift}' AND LineID = ${lineId} AND SKUID = ${skuId}
              )
              BEGIN
                INSERT INTO Prod_EnginePlanExecution (
                  PlanID, LineID, SKUID, ProdDate, ProdShift, PlanQty, KitAssembly_Qty, KitInspected_Qty,
                  ENGMainLine_Qty, ENGNotOK_Qty, ENGNotOKBypass_Qty, ENGTakeOut_Qty, ENGReworkOK_Qty,
                  ENGCompleted_Qty, ENGMaterialHold_Qty, ENGQualityHold_Qty, ENGScrapped_Qty, Status, LineSpeed
                ) VALUES (
                  @CurPlanID, ${lineId}, ${skuId}, '${dateStr}', '${shift}', ${planQty}, ${planQty}, ${isFutureShiftToday ? 0 : planQty - 5},
                  ${mainlineQty}, ${notOkQty}, 0, 1, ${reworkQty},
                  ${completedQty}, ${matHold}, ${qcHold}, ${scrapQty}, 1, 5
                );
              END
              ELSE IF '${dateStr}' = '${todayStr}' AND '${shift}' = 'B'
              BEGIN
                -- Ensure today's Shift B is updated to 0 completed actuals
                UPDATE Prod_EnginePlanExecution
                SET ENGCompleted_Qty = 0, ENGMainLine_Qty = 0, ENGReworkOK_Qty = 0, ENGNotOK_Qty = 0,
                    ENGMaterialHold_Qty = 0, ENGQualityHold_Qty = 0, ENGScrapped_Qty = 0
                WHERE ProdDate = '${todayStr}' AND ProdShift = 'B';
              END
            `);
            insertedPlans++;
          }
        }

        // Only insert downtime for completed shifts (skip upcoming Shift B today)
        if (!isFutureShiftToday) {
          const dtCount = Math.floor(Math.random() * 2) + 1;
          for (let k = 0; k < dtCount; k++) {
            const reason = downtimeReasons[Math.floor(Math.random() * downtimeReasons.length)];
            const subLossId = (k % 3) + 1;
            const dtMins = Math.floor(Math.random() * 35) + 10;
            const startHour = shift === 'A' ? (7 + k * 3) : (15 + k * 3);
            const startStr = `${dateStr} ${String(startHour).padStart(2, '0')}:15:00`;
            const endStr = `${dateStr} ${String(startHour).padStart(2, '0')}:${15 + (dtMins % 40)}:00`;
            const stationId = Math.floor(Math.random() * 3) + 1;

            await runQuery(`
              IF NOT EXISTS (
                SELECT 1 FROM Perf_Downtime 
                WHERE ProdDate = '${dateStr}' AND ProdShift = '${shift}' AND StartTime = '${startStr}'
              )
              BEGIN
                INSERT INTO Perf_Downtime (
                  SubAsslyLineID, StationID, ProdDate, ProdShift, StartTime, EndTime, CurrentDT, TotalDT, LossID, SubLossID, [4MLossID], UserID, Reason
                ) VALUES (
                  1, ${stationId}, '${dateStr}', '${shift}', '${startStr}', '${endStr}', ${dtMins}, ${dtMins}, 1, ${subLossId}, 1, '1', '${reason}'
                );
              END
            `);
            insertedDowntime++;
          }
        } else {
          // Clean any accidental future downtime for today Shift B
          await runQuery(`DELETE FROM Perf_Downtime WHERE ProdDate = '${todayStr}' AND ProdShift = 'B'`);
        }
      }
    }

    console.log(`[3/5] Inserted/Verified ${insertedPlans} Shift Plans & ${insertedDowntime} Downtime logs across 30 days.`);

    console.log('[4/5] Seeding Torque Logs, WIP Buffers & Defect Logs...');
    
    // Seed Sample Torque Logs
    for (let t = 1; t <= 15; t++) {
      const torque = (44.5 + Math.random() * 2.5).toFixed(1);
      await runQuery(`
        IF NOT EXISTS (SELECT 1 FROM Prod_TorqueData_Log WHERE Timestamp >= '2026-08-20' AND RowID = ${t})
        BEGIN
          INSERT INTO Prod_TorqueData_Log (SKUID, ActivityID, ActivityValue, Angle, Rundown, CycleTime, Count, UpperLimit, LowerLimit)
          VALUES (1, 1, ${torque}, 90, 42.0, 12, '1', 50.0, 40.0);
        END
      `);
    }

    // Seed Sample WIP Buffers
    for (let w = 1; w <= 10; w++) {
      const engNo = `E26-WIP-${String(w).padStart(2, '0')}`;
      await runQuery(`
        IF NOT EXISTS (SELECT 1 FROM Prod_Engine_WIP WHERE EngineNo = '${engNo}')
        BEGIN
          INSERT INTO Prod_Engine_WIP (EngineNo, PlanID, SKUID, LineID, StartTime, Status)
          VALUES ('${engNo}', 1, 1, 1, GETDATE(), 1);
        END
      `);
    }

    // Seed Sample Quality Defects
    const defectRemarks = ['Casing Scratch', 'Torque Outlier', 'Gasket Fitment', 'Oil Ring Misalignment'];
    for (let df = 1; df <= 8; df++) {
      const engNo = `E26-DEF-${String(df).padStart(2, '0')}`;
      const remark = defectRemarks[df % defectRemarks.length];
      await runQuery(`
        IF NOT EXISTS (SELECT 1 FROM Prod_Defect_Log WHERE EngineNo = '${engNo}')
        BEGIN
          INSERT INTO Prod_Defect_Log (InspectionPointID, DefectID, EngineNo, DefectCheck, DefectAdjust, DefectAlert, DefectReplace, Remark, Status, UpdatedBy)
          VALUES (5, 3, '${engNo}', 1, 1, 0, 0, '${remark}', 1, 'Rahul Sharma');
        END
      `);
    }

    // Seed Track & Trace Engine Genealogy
    const stages = [1, 2, 3];
    for (let g = 1; g <= 5; g++) {
      const engNo = `E26-TRC-${String(g).padStart(2, '0')}`;
      for (const st of stages) {
        await runQuery(`
          IF NOT EXISTS (SELECT 1 FROM Prod_Engine_Geneology WHERE EngineNo = '${engNo}' AND StationID = ${st})
          BEGIN
            INSERT INTO Prod_Engine_Geneology (Timestamp, EngineNo, StationID, ActivityID, ActivityValue, Count, Status, UsersID)
            VALUES (GETDATE(), '${engNo}', ${st}, 1, 'OK', 1, 1, '1');
          END
        `);
      }
    }

    console.log('\n[5/5] Database Seeding Completed Successfully! 🚀\n');
    console.log('========================================================================');
    console.log('✅ PAST 30 DAYS (1 MONTH) DATA POPULATED IN SQL SERVER');
    console.log('✅ PAST 7 DAYS (1 WEEK) DATA POPULATED IN SQL SERVER');
    console.log('✅ TODAY (1 DAY) DATA POPULATED IN SQL SERVER');
    console.log('✅ SHIFT A & SHIFT B (2 SHIFTS) DATA POPULATED IN SQL SERVER');
    console.log('✅ PRODUCTION, DOWNTIME, WIP, TORQUE, QUALITY & TRACE TABLES ACTIVE');
    console.log('========================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err.message || err);
    process.exit(1);
  }
}

seedDatabase();
