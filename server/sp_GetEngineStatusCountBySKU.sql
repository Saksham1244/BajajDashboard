-- ======================================================================================
-- Stored Procedure: [dbo].[DS_Prod_EngineStatusCountBySKU]
-- Legacy Alias    : [dbo].[USP_GetEngineStatusCountBySKU], [dbo].[DS_GetEngineStatusCountBySKU]
-- Parameter       : @SKUID INT = 0 (If 0 or NULL, returns all data without SKU filter)
-- Description     : Fetches Engine IDs from dbo.Prod_Engine_WIP (filtered by @SKUID if > 0,
--                   or all engines if @SKUID = 0/NULL), retrieves current running ProdDate
--                   (ParameterID = 1) and ProdShift (ParameterID = 2) from dbo.ApplicationSetting,
--                   gets their latest status from dbo.Prod_Status_Geneology for the running shift, 
--                   and returns ProdDate, ProdShift, and all unique status counts.
-- ======================================================================================

CREATE OR ALTER PROCEDURE [dbo].[DS_Prod_EngineStatusCountBySKU]
(
    @SKUID INT = 0
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @ProdDateStr NVARCHAR(50),
                @ProdShift NVARCHAR(50),
                @ProdDate DATE;

        --------------------------------------------------------------------------------
        -- 1. Read Current Running Date (ParameterID = 1) from ApplicationSetting
        --------------------------------------------------------------------------------
        SELECT TOP (1) 
            @ProdDateStr = TRIM(ParameterValue)
        FROM dbo.ApplicationSetting
        WHERE ParameterID = 1
        ORDER BY UID DESC;

        -- Fallback to Prod_ShiftInformation if ApplicationSetting is empty
        IF @ProdDateStr IS NULL
        BEGIN
            SELECT TOP (1) @ProdDateStr = TRIM(ParameterValue)
            FROM dbo.Prod_ShiftInformation
            WHERE ParameterName = 'ProdDate'
            ORDER BY UID DESC;
        END

        SET @ProdDate = TRY_CAST(@ProdDateStr AS DATE);
        IF @ProdDate IS NULL AND @ProdDateStr IS NOT NULL
        BEGIN
            SET @ProdDate = TRY_CONVERT(DATE, @ProdDateStr, 105);
        END
        IF @ProdDate IS NULL AND @ProdDateStr IS NOT NULL
        BEGIN
            SET @ProdDate = TRY_CONVERT(DATE, @ProdDateStr, 120);
        END

        --------------------------------------------------------------------------------
        -- 2. Read Current Running Shift (ParameterID = 2) from ApplicationSetting
        --------------------------------------------------------------------------------
        SELECT TOP (1) 
            @ProdShift = TRIM(ParameterValue)
        FROM dbo.ApplicationSetting
        WHERE ParameterID = 2
        ORDER BY UID DESC;

        -- Fallback to Prod_ShiftInformation if ApplicationSetting is empty
        IF @ProdShift IS NULL
        BEGIN
            SELECT TOP (1) @ProdShift = TRIM(ParameterValue)
            FROM dbo.Prod_ShiftInformation
            WHERE ParameterName = 'ProdShift'
            ORDER BY UID DESC;
        END

        --------------------------------------------------------------------------------
        -- 3. Gather Engines from Prod_Engine_WIP
        --------------------------------------------------------------------------------
        CREATE TABLE #WIP_Engines (
            EngineNo NVARCHAR(50) COLLATE DATABASE_DEFAULT
        );

        INSERT INTO #WIP_Engines (EngineNo)
        SELECT DISTINCT
            W.EngineNo
        FROM dbo.Prod_Engine_WIP W
        WHERE (@SKUID IS NULL OR @SKUID = 0 OR W.SKUID = @SKUID);

        --------------------------------------------------------------------------------
        -- 4. Get Latest Status per Engine from Prod_Status_Geneology
        --------------------------------------------------------------------------------
        CREATE TABLE #Geneology_Ranked (
            EngineNo NVARCHAR(50) COLLATE DATABASE_DEFAULT,
            Status INT,
            rn INT
        );

        INSERT INTO #Geneology_Ranked (EngineNo, Status, rn)
        SELECT 
            G.EngineNo,
            G.Status,
            ROW_NUMBER() OVER (
                PARTITION BY G.EngineNo 
                ORDER BY G.[Timestamp] DESC, G.RowID DESC
            ) AS rn
        FROM dbo.Prod_Status_Geneology G
        INNER JOIN #WIP_Engines W ON G.EngineNo = W.EngineNo COLLATE DATABASE_DEFAULT
        WHERE (@ProdDate IS NULL OR G.ProdDate = @ProdDate)
          AND (@ProdShift IS NULL 
               OR G.ProdShift = @ProdShift COLLATE DATABASE_DEFAULT
               OR (@ProdShift = 'A' AND G.ProdShift IN ('1', 'Shift 1', 'Shift A', 'A'))
               OR (@ProdShift = 'B' AND G.ProdShift IN ('2', 'Shift 2', 'Shift B', 'B'))
               OR (@ProdShift = 'C' AND G.ProdShift IN ('3', 'Shift 3', 'Shift C', 'C')));

        --------------------------------------------------------------------------------
        -- 5. Aggregate Status Counts for Single Record Output
        --------------------------------------------------------------------------------
        SELECT 
            ISNULL(@ProdDate, CAST(GETDATE() AS DATE)) AS ProdDate,
            ISNULL(@ProdShift, 'A') AS ProdShift,
            COUNT(CASE WHEN Status = 6  THEN 1 END) AS NotOK,
            COUNT(CASE WHEN Status = 7  THEN 1 END) AS NotOKBypass,
            COUNT(CASE WHEN Status = 8  THEN 1 END) AS OKBypass,
            COUNT(CASE WHEN Status = 9  THEN 1 END) AS CompletedEng,
            COUNT(CASE WHEN Status = 10 THEN 1 END) AS FGEngine,
            COUNT(CASE WHEN Status = 12 THEN 1 END) AS EngMaterialHold,
            COUNT(CASE WHEN Status = 13 THEN 1 END) AS MaterialHoldCleared,
            COUNT(CASE WHEN Status = 14 THEN 1 END) AS ForRework,
            COUNT(CASE WHEN Status = 15 THEN 1 END) AS ReworkOK,
            COUNT(CASE WHEN Status = 26 THEN 1 END) AS EngFQCHold,
            COUNT(CASE WHEN Status = 21 THEN 1 END) AS EngIPQCHold,
            COUNT(CASE WHEN Status = 19 THEN 1 END) AS IPQCRework,
            COUNT(CASE WHEN Status = 22 THEN 1 END) AS IPQCHoldCleared,
            COUNT(CASE WHEN Status = 27 THEN 1 END) AS FQCHoldCleared,
            COUNT(CASE WHEN Status = 24 THEN 1 END) AS FQCRework,
            COUNT(CASE WHEN Status = 25 THEN 1 END) AS FGReworkOK,
            COUNT(CASE WHEN Status = 28 THEN 1 END) AS FGReworkRejected,
            COUNT(CASE WHEN Status = 11 THEN 1 END) AS EngineScrapped
        FROM #Geneology_Ranked
        WHERE rn = 1;

        DROP TABLE IF EXISTS #Geneology_Ranked;
        DROP TABLE IF EXISTS #WIP_Engines;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE(),
                @ErrorSeverity INT = ERROR_SEVERITY(),
                @ErrorState INT = ERROR_STATE();
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

-- Backward-Compatibility Aliases
CREATE OR ALTER PROCEDURE [dbo].[USP_GetEngineStatusCountBySKU]
(
    @SKUID INT = 0
)
AS
BEGIN
    SET NOCOUNT ON;
    EXEC [dbo].[DS_Prod_EngineStatusCountBySKU] @SKUID = @SKUID;
END;
GO

CREATE OR ALTER PROCEDURE [dbo].[DS_GetEngineStatusCountBySKU]
(
    @SKUID INT = 0
)
AS
BEGIN
    SET NOCOUNT ON;
    EXEC [dbo].[DS_Prod_EngineStatusCountBySKU] @SKUID = @SKUID;
END;
GO
