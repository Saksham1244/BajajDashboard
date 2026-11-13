-- ========================================================================
-- Stored Procedure: [dbo].[SP_GetEngineStatusCountBySKU]
-- Database: PPMS_BajajPant
-- Created: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time) | Last Modified: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time)
-- ========================================================================

-- Alias SP

CREATE       PROCEDURE [dbo].[SP_GetEngineStatusCountBySKU]

(

    @SKUID INT = 0

)

AS

BEGIN

    EXEC [dbo].[USP_GetEngineStatusCountBySKU] @SKUID = @SKUID;

END;
GO
