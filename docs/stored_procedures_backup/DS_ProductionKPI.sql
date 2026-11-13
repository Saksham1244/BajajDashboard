-- ========================================================================
-- Stored Procedure: [dbo].[DS_ProductionKPI]
-- Database: PPMS_BajajPant
-- Created: Fri Nov 13 2026 18:03:43 GMT+0530 (India Standard Time) | Last Modified: Fri Nov 13 2026 18:03:43 GMT+0530 (India Standard Time)
-- ========================================================================

CREATE   PROCEDURE [dbo].[DS_ProductionKPI]
        @StartDate DATE = NULL,
        @EndDate DATE = NULL,
        @Shift VARCHAR(20) = NULL,
        @Line VARCHAR(50) = NULL,
        @Model VARCHAR(50) = NULL,
        @SKU VARCHAR(50) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;
        EXEC [dbo].[DS_Prod_ProductionKPI] @StartDate, @EndDate, @Shift, @Line, @Model, @SKU;
    END;
GO
