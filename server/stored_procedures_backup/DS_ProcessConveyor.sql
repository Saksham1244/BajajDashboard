-- ========================================================================
-- Stored Procedure: [dbo].[DS_ProcessConveyor]
-- Database: PPMS_BajajPant
-- Created: Fri Nov 13 2026 18:03:43 GMT+0530 (India Standard Time) | Last Modified: Fri Nov 13 2026 18:03:43 GMT+0530 (India Standard Time)
-- ========================================================================

CREATE   PROCEDURE [dbo].[DS_ProcessConveyor]
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
GO
