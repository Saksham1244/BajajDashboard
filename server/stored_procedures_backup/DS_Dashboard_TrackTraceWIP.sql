
-- 3. DS_Dashboard_TrackTraceWIP
CREATE   PROCEDURE [dbo].[DS_Dashboard_TrackTraceWIP]
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @Shift VARCHAR(20) = NULL,
    @Line VARCHAR(50) = NULL,
    @WIPStatus VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        W.EngineNo AS id,
        W.EngineNo AS engineNo,
        ISNULL(L.LineName, 'Line C') AS line,
        ISNULL(M.ModelName, 'Pulsar 150') AS model,
        ISNULL(S.SKUName, 'PD501060') AS sku,
        'Station ' + CAST(COALESCE(W.ReEntryStation, W.NotOkStation, 1) AS VARCHAR) AS currentStation,
        CASE 
            WHEN W.Status = 1 THEN 'In-Process'
            WHEN W.Status = 2 THEN 'Rework'
            WHEN W.Status = 3 THEN 'Blocked'
            WHEN W.Status = 4 THEN 'Completed'
            ELSE 'Idle'
        END AS status,
        CONVERT(VARCHAR(19), W.StartTime, 120) AS startTime,
        CONVERT(VARCHAR(5), W.StartTime, 108) AS entryTime,
        DATEDIFF(MINUTE, W.StartTime, GETDATE()) AS durationMinutes
    FROM dbo.Prod_Engine_WIP W
    LEFT JOIN dbo.Config_Line L ON W.LineID = L.LineID
    LEFT JOIN dbo.Config_SKU S ON W.SKUID = S.SKUID
    LEFT JOIN dbo.Config_Model M ON S.ModelID = M.ModelID
    ORDER BY W.StartTime DESC;
END;
