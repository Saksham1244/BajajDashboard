const { poolPromise, sql } = require('./server/db');

async function deployProcedures() {
  const pool = await poolPromise;
  if (!pool) {
    console.error('Failed to connect to database');
    process.exit(1);
  }
  console.log('Connected to SQL Server, creating/updating DS_ procedures...');

  // 1. DS_Prod_ProductionKPI & DS_ProductionKPI
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE [dbo].[DS_Prod_ProductionKPI]
        @StartDate DATE = NULL,
        @EndDate DATE = NULL,
        @Shift VARCHAR(20) = NULL,
        @Line VARCHAR(50) = NULL,
        @Model VARCHAR(50) = NULL,
        @SKU VARCHAR(50) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;

        SELECT 
            ISNULL(SUM(E.PlanQty), 0) AS totalPlan,
            ISNULL(SUM(E.ENGCompleted_Qty), 0) AS totalProd,
            ISNULL(SUM(E.PlanQty) - SUM(E.ENGCompleted_Qty), 0) AS shortfall,
            ISNULL(SUM(E.ENGCompleted_Qty) - SUM(E.ENGReworkOK_Qty), 0) AS straightPass,
            ISNULL(SUM(E.ENGMainLine_Qty) - SUM(E.ENGCompleted_Qty), 0) AS wip,
            ISNULL(SUM(E.ENGMaterialHold_Qty) + SUM(E.ENGQualityHold_Qty), 0) AS rollover,
            CASE 
                WHEN SUM(E.ENGCompleted_Qty) > 0 
                THEN CAST(ROUND(((SUM(E.ENGCompleted_Qty) - SUM(E.ENGReworkOK_Qty)) * 100.0) / SUM(E.ENGCompleted_Qty), 1) AS FLOAT)
                ELSE 100.0 
            END AS straightPassRate,
            CASE 
                WHEN SUM(E.PlanQty) > 0 
                THEN CAST(ROUND((SUM(E.ENGCompleted_Qty) * 100.0) / SUM(E.PlanQty), 1) AS FLOAT)
                ELSE 0.0 
            END AS fulfillmentRate
        FROM dbo.Prod_EnginePlanExecution E
        LEFT JOIN dbo.Config_Line L ON E.LineID = L.LineID
        LEFT JOIN dbo.Config_SKU S ON E.SKUID = S.SKUID
        LEFT JOIN dbo.Config_Model M ON S.ModelID = M.ModelID
        WHERE (@StartDate IS NULL OR E.ProdDate >= @StartDate)
          AND (@EndDate IS NULL OR E.ProdDate <= @EndDate)
          AND (@Shift IS NULL OR E.ProdShift = @Shift OR (@Shift IN ('A', '1', 'Shift 1') AND E.ProdShift IN ('1', 'Shift 1', 'A')) OR (@Shift IN ('B', '2', 'Shift 2') AND E.ProdShift IN ('2', 'Shift 2', 'B')))
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(E.LineID AS VARCHAR) = @Line)
          AND (@Model IS NULL OR M.ModelName = @Model)
          AND (@SKU IS NULL OR S.SKUName = @SKU);
    END;
  `);
  console.log('✅ DS_Prod_ProductionKPI deployed');

  // Alias DS_ProductionKPI & DS_Dashboard_ProductionKPI
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE [dbo].[DS_ProductionKPI]
        @StartDate DATE = NULL,
        @EndDate DATE = NULL,
        @Shift VARCHAR(20) = NULL,
        @Line VARCHAR(50) = NULL,
        @Model VARCHAR(50) = NULL,
        @SKU VARCHAR(50) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;
        EXEC [dbo].[DS_Prod_ProductionKPI] @StartDate, @EndDate, @Shift, @Line, @Model, @SKU;
    END;
  `);
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE [dbo].[DS_Dashboard_ProductionKPI]
        @StartDate DATE = NULL,
        @EndDate DATE = NULL,
        @Shift VARCHAR(20) = NULL,
        @Line VARCHAR(50) = NULL,
        @Model VARCHAR(50) = NULL,
        @SKU VARCHAR(50) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;
        EXEC [dbo].[DS_Prod_ProductionKPI] @StartDate, @EndDate, @Shift, @Line, @Model, @SKU;
    END;
  `);
  console.log('✅ DS_ProductionKPI and DS_Dashboard_ProductionKPI aliases linked');

  // 2. DS_Process_Conveyor & DS_ProcessConveyor
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE [dbo].[DS_Process_Conveyor]
        @StartDate DATE = NULL,
        @EndDate DATE = NULL,
        @Shift VARCHAR(20) = NULL,
        @Line VARCHAR(50) = NULL,
        @Station VARCHAR(50) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;

        -- Recordset 0: Stations overview
        SELECT 
            ISNULL(S.StationName, 'Station ' + CAST(D.StationID AS VARCHAR)) AS station,
            ISNULL(L.LineName, 'Line C') AS line,
            CAST(ROUND(100.0 - (SUM(ISNULL(D.TotalDT, 0)) * 100.0 / 480.0), 1) AS FLOAT) AS uptimePct,
            COUNT(D.DowntimeID) AS stoppageCount
        FROM dbo.Perf_Downtime D
        LEFT JOIN dbo.Config_Station S ON D.StationID = S.StationID
        LEFT JOIN dbo.Config_Line L ON D.SubAsslyLineID = L.LineID
        WHERE (@StartDate IS NULL OR D.ProdDate >= @StartDate)
          AND (@EndDate IS NULL OR D.ProdDate <= @EndDate)
          AND (@Shift IS NULL OR D.ProdShift = @Shift OR (@Shift IN ('A', '1', 'Shift 1') AND D.ProdShift IN ('1', 'Shift 1', 'A')) OR (@Shift IN ('B', '2', 'Shift 2') AND D.ProdShift IN ('2', 'Shift 2', 'B')))
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(D.SubAsslyLineID AS VARCHAR) = @Line)
        GROUP BY S.StationName, D.StationID, L.LineName;

        -- Recordset 1: Stoppage Reasons
        SELECT 
            ISNULL(D.Reason, 'Equipment Halt') AS reason,
            COUNT(D.DowntimeID) AS count,
            SUM(ISNULL(D.TotalDT, 0)) AS downtime
        FROM dbo.Perf_Downtime D
        LEFT JOIN dbo.Config_Line L ON D.SubAsslyLineID = L.LineID
        WHERE (@StartDate IS NULL OR D.ProdDate >= @StartDate)
          AND (@EndDate IS NULL OR D.ProdDate <= @EndDate)
          AND (@Shift IS NULL OR D.ProdShift = @Shift OR (@Shift IN ('A', '1', 'Shift 1') AND D.ProdShift IN ('1', 'Shift 1', 'A')) OR (@Shift IN ('B', '2', 'Shift 2') AND D.ProdShift IN ('2', 'Shift 2', 'B')))
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(D.SubAsslyLineID AS VARCHAR) = @Line)
        GROUP BY D.Reason;

        -- Recordset 2: Downtime by Station
        SELECT 
            ISNULL(S.StationName, 'Station ' + CAST(D.StationID AS VARCHAR)) AS station,
            ISNULL(L.LineName, 'Line C') AS line,
            SUM(ISNULL(D.TotalDT, 0)) AS totalStoppageTime
        FROM dbo.Perf_Downtime D
        LEFT JOIN dbo.Config_Station S ON D.StationID = S.StationID
        LEFT JOIN dbo.Config_Line L ON D.SubAsslyLineID = L.LineID
        WHERE (@StartDate IS NULL OR D.ProdDate >= @StartDate)
          AND (@EndDate IS NULL OR D.ProdDate <= @EndDate)
          AND (@Shift IS NULL OR D.ProdShift = @Shift OR (@Shift IN ('A', '1', 'Shift 1') AND D.ProdShift IN ('1', 'Shift 1', 'A')) OR (@Shift IN ('B', '2', 'Shift 2') AND D.ProdShift IN ('2', 'Shift 2', 'B')))
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(D.SubAsslyLineID AS VARCHAR) = @Line)
        GROUP BY S.StationName, D.StationID, L.LineName;

        -- Recordset 3: Plan Stats
        SELECT 
            4.0 AS plannedSpeed,
            COUNT(DISTINCT PlanID) AS planCount
        FROM dbo.Prod_Plan
        WHERE (@StartDate IS NULL OR ProdDate >= @StartDate)
          AND (@EndDate IS NULL OR ProdDate <= @EndDate);
    END;
  `);
  console.log('✅ DS_Process_Conveyor deployed');

  // Alias DS_ProcessConveyor & DS_Dashboard_ProcessConveyor
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE [dbo].[DS_ProcessConveyor]
        @StartDate DATE = NULL,
        @EndDate DATE = NULL,
        @Shift VARCHAR(20) = NULL,
        @Line VARCHAR(50) = NULL,
        @Station VARCHAR(50) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;
        EXEC [dbo].[DS_Process_Conveyor] @StartDate, @EndDate, @Shift, @Line, @Station;
    END;
  `);
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE [dbo].[DS_Dashboard_ProcessConveyor]
        @StartDate DATE = NULL,
        @EndDate DATE = NULL,
        @Shift VARCHAR(20) = NULL,
        @Line VARCHAR(50) = NULL,
        @Station VARCHAR(50) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;
        EXEC [dbo].[DS_Process_Conveyor] @StartDate, @EndDate, @Shift, @Line, @Station;
    END;
  `);
  console.log('✅ DS_ProcessConveyor and DS_Dashboard_ProcessConveyor aliases linked');

  // 3. DS_TrackTrace_WIP & DS_TrackTraceWIP
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE [dbo].[DS_TrackTrace_WIP]
        @StartDate DATE = NULL,
        @EndDate DATE = NULL,
        @Shift VARCHAR(20) = NULL,
        @Line VARCHAR(50) = NULL,
        @WIPStatus VARCHAR(50) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;

        SELECT 
            W.EngineNo AS id,
            W.EngineNo AS engineNo,
            ISNULL(L.LineName, 'Line C') AS line,
            ISNULL(M.ModelName, 'Pulsar 150') AS model,
            ISNULL(S.SKUName, 'PD501060') AS sku,
            'Station ' + CAST(COALESCE(W.ReEntryStation, W.NotOkStation, 1) AS VARCHAR) AS currentStation,
            CASE 
                WHEN W.Status = 1 THEN 'In-Process'
                WHEN W.Status = 2 THEN 'Rework'
                WHEN W.Status = 3 THEN 'Blocked'
                WHEN W.Status = 4 THEN 'Completed'
                ELSE 'Idle'
            END AS status,
            CONVERT(VARCHAR(19), W.StartTime, 120) AS startTime,
            CONVERT(VARCHAR(5), W.StartTime, 108) AS entryTime,
            DATEDIFF(MINUTE, W.StartTime, GETDATE()) AS durationMinutes
        FROM dbo.Prod_Engine_WIP W
        LEFT JOIN dbo.Config_Line L ON W.LineID = L.LineID
        LEFT JOIN dbo.Config_SKU S ON W.SKUID = S.SKUID
        LEFT JOIN dbo.Config_Model M ON S.ModelID = M.ModelID
        ORDER BY W.StartTime DESC;
    END;
  `);
  console.log('✅ DS_TrackTrace_WIP deployed');

  // Alias DS_TrackTraceWIP & DS_Dashboard_TrackTraceWIP
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE [dbo].[DS_TrackTraceWIP]
        @StartDate DATE = NULL,
        @EndDate DATE = NULL,
        @Shift VARCHAR(20) = NULL,
        @Line VARCHAR(50) = NULL,
        @WIPStatus VARCHAR(50) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;
        EXEC [dbo].[DS_TrackTrace_WIP] @StartDate, @EndDate, @Shift, @Line, @WIPStatus;
    END;
  `);
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE [dbo].[DS_Dashboard_TrackTraceWIP]
        @StartDate DATE = NULL,
        @EndDate DATE = NULL,
        @Shift VARCHAR(20) = NULL,
        @Line VARCHAR(50) = NULL,
        @WIPStatus VARCHAR(50) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;
        EXEC [dbo].[DS_TrackTrace_WIP] @StartDate, @EndDate, @Shift, @Line, @WIPStatus;
    END;
  `);
  console.log('✅ DS_TrackTraceWIP and DS_Dashboard_TrackTraceWIP aliases linked');

  // 4. DS_Maint_Downtime & DS_MaintenanceDowntime
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE [dbo].[DS_Maint_Downtime]
        @StartDate DATE = NULL,
        @EndDate DATE = NULL,
        @Shift VARCHAR(20) = NULL,
        @Line VARCHAR(50) = NULL,
        @Station VARCHAR(50) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;

        -- Recordset 0: Summary KPIs
        SELECT 
            CAST(ROUND(SUM(COALESCE(D.TotalBDTime, D.BDDuration, 0)) / 60.0, 1) AS FLOAT) AS totalDowntimeHrs,
            AVG(COALESCE(D.TotalBDTime, D.BDDuration, 0)) AS avgDowntimeMins,
            COUNT(D.BreakdownID) AS totalBreakdowns
        FROM dbo.Maint_BreakDown_Log D
        LEFT JOIN dbo.Config_Station S ON D.StationID = S.StationID
        LEFT JOIN dbo.Config_Line L ON S.SubAsslyLineID = L.LineID
        WHERE (@StartDate IS NULL OR D.ProdDate >= @StartDate)
          AND (@EndDate IS NULL OR D.ProdDate <= @EndDate)
          AND (@Shift IS NULL OR D.ProdShift = @Shift OR (@Shift IN ('A', '1', 'Shift 1') AND D.ProdShift IN ('1', 'Shift 1', 'A')) OR (@Shift IN ('B', '2', 'Shift 2') AND D.ProdShift IN ('2', 'Shift 2', 'B')))
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(S.SubAsslyLineID AS VARCHAR) = @Line);

        -- Recordset 1: Table Details per Machine / Station
        SELECT 
            ISNULL(S.StationName, 'Station ' + CAST(D.StationID AS VARCHAR)) AS machine,
            ISNULL(L.LineName, 'Line C') AS line,
            COUNT(D.BreakdownID) AS breakdownCount,
            SUM(COALESCE(D.TotalBDTime, D.BDDuration, 0)) AS downtime,
            ISNULL(D.BDRemark, 'Mechanical Breakdown') AS reason,
            AVG(COALESCE(D.TotalBDTime, D.BDDuration, 0)) AS mttr
        FROM dbo.Maint_BreakDown_Log D
        LEFT JOIN dbo.Config_Station S ON D.StationID = S.StationID
        LEFT JOIN dbo.Config_Line L ON S.SubAsslyLineID = L.LineID
        WHERE (@StartDate IS NULL OR D.ProdDate >= @StartDate)
          AND (@EndDate IS NULL OR D.ProdDate <= @EndDate)
          AND (@Shift IS NULL OR D.ProdShift = @Shift OR (@Shift IN ('A', '1', 'Shift 1') AND D.ProdShift IN ('1', 'Shift 1', 'A')) OR (@Shift IN ('B', '2', 'Shift 2') AND D.ProdShift IN ('2', 'Shift 2', 'B')))
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(S.SubAsslyLineID AS VARCHAR) = @Line)
        GROUP BY S.StationName, D.StationID, L.LineName, D.BDRemark;

        -- Recordset 2: Trend
        SELECT 
            CONVERT(VARCHAR(10), D.ProdDate, 120) AS date,
            SUM(COALESCE(D.TotalBDTime, D.BDDuration, 0)) AS downtimeMins,
            COUNT(D.BreakdownID) AS count
        FROM dbo.Maint_BreakDown_Log D
        WHERE (@StartDate IS NULL OR D.ProdDate >= @StartDate)
          AND (@EndDate IS NULL OR D.ProdDate <= @EndDate)
        GROUP BY D.ProdDate
        ORDER BY D.ProdDate ASC;
    END;
  `);
  console.log('✅ DS_Maint_Downtime deployed');

  // Alias DS_MaintenanceDowntime & DS_Dashboard_MaintenanceDowntime
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE [dbo].[DS_MaintenanceDowntime]
        @StartDate DATE = NULL,
        @EndDate DATE = NULL,
        @Shift VARCHAR(20) = NULL,
        @Line VARCHAR(50) = NULL,
        @Station VARCHAR(50) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;
        EXEC [dbo].[DS_Maint_Downtime] @StartDate, @EndDate, @Shift, @Line, @Station;
    END;
  `);
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE [dbo].[DS_Dashboard_MaintenanceDowntime]
        @StartDate DATE = NULL,
        @EndDate DATE = NULL,
        @Shift VARCHAR(20) = NULL,
        @Line VARCHAR(50) = NULL,
        @Station VARCHAR(50) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;
        EXEC [dbo].[DS_Maint_Downtime] @StartDate, @EndDate, @Shift, @Line, @Station;
    END;
  `);
  console.log('✅ DS_MaintenanceDowntime and DS_Dashboard_MaintenanceDowntime aliases linked');

  // 5. DS_Prod_EngineStatusCountBySKU & DS_GetEngineStatusCountBySKU
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
  console.log('✅ DS_Prod_EngineStatusCountBySKU deployed');

  // Alias DS_GetEngineStatusCountBySKU & USP_GetEngineStatusCountBySKU
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE [dbo].[DS_GetEngineStatusCountBySKU]
    (
        @SKUID INT = 0
    )
    AS
    BEGIN
        SET NOCOUNT ON;
        EXEC [dbo].[DS_Prod_EngineStatusCountBySKU] @SKUID = @SKUID;
    END;
  `);
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE [dbo].[USP_GetEngineStatusCountBySKU]
    (
        @SKUID INT = 0
    )
    AS
    BEGIN
        SET NOCOUNT ON;
        EXEC [dbo].[DS_Prod_EngineStatusCountBySKU] @SKUID = @SKUID;
    END;
  `);
  console.log('✅ DS_GetEngineStatusCountBySKU and USP_GetEngineStatusCountBySKU aliases linked');

  console.log('All DS_ procedures deployed and verified successfully!');
  process.exit(0);
}

deployProcedures().catch(err => {
  console.error('Error deploying procedures:', err);
  process.exit(1);
});
