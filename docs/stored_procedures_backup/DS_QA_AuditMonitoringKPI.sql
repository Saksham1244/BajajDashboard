-- ========================================================================
-- Stored Procedure: [dbo].[DS_QA_AuditMonitoringKPI]
-- Database: PPMS_BajajPant
-- Created: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time) | Last Modified: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time)
-- ========================================================================

CREATE     PROCEDURE [dbo].[DS_QA_AuditMonitoringKPI]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT

        -- Notification Counts
        SUM(CASE WHEN Notification = 1 THEN 1 ELSE 0 END) AS NormalCount,
        SUM(CASE WHEN Notification = 2 THEN 1 ELSE 0 END) AS AlertCount,
        SUM(CASE WHEN Notification = 3 THEN 1 ELSE 0 END) AS WarningCount,
        SUM(CASE WHEN Notification = 4 THEN 1 ELSE 0 END) AS AlarmCount,

        -- Status Counts
        SUM(CASE WHEN Status = 0 THEN 1 ELSE 0 END) AS NotScheduleCount,
        SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END) AS PlanCount,
        SUM(CASE WHEN Status = 2 THEN 1 ELSE 0 END) AS InProcessCount,
        SUM(CASE WHEN Status = 3 THEN 1 ELSE 0 END) AS CompletedCount,
        SUM(CASE WHEN Status = 4 THEN 1 ELSE 0 END) AS BypassCount,
        SUM(CASE WHEN Status = 5 THEN 1 ELSE 0 END) AS NotDoneCount,
        SUM(CASE WHEN Status = 6 THEN 1 ELSE 0 END) AS AdditionalTestCount,

        -- Total Records
        COUNT(*) AS TotalCount

    FROM QA_AuditMonitoring;
END
GO
