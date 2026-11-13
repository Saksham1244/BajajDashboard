-- ======================================================================================
-- BAJAJ PPMS - WEB DASHBOARD STORED PROCEDURES DEPLOYMENT SCRIPT
-- ======================================================================================
-- Target Database : PPMS_BajajPant (or your target plant database)
-- Purpose         : Deploy ONLY the 4 custom stored procedures created solely for the 
--                   Bajaj Web Dashboard (all other 380+ plant SPs already exist in DB).
--
-- Procedures Included:
--   1. [dbo].[DS_Prod_ProductionKPI]  (Production Command Center - Shift Target vs Actual)
--   2. [dbo].[DS_Process_Conveyor]    (Process Monitoring - Line Speed, Uptime %, Stoppages)
--   3. [dbo].[DS_TrackTrace_WIP]      (Track & Trace - Live WIP Engine Dwell & Station Status)
--   4. [dbo].[DS_Maint_Downtime]      (Maintenance - Breakdown KPIs, MTTR & Station Pareto)
--   + Backward-compatible aliases for seamless execution under both new and legacy names.
--   + Companion View [dbo].[Prod_Shift_Plan] (required by plant SP [GV_ProdShiftPlan]).
-- ======================================================================================

USE [PPMS_BajajPant];
GO

-- --------------------------------------------------------------------------------------
-- COMPANION VIEW: [dbo].[Prod_Shift_Plan]
-- Required by the existing plant procedure [dbo].[GV_ProdShiftPlan] (authored by Shubham Patil)
-- --------------------------------------------------------------------------------------
IF OBJECT_ID('dbo.Prod_Shift_Plan', 'V') IS NULL AND OBJECT_ID('dbo.Prod_Plan', 'U') IS NOT NULL
BEGIN
    EXEC('CREATE VIEW dbo.Prod_Shift_Plan AS SELECT * FROM dbo.Prod_Plan;');
    PRINT '✓ Companion view dbo.Prod_Shift_Plan created over dbo.Prod_Plan';
END
GO


-- ======================================================================================
-- 1. [dbo].[DS_Prod_ProductionKPI]
-- Used by: GET /api/dashboard/production (Production.jsx)
-- Computes: Shift Plan Qty, Actual Output, Shortfall, Straight Pass, WIP, Rollover, Rates
-- ======================================================================================
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
      AND (@Shift IS NULL OR E.ProdShift = @Shift 
           OR (@Shift IN ('A', '1', 'Shift 1') AND E.ProdShift IN ('1', 'Shift 1', 'A')) 
           OR (@Shift IN ('B', '2', 'Shift 2') AND E.ProdShift IN ('2', 'Shift 2', 'B'))
           OR (@Shift IN ('C', '3', 'Shift 3') AND E.ProdShift IN ('3', 'Shift 3', 'C')))
      AND (@Line IS NULL OR L.LineName = @Line OR CAST(E.LineID AS VARCHAR) = @Line)
      AND (@Model IS NULL OR M.ModelName = @Model)
      AND (@SKU IS NULL OR S.SKUName = @SKU);
END;
GO

-- Backward-Compatibility Aliases for Production KPI
CREATE OR ALTER PROCEDURE [dbo].[DS_ProductionKPI]
    @StartDate DATE = NULL, @EndDate DATE = NULL, @Shift VARCHAR(20) = NULL, @Line VARCHAR(50) = NULL, @Model VARCHAR(50) = NULL, @SKU VARCHAR(50) = NULL
AS BEGIN SET NOCOUNT ON; EXEC [dbo].[DS_Prod_ProductionKPI] @StartDate, @EndDate, @Shift, @Line, @Model, @SKU; END;
GO

CREATE OR ALTER PROCEDURE [dbo].[DS_Dashboard_ProductionKPI]
    @StartDate DATE = NULL, @EndDate DATE = NULL, @Shift VARCHAR(20) = NULL, @Line VARCHAR(50) = NULL, @Model VARCHAR(50) = NULL, @SKU VARCHAR(50) = NULL
AS BEGIN SET NOCOUNT ON; EXEC [dbo].[DS_Prod_ProductionKPI] @StartDate, @EndDate, @Shift, @Line, @Model, @SKU; END;
GO

PRINT '✓ 1. DS_Prod_ProductionKPI deployed successfully';
GO


-- ======================================================================================
-- 2. [dbo].[DS_Process_Conveyor]
-- Used by: GET /api/process/conveyor (ConveyorReport.jsx)
-- Computes: 4 Recordsets (Stations Uptime %, Stoppage Reasons, Station Downtime, Plan Speed)
-- ======================================================================================
CREATE OR ALTER PROCEDURE [dbo].[DS_Process_Conveyor]
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @Shift VARCHAR(20) = NULL,
    @Line VARCHAR(50) = NULL,
    @Station VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Recordset 0: Stations overview (Uptime % and stoppage count)
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
      AND (@Shift IS NULL OR D.ProdShift = @Shift 
           OR (@Shift IN ('A', '1', 'Shift 1') AND D.ProdShift IN ('1', 'Shift 1', 'A')) 
           OR (@Shift IN ('B', '2', 'Shift 2') AND D.ProdShift IN ('2', 'Shift 2', 'B'))
           OR (@Shift IN ('C', '3', 'Shift 3') AND D.ProdShift IN ('3', 'Shift 3', 'C')))
      AND (@Line IS NULL OR L.LineName = @Line OR CAST(D.SubAsslyLineID AS VARCHAR) = @Line)
    GROUP BY S.StationName, D.StationID, L.LineName;

    -- Recordset 1: Stoppage Reasons breakdown
    SELECT 
        ISNULL(D.Reason, 'Equipment Halt') AS reason,
        COUNT(D.DowntimeID) AS count,
        SUM(ISNULL(D.TotalDT, 0)) AS downtime
    FROM dbo.Perf_Downtime D
    LEFT JOIN dbo.Config_Line L ON D.SubAsslyLineID = L.LineID
    WHERE (@StartDate IS NULL OR D.ProdDate >= @StartDate)
      AND (@EndDate IS NULL OR D.ProdDate <= @EndDate)
      AND (@Shift IS NULL OR D.ProdShift = @Shift 
           OR (@Shift IN ('A', '1', 'Shift 1') AND D.ProdShift IN ('1', 'Shift 1', 'A')) 
           OR (@Shift IN ('B', '2', 'Shift 2') AND D.ProdShift IN ('2', 'Shift 2', 'B'))
           OR (@Shift IN ('C', '3', 'Shift 3') AND D.ProdShift IN ('3', 'Shift 3', 'C')))
      AND (@Line IS NULL OR L.LineName = @Line OR CAST(D.SubAsslyLineID AS VARCHAR) = @Line)
    GROUP BY D.Reason;

    -- Recordset 2: Total Stoppage Time by Station
    SELECT 
        ISNULL(S.StationName, 'Station ' + CAST(D.StationID AS VARCHAR)) AS station,
        ISNULL(L.LineName, 'Line C') AS line,
        SUM(ISNULL(D.TotalDT, 0)) AS totalStoppageTime
    FROM dbo.Perf_Downtime D
    LEFT JOIN dbo.Config_Station S ON D.StationID = S.StationID
    LEFT JOIN dbo.Config_Line L ON D.SubAsslyLineID = L.LineID
    WHERE (@StartDate IS NULL OR D.ProdDate >= @StartDate)
      AND (@EndDate IS NULL OR D.ProdDate <= @EndDate)
      AND (@Shift IS NULL OR D.ProdShift = @Shift 
           OR (@Shift IN ('A', '1', 'Shift 1') AND D.ProdShift IN ('1', 'Shift 1', 'A')) 
           OR (@Shift IN ('B', '2', 'Shift 2') AND D.ProdShift IN ('2', 'Shift 2', 'B'))
           OR (@Shift IN ('C', '3', 'Shift 3') AND D.ProdShift IN ('3', 'Shift 3', 'C')))
      AND (@Line IS NULL OR L.LineName = @Line OR CAST(D.SubAsslyLineID AS VARCHAR) = @Line)
    GROUP BY S.StationName, D.StationID, L.LineName;

    -- Recordset 3: Planned Speed Reference
    SELECT 
        4.0 AS plannedSpeed,
        COUNT(DISTINCT PlanID) AS planCount
    FROM dbo.Prod_Plan
    WHERE (@StartDate IS NULL OR ProdDate >= @StartDate)
      AND (@EndDate IS NULL OR ProdDate <= @EndDate);
END;
GO

-- Backward-Compatibility Aliases for Process Conveyor
CREATE OR ALTER PROCEDURE [dbo].[DS_ProcessConveyor]
    @StartDate DATE = NULL, @EndDate DATE = NULL, @Shift VARCHAR(20) = NULL, @Line VARCHAR(50) = NULL, @Station VARCHAR(50) = NULL
AS BEGIN SET NOCOUNT ON; EXEC [dbo].[DS_Process_Conveyor] @StartDate, @EndDate, @Shift, @Line, @Station; END;
GO

CREATE OR ALTER PROCEDURE [dbo].[DS_Dashboard_ProcessConveyor]
    @StartDate DATE = NULL, @EndDate DATE = NULL, @Shift VARCHAR(20) = NULL, @Line VARCHAR(50) = NULL, @Station VARCHAR(50) = NULL
AS BEGIN SET NOCOUNT ON; EXEC [dbo].[DS_Process_Conveyor] @StartDate, @EndDate, @Shift, @Line, @Station; END;
GO

PRINT '✓ 2. DS_Process_Conveyor deployed successfully';
GO


-- ======================================================================================
-- 3. [dbo].[DS_TrackTrace_WIP]
-- Used by: GET /api/trace/wip (WIPReport.jsx)
-- Computes: Live WIP engine list with Station, Status, StartTime, EntryTime, Dwell Minutes
-- ======================================================================================
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
GO

-- Backward-Compatibility Aliases for Track Trace WIP
CREATE OR ALTER PROCEDURE [dbo].[DS_TrackTraceWIP]
    @StartDate DATE = NULL, @EndDate DATE = NULL, @Shift VARCHAR(20) = NULL, @Line VARCHAR(50) = NULL, @WIPStatus VARCHAR(50) = NULL
AS BEGIN SET NOCOUNT ON; EXEC [dbo].[DS_TrackTrace_WIP] @StartDate, @EndDate, @Shift, @Line, @WIPStatus; END;
GO

CREATE OR ALTER PROCEDURE [dbo].[DS_Dashboard_TrackTraceWIP]
    @StartDate DATE = NULL, @EndDate DATE = NULL, @Shift VARCHAR(20) = NULL, @Line VARCHAR(50) = NULL, @WIPStatus VARCHAR(50) = NULL
AS BEGIN SET NOCOUNT ON; EXEC [dbo].[DS_TrackTrace_WIP] @StartDate, @EndDate, @Shift, @Line, @WIPStatus; END;
GO

PRINT '✓ 3. DS_TrackTrace_WIP deployed successfully';
GO


-- ======================================================================================
-- 4. [dbo].[DS_Maint_Downtime]
-- Used by: GET /api/maintenance/downtime (DowntimeSummaryReport.jsx)
-- Computes: 3 Recordsets (Summary KPIs, Machine Breakdown Details with MTTR, Trend)
-- ======================================================================================
CREATE OR ALTER PROCEDURE [dbo].[DS_Maint_Downtime]
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @Shift VARCHAR(20) = NULL,
    @Line VARCHAR(50) = NULL,
    @Station VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Recordset 0: Summary KPIs (Total Downtime Hrs, Avg Mins, Breakdown Count)
    SELECT 
        CAST(ROUND(SUM(COALESCE(D.TotalBDTime, D.BDDuration, 0)) / 60.0, 1) AS FLOAT) AS totalDowntimeHrs,
        AVG(COALESCE(D.TotalBDTime, D.BDDuration, 0)) AS avgDowntimeMins,
        COUNT(D.BreakdownID) AS totalBreakdowns
    FROM dbo.Maint_BreakDown_Log D
    LEFT JOIN dbo.Config_Station S ON D.StationID = S.StationID
    LEFT JOIN dbo.Config_Line L ON S.SubAsslyLineID = L.LineID
    WHERE (@StartDate IS NULL OR D.ProdDate >= @StartDate)
      AND (@EndDate IS NULL OR D.ProdDate <= @EndDate)
      AND (@Shift IS NULL OR D.ProdShift = @Shift 
           OR (@Shift IN ('A', '1', 'Shift 1') AND D.ProdShift IN ('1', 'Shift 1', 'A')) 
           OR (@Shift IN ('B', '2', 'Shift 2') AND D.ProdShift IN ('2', 'Shift 2', 'B'))
           OR (@Shift IN ('C', '3', 'Shift 3') AND D.ProdShift IN ('3', 'Shift 3', 'C')))
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
      AND (@Shift IS NULL OR D.ProdShift = @Shift 
           OR (@Shift IN ('A', '1', 'Shift 1') AND D.ProdShift IN ('1', 'Shift 1', 'A')) 
           OR (@Shift IN ('B', '2', 'Shift 2') AND D.ProdShift IN ('2', 'Shift 2', 'B'))
           OR (@Shift IN ('C', '3', 'Shift 3') AND D.ProdShift IN ('3', 'Shift 3', 'C')))
      AND (@Line IS NULL OR L.LineName = @Line OR CAST(S.SubAsslyLineID AS VARCHAR) = @Line)
    GROUP BY S.StationName, D.StationID, L.LineName, D.BDRemark;

    -- Recordset 2: Downtime Trend by Date
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
GO

-- Backward-Compatibility Aliases for Maintenance Downtime
CREATE OR ALTER PROCEDURE [dbo].[DS_MaintenanceDowntime]
    @StartDate DATE = NULL, @EndDate DATE = NULL, @Shift VARCHAR(20) = NULL, @Line VARCHAR(50) = NULL, @Station VARCHAR(50) = NULL
AS BEGIN SET NOCOUNT ON; EXEC [dbo].[DS_Maint_Downtime] @StartDate, @EndDate, @Shift, @Line, @Station; END;
GO

CREATE OR ALTER PROCEDURE [dbo].[DS_Dashboard_MaintenanceDowntime]
    @StartDate DATE = NULL, @EndDate DATE = NULL, @Shift VARCHAR(20) = NULL, @Line VARCHAR(50) = NULL, @Station VARCHAR(50) = NULL
AS BEGIN SET NOCOUNT ON; EXEC [dbo].[DS_Maint_Downtime] @StartDate, @EndDate, @Shift, @Line, @Station; END;
GO

PRINT '✓ 4. DS_Maint_Downtime deployed successfully';
GO

PRINT '======================================================================================';
PRINT 'ALL 4 DASHBOARD STORED PROCEDURES DEPLOYED & READY FOR TESTING!';
PRINT '======================================================================================';
GO
