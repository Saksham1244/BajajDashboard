-- ========================================================================
-- Stored Procedure: [dbo].[DS_ShiftDashboard_KPI]
-- Database: PPMS_BajajPant
-- Created: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time) | Last Modified: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time)
-- ========================================================================

-- =============================================
-- Author:        Sumit
-- Create date: 07 July 2026
-- Description:  Shift Production Dashboard KPI
-- =============================================

CREATE       PROCEDURE [dbo].[DS_ShiftDashboard_KPI]
(
      @SKUID INT = 0
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        DECLARE @ProdDate DATE,
                @ProdShift NVARCHAR(10);

        -- Current Production Date
        SELECT TOP (1)
            @ProdDate = CONVERT(DATE, ParameterValue, 105)
        FROM dbo.Prod_ShiftInformation
        WHERE ParameterName = 'ProdDate'
        ORDER BY UID DESC;

        -- Current Production Shift
        SELECT TOP (1)
            @ProdShift = ParameterValue
        FROM dbo.Prod_ShiftInformation
        WHERE ParameterName = 'ProdShift'
        ORDER BY UID DESC;

        SELECT

            SUM(PE.PlanQty)                    AS PlanQty,
            SUM(PE.KitAssembly_Qty)           AS OrderStarted,
            SUM(PE.ENGCompleted_Qty)          AS OrderCompleted,
            SUM(PE.ENGReworkOK_Qty)           AS ReworkCompleted,
            SUM(PE.ENGMaterialHold_Qty)       AS MaterialHold,
            SUM(PE.ENGQualityHold_Qty)        AS QualityHold,
            SUM(PE.ENGScrapped_Qty)           AS Scrapped,
            SUM(PE.ENGNotOK_Qty)              AS Rework,
            SUM(PE.ENGTakeOut_Qty)            AS TakeOut,
            SUM(PE.ENGNotOKBypass_Qty)        AS BypassQty,
            SUM(PE.ENGMainLine_Qty)           AS MainLineQty,
            SUM(PE.KitInspected_Qty)          AS KitInspectedQty

        FROM dbo.Prod_EnginePlanExecution PE

        WHERE
            PE.ProdDate = @ProdDate
            AND PE.ProdShift = @ProdShift
            AND PE.Status = 1
            AND
            (
                @SKUID = 0
                OR PE.SKUID = @SKUID
            );

    END TRY

    BEGIN CATCH
        EXEC dbo.RethrowError;
    END CATCH

END
GO
