-- ========================================================================
-- Stored Procedure: [dbo].[GV_ProdShiftPlan]
-- Database: PPMS_BajajPant
-- Created: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time) | Last Modified: Fri Nov 13 2026 17:54:00 GMT+0530 (India Standard Time)
-- ========================================================================

-- Backward Compatibility: GV_ProdShiftPlan
CREATE   PROCEDURE [dbo].[GV_ProdShiftPlan]
AS
BEGIN
    SET NOCOUNT ON;
    EXEC [dbo].[DS_Dashboard_ProdShiftPlan];
END;
GO
