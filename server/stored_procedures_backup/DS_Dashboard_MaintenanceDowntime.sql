-- ========================================================================
-- Stored Procedure: [dbo].[DS_Dashboard_MaintenanceDowntime]
-- Database: PPMS_BajajPant
-- Created: Fri Nov 13 2026 17:49:01 GMT+0530 (India Standard Time) | Last Modified: Fri Nov 13 2026 18:03:43 GMT+0530 (India Standard Time)
-- ========================================================================

CREATE   PROCEDURE [dbo].[DS_Dashboard_MaintenanceDowntime]
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
GO
