
 

-- =============================================
-- Author:      Shubham Patil
-- CREATE OR ALTER OR ALTER date: 07 May 2026
-- Description: Production Shift Plan Grid
-- =============================================

 

CREATE         PROCEDURE [dbo].[GV_ProdShiftPlan]

 

AS
BEGIN

 

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

 

    FROM Prod_Shift_Plan AS A

 

    JOIN Config_Line AS B
        ON A.LineID = B.LineID

 

    JOIN Config_SKU AS C
        ON A.SKUID = C.SKUID

 

    ORDER BY A.PlanID DESC

 

END
