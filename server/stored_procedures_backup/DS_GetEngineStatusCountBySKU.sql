-- ========================================================================
-- Stored Procedure: [dbo].[DS_GetEngineStatusCountBySKU]
-- Database: PPMS_BajajPant
-- Created: Fri Nov 13 2026 17:54:00 GMT+0530 (India Standard Time) | Last Modified: Fri Nov 13 2026 18:03:43 GMT+0530 (India Standard Time)
-- ========================================================================

CREATE   PROCEDURE [dbo].[DS_GetEngineStatusCountBySKU]
    (
        @SKUID INT = 0
    )
    AS
    BEGIN
        SET NOCOUNT ON;
        EXEC [dbo].[DS_Prod_EngineStatusCountBySKU] @SKUID = @SKUID;
    END;
GO
