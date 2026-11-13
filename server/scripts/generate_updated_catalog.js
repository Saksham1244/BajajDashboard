const fs = require('fs');
const path = require('path');
const xlsx = require('./client/node_modules/xlsx');

async function updateCatalog() {
  const origPath = path.join(__dirname, 'BAJAJ_PPMS_API_LINEAGE_AND_PROCEDURES_CATALOG.xlsx');
  const wb = xlsx.readFile(origPath);

  // Read existing sheets we want to keep
  const wsAudit = wb.Sheets['Report_API_Audit'];
  const wsKpi = wb.Sheets['API_KPI_Dictionary'];
  const wsTables = wb.Sheets['API_Target_Tables'];

  // 1. Updated Stored_Procedure_APIs
  const spApiData = [
    {
      'S.No': 1,
      'API Route / Feature': 'GET /api/dashboard/production',
      'Dashboard Module': 'Production Command Center',
      'Standardized SP Name': 'DS_Prod_ProductionKPI',
      'Legacy / Alias SP': 'DS_Dashboard_ProductionKPI / DS_ProductionKPI',
      'Category': 'Dashboard Screen Procedure (DS_Prod_*)',
      'Author / Owner': 'Dashboard Architecture Team',
      'Parameters Accepted': '@StartDate, @EndDate, @Shift, @Line, @Model, @SKU',
      'Target Tables Queried': 'Prod_EnginePlanExecution, Config_Line, Config_SKU, Config_Model',
      'Execution Mode': 'await spReq.execute("DS_Prod_ProductionKPI")',
      'Output Recordset / KPIs': 'totalPlan, totalProd, shortfall, straightPass, wip, rollover, straightPassRate, fulfillmentRate',
      'Database Status': 'Active & Deployed in PPMS_BajajPant (200 OK)'
    },
    {
      'S.No': 2,
      'API Route / Feature': 'GET /api/process/conveyor',
      'Dashboard Module': 'Process Monitoring',
      'Standardized SP Name': 'DS_Process_Conveyor',
      'Legacy / Alias SP': 'DS_Dashboard_ProcessConveyor / DS_ProcessConveyor',
      'Category': 'Dashboard Screen Procedure (DS_Process_*)',
      'Author / Owner': 'Dashboard Architecture Team',
      'Parameters Accepted': '@StartDate, @EndDate, @Shift, @Line, @Station',
      'Target Tables Queried': 'Perf_Downtime, Config_Station, Config_Line, Prod_Plan',
      'Execution Mode': 'await spReq.execute("DS_Process_Conveyor")',
      'Output Recordset / KPIs': '4 Recordsets: Station Uptime %, Stoppage Reasons, Downtime by Station, Planned Speed & Count',
      'Database Status': 'Active & Deployed in PPMS_BajajPant (200 OK)'
    },
    {
      'S.No': 3,
      'API Route / Feature': 'GET /api/trace/wip',
      'Dashboard Module': 'Track & Trace (WIP Tracking)',
      'Standardized SP Name': 'DS_TrackTrace_WIP',
      'Legacy / Alias SP': 'DS_Dashboard_TrackTraceWIP / DS_TrackTraceWIP',
      'Category': 'Dashboard Screen Procedure (DS_TrackTrace_*)',
      'Author / Owner': 'Dashboard Architecture Team',
      'Parameters Accepted': '@StartDate, @EndDate, @Shift, @Line, @WIPStatus',
      'Target Tables Queried': 'Prod_Engine_WIP, Config_Line, Config_SKU, Config_Model',
      'Execution Mode': 'await spReq.execute("DS_TrackTrace_WIP")',
      'Output Recordset / KPIs': '19 Live WIP Engines with Current Station, Status, StartTime, EntryTime, Duration in Minutes',
      'Database Status': 'Active & Deployed in PPMS_BajajPant (200 OK)'
    },
    {
      'S.No': 4,
      'API Route / Feature': 'GET /api/maintenance/downtime',
      'Dashboard Module': 'Maintenance & Downtime Summary',
      'Standardized SP Name': 'DS_Maint_Downtime',
      'Legacy / Alias SP': 'DS_Dashboard_MaintenanceDowntime / DS_MaintenanceDowntime',
      'Category': 'Dashboard Screen Procedure (DS_Maint_*)',
      'Author / Owner': 'Dashboard Architecture Team',
      'Parameters Accepted': '@StartDate, @EndDate, @Shift, @Line, @Station',
      'Target Tables Queried': 'Maint_BreakDown_Log, Config_Station, Config_Line',
      'Execution Mode': 'await spReq.execute("DS_Maint_Downtime")',
      'Output Recordset / KPIs': '3 Recordsets: Summary KPIs (Total Hours, Avg Mins, Breakdowns), Machine Breakdown Matrix, 30-Day Trend',
      'Database Status': 'Active & Deployed in PPMS_BajajPant (200 OK)'
    },
    {
      'S.No': 5,
      'API Route / Feature': 'Track & Trace / Engine Gate Genealogy Tracker',
      'Dashboard Module': 'Track & Trace (Genealogy & Gates)',
      'Standardized SP Name': 'DS_Prod_EngineStatusCountBySKU',
      'Legacy / Alias SP': 'USP_GetEngineStatusCountBySKU / DS_GetEngineStatusCountBySKU',
      'Category': 'Dashboard Screen Procedure (DS_Prod_*)',
      'Author / Owner': 'Plant Engineering & Quality Team',
      'Parameters Accepted': '@SKUID (e.g. 1 for SKU 1, 0 for All SKUs)',
      'Target Tables Queried': 'Prod_Engine_WIP, Prod_Status_Geneology, ApplicationSetting, Prod_ShiftInformation',
      'Execution Mode': 'EXEC [dbo].[DS_Prod_EngineStatusCountBySKU] @SKUID = @SKUID',
      'Output Recordset / KPIs': '19 Process Gate Counts: Completed, FG, MaterialHold, ForRework, ReworkOK, IPQCHold, FQCHold, Scrapped',
      'Database Status': 'Active & Deployed in PPMS_BajajPant (200 OK)'
    },
    {
      'S.No': 6,
      'API Route / Feature': 'GET /api/production/plan',
      'Dashboard Module': 'Production Shift Planning',
      'Standardized SP Name': 'DS_ProdShiftPlan',
      'Legacy / Alias SP': 'GV_ProdShiftPlan',
      'Category': 'Dashboard / Grid View Procedure (DS_ / GV_*)',
      'Author / Owner': 'Shubham Patil',
      'Parameters Accepted': 'None (Queries official view Prod_Shift_Plan over Prod_Plan)',
      'Target Tables Queried': 'Prod_Plan, Config_Line, Config_SKU',
      'Execution Mode': 'await pool.request().execute("DS_ProdShiftPlan")',
      'Output Recordset / KPIs': '160 Shift Plan Records: PlanID, Line, SKU, Model, Target Qty, Start/End Time, Shift Status',
      'Database Status': 'Active & Deployed in PPMS_BajajPant (200 OK)'
    }
  ];

  // 2. All_Dashboard_SPs_DS: Dedicated sheet for all DS_ procedures in DB
  const allDsProcedures = [
    {
      'S.No': 1,
      'Stored Procedure Name': 'DS_Prod_ProductionKPI',
      'Type / Role': 'Primary Live Procedure',
      'Module': 'Production Management',
      'Category': 'DS_Prod_*',
      'Author / Owner': 'Dashboard Team',
      'Parameters': '@StartDate, @EndDate, @Shift, @Line, @Model, @SKU',
      'Target Tables / Views': 'dbo.Prod_EnginePlanExecution, dbo.Config_Line, dbo.Config_SKU, dbo.Config_Model',
      'Returns / Purpose': 'Calculates production plan, actual output, straight pass, WIP, shortfall, and rollover KPIs.',
      'Associated API / Screen': 'GET /api/dashboard/production (Production.jsx)',
      'Status in DB': 'Active & Deployed'
    },
    {
      'S.No': 2,
      'Stored Procedure Name': 'DS_Process_Conveyor',
      'Type / Role': 'Primary Live Procedure',
      'Module': 'Process Monitoring',
      'Category': 'DS_Process_*',
      'Author / Owner': 'Dashboard Team',
      'Parameters': '@StartDate, @EndDate, @Shift, @Line, @Station',
      'Target Tables / Views': 'dbo.Perf_Downtime, dbo.Config_Station, dbo.Config_Line, dbo.Prod_Plan',
      'Returns / Purpose': 'Returns 4 recordsets: station uptime %, stoppage reasons, downtime pareto, and planned line speed.',
      'Associated API / Screen': 'GET /api/process/conveyor (ConveyorReport.jsx)',
      'Status in DB': 'Active & Deployed'
    },
    {
      'S.No': 3,
      'Stored Procedure Name': 'DS_TrackTrace_WIP',
      'Type / Role': 'Primary Live Procedure',
      'Module': 'Track & Trace',
      'Category': 'DS_TrackTrace_*',
      'Author / Owner': 'Dashboard Team',
      'Parameters': '@StartDate, @EndDate, @Shift, @Line, @WIPStatus',
      'Target Tables / Views': 'dbo.Prod_Engine_WIP, dbo.Config_Line, dbo.Config_SKU, dbo.Config_Model',
      'Returns / Purpose': 'Tracks real-time WIP engines across assembly line stations with dwell time and station status.',
      'Associated API / Screen': 'GET /api/trace/wip (WIPReport.jsx)',
      'Status in DB': 'Active & Deployed'
    },
    {
      'S.No': 4,
      'Stored Procedure Name': 'DS_Maint_Downtime',
      'Type / Role': 'Primary Live Procedure',
      'Module': 'Maintenance',
      'Category': 'DS_Maint_*',
      'Author / Owner': 'Dashboard Team',
      'Parameters': '@StartDate, @EndDate, @Shift, @Line, @Station',
      'Target Tables / Views': 'dbo.Maint_BreakDown_Log, dbo.Config_Station, dbo.Config_Line',
      'Returns / Purpose': 'Returns 3 recordsets: breakdown summary KPIs, station breakdown matrix with MTTR, and downtime trend.',
      'Associated API / Screen': 'GET /api/maintenance/downtime (DowntimeSummaryReport.jsx)',
      'Status in DB': 'Active & Deployed'
    },
    {
      'S.No': 5,
      'Stored Procedure Name': 'DS_Prod_EngineStatusCountBySKU',
      'Type / Role': 'Primary Live Procedure',
      'Module': 'Track & Trace / Genealogy',
      'Category': 'DS_Prod_*',
      'Author / Owner': 'Plant Quality Team',
      'Parameters': '@SKUID (INT)',
      'Target Tables / Views': 'dbo.Prod_Engine_WIP, dbo.Prod_Status_Geneology, dbo.ApplicationSetting, dbo.Prod_ShiftInformation',
      'Returns / Purpose': 'Aggregates live engine counts across 19 quality and rework gates partitioned by latest timestamp.',
      'Associated API / Screen': 'Genealogy & Quality Gate Tracking (EngineHistoryReport.jsx)',
      'Status in DB': 'Active & Deployed'
    },
    {
      'S.No': 6,
      'Stored Procedure Name': 'DS_ProdShiftPlan',
      'Type / Role': 'Primary Live Procedure',
      'Module': 'Production Planning',
      'Category': 'DS_Prod_*',
      'Author / Owner': 'Shubham Patil',
      'Parameters': 'None',
      'Target Tables / Views': 'dbo.Prod_Shift_Plan, dbo.Prod_Plan, dbo.Config_Line, dbo.Config_SKU',
      'Returns / Purpose': 'Returns current shift production plan schedule, target quantities, and running execution status.',
      'Associated API / Screen': 'GET /api/production/plan (ShiftPlanExecutionReport.jsx)',
      'Status in DB': 'Active & Deployed'
    },
    {
      'S.No': 7,
      'Stored Procedure Name': 'DS_ShiftDashboard_KPI',
      'Type / Role': 'Original Plant Procedure',
      'Module': 'Production Shift Dashboard',
      'Category': 'DS_ShiftDashboard_*',
      'Author / Owner': 'Sumit',
      'Parameters': '@SKUID (INT)',
      'Target Tables / Views': 'dbo.Prod_EnginePlanExecution, dbo.Prod_ShiftInformation',
      'Returns / Purpose': 'Shift Production Dashboard KPI: calculates plan qty, kit start, completed, rework, and material hold.',
      'Associated API / Screen': 'Genesis Production Dashboard',
      'Status in DB': 'Original Plant Deployed'
    },
    {
      'S.No': 8,
      'Stored Procedure Name': 'DS_ShiftDashboard_RunningPlan',
      'Type / Role': 'Original Plant Procedure',
      'Module': 'Production Shift Dashboard',
      'Category': 'DS_ShiftDashboard_*',
      'Author / Owner': 'Sumit',
      'Parameters': '@SKUID (INT)',
      'Target Tables / Views': 'dbo.Prod_EnginePlanExecution, dbo.Prod_ShiftInformation',
      'Returns / Purpose': 'Returns currently running plan details for the active date and shift.',
      'Associated API / Screen': 'Genesis Production Dashboard',
      'Status in DB': 'Original Plant Deployed'
    },
    {
      'S.No': 9,
      'Stored Procedure Name': 'DS_ShiftDashboard_CCLH',
      'Type / Role': 'Original Plant Procedure',
      'Module': 'Sub-Assembly Dashboard',
      'Category': 'DS_ShiftDashboard_*',
      'Author / Owner': 'Sumit',
      'Parameters': '@SKUID (INT)',
      'Target Tables / Views': 'dbo.SubAssly_PlanExecution, dbo.Prod_ShiftInformation',
      'Returns / Purpose': 'Shift dashboard KPIs specifically for Crankcase Left Hand (CCLH) sub-assembly line.',
      'Associated API / Screen': 'Genesis CCLH Sub-Assembly Dashboard',
      'Status in DB': 'Original Plant Deployed'
    },
    {
      'S.No': 10,
      'Stored Procedure Name': 'DS_ShiftDashboard_CCRH',
      'Type / Role': 'Original Plant Procedure',
      'Module': 'Sub-Assembly Dashboard',
      'Category': 'DS_ShiftDashboard_*',
      'Author / Owner': 'Sumit',
      'Parameters': '@SKUID (INT)',
      'Target Tables / Views': 'dbo.SubAssly_PlanExecution, dbo.Prod_ShiftInformation',
      'Returns / Purpose': 'Shift dashboard KPIs specifically for Crankcase Right Hand (CCRH) sub-assembly line.',
      'Associated API / Screen': 'Genesis CCRH Sub-Assembly Dashboard',
      'Status in DB': 'Original Plant Deployed'
    },
    {
      'S.No': 11,
      'Stored Procedure Name': 'DS_ShiftDashboard_CylinderHead',
      'Type / Role': 'Original Plant Procedure',
      'Module': 'Sub-Assembly Dashboard',
      'Category': 'DS_ShiftDashboard_*',
      'Author / Owner': 'Sumit',
      'Parameters': '@SKUID (INT)',
      'Target Tables / Views': 'dbo.SubAssly_PlanExecution, dbo.Prod_ShiftInformation',
      'Returns / Purpose': 'Shift dashboard KPIs specifically for Cylinder Head sub-assembly line.',
      'Associated API / Screen': 'Genesis Cylinder Head Sub-Assembly Dashboard',
      'Status in DB': 'Original Plant Deployed'
    },
    {
      'S.No': 12,
      'Stored Procedure Name': 'DS_Prod_Engine_Station_Tracking',
      'Type / Role': 'Original Plant Procedure',
      'Module': 'Track & Trace',
      'Category': 'DS_Prod_*',
      'Author / Owner': 'Sumit / Plant Engineering',
      'Parameters': 'None',
      'Target Tables / Views': 'dbo.Prod_Engine_WIP, dbo.Prod_Engine_Station_Tracking',
      'Returns / Purpose': 'Tracks engine numbers and operational status across all stations ordered by StationID.',
      'Associated API / Screen': 'Track & Trace Station Tracking Screen',
      'Status in DB': 'Original Plant Deployed'
    },
    {
      'S.No': 13,
      'Stored Procedure Name': 'DS_Prod_Date&Shift',
      'Type / Role': 'Original Plant Procedure',
      'Module': 'System Master / Shift Info',
      'Category': 'DS_Prod_*',
      'Author / Owner': 'Sumit',
      'Parameters': 'None',
      'Target Tables / Views': 'dbo.Prod_ShiftInformation',
      'Returns / Purpose': 'Retrieves active production date and shift from shift information parameters.',
      'Associated API / Screen': 'Global Plant Context Header',
      'Status in DB': 'Original Plant Deployed'
    },
    {
      'S.No': 14,
      'Stored Procedure Name': 'DS_Maint_ActiveAlarm_Count',
      'Type / Role': 'Original Plant Procedure',
      'Module': 'Maintenance & Alarms',
      'Category': 'DS_Maint_*',
      'Author / Owner': 'Sumit',
      'Parameters': 'None',
      'Target Tables / Views': 'dbo.Maint_ActiveAlarm, dbo.Config_Alarm',
      'Returns / Purpose': 'Aggregates counts of active machine alarms, categorizing by Information vs Stoppage alarms.',
      'Associated API / Screen': 'Active Alarm Monitoring Dashboard',
      'Status in DB': 'Original Plant Deployed'
    },
    {
      'S.No': 15,
      'Stored Procedure Name': 'DS_QA_AuditMonitoringKPI',
      'Type / Role': 'Original Plant Procedure',
      'Module': 'Quality Assurance',
      'Category': 'DS_QA_*',
      'Author / Owner': 'Sumit / Kashish',
      'Parameters': 'None',
      'Target Tables / Views': 'dbo.QA_AuditMonitoring',
      'Returns / Purpose': 'Calculates QA audit monitoring notification counts: Normal, Alert, and Warning levels.',
      'Associated API / Screen': 'Quality Audit Monitoring Screen',
      'Status in DB': 'Original Plant Deployed'
    },
    {
      'S.No': 16,
      'Stored Procedure Name': 'DS_ProductionKPI',
      'Type / Role': 'Standard Alias / Wrapper',
      'Module': 'Production Management',
      'Category': 'DS_*',
      'Author / Owner': 'Dashboard Team',
      'Parameters': '@StartDate, @EndDate, @Shift, @Line, @Model, @SKU',
      'Target Tables / Views': 'Wraps dbo.DS_Prod_ProductionKPI',
      'Returns / Purpose': 'Provides zero-downtime execution wrapper for DS_Prod_ProductionKPI.',
      'Associated API / Screen': 'Production Dashboard',
      'Status in DB': 'Active & Deployed'
    },
    {
      'S.No': 17,
      'Stored Procedure Name': 'DS_ProcessConveyor',
      'Type / Role': 'Standard Alias / Wrapper',
      'Module': 'Process Monitoring',
      'Category': 'DS_*',
      'Author / Owner': 'Dashboard Team',
      'Parameters': '@StartDate, @EndDate, @Shift, @Line, @Station',
      'Target Tables / Views': 'Wraps dbo.DS_Process_Conveyor',
      'Returns / Purpose': 'Provides zero-downtime execution wrapper for DS_Process_Conveyor.',
      'Associated API / Screen': 'Process Conveyor Dashboard',
      'Status in DB': 'Active & Deployed'
    },
    {
      'S.No': 18,
      'Stored Procedure Name': 'DS_TrackTraceWIP',
      'Type / Role': 'Standard Alias / Wrapper',
      'Module': 'Track & Trace',
      'Category': 'DS_*',
      'Author / Owner': 'Dashboard Team',
      'Parameters': '@StartDate, @EndDate, @Shift, @Line, @WIPStatus',
      'Target Tables / Views': 'Wraps dbo.DS_TrackTrace_WIP',
      'Returns / Purpose': 'Provides zero-downtime execution wrapper for DS_TrackTrace_WIP.',
      'Associated API / Screen': 'Track & Trace WIP Dashboard',
      'Status in DB': 'Active & Deployed'
    },
    {
      'S.No': 19,
      'Stored Procedure Name': 'DS_MaintenanceDowntime',
      'Type / Role': 'Standard Alias / Wrapper',
      'Module': 'Maintenance',
      'Category': 'DS_*',
      'Author / Owner': 'Dashboard Team',
      'Parameters': '@StartDate, @EndDate, @Shift, @Line, @Station',
      'Target Tables / Views': 'Wraps dbo.DS_Maint_Downtime',
      'Returns / Purpose': 'Provides zero-downtime execution wrapper for DS_Maint_Downtime.',
      'Associated API / Screen': 'Maintenance Downtime Dashboard',
      'Status in DB': 'Active & Deployed'
    },
    {
      'S.No': 20,
      'Stored Procedure Name': 'DS_GetEngineStatusCountBySKU',
      'Type / Role': 'Standard Alias / Wrapper',
      'Module': 'Track & Trace / Genealogy',
      'Category': 'DS_*',
      'Author / Owner': 'Dashboard Team',
      'Parameters': '@SKUID (INT)',
      'Target Tables / Views': 'Wraps dbo.DS_Prod_EngineStatusCountBySKU',
      'Returns / Purpose': 'Provides zero-downtime execution wrapper for DS_Prod_EngineStatusCountBySKU.',
      'Associated API / Screen': 'Genealogy & Status Gate Dashboard',
      'Status in DB': 'Active & Deployed'
    }
  ];

  // 3. Read all 388 stored procedures from sp_index.json
  const spIndex = JSON.parse(fs.readFileSync(path.join(__dirname, 'docs', 'stored_procedures_backup', 'sp_index.json'), 'utf8'));
  const allDbProcsData = spIndex.map((s, idx) => {
    let cat = 'Other';
    if (s.name.startsWith('DS_')) cat = 'Dashboard Screen Procedure (DS_*)';
    else if (s.name.startsWith('GV_')) cat = 'Grid View Procedure (GV_*)';
    else if (s.name.startsWith('BT_')) cat = 'Button / Transaction Procedure (BT_*)';
    else if (s.name.startsWith('DD_')) cat = 'Dropdown Procedure (DD_*)';
    else if (s.name.startsWith('Tab_')) cat = 'Tablet / Mobile Procedure (Tab_*)';
    else if (s.name.startsWith('TB_')) cat = 'TextBox Procedure (TB_*)';
    else if (s.name.startsWith('USP_') || s.name.startsWith('usp_')) cat = 'User Stored Procedure (USP_*)';
    else if (s.name.startsWith('SP_')) cat = 'Stored Procedure (SP_*)';

    return {
      'S.No': idx + 1,
      'Stored Procedure Name': s.name,
      'Prefix Category': cat,
      'Code Lines': s.lines,
      'Created Date': s.createDate,
      'Last Modified Date': s.modifyDate,
      'Backup SQL File': `docs/stored_procedures_backup/${s.name.replace(/[^a-zA-Z0-9_]/g, '_')}.sql`
    };
  });

  // Create new workbook
  const newWb = xlsx.utils.book_new();

  // Sheet 1: Report_API_Audit
  xlsx.utils.book_append_sheet(newWb, wsAudit, 'Report_API_Audit');

  // Sheet 2: API_KPI_Dictionary
  xlsx.utils.book_append_sheet(newWb, wsKpi, 'API_KPI_Dictionary');

  // Sheet 3: API_Target_Tables
  xlsx.utils.book_append_sheet(newWb, wsTables, 'API_Target_Tables');

  // Sheet 4: Stored_Procedure_APIs
  const wsSpApi = xlsx.utils.json_to_sheet(spApiData);
  xlsx.utils.book_append_sheet(newWb, wsSpApi, 'Stored_Procedure_APIs');

  // Sheet 5: All_Dashboard_SPs_DS (DEDICATED DS_ SHEET)
  const wsAllDs = xlsx.utils.json_to_sheet(allDsProcedures);
  xlsx.utils.book_append_sheet(newWb, wsAllDs, 'All_Dashboard_SPs_DS');

  // Sheet 6: All_388_DB_Procedures
  const wsAllProcs = xlsx.utils.json_to_sheet(allDbProcsData);
  xlsx.utils.book_append_sheet(newWb, wsAllProcs, 'All_388_DB_Procedures');

  // Write to root, docs, and artifact folder safely
  const artifactPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\333bd165-94eb-4f42-bd23-69b959bbb694\\BAJAJ_PPMS_API_LINEAGE_AND_PROCEDURES_CATALOG.xlsx';
  const targets = [
    origPath,
    path.join(__dirname, 'docs', 'BAJAJ_PPMS_API_LINEAGE_AND_PROCEDURES_CATALOG.xlsx'),
    path.join(__dirname, 'docs', 'BAJAJ_PPMS_API_LINEAGE_AND_PROCEDURES_CATALOG_LATEST.xlsx'),
    artifactPath
  ];

  for (const t of targets) {
    try {
      xlsx.writeFile(newWb, t);
      console.log(`Saved workbook to: ${t}`);
    } catch (err) {
      console.warn(`Could not overwrite ${t} (likely open in Excel): ${err.message}`);
    }
  }

  console.log('✅ Workbook updated successfully with 6 sheets!');
  console.log('Sheets in new workbook:', newWb.SheetNames);
}

updateCatalog().catch(err => {
  console.error('Error updating catalog:', err);
  process.exit(1);
});
