-- ========================================================================
-- Stored Procedure: [dbo].[DS_ShiftDashboard_RunningPlan]
-- Database: PPMS_BajajPant
-- Created: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time) | Last Modified: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time)
-- ========================================================================

-- =============================================
-- Author:        Sumit
-- Create date: 07 July 2026
-- Description:  Running Plan Details for Shift Production Dashboard
-- =============================================

CREATE       PROCEDURE [dbo].[DS_ShiftDashboard_RunningPlan]
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
            P.PlanID,
            P.SKUID,
            C.SKUName,
            P.PlanQty,
            P.ProdDate,
            P.ProdShift,
            P.Status,
            P.LineSpeed
        FROM dbo.Prod_Shift_Plan P
        INNER JOIN dbo.Config_SKU C
            ON P.SKUID = C.SKUID
        WHERE
            P.ProdDate = @ProdDate
            AND P.ProdShift = @ProdShift
            AND P.Status = 1
            AND
            (
                @SKUID = 0
                OR P.SKUID = @SKUID
            )
        ORDER BY P.PlanID;

    END TRY
    BEGIN CATCH
        EXEC dbo.RethrowError;
    END CATCH
END
GO
