-- ========================================================================
-- Stored Procedure: [dbo].[DS_ProdShiftPlan]
-- Database: PPMS_BajajPant
-- Created: Fri Nov 13 2026 17:54:00 GMT+0530 (India Standard Time) | Last Modified: Fri Nov 13 2026 17:56:16 GMT+0530 (India Standard Time)
-- ========================================================================

-- 2. DS_ProdShiftPlan (Alias to GV_ProdShiftPlan)
CREATE   PROCEDURE [dbo].[DS_ProdShiftPlan]
AS
BEGIN
    SET NOCOUNT ON;
    EXEC [dbo].[GV_ProdShiftPlan];
END;
GO
