-- ========================================================================
-- Stored Procedure: [dbo].[DS_Prod_ProductionKPI]
-- Database: PPMS_BajajPant
-- Created: Fri Nov 13 2026 18:03:43 GMT+0530 (India Standard Time) | Last Modified: Fri Nov 13 2026 18:03:43 GMT+0530 (India Standard Time)
-- ========================================================================

CREATE   PROCEDURE [dbo].[DS_Prod_ProductionKPI]
        @StartDate DATE = NULL,
        @EndDate DATE = NULL,
        @Shift VARCHAR(20) = NULL,
        @Line VARCHAR(50) = NULL,
        @Model VARCHAR(50) = NULL,
        @SKU VARCHAR(50) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;

        SELECT 
            ISNULL(SUM(E.PlanQty), 0) AS totalPlan,
            ISNULL(SUM(E.ENGCompleted_Qty), 0) AS totalProd,
            ISNULL(SUM(E.PlanQty) - SUM(E.ENGCompleted_Qty), 0) AS shortfall,
            ISNULL(SUM(E.ENGCompleted_Qty) - SUM(E.ENGReworkOK_Qty), 0) AS straightPass,
            ISNULL(SUM(E.ENGMainLine_Qty) - SUM(E.ENGCompleted_Qty), 0) AS wip,
            ISNULL(SUM(E.ENGMaterialHold_Qty) + SUM(E.ENGQualityHold_Qty), 0) AS rollover,
            CASE 
                WHEN SUM(E.ENGCompleted_Qty) > 0 
                THEN CAST(ROUND(((SUM(E.ENGCompleted_Qty) - SUM(E.ENGReworkOK_Qty)) * 100.0) / SUM(E.ENGCompleted_Qty), 1) AS FLOAT)
                ELSE 100.0 
            END AS straightPassRate,
            CASE 
                WHEN SUM(E.PlanQty) > 0 
                THEN CAST(ROUND((SUM(E.ENGCompleted_Qty) * 100.0) / SUM(E.PlanQty), 1) AS FLOAT)
                ELSE 0.0 
            END AS fulfillmentRate
        FROM dbo.Prod_EnginePlanExecution E
        LEFT JOIN dbo.Config_Line L ON E.LineID = L.LineID
        LEFT JOIN dbo.Config_SKU S ON E.SKUID = S.SKUID
        LEFT JOIN dbo.Config_Model M ON S.ModelID = M.ModelID
        WHERE (@StartDate IS NULL OR E.ProdDate >= @StartDate)
          AND (@EndDate IS NULL OR E.ProdDate <= @EndDate)
          AND (@Shift IS NULL OR E.ProdShift = @Shift OR (@Shift IN ('A', '1', 'Shift 1') AND E.ProdShift IN ('1', 'Shift 1', 'A')) OR (@Shift IN ('B', '2', 'Shift 2') AND E.ProdShift IN ('2', 'Shift 2', 'B')))
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(E.LineID AS VARCHAR) = @Line)
          AND (@Model IS NULL OR M.ModelName = @Model)
          AND (@SKU IS NULL OR S.SKUName = @SKU);
    END;
GO
