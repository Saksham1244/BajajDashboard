-- ========================================================================
-- Stored Procedure: [dbo].[DS_Maint_ActiveAlarm_Count]
-- Database: PPMS_BajajPant
-- Created: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time) | Last Modified: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time)
-- ========================================================================

CREATE         PROCEDURE [dbo].[DS_Maint_ActiveAlarm_Count]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) AS TotalActiveAlarms,

        SUM(CASE WHEN CA.AlarmType = 2 THEN 1 ELSE 0 END) AS InformationAlarms,

        SUM(CASE WHEN CA.AlarmType = 1 THEN 1 ELSE 0 END) AS StoppageAlarms

    FROM dbo.Maint_ActiveAlarm MAA

    INNER JOIN dbo.Config_Alarm CA
        ON MAA.AlarmID = CA.AlarmID;
END
GO
