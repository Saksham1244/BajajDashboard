-- ========================================================================
-- Stored Procedure: [dbo].[DS_ShiftDashboard_CylinderHead]
-- Database: PPMS_BajajPant
-- Created: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time) | Last Modified: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time)
-- ========================================================================

-- =============================================
-- Author:        Sumit
-- Create date:   09 July 2026
-- Description:   Shift Dashboard Cylinder Head KPI
-- =============================================

CREATE       PROCEDURE [dbo].[DS_ShiftDashboard_CylinderHead]
(
    @SKUID INT = 0
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        DECLARE
            @ProdDate DATE,
            @ProdShift NVARCHAR(10);

        -- Get Current Production Date
        SELECT TOP (1)
            @ProdDate = CONVERT(DATE, ParameterValue, 105)
        FROM Prod_ShiftInformation
        WHERE ParameterName = 'ProdDate'
        ORDER BY UID DESC;

        -- Get Current Production Shift
        SELECT TOP (1)
            @ProdShift = ParameterValue
        FROM Prod_ShiftInformation
        WHERE ParameterName = 'ProdShift'
        ORDER BY UID DESC;

        SELECT

            SUM(ISNULL(CH.Planned,0))     AS OrderStarted,
            SUM(ISNULL(CH.Completed,0))   AS OrderCompleted,
            SUM(ISNULL(CH.InProcess,0))   AS NotOK,
            SUM(ISNULL(CH.Married,0))     AS Married

        FROM Prod_CHD_PlanExecution CH
        INNER JOIN Prod_Shift_Plan SP
            ON CH.PlanID = SP.PlanID

        WHERE
            SP.ProdDate = @ProdDate
            AND SP.ProdShift = @ProdShift
            AND
            (
                @SKUID = 0
                OR SP.SKUID = @SKUID
            );

    END TRY

    BEGIN CATCH
        EXEC dbo.RethrowError;
    END CATCH

END
GO
