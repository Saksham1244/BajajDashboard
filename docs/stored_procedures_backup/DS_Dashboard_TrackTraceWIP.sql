-- ========================================================================
-- Stored Procedure: [dbo].[DS_Dashboard_TrackTraceWIP]
-- Database: PPMS_BajajPant
-- Created: Fri Nov 13 2026 17:49:00 GMT+0530 (India Standard Time) | Last Modified: Fri Nov 13 2026 18:03:43 GMT+0530 (India Standard Time)
-- ========================================================================

CREATE   PROCEDURE [dbo].[DS_Dashboard_TrackTraceWIP]
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
GO
