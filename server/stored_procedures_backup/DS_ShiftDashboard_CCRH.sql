-- ========================================================================
-- Stored Procedure: [dbo].[DS_ShiftDashboard_CCRH]
-- Database: PPMS_BajajPant
-- Created: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time) | Last Modified: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time)
-- ========================================================================

-- =============================================
-- Author:        Sumit
-- Create date: 08 July 2026
-- Description:  Shift Dashboard CCRH Details
-- =============================================

CREATE       PROCEDURE [dbo].[DS_ShiftDashboard_CCRH]
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

            SUM(ISNULL(C.Planned,0))    AS OrderStarted,
            SUM(ISNULL(C.Completed,0))  AS OrderCompleted,
            SUM(ISNULL(C.InProcess,0))  AS NotOK,
            SUM(ISNULL(C.Married,0))    AS Married

        FROM dbo.Prod_CCRH_PlanExecution C
        INNER JOIN dbo.Prod_Shift_Plan P
            ON C.PlanID = P.PlanID

        WHERE
            P.ProdDate = @ProdDate
            AND P.ProdShift = @ProdShift
            AND
            (
                @SKUID = 0
                OR P.SKUID = @SKUID
            );

    END TRY

    BEGIN CATCH
        EXEC dbo.RethrowError;
    END CATCH

END
GO
