-- ========================================================================
-- Stored Procedure: [dbo].[DS_Maint_Downtime]
-- Database: PPMS_BajajPant
-- Created: Fri Nov 13 2026 18:03:43 GMT+0530 (India Standard Time) | Last Modified: Fri Nov 13 2026 18:03:43 GMT+0530 (India Standard Time)
-- ========================================================================

CREATE   PROCEDURE [dbo].[DS_Maint_Downtime]
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
