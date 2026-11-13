-- ========================================================================
-- Stored Procedure: [dbo].[DS_Dashboard_ProdShiftPlan]
-- Database: PPMS_BajajPant
-- Created: Fri Nov 13 2026 17:54:00 GMT+0530 (India Standard Time) | Last Modified: Fri Nov 13 2026 17:54:00 GMT+0530 (India Standard Time)
-- ========================================================================

-- 1. DS_Dashboard_ProdShiftPlan (renamed from GV_ProdShiftPlan)
CREATE   PROCEDURE [dbo].[DS_Dashboard_ProdShiftPlan]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        A.PlanID,
        A.LineID,
        B.LineName,
        A.SKUID,
        C.SKUName,
        A.ProdDate,
        A.ProdShift,
        A.PlanQty,
        A.Status,
        CASE
            WHEN A.Status = 1 THEN 'Plan'
            WHEN A.Status = 2 THEN 'Hold'
            WHEN A.Status = 3 THEN 'Short Close'
            WHEN A.Status = 4 THEN 'Completed'
            WHEN A.Status = 5 THEN 'Inprocess'
        END AS StatusName,
        A.Priority,
        A.Source,
        CASE
            WHEN A.Source = 1 THEN 'Manual'
            WHEN A.Source = 2 THEN 'Excel'
            WHEN A.Source = 3 THEN 'SAP'
        END AS SourceName
    FROM dbo.Prod_Plan AS A
    LEFT JOIN dbo.Config_Line AS B ON A.LineID = B.LineID
    LEFT JOIN dbo.Config_SKU AS C ON A.SKUID = C.SKUID
    ORDER BY A.PlanID DESC;
END;
GO
