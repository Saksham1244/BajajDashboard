USE [PPMS_BajajPant];
GO

-- ========================================================================
-- 3. DS_TrackTrace_WIP
-- ========================================================================
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

-- Backward-Compatibility Aliases
CREATE OR ALTER PROCEDURE [dbo].[DS_TrackTraceWIP]
    @StartDate DATE = NULL, @EndDate DATE = NULL, @Shift VARCHAR(20) = NULL, @Line VARCHAR(50) = NULL, @WIPStatus VARCHAR(50) = NULL
AS BEGIN SET NOCOUNT ON; EXEC [dbo].[DS_TrackTrace_WIP] @StartDate, @EndDate, @Shift, @Line, @WIPStatus; END;
GO

CREATE OR ALTER PROCEDURE [dbo].[DS_Dashboard_TrackTraceWIP]
    @StartDate DATE = NULL, @EndDate DATE = NULL, @Shift VARCHAR(20) = NULL, @Line VARCHAR(50) = NULL, @WIPStatus VARCHAR(50) = NULL
AS BEGIN SET NOCOUNT ON; EXEC [dbo].[DS_TrackTrace_WIP] @StartDate, @EndDate, @Shift, @Line, @WIPStatus; END;
GO

-- ========================================================================
-- 4. DS_Maint_Downtime
-- ========================================================================
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
GO

-- Backward-Compatibility Aliases
CREATE OR ALTER PROCEDURE [dbo].[DS_MaintenanceDowntime]
    @StartDate DATE = NULL, @EndDate DATE = NULL, @Shift VARCHAR(20) = NULL, @Line VARCHAR(50) = NULL, @Station VARCHAR(50) = NULL
AS BEGIN SET NOCOUNT ON; EXEC [dbo].[DS_Maint_Downtime] @StartDate, @EndDate, @Shift, @Line, @Station; END;
GO

CREATE OR ALTER PROCEDURE [dbo].[DS_Dashboard_MaintenanceDowntime]
    @StartDate DATE = NULL, @EndDate DATE = NULL, @Shift VARCHAR(20) = NULL, @Line VARCHAR(50) = NULL, @Station VARCHAR(50) = NULL
AS BEGIN SET NOCOUNT ON; EXEC [dbo].[DS_Maint_Downtime] @StartDate, @EndDate, @Shift, @Line, @Station; END;
GO
