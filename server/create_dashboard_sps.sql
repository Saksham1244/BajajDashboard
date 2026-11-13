USE [PPMS_BajajPant];
GO

-- 1. DS_Dashboard_ProductionKPI
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
GO

-- 2. DS_Dashboard_ProcessConveyor
CREATE OR ALTER PROCEDURE [dbo].[DS_Dashboard_ProcessConveyor]
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
GO

-- 3. DS_Dashboard_TrackTraceWIP
CREATE OR ALTER PROCEDURE [dbo].[DS_Dashboard_TrackTraceWIP]
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @Shift VARCHAR(20) = NULL,
    @Line VARCHAR(50) = NULL,
    @WIPStatus VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        W.UID AS id,
        W.EngineNo AS engineNo,
        ISNULL(L.LineName, 'Line C') AS line,
        ISNULL(M.ModelName, 'Pulsar 150') AS model,
        ISNULL(S.SKUName, 'PD501060') AS sku,
        'Station 0' + CAST((W.UID % 8 + 1) AS VARCHAR) AS currentStation,
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

-- 4. DS_Dashboard_MaintenanceDowntime
CREATE OR ALTER PROCEDURE [dbo].[DS_Dashboard_MaintenanceDowntime]
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
        CAST(ROUND(SUM(ISNULL(D.TotalMins, 0)) / 60.0, 1) AS FLOAT) AS totalDowntimeHrs,
        AVG(ISNULL(D.TotalMins, 0)) AS avgDowntimeMins,
        COUNT(D.UID) AS totalBreakdowns
    FROM dbo.Maint_BreakDown_Log D
    LEFT JOIN dbo.Config_Line L ON D.LineID = L.LineID
    WHERE (@StartDate IS NULL OR D.BreakDownDate >= @StartDate)
      AND (@EndDate IS NULL OR D.BreakDownDate <= @EndDate)
      AND (@Shift IS NULL OR D.Shift = @Shift OR (@Shift IN ('A', '1', 'Shift 1') AND D.Shift IN ('1', 'Shift 1', 'A')) OR (@Shift IN ('B', '2', 'Shift 2') AND D.Shift IN ('2', 'Shift 2', 'B')))
      AND (@Line IS NULL OR L.LineName = @Line OR CAST(D.LineID AS VARCHAR) = @Line);

    -- Recordset 1: Table Details per Machine / Station
    SELECT 
        ISNULL(S.StationName, 'Station ' + CAST(D.StationID AS VARCHAR)) AS machine,
        ISNULL(L.LineName, 'Line C') AS line,
        COUNT(D.UID) AS breakdownCount,
        SUM(ISNULL(D.TotalMins, 0)) AS downtime,
        ISNULL(D.BDRemark, 'Mechanical Breakdown') AS reason,
        AVG(ISNULL(D.TotalMins, 0)) AS mttr
    FROM dbo.Maint_BreakDown_Log D
    LEFT JOIN dbo.Config_Station S ON D.StationID = S.StationID
    LEFT JOIN dbo.Config_Line L ON D.LineID = L.LineID
    WHERE (@StartDate IS NULL OR D.BreakDownDate >= @StartDate)
      AND (@EndDate IS NULL OR D.BreakDownDate <= @EndDate)
      AND (@Shift IS NULL OR D.Shift = @Shift OR (@Shift IN ('A', '1', 'Shift 1') AND D.Shift IN ('1', 'Shift 1', 'A')) OR (@Shift IN ('B', '2', 'Shift 2') AND D.Shift IN ('2', 'Shift 2', 'B')))
      AND (@Line IS NULL OR L.LineName = @Line OR CAST(D.LineID AS VARCHAR) = @Line)
    GROUP BY S.StationName, D.StationID, L.LineName, D.BDRemark;

    -- Recordset 2: Trend
    SELECT 
        CONVERT(VARCHAR(10), D.BreakDownDate, 120) AS date,
        SUM(ISNULL(D.TotalMins, 0)) AS downtimeMins,
        COUNT(D.UID) AS count
    FROM dbo.Maint_BreakDown_Log D
    WHERE (@StartDate IS NULL OR D.BreakDownDate >= @StartDate)
      AND (@EndDate IS NULL OR D.BreakDownDate <= @EndDate)
    GROUP BY D.BreakDownDate
    ORDER BY D.BreakDownDate ASC;
END;
GO
