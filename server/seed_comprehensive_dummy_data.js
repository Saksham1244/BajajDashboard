const { poolPromise, sql } = require('./db.js');

async function seedComprehensiveDummyData() {
  console.log('================================================================');
  console.log('  STARTING COMPREHENSIVE DUMMY DATA SEEDER FOR BAJAJ PPMS');
  console.log('================================================================');

  const pool = await poolPromise;

  // -------------------------------------------------------------
  // 1. ENSURE SUPPORTING TABLES EXIST
  // -------------------------------------------------------------
  console.log('\n[1/7] Ensuring auxiliary tables (Prod_Kit_Inspection_Log) & seeding official Material tables...');

  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Prod_Kit_Inspection_Log')
    BEGIN
      CREATE TABLE Prod_Kit_Inspection_Log (
        UID INT IDENTITY(1,1) PRIMARY KEY,
        KitID VARCHAR(50) NOT NULL,
        LineID INT DEFAULT 1,
        SKUID INT DEFAULT 1,
        ModelID INT DEFAULT 1,
        ProdDate DATE NOT NULL,
        ProdShift VARCHAR(10) NOT NULL,
        [Status] VARCHAR(20) NOT NULL,
        DefectReason VARCHAR(100) NULL,
        Accuracy INT DEFAULT 100,
        InspectorName VARCHAR(100) NOT NULL,
        InspectionTime TIME NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
      );
    END;
  `);

  // Populate official Material tables using real Config_PartVariant parts
  const realParts = [
    { partId: 'PD551086', min: 50, max: 400, store: 320, kitC: 45, kitD: 40, sideC: 25, sideD: 20 },
    { partId: 'PD551057', min: 60, max: 500, store: 280, kitC: 50, kitD: 45, sideC: 30, sideD: 25 },
    { partId: '52JE0545', min: 40, max: 350, store: 210, kitC: 35, kitD: 30, sideC: 20, sideD: 15 },
    { partId: '52JE0536', min: 40, max: 350, store: 220, kitC: 35, kitD: 30, sideC: 20, sideD: 15 },
    { partId: '52PD1803', min: 50, max: 450, store: 310, kitC: 40, kitD: 40, sideC: 25, sideD: 20 },
    { partId: 'DH103773', min: 70, max: 600, store: 45, kitC: 10, kitD: 10, sideC: 5, sideD: 5 },
    { partId: '56PD5D28', min: 50, max: 400, store: 380, kitC: 50, kitD: 45, sideC: 30, sideD: 25 },
    { partId: '52PD1611', min: 50, max: 400, store: 410, kitC: 50, kitD: 50, sideC: 30, sideD: 30 },
    { partId: '14151033', min: 60, max: 500, store: 340, kitC: 45, kitD: 40, sideC: 25, sideD: 20 },
    { partId: '39188020', min: 60, max: 500, store: 290, kitC: 40, kitD: 40, sideC: 20, sideD: 20 },
    { partId: 'PD621421', min: 80, max: 600, store: 390, kitC: 60, kitD: 60, sideC: 35, sideD: 30 },
    { partId: 'PD621423', min: 80, max: 600, store: 380, kitC: 60, kitD: 60, sideC: 35, sideD: 30 }
  ];

  for (const p of realParts) {
    await pool.request().query(`
      IF NOT EXISTS (SELECT 1 FROM Config_MaterialLocationMapping WHERE PartID = '${p.partId}')
      BEGIN
        INSERT INTO Config_MaterialLocationMapping (PartID, AreaID, StorageType, PackStdQty, MinAreaCapacity, MaxAreaCapacity)
        VALUES ('${p.partId}', 1, 1, 50, ${p.min}, ${p.max});
      END
      ELSE
      BEGIN
        UPDATE Config_MaterialLocationMapping
        SET MinAreaCapacity = ${p.min}, MaxAreaCapacity = ${p.max}, PackStdQty = 50
        WHERE PartID = '${p.partId}';
      END
    `);

    await pool.request().query(`
      IF NOT EXISTS (SELECT 1 FROM Material_Stock WHERE PartID = '${p.partId}')
      BEGIN
        INSERT INTO Material_Stock (
          PartID, IncomingQty, StoreQty, StoreHoldQty,
          LineCKitRackQty, LineCHoldKitRackQty, LineDKitRackQty, LineDHoldKitRackQty,
          LineCMaterialOnKit, LineCHoldMaterialOnKit, LineDMaterialOnKit, LineDHoldMaterialOnKit,
          LineCQty, LineCHoldQty, LineDQty, LineDHoldQty,
          LinesideCQty, LinesideCHoldQty, LinesideDQty, LinesideDHoldQty
        ) VALUES (
          '${p.partId}', 500, ${p.store}, 0,
          ${p.kitC}, 0, ${p.kitD}, 0,
          10, 0, 10, 0,
          15, 0, 15, 0,
          ${p.sideC}, 0, ${p.sideD}, 0
        );
      END
      ELSE
      BEGIN
        UPDATE Material_Stock SET
          StoreQty = ${p.store},
          StoreHoldQty = 0,
          LineCKitRackQty = ${p.kitC},
          LineDKitRackQty = ${p.kitD},
          LinesideCQty = ${p.sideC},
          LinesideDQty = ${p.sideD}
        WHERE PartID = '${p.partId}';
      END
    `);
  }
  console.log('✓ Material_Stock and Config_MaterialLocationMapping seeded');

  // Populate Material_Movement_Log
  await pool.request().query(`
    DELETE FROM Material_Movement_Log;
    INSERT INTO Material_Movement_Log (PartID, SourceAreaID, DestinationAreaID, Quantity, BatchID, TimeStamp) VALUES
      ('PD551086', 1, 2, 50, 101, DATEADD(minute, -180, GETDATE())),
      ('PD551057', 1, 2, 50, 102, DATEADD(minute, -150, GETDATE())),
      ('52JE0545', 1, 2, 40, 103, DATEADD(minute, -120, GETDATE())),
      ('52JE0536', 1, 2, 40, 104, DATEADD(minute, -90, GETDATE())),
      ('52PD1803', 1, 2, 50, 105, DATEADD(minute, -70, GETDATE())),
      ('DH103773', 1, 2, 20, 106, DATEADD(minute, -50, GETDATE())),
      ('56PD5D28', 1, 2, 40, 107, DATEADD(minute, -30, GETDATE())),
      ('52PD1611', 1, 2, 50, 108, DATEADD(minute, -15, GETDATE()));
  `);
  console.log('✓ Material_Movement_Log seeded');

  // Populate PM Checklists and Schedules
  await pool.request().query(`
    DELETE FROM Config_PMSchedule;
    DELETE FROM Config_PMCheckList;

    INSERT INTO Config_PMCheckList (EquipmentId, CheckListName, CheckListDesc) VALUES
      (1, 'Weekly Nutrunner Calibration', 'Torque transducer verification'),
      (1, 'Daily Conveyor Belt Inspection', 'Tension and sensor alignment audit'),
      (1, 'Monthly Pneumatic Filter Clean', 'Air regulator lubrication and filter purge'),
      (1, 'Bi-Weekly Fixture Lubrication', 'Clamping pin and cylinder lubrication');

    DECLARE @c1 INT = (SELECT TOP 1 CheckListId FROM Config_PMCheckList ORDER BY CheckListId ASC);
    DECLARE @c2 INT = (SELECT TOP 1 CheckListId FROM Config_PMCheckList WHERE CheckListId > @c1 ORDER BY CheckListId ASC);

    INSERT INTO Config_PMSchedule (LineId, CheckListId, StartDate, StartCount, FrequencyType, FrequencyValue, Alert, EstimatedDuration) VALUES
      (1, @c1, '2026-11-10', 1, 1, 7, 0, 30),
      (1, @c2, '2026-11-12', 1, 1, 1, 0, 15),
      (1, @c1, '2026-11-13', 1, 1, 7, 0, 30),
      (1, @c2, '2026-11-15', 1, 1, 14, 0, 45);
  `);
  console.log('✓ Config_PMCheckList and Config_PMSchedule seeded');

  // Populate Config_Skill and Config_OperatorSkillMapping
  await pool.request().query(`
    DELETE FROM Config_OperatorSkillMapping;

    IF NOT EXISTS (SELECT 1 FROM Config_Skill)
    BEGIN
      INSERT INTO Config_Skill (ActivityID, SkillName, SkillDesc) VALUES
        (1, 'Crankcase Assembly & Alignment', 'Precision fitting of LH & RH crankcases'),
        (2, 'Torque Tool Operation', 'Calibrated electronic nutrunner fastening'),
        (3, 'Valve & Tappet Clearance Setting', 'Feeler gauge inspection and clearance adjustment'),
        (4, 'Piston Ring Fitment', 'Ring orientation, gap spacing, and ring compressor use'),
        (5, 'Quality Inspection & Poka-Yoke', 'Audit verification and sensor testing');
    END

    -- Map Operators dynamically to valid SkillIDs
    INSERT INTO Config_OperatorSkillMapping (UserID, SkillID, SkillLevelID)
    SELECT u.UserID, s.SkillID, ((CAST(u.UserID AS INT) + s.SkillID) % 3) + 1
    FROM (SELECT UserID FROM Config_User WHERE UserID IN ('1', '2', '3', '4', '6', '7', '8')) u
    CROSS JOIN Config_Skill s;
  `);
  console.log('✓ Config_Skill and Config_OperatorSkillMapping seeded');

  // Update ApplicationSetting to Today (2026-11-13) Shift A
  await pool.request().query(`
    UPDATE ApplicationSetting SET ParameterValue = '13-11-2026' WHERE ParameterID = 1;
    UPDATE ApplicationSetting SET ParameterValue = 'A' WHERE ParameterID = 2;
  `);
  console.log('✓ ApplicationSetting updated to 13-11-2026, Shift A');

  // Standardize DS_Prod_EngineStatusCountBySKU date handling
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE [dbo].[DS_Prod_EngineStatusCountBySKU]
    (
        @SKUID INT = 0
    )
    AS
    BEGIN
        SET NOCOUNT ON;
        BEGIN TRY
            DECLARE @ProdDateStr NVARCHAR(50),
                    @ProdShift NVARCHAR(50),
                    @ProdDate DATE;

            SELECT TOP (1) 
                @ProdDateStr = TRIM(ParameterValue)
            FROM dbo.ApplicationSetting
            WHERE ParameterID = 1
            ORDER BY UID DESC;

            IF @ProdDateStr IS NULL
            BEGIN
                SELECT TOP (1) @ProdDateStr = TRIM(ParameterValue)
                FROM dbo.Prod_ShiftInformation
                WHERE ParameterName = 'ProdDate'
                ORDER BY UID DESC;
            END

            -- Try format 105 (DD-MM-YYYY) first, then standard YYYY-MM-DD
            SET @ProdDate = TRY_CONVERT(DATE, @ProdDateStr, 105);
            IF @ProdDate IS NULL AND @ProdDateStr IS NOT NULL
            BEGIN
                SET @ProdDate = TRY_CONVERT(DATE, @ProdDateStr, 120);
            END

            SELECT TOP (1) 
                @ProdShift = TRIM(ParameterValue)
            FROM dbo.ApplicationSetting
            WHERE ParameterID = 2
            ORDER BY UID DESC;

            IF @ProdShift IS NULL
            BEGIN
                SELECT TOP (1) @ProdShift = TRIM(ParameterValue)
                FROM dbo.Prod_ShiftInformation
                WHERE ParameterName = 'ProdShift'
                ORDER BY UID DESC;
            END

            CREATE TABLE #WIP_Engines (
                EngineNo NVARCHAR(50) COLLATE DATABASE_DEFAULT
            );

            INSERT INTO #WIP_Engines (EngineNo)
            SELECT DISTINCT
                W.EngineNo
            FROM dbo.Prod_Engine_WIP W
            WHERE (@SKUID IS NULL OR @SKUID = 0 OR W.SKUID = @SKUID);

            CREATE TABLE #Geneology_Ranked (
                EngineNo NVARCHAR(50) COLLATE DATABASE_DEFAULT,
                Status INT,
                rn INT
            );

            INSERT INTO #Geneology_Ranked (EngineNo, Status, rn)
            SELECT 
                G.EngineNo,
                G.Status,
                ROW_NUMBER() OVER (
                    PARTITION BY G.EngineNo 
                    ORDER BY G.[Timestamp] DESC, G.RowID DESC
                ) AS rn
            FROM dbo.Prod_Status_Geneology G
            INNER JOIN #WIP_Engines W ON G.EngineNo = W.EngineNo COLLATE DATABASE_DEFAULT
            WHERE (@ProdDate IS NULL OR G.ProdDate = @ProdDate)
              AND (@ProdShift IS NULL 
                   OR G.ProdShift = @ProdShift COLLATE DATABASE_DEFAULT
                   OR (@ProdShift = 'A' AND G.ProdShift IN ('1', 'Shift 1', 'Shift A', 'A'))
                   OR (@ProdShift = 'B' AND G.ProdShift IN ('2', 'Shift 2', 'Shift B', 'B'))
                   OR (@ProdShift = 'C' AND G.ProdShift IN ('3', 'Shift 3', 'Shift C', 'C')));

            SELECT 
                ISNULL(@ProdDate, CAST(GETDATE() AS DATE)) AS ProdDate,
                ISNULL(@ProdShift, 'A') AS ProdShift,
                COUNT(CASE WHEN Status = 6  THEN 1 END) AS NotOK,
                COUNT(CASE WHEN Status = 7  THEN 1 END) AS NotOKBypass,
                COUNT(CASE WHEN Status = 8  THEN 1 END) AS OKBypass,
                COUNT(CASE WHEN Status = 9  THEN 1 END) AS CompletedEng,
                COUNT(CASE WHEN Status = 10 THEN 1 END) AS FGEngine,
                COUNT(CASE WHEN Status = 12 THEN 1 END) AS EngMaterialHold,
                COUNT(CASE WHEN Status = 13 THEN 1 END) AS MaterialHoldCleared,
                COUNT(CASE WHEN Status = 14 THEN 1 END) AS ForRework,
                COUNT(CASE WHEN Status = 15 THEN 1 END) AS ReworkOK,
                COUNT(CASE WHEN Status = 26 THEN 1 END) AS EngFQCHold,
                COUNT(CASE WHEN Status = 21 THEN 1 END) AS EngIPQCHold,
                COUNT(CASE WHEN Status = 19 THEN 1 END) AS IPQCRework,
                COUNT(CASE WHEN Status = 22 THEN 1 END) AS IPQCHoldCleared,
                COUNT(CASE WHEN Status = 27 THEN 1 END) AS FQCHoldCleared,
                COUNT(CASE WHEN Status = 24 THEN 1 END) AS FQCRework,
                COUNT(CASE WHEN Status = 25 THEN 1 END) AS FGReworkOK,
                COUNT(CASE WHEN Status = 28 THEN 1 END) AS FGReworkRejected,
                COUNT(CASE WHEN Status = 11 THEN 1 END) AS EngineScrapped
            FROM #Geneology_Ranked
            WHERE rn = 1;

            DROP TABLE IF EXISTS #Geneology_Ranked;
            DROP TABLE IF EXISTS #WIP_Engines;
        END TRY
        BEGIN CATCH
            DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE(),
                    @ErrorSeverity INT = ERROR_SEVERITY(),
                    @ErrorState INT = ERROR_STATE();
            RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
        END CATCH
    END;
  `);

  await pool.request().query(`
    CREATE OR ALTER PROCEDURE [dbo].[USP_GetEngineStatusCountBySKU] (@SKUID INT = 0)
    AS BEGIN SET NOCOUNT ON; EXEC [dbo].[DS_Prod_EngineStatusCountBySKU] @SKUID = @SKUID; END;
  `);
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE [dbo].[DS_GetEngineStatusCountBySKU] (@SKUID INT = 0)
    AS BEGIN SET NOCOUNT ON; EXEC [dbo].[DS_Prod_EngineStatusCountBySKU] @SKUID = @SKUID; END;
  `);
  console.log('✓ DS_Prod_EngineStatusCountBySKU procedure updated and verified');

  // -------------------------------------------------------------
  // 2. CLEAR TRANSACTIONAL TABLES
  // -------------------------------------------------------------
  console.log('\n[2/7] Cleaning transactional tables...');
  const tablesToClear = [
    'Prod_Engine_Geneology',
    'Prod_Station_Geneology',
    'Prod_Status_Geneology',
    'Prod_Engine_WIP',
    'Prod_EnginePlanExecution',
    'Prod_Plan',
    'Perf_Hourly_OLE',
    'Perf_Downtime',
    'Maint_BreakDown_Log',
    'Prod_Defect_Log',
    'QA_AuditMonitoring',
    'Prod_TorqueData_Log',
    'Prod_Kit_Inspection_Log',
    'Prod_ShiftOperatorAssignment'
  ];

  for (const t of tablesToClear) {
    try {
      await pool.request().query(`DELETE FROM dbo.[${t}];`);
    } catch (e) {
      console.log(`Note clearing ${t}: ${e.message}`);
    }
  }
  console.log('✓ Transactional tables cleared');

  // -------------------------------------------------------------
  // 3. GENERATE 40 DAYS OF DATES UP TO TODAY (2026-11-13)
  // -------------------------------------------------------------
  console.log('\n[3/7] Generating 40 operational days of production data...');
  const dates = [];
  const today = new Date(2026, 10, 13); // 2026-11-13
  for (let i = 39; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }

  console.log(`Date range: ${dates[0]} to ${dates[dates.length - 1]} (${dates.length} days)`);

  const shifts = [
    { shift: '1', dbShift: 'A', startHour: 6, endHour: 14 },
    { shift: '2', dbShift: 'B', startHour: 14, endHour: 22 }
  ];

  // SKUs in database: 1 (PD501163), 2 (PD501060), 3 (JE501143), 5 (PD501214)
  const skus = [
    { skuId: 1, name: 'PD501163', lineSpeed: 4 },
    { skuId: 2, name: 'PD501060', lineSpeed: 4 },
    { skuId: 3, name: 'JE501143', lineSpeed: 4 },
    { skuId: 5, name: 'PD501214', lineSpeed: 4 }
  ];

  const stations = [
    { id: 487, name: 'KA01' },
    { id: 508, name: 'CCRH01' },
    { id: 557, name: 'RH00' },
    { id: 559, name: 'RH01' },
    { id: 561, name: 'RH02' },
    { id: 567, name: 'RH05' },
    { id: 585, name: 'RH14' }
  ];

  const downtimeReasons = [
    { reason: 'Pneumatic Air Pressure Drop', lossId: 1, subLossId: 16, stationId: 557 },
    { reason: 'Conveyor Drive Belt Slippage', lossId: 1, subLossId: 16, stationId: 559 },
    { reason: 'Nutrunner Controller Comm Timeout', lossId: 1, subLossId: 20, stationId: 567 },
    { reason: 'Model Fixture Changeover Delay', lossId: 2, subLossId: 17, stationId: 561 },
    { reason: 'Scheduled JH & Line Cleaning', lossId: 2, subLossId: 23, stationId: 487 },
    { reason: 'Crankcase Feeder Starvation', lossId: 3, subLossId: 24, stationId: 508 },
    { reason: 'Trolley Buffer Logistics Delay', lossId: 3, subLossId: 27, stationId: 487 },
    { reason: 'Poka Yoke Sensor Interlock Trigger', lossId: 4, subLossId: 22, stationId: 567 },
    { reason: 'Sealant Dispense Bead Width Deviation', lossId: 4, subLossId: 28, stationId: 585 }
  ];

  const defectRemarks = [
    'Bolt Under-Torque (Station RH05)',
    'Oil Seal Misalignment',
    'Crankcase Scratch',
    'Spark Plug Thread Burr',
    'Valve Clearance Gap Deviation',
    'Gasket Pinch & Leakage',
    'Timing Chain Tension Loose',
    'Sensor Wiring Loose Pin'
  ];

  const operators = ['1', '2', '3', '4', '6', '7', '8'];

  let totalPlans = 0;
  let totalHourly = 0;
  let totalDowntimes = 0;
  let totalBreakdowns = 0;
  let totalDefects = 0;
  let totalAudits = 0;
  let totalTorque = 0;
  let totalKits = 0;
  let totalOperatorAssignments = 0;

  for (let di = 0; di < dates.length; di++) {
    const dateStr = dates[di];
    const isToday = di === dates.length - 1;

    for (const s of shifts) {
      // Pick 2 active SKUs per shift
      const activeSkus = [skus[(di + (s.shift === '1' ? 0 : 1)) % skus.length], skus[(di + 2) % skus.length]];

      for (const skuItem of activeSkus) {
        const planQty = Math.floor(180 + Math.random() * 40); // 180 - 220
        const compRate = 0.93 + Math.random() * 0.05;
        const compQty = isToday && s.shift === '2' ? Math.floor(planQty * 0.4) : Math.floor(planQty * compRate);
        const reworkQty = Math.floor(2 + Math.random() * 6);
        const matHold = Math.floor(Math.random() * 2);
        const qualHold = Math.floor(Math.random() * 2);
        const notOk = Math.floor(1 + Math.random() * 3);
        const bypassQty = Math.floor(Math.random() * 2);
        const mainLineQty = compQty + notOk + matHold + qualHold;
        const planStatus = isToday ? (s.shift === '1' ? 4 : 5) : 4; // 4=Completed, 5=In-Progress

        // Insert Prod_Plan
        const insPlan = await pool.request()
          .input('LineID', sql.Int, 1)
          .input('SKUID', sql.Int, skuItem.skuId)
          .input('ProdDate', sql.Date, dateStr)
          .input('ProdShift', sql.NVarChar(10), s.dbShift)
          .input('PlanQty', sql.Int, planQty)
          .input('Status', sql.Int, planStatus)
          .input('Priority', sql.Int, 1)
          .input('Source', sql.Int, 1)
          .input('LineSpeed', sql.Int, skuItem.lineSpeed)
          .query(`
            INSERT INTO Prod_Plan (LineID, SKUID, ProdDate, ProdShift, PlanQty, Status, Priority, Source, LineSpeed)
            OUTPUT INSERTED.PlanID
            VALUES (@LineID, @SKUID, @ProdDate, @ProdShift, @PlanQty, @Status, @Priority, @Source, @LineSpeed)
          `);

        const planId = insPlan.recordset[0].PlanID;
        totalPlans++;

        // Insert Prod_EnginePlanExecution
        await pool.request()
          .input('PlanID', sql.Int, planId)
          .input('LineID', sql.Int, 1)
          .input('SKUID', sql.Int, skuItem.skuId)
          .input('ProdDate', sql.Date, dateStr)
          .input('ProdShift', sql.NVarChar(10), s.dbShift)
          .input('Priority', sql.Int, 1)
          .input('PlanQty', sql.Int, planQty)
          .input('KitAssembly_Qty', sql.Int, mainLineQty)
          .input('KitInspected_Qty', sql.Int, mainLineQty)
          .input('ENGMainLine_Qty', sql.Int, mainLineQty)
          .input('ENGNotOK_Qty', sql.Int, notOk)
          .input('ENGNotOKBypass_Qty', sql.Int, bypassQty)
          .input('ENGTakeOut_Qty', sql.Int, 0)
          .input('ENGReworkOK_Qty', sql.Int, reworkQty)
          .input('ENGCompleted_Qty', sql.Int, compQty)
          .input('ENGMaterialHold_Qty', sql.Int, matHold)
          .input('ENGQualityHold_Qty', sql.Int, qualHold)
          .input('ENGScrapped_Qty', sql.Int, 0)
          .input('Status', sql.Int, 1)
          .input('LineSpeed', sql.Int, skuItem.lineSpeed)
          .query(`
            INSERT INTO Prod_EnginePlanExecution 
              (PlanID, LineID, SKUID, ProdDate, ProdShift, Priority, PlanQty, KitAssembly_Qty, KitInspected_Qty, ENGMainLine_Qty, ENGNotOK_Qty, ENGNotOKBypass_Qty, ENGTakeOut_Qty, ENGReworkOK_Qty, ENGCompleted_Qty, ENGMaterialHold_Qty, ENGQualityHold_Qty, ENGScrapped_Qty, Status, LineSpeed)
            VALUES 
              (@PlanID, @LineID, @SKUID, @ProdDate, @ProdShift, @Priority, @PlanQty, @KitAssembly_Qty, @KitInspected_Qty, @ENGMainLine_Qty, @ENGNotOK_Qty, @ENGNotOKBypass_Qty, @ENGTakeOut_Qty, @ENGReworkOK_Qty, @ENGCompleted_Qty, @ENGMaterialHold_Qty, @ENGQualityHold_Qty, @ENGScrapped_Qty, @Status, @LineSpeed)
          `);
      }

      // Hourly OLE (8 hours per shift)
      for (let h = 0; h < 8; h++) {
        const hour = s.startHour + h;
        const timeStr = `${dateStr} ${String(hour).padStart(2, '0')}:00:00`;
        const plannedHr = 45;
        const actualHr = isToday && s.shift === '2' && h >= 4 ? 0 : Math.floor(40 + Math.random() * 8);
        const goodHr = actualHr > 0 ? actualHr - Math.floor(Math.random() * 2) : 0;
        const rejHr = actualHr - goodHr;
        const dtMins = actualHr > 0 ? Math.floor(2 + Math.random() * 6) : 0;
        const avail = actualHr > 0 ? Number((((60 - dtMins) / 60) * 100).toFixed(1)) : 0;
        const perf = actualHr > 0 ? Number(((actualHr / plannedHr) * 100).toFixed(1)) : 0;
        const qual = actualHr > 0 ? Number(((goodHr / actualHr) * 100).toFixed(1)) : 0;
        const ole = actualHr > 0 ? Number(((avail * perf * qual) / 10000).toFixed(1)) : 0;

        await pool.request()
          .input('Timestamp', sql.DateTime, new Date(timeStr))
          .input('LineID', sql.Int, 1)
          .input('SubAsslyLineID', sql.Int, 7) // Engine Assembly
          .input('ProdDate', sql.Date, dateStr)
          .input('ProdShift', sql.NVarChar(10), s.shift)
          .input('TotalTime', sql.DateTime, new Date(timeStr))
          .input('TotalDownTime', sql.Int, dtMins)
          .input('AvailableTime', sql.Int, 60 - dtMins)
          .input('PlannedQuantity', sql.Int, plannedHr)
          .input('ExpectedQuantity', sql.Int, plannedHr)
          .input('TotalQuantity', sql.Int, actualHr)
          .input('GoodQuantity', sql.Int, goodHr)
          .input('RejectionQuantity', sql.Int, rejHr)
          .input('Availability', sql.Decimal(5, 1), avail)
          .input('Performance', sql.Decimal(5, 1), perf)
          .input('Quality', sql.Decimal(5, 1), qual)
          .input('OLE', sql.Decimal(5, 1), ole)
          .query(`
            INSERT INTO Perf_Hourly_OLE 
              (Timestamp, LineID, SubAsslyLineID, ProdDate, ProdShift, TotalTime, TotalDownTime, AvailableTime, PlannedQuantity, ExpectedQuantity, TotalQuantity, GoodQuantity, RejectionQuantity, Availability, Performance, Quality, OLE)
            VALUES 
              (@Timestamp, @LineID, @SubAsslyLineID, @ProdDate, @ProdShift, @TotalTime, @TotalDownTime, @AvailableTime, @PlannedQuantity, @ExpectedQuantity, @TotalQuantity, @GoodQuantity, @RejectionQuantity, @Availability, @Performance, @Quality, @OLE)
          `);
        totalHourly++;
      }

      // Downtimes & Breakdowns (1-2 per shift)
      const dtCount = 1 + (di % 2);
      for (let dti = 0; dti < dtCount; dti++) {
        const dtItem = downtimeReasons[(di * 3 + dti) % downtimeReasons.length];
        const dtDuration = Math.floor(10 + Math.random() * 25);
        const dtHour = s.startHour + 1 + dti * 3;
        const dtStart = `${dateStr} ${String(dtHour).padStart(2, '0')}:15:00`;
        const dtEnd = new Date(new Date(dtStart).getTime() + dtDuration * 60000);
        const userId = operators[(di + dti) % operators.length];

        await pool.request()
          .input('TimeStamp', sql.DateTime, new Date(dtStart))
          .input('SubAsslyLineID', sql.Int, 7)
          .input('StationID', sql.Int, dtItem.stationId)
          .input('ProdDate', sql.Date, dateStr)
          .input('ProdShift', sql.NVarChar(10), s.shift)
          .input('StartTime', sql.DateTime, new Date(dtStart))
          .input('EndTime', sql.DateTime, dtEnd)
          .input('CurrentDT', sql.Int, dtDuration)
          .input('TotalDT', sql.Int, dtDuration)
          .input('LossID', sql.Int, dtItem.lossId)
          .input('SubLossID', sql.Int, dtItem.subLossId)
          .input('4MLossID', sql.Int, 1)
          .input('UserID', sql.NVarChar(50), userId)
          .input('Reason', sql.NVarChar(255), dtItem.reason)
          .input('LastUpdatedTime', sql.DateTime, dtEnd)
          .query(`
            INSERT INTO Perf_Downtime 
              (TimeStamp, SubAsslyLineID, StationID, ProdDate, ProdShift, StartTime, EndTime, CurrentDT, TotalDT, LossID, SubLossID, [4MLossID], UserID, Reason, LastUpdatedTime)
            VALUES 
              (@TimeStamp, @SubAsslyLineID, @StationID, @ProdDate, @ProdShift, @StartTime, @EndTime, @CurrentDT, @TotalDT, @LossID, @SubLossID, @4MLossID, @UserID, @Reason, @LastUpdatedTime)
          `);
        totalDowntimes++;

        // Add corresponding breakdown log
        if (dtItem.lossId === 1) {
          await pool.request()
            .input('BDTicketType', sql.Int, 1)
            .input('StationID', sql.Int, dtItem.stationId)
            .input('EquipmentID', sql.Int, 1)
            .input('LossID', sql.Int, dtItem.lossId)
            .input('AlarmID', sql.Int, 1)
            .input('SubLossID', sql.Int, dtItem.subLossId)
            .input('ProdDate', sql.Date, dateStr)
            .input('ProdShift', sql.NVarChar(10), s.shift)
            .input('BDStartTime', sql.DateTime, new Date(dtStart))
            .input('BDEndTime', sql.DateTime, dtEnd)
            .input('TotalBDTime', sql.BigInt, dtDuration)
            .input('TotalBDCount', sql.Int, 1)
            .input('AssignedUserID', sql.NVarChar(50), userId)
            .input('BDRemark', sql.NVarChar(255), dtItem.reason)
            .input('BDStatus', sql.Int, 1) // Resolved
            .query(`
              INSERT INTO Maint_BreakDown_Log 
                (BDTicketType, StationID, EquipmentID, LossID, AlarmID, SubLossID, ProdDate, ProdShift, BDStartTime, BDEndTime, TotalBDTime, TotalBDCount, AssignedUserID, BDRemark, BDStatus)
              VALUES 
                (@BDTicketType, @StationID, @EquipmentID, @LossID, @AlarmID, @SubLossID, @ProdDate, @ProdShift, @BDStartTime, @BDEndTime, @TotalBDTime, @TotalBDCount, @AssignedUserID, @BDRemark, @BDStatus)
            `);
          totalBreakdowns++;
        }
      }

      // Quality Defects
      const dfCount = Math.floor(Math.random() * 2);
      for (let dfi = 0; dfi < dfCount; dfi++) {
        const engNo = `E${dateStr.replace(/-/g, '').slice(2)}${String(totalDefects + 1).padStart(4, '0')}`;
        const dfRemark = defectRemarks[(totalDefects + dfi) % defectRemarks.length];
        const dfTime = `${dateStr} ${String(s.startHour + 2).padStart(2, '0')}:30:00`;
        const inspector = operators[dfi % operators.length];

        await pool.request()
          .input('InspectionRefID', sql.Int, 7)
          .input('DefectRefID', sql.Int, 100)
          .input('EngineNo', sql.NVarChar(14), engNo.slice(0, 14))
          .input('Remark', sql.NVarChar(255), dfRemark)
          .input('EngineStatus', sql.Int, 21) // EngIPQCHold
          .input('DefectStatus', sql.Int, 1)
          .input('UpdatedBy', sql.NVarChar(50), inspector)
          .input('LastUpdatedTime', sql.DateTime, new Date(dfTime))
          .input('QAlert', sql.Int, 1)
          .input('TimeStamp', sql.DateTime, new Date(dfTime))
          .query(`
            INSERT INTO Prod_Defect_Log 
              (InspectionRefID, DefectRefID, EngineNo, Remark, EngineStatus, DefectStatus, UpdatedBy, LastUpdatedTime, QAlert, TimeStamp)
            VALUES 
              (@InspectionRefID, @DefectRefID, @EngineNo, @Remark, @EngineStatus, @DefectStatus, @UpdatedBy, @LastUpdatedTime, @QAlert, @TimeStamp)
          `);
        totalDefects++;
      }

      // QA Audit Monitoring (PQCA, IQC, IPQC, FQC)
      const auditTypes = [6, 7, 9, 13, 18];
      for (const aId of auditTypes) {
        const aStart = `${dateStr} ${String(s.startHour + 1).padStart(2, '0')}:00:00`;
        const aEnd = `${dateStr} ${String(s.startHour + 2).padStart(2, '0')}:00:00`;
        const aStatus = Math.random() > 0.12 ? 1 : 2; // 1=OK, 2=NC

        await pool.request()
          .input('LineID', sql.Int, 1)
          .input('AuditListID', sql.Int, aId)
          .input('AuditInstanceID', sql.Int, totalAudits + 1)
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
        totalAudits++;
      }

      // Torque Data (2 readings per shift)
      for (let ti = 0; ti < 2; ti++) {
        const tVal = Number((43.0 + Math.random() * 4.0).toFixed(1));
        const tTime = `${dateStr} ${String(s.startHour + ti + 2).padStart(2, '0')}:20:00`;

        await pool.request()
          .input('Timestamp', sql.DateTime, new Date(tTime))
          .input('SKUID', sql.Int, 1)
          .input('ActivityID', sql.Int, 1)
          .input('ActivityValue', sql.Decimal(5, 1), tVal)
          .input('FinalAngle', sql.Int, 180)
          .input('Rundown', sql.Decimal(5, 1), 35.0)
          .input('CycleTime', sql.Int, 4)
          .input('Count', sql.NVarChar(10), '1')
          .input('UpperLimit', sql.Decimal(5, 1), 50.0)
          .input('LowerLimit', sql.Decimal(5, 1), 40.0)
          .query(`
            INSERT INTO Prod_TorqueData_Log 
              (Timestamp, SKUID, ActivityID, ActivityValue, FinalAngle, Rundown, CycleTime, Count, UpperLimit, LowerLimit)
            VALUES 
              (@Timestamp, @SKUID, @ActivityID, @ActivityValue, @FinalAngle, @Rundown, @CycleTime, @Count, @UpperLimit, @LowerLimit)
          `);
        totalTorque++;
      }

      // Kit Inspection
      for (let ki = 0; ki < 3; ki++) {
        const kitId = `KIT-${dateStr.replace(/-/g, '').slice(4)}-${String(totalKits + 1).padStart(3, '0')}`;
        const kitStatus = Math.random() > 0.08 ? 'OK' : 'NOK';
        const kitReason = kitStatus === 'NOK' ? 'Missing O-Ring (Head Gasket)' : null;
        const kitAccuracy = kitStatus === 'OK' ? 100 : 92;

        await pool.request()
          .input('KitID', sql.VarChar(50), kitId)
          .input('LineID', sql.Int, 1)
          .input('SKUID', sql.Int, 1)
          .input('ModelID', sql.Int, 1)
          .input('ProdDate', sql.Date, dateStr)
          .input('ProdShift', sql.VarChar(10), s.dbShift)
          .input('Status', sql.VarChar(20), kitStatus)
          .input('DefectReason', sql.VarChar(100), kitReason)
          .input('Accuracy', sql.Int, kitAccuracy)
          .input('InspectorName', sql.VarChar(100), 'Tanish')
          .input('InspectionTime', sql.VarChar(10), `${String(s.startHour + ki).padStart(2, '0')}:15:00`)
          .query(`
            INSERT INTO Prod_Kit_Inspection_Log 
              (KitID, LineID, SKUID, ModelID, ProdDate, ProdShift, [Status], DefectReason, Accuracy, InspectorName, InspectionTime)
            VALUES 
              (@KitID, @LineID, @SKUID, @ModelID, @ProdDate, @ProdShift, @Status, @DefectReason, @Accuracy, @InspectorName, CAST(@InspectionTime AS TIME))
          `);
        totalKits++;
      }

      // Workforce Operator Shift Assignment (for recent 7 days)
      if (di >= dates.length - 7) {
        for (let oi = 0; oi < operators.length; oi++) {
          const stn = stations[oi % stations.length];
          const assignTime = `${dateStr} ${String(s.startHour).padStart(2, '0')}:00:00`;

          await pool.request()
            .input('LineID', sql.Int, 1)
            .input('StationID', sql.Int, stn.id)
            .input('UserID', sql.NVarChar(50), operators[oi])
            .input('ProdDate', sql.Date, dateStr)
            .input('ProdShift', sql.NVarChar(10), s.dbShift)
            .input('UserStatus', sql.Int, 1) // Present
            .input('AssignmentTimestamp', sql.DateTime, new Date(assignTime))
            .input('LoggedInTimeStamp', sql.DateTime, new Date(assignTime))
            .query(`
              INSERT INTO Prod_ShiftOperatorAssignment 
                (LineID, StationID, UserID, ProdDate, ProdShift, UserStatus, AssignmentTimestamp, LoggedInTimeStamp)
              VALUES 
                (@LineID, @StationID, @UserID, @ProdDate, @ProdShift, @UserStatus, @AssignmentTimestamp, @LoggedInTimeStamp)
            `);
          totalOperatorAssignments++;
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 4. SEED TRACK & TRACE / GENEALOGY DATA
  // -------------------------------------------------------------
  console.log('\n[4/7] Seeding Track & Trace and Genealogy data for today and recent days...');

  // 14-station assembly sequence as per Bajaj Pantnagar DB Design
  const assemblySequence = [
    { station: 557, name: 'RH00', desc: 'Push Kit On Main Line', val: 'OK', dur: 3 },
    { station: 559, name: 'RH01', desc: 'RH crankcase loading & verification', val: 'OK', dur: 4 },
    { station: 561, name: 'RH02', desc: 'Input and Output Shaft Fitment', val: 'OK', dur: 5 },
    { station: 563, name: 'RH03', desc: 'Gear Box Assembly & check', val: 'OK', dur: 5 },
    { station: 564, name: 'LH03', desc: 'LH crank case Loading', val: 'OK', dur: 4 },
    { station: 566, name: 'LH04', desc: 'Fixture Clamping', val: 'OK', dur: 3 },
    { station: 567, name: 'RH05', desc: '1st Joining Bolt Tightening', val: '43.2 Nm', dur: 6 },
    { station: 568, name: 'LH05', desc: '2nd Joining Bolt Tightening', val: '42.8 Nm', dur: 5 },
    { station: 569, name: 'RH06', desc: 'Stator Coil Tightening', val: '18.5 Nm', dur: 4 },
    { station: 570, name: 'LH06', desc: 'GIS Pin and spring fitment', val: 'OK', dur: 5 },
    { station: 573, name: 'RH08', desc: 'Starter Motor Fitment', val: 'OK', dur: 4 },
    { station: 584, name: 'LH13', desc: 'Piston & Ring Fitment', val: 'OK', dur: 6 },
    { station: 586, name: 'LH14', desc: 'Cylinder Block Fitment', val: 'OK', dur: 6 },
    { station: 585, name: 'RH14', desc: 'Cylinder Head Fitment & Torquing', val: '54.5 Nm', dur: 7 }
  ];

  // Specific engines to seed covering all gate statuses requested by user
  const testEngines = [
    { engineNo: 'ENG20261113001', vr: 'VR1113001', kit: 'KIT001', stages: 14, status: 10, skuId: 1, desc: 'FG Engine' },
    { engineNo: 'ENG20261113002', vr: 'VR1113002', kit: 'KIT002', stages: 14, status: 9, skuId: 1, desc: 'Assembly Completed' },
    { engineNo: 'ENG20261113003', vr: 'VR1113003', kit: 'KIT003', stages: 10, status: 5, skuId: 1, desc: 'Engine In-Process' },
    { engineNo: 'ENG20261113004', vr: 'VR1113004', kit: 'KIT004', stages: 7, status: 6, skuId: 1, desc: 'Not OK' },
    { engineNo: 'ENG20261113005', vr: 'VR1113005', kit: 'KIT005', stages: 7, status: 7, skuId: 2, desc: 'Not OK Bypass' },
    { engineNo: 'ENG20261113006', vr: 'VR1113006', kit: 'KIT006', stages: 12, status: 8, skuId: 2, desc: 'OK Bypass' },
    { engineNo: 'ENG20261113007', vr: 'VR1113007', kit: 'KIT007', stages: 14, status: 11, skuId: 2, desc: 'Engine Scrapped' },
    { engineNo: 'ENG20261113008', vr: 'VR1113008', kit: 'KIT008', stages: 6, status: 12, skuId: 3, desc: 'Material Hold' },
    { engineNo: 'ENG20261113009', vr: 'VR1113009', kit: 'KIT009', stages: 9, status: 13, skuId: 3, desc: 'Material Hold Cleared' },
    { engineNo: 'ENG20261113010', vr: 'VR1113010', kit: 'KIT010', stages: 8, status: 14, skuId: 3, desc: 'Production Rework' },
    { engineNo: 'ENG20261113011', vr: 'VR1113011', kit: 'KIT011', stages: 11, status: 15, skuId: 5, desc: 'Rework OK' },
    { engineNo: 'ENG20261113012', vr: 'VR1113012', kit: 'KIT012', stages: 7, status: 19, skuId: 5, desc: 'IPQC Rework' },
    { engineNo: 'ENG20261113013', vr: 'VR1113013', kit: 'KIT013', stages: 7, status: 21, skuId: 5, desc: 'IPQC Hold' },
    { engineNo: 'ENG20261113014', vr: 'VR1113014', kit: 'KIT014', stages: 9, status: 22, skuId: 1, desc: 'IPQC Hold Cleared' },
    { engineNo: 'ENG20261113015', vr: 'VR1113015', kit: 'KIT015', stages: 14, status: 24, skuId: 1, desc: 'FQC Rework' },
    { engineNo: 'ENG20261113016', vr: 'VR1113016', kit: 'KIT016', stages: 14, status: 25, skuId: 1, desc: 'FG Rework OK' },
    { engineNo: 'ENG20261113017', vr: 'VR1113017', kit: 'KIT017', stages: 14, status: 26, skuId: 2, desc: 'FQC Hold' },
    { engineNo: 'ENG20261113018', vr: 'VR1113018', kit: 'KIT018', stages: 14, status: 27, skuId: 2, desc: 'FQC Hold Cleared' },
    { engineNo: 'ENG20261113019', vr: 'VR1113019', kit: 'KIT019', stages: 14, status: 28, skuId: 2, desc: 'FG Rejected' }
  ];

  // Fetch a plan ID from today to link WIP
  const todayPlanRes = await pool.request().query("SELECT TOP 1 PlanID FROM Prod_Plan WHERE ProdDate = '2026-11-13' AND ProdShift = 'A' ORDER BY PlanID DESC");
  const defaultPlanId = todayPlanRes.recordset[0]?.PlanID || 1;

  let totalGenealogy = 0;

  for (let ei = 0; ei < testEngines.length; ei++) {
    const eng = testEngines[ei];
    const startTime = new Date(2026, 10, 13, 8, 10 + ei * 3, 0);

    // Insert into Prod_Engine_WIP
    await pool.request()
      .input('VREngineNo', sql.NVarChar(10), eng.vr)
      .input('EngineNo', sql.NVarChar(14), eng.engineNo)
      .input('PlanID', sql.Int, defaultPlanId)
      .input('SKUID', sql.Int, eng.skuId)
      .input('LineID', sql.Int, 1)
      .input('KITID', sql.NVarChar(10), eng.kit)
      .input('StartTime', sql.DateTime, startTime)
      .input('EndTime', sql.DateTime, new Date(startTime.getTime() + eng.stages * 5 * 60000))
      .input('Status', sql.Int, eng.status >= 9 ? 1 : (eng.status === 6 || eng.status === 14 ? 2 : (eng.status === 12 || eng.status === 21 || eng.status === 26 ? 3 : 1)))
      .input('NotOkStation', sql.Int, 567)
      .input('ReEntryStation', sql.Int, 557)
      .input('SAMarrigeStatus', sql.Int, 1)
      .query(`
        INSERT INTO Prod_Engine_WIP 
          (VREngineNo, EngineNo, PlanID, SKUID, LineID, KITID, StartTime, EndTime, Status, NotOkStation, ReEntryStation, SAMarrigeStatus)
        VALUES 
          (@VREngineNo, @EngineNo, @PlanID, @SKUID, @LineID, @KITID, @StartTime, @EndTime, @Status, @NotOkStation, @ReEntryStation, @SAMarrigeStatus)
      `);

    // Insert status history into Prod_Status_Geneology
    // Initial status: Pre-assembly (4)
    await pool.request()
      .input('Timestamp', sql.DateTime, startTime)
      .input('EngineNo', sql.NVarChar(14), eng.engineNo)
      .input('Status', sql.Int, 4) // Pre-Assembly
      .input('ProdDate', sql.Date, '2026-11-13')
      .input('ProdShift', sql.NVarChar(10), 'A')
      .query(`
        INSERT INTO Prod_Status_Geneology (Timestamp, EngineNo, Status, ProdDate, ProdShift)
        VALUES (@Timestamp, @EngineNo, @Status, @ProdDate, @ProdShift)
      `);

    // Final status
    const finishTime = new Date(startTime.getTime() + eng.stages * 5 * 60000);
    await pool.request()
      .input('Timestamp', sql.DateTime, finishTime)
      .input('EngineNo', sql.NVarChar(14), eng.engineNo)
      .input('Status', sql.Int, eng.status)
      .input('ProdDate', sql.Date, '2026-11-13')
      .input('ProdShift', sql.NVarChar(10), 'A')
      .query(`
        INSERT INTO Prod_Status_Geneology (Timestamp, EngineNo, Status, ProdDate, ProdShift)
        VALUES (@Timestamp, @EngineNo, @Status, @ProdDate, @ProdShift)
      `);

    // Insert station trace for each stage into Prod_Engine_Geneology and Prod_Station_Geneology
    let currTime = new Date(startTime);
    for (let st = 0; st < eng.stages; st++) {
      const step = assemblySequence[st];
      const opUser = operators[st % operators.length];
      const isLastNok = (st === eng.stages - 1) && (eng.status === 6 || eng.status === 14);
      const actVal = isLastNok ? 'NOK' : step.val;
      const statusVal = isLastNok ? 2 : 1; // 1=OK, 2=NOK

      await pool.request()
        .input('Timestamp', sql.DateTime, currTime)
        .input('EngineNo', sql.NVarChar(14), eng.engineNo)
        .input('StationID', sql.Int, step.station)
        .input('ActivityID', sql.Int, 1)
        .input('ActivityValue', sql.NVarChar(50), actVal)
        .input('Count', sql.Int, 1)
        .input('Status', sql.Int, statusVal)
        .input('UserID', sql.NVarChar(50), opUser)
        .query(`
          INSERT INTO Prod_Engine_Geneology (Timestamp, EngineNo, StationID, ActivityID, ActivityValue, Count, Status, UserID)
          VALUES (@Timestamp, @EngineNo, @StationID, @ActivityID, @ActivityValue, @Count, @Status, @UserID)
        `);

      await pool.request()
        .input('Timestamp', sql.DateTime, currTime)
        .input('EngineNo', sql.NVarChar(14), eng.engineNo)
        .input('StationID', sql.Int, step.station)
        .input('Status', sql.Int, statusVal)
        .input('UserID', sql.NVarChar(50), opUser)
        .query(`
          INSERT INTO Prod_Station_Geneology (Timestamp, EngineNo, StationID, Status, UserID)
          VALUES (@Timestamp, @EngineNo, @StationID, @Status, @UserID)
        `);

      totalGenealogy++;
      currTime = new Date(currTime.getTime() + step.dur * 60000);
    }
  }

  console.log('\n================================================================');
  console.log('  COMPREHENSIVE DUMMY DATA SEEDING COMPLETE!');
  console.log('================================================================');
  console.log(`✓ Prod_Plan & Execution Records  : ${totalPlans} shift plans generated`);
  console.log(`✓ Perf_Hourly_OLE Records        : ${totalHourly} hourly production slices`);
  console.log(`✓ Perf_Downtime Records          : ${totalDowntimes} stoppage events`);
  console.log(`✓ Maint_BreakDown_Log Records    : ${totalBreakdowns} maintenance breakdown events`);
  console.log(`✓ Prod_Defect_Log Records        : ${totalDefects} quality defects logged`);
  console.log(`✓ QA_AuditMonitoring Records     : ${totalAudits} audits (PQCA, IQC, IPQC, FQC)`);
  console.log(`✓ Prod_TorqueData_Log Records    : ${totalTorque} fastening torque readings`);
  console.log(`✓ Prod_Kit_Inspection_Log Records: ${totalKits} kit inspection records`);
  console.log(`✓ Shift Operator Assignments     : ${totalOperatorAssignments} workforce station allocations`);
  console.log(`✓ Track & Trace Engines          : ${testEngines.length} engines with all 19 gate status codes`);
  console.log(`✓ Prod_Engine_Geneology Traces   : ${totalGenealogy} station step traces`);
  console.log('================================================================\n');

  process.exit(0);
}

seedComprehensiveDummyData().catch(e => {
  console.error('Fatal Seeder Error:', e);
  process.exit(1);
});
