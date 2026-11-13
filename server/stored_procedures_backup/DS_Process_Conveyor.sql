-- ========================================================================
-- Stored Procedure: [dbo].[DS_Process_Conveyor]
-- Database: PPMS_BajajPant
-- Created: Fri Nov 13 2026 18:03:43 GMT+0530 (India Standard Time) | Last Modified: Fri Nov 13 2026 18:03:43 GMT+0530 (India Standard Time)
-- ========================================================================

CREATE   PROCEDURE [dbo].[DS_Process_Conveyor]
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
