-- ========================================================================
-- Stored Procedure: [dbo].[DS_Prod_Date&Shift]
-- Database: PPMS_BajajPant
-- Created: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time) | Last Modified: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time)
-- ========================================================================

CREATE       PROCEDURE [dbo].[DS_Prod_Date&Shift]
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        SELECT
            MAX(CASE WHEN ParameterName = 'ProdDate' THEN ParameterValue END) AS ProdDate,
            MAX(CASE WHEN ParameterName = 'ProdShift' THEN ParameterValue END) AS ProdShift
        FROM
        (
            SELECT
                ParameterName,
                ParameterValue,
                ROW_NUMBER() OVER
                (
                    PARTITION BY ParameterName
                    ORDER BY UID DESC
                ) AS RN
            FROM dbo.ApplicationSetting
            WHERE ParameterName IN ('ProdDate', 'ProdShift')
        ) AS LatestValues
        WHERE RN = 1;

    END TRY
    BEGIN CATCH
        EXEC dbo.RethrowError;
    END CATCH
END
select * from ApplicationSetting
GO
