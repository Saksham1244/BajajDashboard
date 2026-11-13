-- ========================================================================
-- Stored Procedure: [dbo].[DS_Prod_Engine_Station_Tracking]
-- Database: PPMS_BajajPant
-- Created: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time) | Last Modified: Fri Oct 09 2026 14:26:12 GMT+0530 (India Standard Time)
-- ========================================================================

-- =============================================
-- Author:		Suhbham
-- Create date: 28-09-2026
-- Description:	Engine Station Tracking
-- =============================================
create   PROCEDURE [dbo].[DS_Prod_Engine_Station_Tracking] 
	-- Add the parameters for the stored procedure here
	
AS
BEGIN

	SET NOCOUNT ON;

	select WIP.EngineNo,Status
	from Prod_Engine_WIP as WIP
	JOIN Prod_Engine_Station_Tracking AS ET
	ON WIP.EngineNo=ET.EngineNo
	order by StationID ASC;

	
END
GO
