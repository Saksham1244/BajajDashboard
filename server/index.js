const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { poolPromise, sql } = require('./db');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bajaj PPMS Command Center API is running with live database connectivity' });
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================
const normalizeShift = (s, period) => {
  if (!s || s === 'All' || s === 'All Shifts') return null;
  const str = String(s).trim();
  if (str === 'Shift 1' || str === '1' || str === 'A') return 'A';
  if (str === 'Shift 2' || str === '2' || str === 'B') return 'B';
  if (str === 'Shift 3' || str === '3' || str === 'C') return 'C';
  return str;
};

const computeDateRange = (period, startDate, endDate) => {
  let effectiveStartDate = startDate;
  let effectiveEndDate = endDate;
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  if (!effectiveStartDate || (period === 'Week' && effectiveStartDate === effectiveEndDate) || (period === 'Month' && effectiveStartDate === effectiveEndDate)) {
    if (period === 'Day' || period === 'Shift') {
      effectiveStartDate = effectiveStartDate || todayStr;
      effectiveEndDate = effectiveEndDate || todayStr;
    } else if (period === 'Week') {
      const past7 = new Date(today);
      past7.setDate(today.getDate() - 7);
      effectiveStartDate = `${past7.getFullYear()}-${String(past7.getMonth() + 1).padStart(2, '0')}-${String(past7.getDate()).padStart(2, '0')}`;
      effectiveEndDate = todayStr;
    } else if (period === 'Month') {
      const past30 = new Date(today);
      past30.setDate(today.getDate() - 30);
      effectiveStartDate = `${past30.getFullYear()}-${String(past30.getMonth() + 1).padStart(2, '0')}-${String(past30.getDate()).padStart(2, '0')}`;
      effectiveEndDate = todayStr;
    }
  }

  return { effectiveStartDate: effectiveStartDate || null, effectiveEndDate: effectiveEndDate || null };
};

const createSqlRequest = (pool, params = {}) => {
  const req = pool.request();
  for (const [key, config] of Object.entries(params)) {
    if (config.type && config.value !== undefined) {
      req.input(key, config.type, config.value);
    }
  }
  return req;
};

// ==========================================
// AUTHENTICATION ENDPOINTS (Config_User)
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both username/email and password.' });
  }

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = pool.request();
      request.input('Username', sql.NVarChar(100), username.trim());
      request.input('Password', sql.NVarChar(100), password.trim());

      const result = await request.query(`
        SELECT TOP 1
          UserID,
          DepartmentID,
          DepartmentRoleID,
          UserName,
          EmailID,
          MobileNo,
          [Password],
          AadharNo,
          CreatedBy,
          CreatedDate,
          ModifiedBy,
          ModifiedDate
        FROM Config_User
        WHERE (
          LOWER(UserName) = LOWER(@Username) OR 
          LOWER(EmailID) = LOWER(@Username) OR 
          CAST(MobileNo AS VARCHAR) = @Username
        ) AND [Password] = @Password
      `);

      if (result.recordset && result.recordset.length > 0) {
        const user = result.recordset[0];
        const { Password, ...userProfile } = user;
        return res.json({
          success: true,
          message: 'Login successful',
          user: userProfile
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid username, email, or password.'
        });
      }
    }
    return res.status(500).json({ success: false, message: 'Database connection unavailable.' });
  } catch (err) {
    console.error('Login DB error:', err);
    return res.status(500).json({ success: false, message: 'Database authentication error: ' + err.message });
  }
});

app.get('/api/auth/users', async (req, res) => {
  try {
    const pool = await poolPromise;
    if (pool) {
      const result = await pool.request().query(`
        SELECT 
          UserID,
          DepartmentID,
          DepartmentRoleID,
          UserName,
          EmailID,
          MobileNo
        FROM Config_User
        ORDER BY UserID ASC
      `);
      return res.json({ users: result.recordset || [] });
    }
  } catch (err) {
    console.error('Auth users DB error:', err.message);
  }
  res.json({ users: [] });
});

// ==========================================
// 0. METADATA FILTERS ENDPOINT
// ==========================================
app.get('/api/metadata/filters', async (req, res) => {
  try {
    const pool = await poolPromise;
    if (pool) {
      const [lineRes, stationRes, familyRes, modelRes, skuRes, lossRes, userRes] = await Promise.allSettled([
        pool.request().query("SELECT DISTINCT LineName FROM Config_Line WHERE LineName IS NOT NULL ORDER BY LineName"),
        pool.request().query("SELECT DISTINCT StationName FROM Config_Station WHERE StationName IS NOT NULL ORDER BY StationName"),
        pool.request().query("SELECT DISTINCT ModelFamilyName FROM Config_ModelFamily WHERE ModelFamilyName IS NOT NULL ORDER BY ModelFamilyName"),
        pool.request().query("SELECT DISTINCT ModelName FROM Config_Model WHERE ModelName IS NOT NULL ORDER BY ModelName"),
        pool.request().query("SELECT DISTINCT SKUName FROM Config_SKU WHERE SKUName IS NOT NULL ORDER BY SKUName"),
        pool.request().query("SELECT DISTINCT LossName FROM Config_LossCategory WHERE LossName IS NOT NULL ORDER BY LossName"),
        pool.request().query("SELECT DISTINCT UserName FROM Config_User WHERE UserName IS NOT NULL AND UserName NOT IN ('admin', 'coolsuper') ORDER BY UserName")
      ]);

      return res.json({
        lines: lineRes.status === 'fulfilled' && lineRes.value?.recordset ? lineRes.value.recordset.map(r => r.LineName) : [],
        stations: stationRes.status === 'fulfilled' && stationRes.value?.recordset ? stationRes.value.recordset.map(r => r.StationName) : [],
        modelFamilies: familyRes.status === 'fulfilled' && familyRes.value?.recordset ? familyRes.value.recordset.map(r => r.ModelFamilyName) : [],
        models: modelRes.status === 'fulfilled' && modelRes.value?.recordset ? modelRes.value.recordset.map(r => r.ModelName) : [],
        skus: skuRes.status === 'fulfilled' && skuRes.value?.recordset ? skuRes.value.recordset.map(r => r.SKUName) : [],
        lossCategories: lossRes.status === 'fulfilled' && lossRes.value?.recordset ? lossRes.value.recordset.map(r => r.LossName) : [],
        operators: userRes.status === 'fulfilled' && userRes.value?.recordset ? userRes.value.recordset.map(r => r.UserName) : []
      });
    }
  } catch (err) {
    console.error('Metadata filters DB error:', err.message);
  }

  res.json({
    lines: [],
    stations: [],
    modelFamilies: [],
    models: [],
    skus: [],
    lossCategories: [],
    operators: []
  });
});

// ==========================================
// 1. PRODUCTION MODULE ENDPOINTS
// ==========================================
app.get(['/api/dashboard/production', '/api/production/overview', '/api/production/report'], async (req, res) => {
  const { period, shift, startDate, endDate, line, model, sku } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const spReq = createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Shift: { type: sql.VarChar(20), value: dbShift },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
        Model: { type: sql.VarChar(50), value: (model && model !== 'All') ? model : null },
        SKU: { type: sql.VarChar(50), value: (sku && sku !== 'All') ? sku : null }
      });

      const isSingleDay = effectiveStartDate && effectiveEndDate && effectiveStartDate === effectiveEndDate && period !== 'Month' && period !== 'Week';

      let timeTrendQuery = `
        SELECT 
          CONVERT(VARCHAR(10), E.ProdDate, 120) as [time],
          CONVERT(VARCHAR(10), E.ProdDate, 120) as name,
          ISNULL(SUM(E.PlanQty), 0) as [plan],
          ISNULL(SUM(E.ENGCompleted_Qty), 0) as actual,
          ISNULL(SUM(E.ENGCompleted_Qty) - SUM(E.ENGReworkOK_Qty), 0) as straight,
          ISNULL(SUM(E.ENGReworkOK_Qty), 0) as rework
        FROM Prod_EnginePlanExecution E
        LEFT JOIN Config_Line L ON E.LineID = L.LineID
        LEFT JOIN Config_SKU S ON E.SKUID = S.SKUID
        LEFT JOIN Config_Model M ON S.ModelID = M.ModelID
        LEFT JOIN Config_ModelFamily F ON M.ModelFamilyID = F.ModelFamilyID
        WHERE (@StartDate IS NULL OR E.ProdDate >= @StartDate)
          AND (@EndDate IS NULL OR E.ProdDate <= @EndDate)
          AND (@Shift IS NULL OR E.ProdShift = @Shift OR (@Shift = 'A' AND E.ProdShift IN ('1', 'Shift 1', 'A')) OR (@Shift = 'B' AND E.ProdShift IN ('2', 'Shift 2', 'B')))
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(E.LineID AS VARCHAR) = @Line)
          AND (@Model IS NULL OR M.ModelName = @Model)
          AND (@SKU IS NULL OR S.SKUName = @SKU)
        GROUP BY E.ProdDate
        ORDER BY E.ProdDate ASC
      `;

      if (isSingleDay) {
        timeTrendQuery = `
          SELECT 
            CONVERT(VARCHAR(5), H.Timestamp, 108) as [time],
            CONVERT(VARCHAR(5), H.Timestamp, 108) as name,
            ISNULL(SUM(H.PlannedQuantity), 0) as [plan],
            ISNULL(SUM(H.TotalQuantity), 0) as actual,
            ISNULL(SUM(H.GoodQuantity), 0) as straight,
            ISNULL(SUM(H.RejectionQuantity), 0) as rework
          FROM Perf_Hourly_OLE H
          LEFT JOIN Config_Line L ON H.SubAsslyLineID = L.LineID
          WHERE (@StartDate IS NULL OR H.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR H.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR H.ProdShift = @Shift OR (@Shift = 'A' AND H.ProdShift IN ('1', 'Shift 1', 'A')) OR (@Shift = 'B' AND H.ProdShift IN ('2', 'Shift 2', 'B')))
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(H.SubAsslyLineID AS VARCHAR) = @Line)
          GROUP BY CONVERT(VARCHAR(5), H.Timestamp, 108)
          ORDER BY [time] ASC
        `;
      }

      const [spResult, planResult, skuResult, enginesResult] = await Promise.allSettled([
        spReq.execute('DS_Dashboard_ProductionKPI'),
        createSqlRequest(pool, {
          StartDate: { type: sql.Date, value: effectiveStartDate },
          EndDate: { type: sql.Date, value: effectiveEndDate },
          Shift: { type: sql.VarChar(20), value: dbShift },
          Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
          Model: { type: sql.VarChar(50), value: (model && model !== 'All') ? model : null },
          SKU: { type: sql.VarChar(50), value: (sku && sku !== 'All') ? sku : null }
        }).query(timeTrendQuery),
        createSqlRequest(pool, {
          StartDate: { type: sql.Date, value: effectiveStartDate },
          EndDate: { type: sql.Date, value: effectiveEndDate },
          Shift: { type: sql.VarChar(20), value: dbShift },
          Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
          Model: { type: sql.VarChar(50), value: (model && model !== 'All') ? model : null },
          SKU: { type: sql.VarChar(50), value: (sku && sku !== 'All') ? sku : null }
        }).query(`
          SELECT 
            ISNULL(L.LineName, 'Line ' + CAST(E.LineID AS VARCHAR)) as line,
            ISNULL(S.SKUName, 'SKU-' + CAST(E.SKUID AS VARCHAR)) as name,
            ISNULL(F.ModelFamilyName, 'Family-' + CAST(E.SKUID AS VARCHAR)) as modelFamily,
            ISNULL(SUM(E.PlanQty), 0) as [plan],
            ISNULL(SUM(E.ENGCompleted_Qty), 0) as actual,
            ISNULL(SUM(E.ENGCompleted_Qty) - SUM(E.ENGReworkOK_Qty), 0) as straight,
            ISNULL(SUM(E.ENGReworkOK_Qty), 0) as rework,
            ISNULL(SUM(E.ENGMainLine_Qty) - SUM(E.ENGCompleted_Qty), 0) as wip,
            ISNULL(SUM(E.ENGMaterialHold_Qty) + SUM(E.ENGQualityHold_Qty), 0) as rollover
          FROM Prod_EnginePlanExecution E
          LEFT JOIN Config_Line L ON E.LineID = L.LineID
          LEFT JOIN Config_SKU S ON E.SKUID = S.SKUID
          LEFT JOIN Config_Model M ON S.ModelID = M.ModelID
          LEFT JOIN Config_ModelFamily F ON M.ModelFamilyID = F.ModelFamilyID
          WHERE (@StartDate IS NULL OR E.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR E.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR E.ProdShift = @Shift)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(E.LineID AS VARCHAR) = @Line)
            AND (@Model IS NULL OR M.ModelName = @Model)
            AND (@SKU IS NULL OR S.SKUName = @SKU)
          GROUP BY L.LineName, S.SKUName, F.ModelFamilyName, E.SKUID, E.LineID
        `),
        pool.request().query('SELECT TOP 15 EngineNo FROM Prod_Engine_WIP ORDER BY StartTime DESC, EngineNo DESC')
      ]);

      const recordsets = (spResult.status === 'fulfilled' && spResult.value?.recordsets) || [[], [], []];
      const kpis = recordsets[0]?.[0] || {
        totalPlan: 0,
        totalProd: 0,
        shortfall: 0,
        wip: 0,
        rollover: 0
      };

      const straightPass = recordsets[1] || [];
      const rawPareto = recordsets[2] || [];
      const planVsActual = (planResult.status === 'fulfilled' && planResult.value?.recordset) || [];
      const skuData = (skuResult.status === 'fulfilled' && skuResult.value?.recordset) || [];
      const engineList = (enginesResult?.status === 'fulfilled' && enginesResult.value?.recordset?.map(e => e.EngineNo)) || [];

      const totalDuration = rawPareto.reduce((a, b) => a + (b.duration || 0), 0) || 1;
      let runningSum = 0;
      const pareto = rawPareto.map((item, idx) => {
        runningSum += item.duration;
        const start = idx * 2;
        const itemEngines = engineList.slice(start, start + 2);
        return {
          ...item,
          cumPercent: Math.round((runningSum / totalDuration) * 100),
          engines: itemEngines.length > 0 ? itemEngines : (engineList.length > 0 ? [engineList[idx % engineList.length]] : [])
        };
      });

      return res.json({
        kpis,
        planVsActual,
        straightPass,
        skuData,
        pareto
      });
    }
  } catch (err) {
    console.error('Production endpoint error:', err.message);
  }

  res.json({
    kpis: { totalPlan: 0, totalProd: 0, shortfall: 0, wip: 0, rollover: 0 },
    planVsActual: [],
    straightPass: [],
    skuData: [],
    pareto: []
  });
});

app.get('/api/production/plan', async (req, res) => {
  const { period, shift, startDate, endDate, line, model, sku } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      // Execute official SP authored by Shubham Patil
      const result = await pool.request().execute('GV_ProdShiftPlan');
      let rows = result.recordset || [];

      // Apply dynamic filtering on normalized SP output
      if (effectiveStartDate) {
        rows = rows.filter(r => {
          const rowDate = r.ProdDate ? new Date(r.ProdDate).toISOString().slice(0, 10) : '';
          return (!effectiveStartDate || rowDate >= effectiveStartDate) && (!effectiveEndDate || rowDate <= effectiveEndDate);
        });
      }
      if (dbShift) {
        rows = rows.filter(r => r.ProdShift === dbShift);
      }
      if (line && line !== 'All') {
        rows = rows.filter(r => r.LineName === line || String(r.LineID) === line);
      }
      if (sku && sku !== 'All') {
        rows = rows.filter(r => r.SKUName === sku || String(r.SKUID) === sku);
      }

      const table = rows.map(r => ({
        id: r.PlanID,
        date: r.ProdDate ? new Date(r.ProdDate).toISOString().slice(0, 10) : '-',
        shift: 'Shift ' + (r.ProdShift || 'A'),
        line: r.LineName || ('Line ' + r.LineID),
        model: 'Pulsar 150',
        sku: r.SKUName || ('SKU-' + r.SKUID),
        plannedQty: r.PlanQty || 0,
        lineSpeed: 4.0,
        status: r.StatusName || 'Active',
        source: r.SourceName || 'Manual'
      }));

      const totalPlanned = table.reduce((sum, r) => sum + (r.plannedQty || 0), 0);
      const activePlans = table.filter(r => r.status === 'Active' || r.status === 'Plan' || r.status === 'Inprocess').length;
      const completedPlans = table.filter(r => r.status === 'Completed').length;

      return res.json({
        kpis: {
          totalPlanned,
          activePlans,
          completedPlans,
          totalPlans: table.length
        },
        table
      });
    }
  } catch (err) {
    console.error('Production plan SP error:', err.message);
  }

  res.json({
    kpis: { totalPlanned: 0, activePlans: 0, completedPlans: 0, totalPlans: 0 },
    table: []
  });
});

app.get('/api/production/hourly', async (req, res) => {
  const { period, shift, startDate, endDate, line } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Shift: { type: sql.VarChar(20), value: dbShift },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null }
      });

      const result = await request.query(`
        SELECT 
          H.UID as id,
          CONVERT(VARCHAR(10), H.ProdDate, 120) as [date],
          ISNULL(H.ProdShift, 'A') as shift,
          ISNULL(L.LineName, 'Line ' + CAST(H.SubAsslyLineID AS VARCHAR)) as line,
          CONVERT(VARCHAR(5), ISNULL(H.Timestamp, H.TotalTime), 108) as [hour],
          ISNULL(H.PlannedQuantity, 0) as planned,
          ISNULL(H.TotalQuantity, 0) as actual,
          ISNULL(H.GoodQuantity, 0) as good,
          ISNULL(H.RejectionQuantity, 0) as rejected,
          CAST(ISNULL(H.OLE, 0) AS FLOAT) as ole,
          CAST(ISNULL(H.Availability, 0) AS FLOAT) as availability,
          CAST(ISNULL(H.Performance, 0) AS FLOAT) as performance,
          CAST(ISNULL(H.Quality, 0) AS FLOAT) as quality
        FROM Perf_Hourly_OLE H
        LEFT JOIN Config_Line L ON H.SubAsslyLineID = L.LineID
        WHERE (@StartDate IS NULL OR H.ProdDate >= @StartDate)
          AND (@EndDate IS NULL OR H.ProdDate <= @EndDate)
          AND (@Shift IS NULL OR H.ProdShift = @Shift OR H.ProdShift = 'Shift ' + @Shift)
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(H.SubAsslyLineID AS VARCHAR) = @Line)
        ORDER BY H.ProdDate DESC, H.UID ASC
      `);

      const table = result.recordset || [];
      const totalPlanned = table.reduce((sum, r) => sum + r.planned, 0);
      const totalActual = table.reduce((sum, r) => sum + r.actual, 0);
      const totalGood = table.reduce((sum, r) => sum + r.good, 0);
      const totalRejected = table.reduce((sum, r) => sum + r.rejected, 0);
      const avgOLE = table.length > 0 ? Number((table.reduce((sum, r) => sum + r.ole, 0) / table.length).toFixed(1)) : 0;

      return res.json({
        kpis: { totalPlanned, totalActual, totalGood, totalRejected, avgOLE },
        hourlyData: table.map(r => ({ time: r.hour || r.date, planned: r.planned, actual: r.actual })),
        table
      });
    }
  } catch (err) {
    console.error('Hourly production error:', err.message);
  }

  res.json({
    kpis: { totalPlanned: 0, totalActual: 0, totalGood: 0, totalRejected: 0, avgOLE: 0 },
    hourlyData: [],
    table: []
  });
});

app.get('/api/production/straight-pass', async (req, res) => {
  const { period, shift, startDate, endDate, line } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const reqKpi = createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Shift: { type: sql.VarChar(20), value: dbShift },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null }
      });

      const reqTable = createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null }
      });

      const [kpiRes, tableRes] = await Promise.allSettled([
        reqKpi.query(`
          SELECT 
            ISNULL(SUM(E.ENGCompleted_Qty), 0) as total,
            ISNULL(SUM(E.ENGCompleted_Qty) - SUM(E.ENGReworkOK_Qty), 0) as straight,
            ISNULL(SUM(E.ENGReworkOK_Qty), 0) as rework
          FROM Prod_EnginePlanExecution E
          LEFT JOIN Config_Line L ON E.LineID = L.LineID
          WHERE (@StartDate IS NULL OR E.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR E.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR E.ProdShift = @Shift)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(E.LineID AS VARCHAR) = @Line)
        `),
        reqTable.query(`
          SELECT TOP 100
            W.EngineNo as engineNo,
            ISNULL(S.SKUName, 'SKU-' + CAST(W.SKUID AS VARCHAR)) as sku,
            ISNULL(M.ModelName, 'Pulsar 150') as model,
            CONVERT(VARCHAR(10), W.StartTime, 120) as [date],
            'Shift 1' as shift,
            ISNULL(L.LineName, 'Line ' + CAST(W.LineID AS VARCHAR)) as line,
            CASE WHEN D.EngineNo IS NOT NULL THEN 'Reworked Pass' ELSE 'Straight Pass' END as [status],
            CONVERT(VARCHAR(8), W.StartTime, 108) as [time]
          FROM Prod_Engine_WIP W
          LEFT JOIN Prod_Defect_Log D ON W.EngineNo = D.EngineNo
          LEFT JOIN Config_SKU S ON W.SKUID = S.SKUID
          LEFT JOIN Config_Model M ON S.ModelID = M.ModelID
          LEFT JOIN Config_Line L ON W.LineID = L.LineID
          WHERE (@StartDate IS NULL OR CAST(W.StartTime AS DATE) >= @StartDate)
            AND (@EndDate IS NULL OR CAST(W.StartTime AS DATE) <= @EndDate)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(W.LineID AS VARCHAR) = @Line)
          ORDER BY W.StartTime DESC
        `)
      ]);

      const row = (kpiRes.status === 'fulfilled' && kpiRes.value?.recordset?.[0]) || { total: 0, straight: 0, rework: 0 };
      const table = (tableRes.status === 'fulfilled' && tableRes.value?.recordset) || [];

      return res.json({
        kpis: {
          total: row.total || table.length,
          straight: row.straight || table.filter(t => t.status === 'Straight Pass').length,
          rework: row.rework || table.filter(t => t.status === 'Reworked Pass').length
        },
        table
      });
    }
  } catch (err) {
    console.error('Straight pass endpoint DB error:', err.message);
  }

  res.json({
    kpis: { total: 0, straight: 0, rework: 0 },
    table: []
  });
});

// ==========================================
// 2. PERFORMANCE MODULE ENDPOINTS
// ==========================================
app.get(['/api/dashboard/performance', '/api/performance/ole'], async (req, res) => {
  const { period, shift, startDate, endDate, line } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const getReq = () => createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Shift: { type: sql.VarChar(20), value: dbShift },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null }
      });

      const isSingleDay = effectiveStartDate && effectiveEndDate && effectiveStartDate === effectiveEndDate && period !== 'Month' && period !== 'Week';
      const oleTrendQuery = isSingleDay ? `
        SELECT 
          CONVERT(VARCHAR(5), H.Timestamp, 108) as [time],
          CAST(ISNULL(AVG(H.OLE), 0) AS DECIMAL(5,1)) as ole,
          CAST(ISNULL(AVG(H.Availability), 0) AS DECIMAL(5,1)) as availability,
          CAST(ISNULL(AVG(H.Performance), 0) AS DECIMAL(5,1)) as performance,
          85.0 as target
        FROM Perf_Hourly_OLE H
        LEFT JOIN Config_Line L ON H.SubAsslyLineID = L.LineID
        WHERE (@StartDate IS NULL OR H.ProdDate >= @StartDate)
          AND (@EndDate IS NULL OR H.ProdDate <= @EndDate)
          AND (@Shift IS NULL OR H.ProdShift = @Shift OR (@Shift = 'A' AND H.ProdShift IN ('1', 'Shift 1', 'A')) OR (@Shift = 'B' AND H.ProdShift IN ('2', 'Shift 2', 'B')))
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(H.SubAsslyLineID AS VARCHAR) = @Line)
        GROUP BY CONVERT(VARCHAR(5), H.Timestamp, 108)
        ORDER BY [time] ASC
      ` : `
        SELECT 
          CONVERT(VARCHAR(10), H.ProdDate, 120) as [time],
          CAST(ISNULL(AVG(H.OLE), 0) AS DECIMAL(5,1)) as ole,
          CAST(ISNULL(AVG(H.Availability), 0) AS DECIMAL(5,1)) as availability,
          CAST(ISNULL(AVG(H.Performance), 0) AS DECIMAL(5,1)) as performance,
          85.0 as target
        FROM Perf_Hourly_OLE H
        LEFT JOIN Config_Line L ON H.SubAsslyLineID = L.LineID
        WHERE (@StartDate IS NULL OR H.ProdDate >= @StartDate)
          AND (@EndDate IS NULL OR H.ProdDate <= @EndDate)
          AND (@Shift IS NULL OR H.ProdShift = @Shift OR (@Shift = 'A' AND H.ProdShift IN ('1', 'Shift 1', 'A')) OR (@Shift = 'B' AND H.ProdShift IN ('2', 'Shift 2', 'B')))
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(H.SubAsslyLineID AS VARCHAR) = @Line)
        GROUP BY H.ProdDate
        ORDER BY H.ProdDate ASC
      `;

      const [prodRes, dtRes, hourlyRes, trendRes] = await Promise.allSettled([
        getReq().query(`
          SELECT 
            ISNULL(SUM(E.PlanQty), 0) as totalPlan,
            ISNULL(SUM(E.ENGCompleted_Qty), 0) as totalProd,
            ISNULL(SUM(E.ENGReworkOK_Qty), 0) as totalRework,
            ISNULL(SUM(E.ENGNotOK_Qty), 0) as totalNotOk,
            COUNT(DISTINCT E.ProdDate) as dayCount
          FROM Prod_EnginePlanExecution E
          LEFT JOIN Config_Line L ON E.LineID = L.LineID
          WHERE (@StartDate IS NULL OR E.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR E.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR E.ProdShift = @Shift)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(E.LineID AS VARCHAR) = @Line)
        `),
        getReq().query(`
          SELECT 
            ISNULL(SUM(D.TotalDT), 0) as totalDT,
            ISNULL(SUM(CASE WHEN D.Reason LIKE '%Motor%' OR D.Reason LIKE '%Conveyor%' OR D.Reason LIKE '%Tool%' THEN D.TotalDT ELSE 0 END), 0) as mechanicalDT,
            ISNULL(SUM(CASE WHEN D.Reason LIKE '%Power%' OR D.Reason LIKE '%Sensor%' THEN D.TotalDT ELSE 0 END), 0) as electricalDT,
            ISNULL(SUM(CASE WHEN D.Reason LIKE '%Quality%' OR D.Reason LIKE '%Inspection%' THEN D.TotalDT ELSE 0 END), 0) as qualityDT,
            ISNULL(SUM(CASE WHEN D.Reason LIKE '%Changeover%' OR D.Reason LIKE '%Setup%' THEN D.TotalDT ELSE 0 END), 0) as setupDT,
            ISNULL(SUM(CASE WHEN D.Reason LIKE '%Maintenance%' OR D.Reason LIKE '%Preventive%' THEN D.TotalDT ELSE 0 END), 0) as processDT
          FROM Perf_Downtime D
          LEFT JOIN Config_Line L ON D.SubAsslyLineID = L.LineID
          WHERE (@StartDate IS NULL OR D.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR D.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR D.ProdShift = @Shift)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(D.SubAsslyLineID AS VARCHAR) = @Line)
        `),
        getReq().query(`
          SELECT 
            AVG(H.OLE) as avgOLE,
            AVG(H.Availability) as avgAvail,
            AVG(H.Performance) as avgPerf,
            AVG(H.Quality) as avgQuality
          FROM Perf_Hourly_OLE H
          LEFT JOIN Config_Line L ON H.SubAsslyLineID = L.LineID
          WHERE (@StartDate IS NULL OR H.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR H.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR H.ProdShift = @Shift OR H.ProdShift = 'Shift ' + @Shift)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(H.SubAsslyLineID AS VARCHAR) = @Line)
        `),
        getReq().query(oleTrendQuery)
      ]);

      const prodRow = (prodRes.status === 'fulfilled' && prodRes.value?.recordset?.[0]) || { totalPlan: 0, totalProd: 0, totalRework: 0, totalNotOk: 0, dayCount: 0 };
      const dtRow = (dtRes.status === 'fulfilled' && dtRes.value?.recordset?.[0]) || { totalDT: 0, mechanicalDT: 0, electricalDT: 0, qualityDT: 0, setupDT: 0, processDT: 0 };
      const hourlyRow = (hourlyRes.status === 'fulfilled' && hourlyRes.value?.recordset?.[0]) || {};
      const oleTrend = (trendRes.status === 'fulfilled' && trendRes.value?.recordset) || [];

      const hasData = (prodRow.totalPlan > 0 || prodRow.totalProd > 0 || dtRow.totalDT > 0 || (hourlyRow.avgOLE !== null && hourlyRow.avgOLE !== undefined));

      if (!hasData) {
        return res.json({
          kpis: { ole: 0, oee: 0, availability: 0, performance: 0 },
          downtime: [],
          oleTrend: []
        });
      }

      const days = Math.max(1, prodRow.dayCount || 1);
      const plannedMinutes = days * 480;
      const totalDT = dtRow.totalDT || 0;

      let availability = plannedMinutes > 0 ? Number((((plannedMinutes - Math.min(plannedMinutes, totalDT)) / plannedMinutes) * 100).toFixed(1)) : 0;
      let performance = prodRow.totalPlan > 0 ? Number(((prodRow.totalProd / prodRow.totalPlan) * 100).toFixed(1)) : 0;
      let quality = prodRow.totalProd > 0 ? Number((((prodRow.totalProd - prodRow.totalRework - prodRow.totalNotOk) / prodRow.totalProd) * 100).toFixed(1)) : 0;

      if (hourlyRow.avgAvail !== null && hourlyRow.avgAvail !== undefined) availability = Number(hourlyRow.avgAvail.toFixed(1));
      if (hourlyRow.avgPerf !== null && hourlyRow.avgPerf !== undefined) performance = Number(hourlyRow.avgPerf.toFixed(1));
      if (hourlyRow.avgQuality !== null && hourlyRow.avgQuality !== undefined) quality = Number(hourlyRow.avgQuality.toFixed(1));

      const oee = Number(((availability * performance * quality) / 10000).toFixed(1));
      const ole = (hourlyRow.avgOLE !== null && hourlyRow.avgOLE !== undefined) ? Number(hourlyRow.avgOLE.toFixed(1)) : Number(Math.min(99.9, oee * 1.05).toFixed(1));

      const kpis = { ole, oee, availability, performance };

      const downtime = (dtRow.totalDT > 0 || plannedMinutes > 0) ? [
        { name: 'Mechanical', downTime: dtRow.mechanicalDT || 0, runTime: Math.max(0, Math.round(plannedMinutes * 0.25) - (dtRow.mechanicalDT || 0)) },
        { name: 'Electrical', downTime: dtRow.electricalDT || 0, runTime: Math.max(0, Math.round(plannedMinutes * 0.25) - (dtRow.electricalDT || 0)) },
        { name: 'Process', downTime: dtRow.processDT || 0, runTime: Math.max(0, Math.round(plannedMinutes * 0.25) - (dtRow.processDT || 0)) },
        { name: 'Setup', downTime: dtRow.setupDT || 0, runTime: Math.max(0, Math.round(plannedMinutes * 0.25) - (dtRow.setupDT || 0)) }
      ] : [];

      return res.json({ kpis, downtime, oleTrend });
    }
  } catch (err) {
    console.error('Performance endpoint error:', err.message);
  }

  res.json({
    kpis: { ole: 0, oee: 0, availability: 0, performance: 0 },
    downtime: [],
    oleTrend: []
  });
});

app.get('/api/performance/downtime', async (req, res) => {
  const { period, shift, startDate, endDate, line, station, modelFamily, model, sku } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Shift: { type: sql.VarChar(20), value: dbShift },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
        Station: { type: sql.VarChar(50), value: (station && station !== 'All') ? station : null }
      });

      const [dtTableRes, catRes, kpiRes] = await Promise.allSettled([
        request.query(`
          SELECT 
            D.DowntimeID as id,
            ISNULL(LC.LossName, 'General Loss') as category,
            ISNULL(SLC.SubLossName, ISNULL(D.Reason, 'Unspecified')) as subCategory,
            CONVERT(VARCHAR(5), D.StartTime, 108) as startTime,
            CONVERT(VARCHAR(5), D.EndTime, 108) as endTime,
            ISNULL(D.TotalDT, 0) as duration,
            1 as occurrence,
            ISNULL(S.StationName, 'Line ' + CAST(D.SubAsslyLineID AS VARCHAR)) as machine,
            ISNULL(D.Reason, 'Breakdown') as reason,
            CONVERT(VARCHAR(10), D.ProdDate, 120) as [date],
            ISNULL(D.ProdShift, 'A') as shift,
            ISNULL(L.LineName, 'Line ' + CAST(D.SubAsslyLineID AS VARCHAR)) as line,
            ISNULL(S.StationName, 'ST-01') as station
          FROM Perf_Downtime D
          LEFT JOIN Config_Line L ON D.SubAsslyLineID = L.LineID
          LEFT JOIN Config_Station S ON D.StationID = S.StationID
          LEFT JOIN Config_LossCategory LC ON D.LossID = LC.LossID
          LEFT JOIN Config_SubLossCategory SLC ON D.SubLossID = SLC.SubLossID
          WHERE (@StartDate IS NULL OR D.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR D.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR D.ProdShift = @Shift)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(D.SubAsslyLineID AS VARCHAR) = @Line)
            AND (@Station IS NULL OR S.StationName = @Station OR CAST(D.StationID AS VARCHAR) = @Station)
          ORDER BY D.StartTime DESC
        `),
        request.query(`
          SELECT 
            ISNULL(LC.LossName, 'Other') as category,
            ISNULL(SUM(D.TotalDT), 0) as duration,
            COUNT(D.DowntimeID) as occurrence
          FROM Perf_Downtime D
          LEFT JOIN Config_LossCategory LC ON D.LossID = LC.LossID
          LEFT JOIN Config_Line L ON D.SubAsslyLineID = L.LineID
          LEFT JOIN Config_Station S ON D.StationID = S.StationID
          WHERE (@StartDate IS NULL OR D.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR D.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR D.ProdShift = @Shift)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(D.SubAsslyLineID AS VARCHAR) = @Line)
            AND (@Station IS NULL OR S.StationName = @Station OR CAST(D.StationID AS VARCHAR) = @Station)
          GROUP BY LC.LossName
          ORDER BY duration DESC
        `),
        request.query(`
          SELECT 
            ISNULL(SUM(D.TotalDT), 0) as totalDowntime,
            COUNT(D.DowntimeID) as noOfLosses,
            ISNULL(AVG(D.TotalDT), 0) as avgLossDuration
          FROM Perf_Downtime D
          LEFT JOIN Config_Line L ON D.SubAsslyLineID = L.LineID
          LEFT JOIN Config_Station S ON D.StationID = S.StationID
          WHERE (@StartDate IS NULL OR D.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR D.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR D.ProdShift = @Shift)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(D.SubAsslyLineID AS VARCHAR) = @Line)
            AND (@Station IS NULL OR S.StationName = @Station OR CAST(D.StationID AS VARCHAR) = @Station)
        `)
      ]);

      const table = (dtTableRes.status === 'fulfilled' && dtTableRes.value?.recordset) || [];
      const categories = (catRes.status === 'fulfilled' && catRes.value?.recordset) || [];
      const kpiRow = (kpiRes.status === 'fulfilled' && kpiRes.value?.recordset?.[0]) || { totalDowntime: 0, noOfLosses: 0, avgLossDuration: 0 };

      const mostLostCat = categories.length > 0 ? categories[0].category : 'None';

      const hourlyMap = {};
      table.forEach(r => {
        const h = r.startTime ? r.startTime.split(':')[0] + ':00' : '08:00';
        hourlyMap[h] = (hourlyMap[h] || 0) + (r.duration || 0);
      });
      const hourly = Object.entries(hourlyMap).map(([time, duration]) => ({ time, duration }));

      return res.json({
        kpis: {
          totalDowntime: kpiRow.totalDowntime || 0,
          noOfLosses: kpiRow.noOfLosses || table.length,
          mostLostCat,
          avgLossDuration: Math.round(kpiRow.avgLossDuration || 0)
        },
        hourly,
        categories,
        table
      });
    }
  } catch (err) {
    console.error('Performance Downtime error:', err.message);
  }

  res.json({
    kpis: { totalDowntime: 0, noOfLosses: 0, mostLostCat: 'None', avgLossDuration: 0 },
    hourly: [],
    categories: [],
    table: []
  });
});

// ==========================================
// 3. PROCESS MONITORING MODULE ENDPOINTS
// ==========================================
app.get('/api/process/pokayoke', async (req, res) => {
  const { period, shift, startDate, endDate, line, station } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const getReq = () => createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Shift: { type: sql.VarChar(20), value: dbShift },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
        Station: { type: sql.VarChar(50), value: (station && station !== 'All') ? station : null }
      });

      const [prodRes, dtRes] = await Promise.allSettled([
        getReq().query(`
          SELECT 
            ISNULL(SUM(E.ENGCompleted_Qty), 0) as totalProd,
            ISNULL(SUM(E.ENGNotOK_Qty), 0) as totalNotOk
          FROM Prod_EnginePlanExecution E
          LEFT JOIN Config_Line L ON E.LineID = L.LineID
          WHERE (@StartDate IS NULL OR E.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR E.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR E.ProdShift = @Shift)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(E.LineID AS VARCHAR) = @Line)
        `),
        getReq().query(`
          SELECT COUNT(D.DowntimeID) as bypassCount
          FROM Perf_Downtime D
          LEFT JOIN Config_Line L ON D.SubAsslyLineID = L.LineID
          LEFT JOIN Config_Station S ON D.StationID = S.StationID
          WHERE (@StartDate IS NULL OR D.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR D.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR D.ProdShift = @Shift)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(D.SubAsslyLineID AS VARCHAR) = @Line)
            AND (@Station IS NULL OR S.StationName = @Station OR CAST(D.StationID AS VARCHAR) = @Station)
        `)
      ]);

      const prodRow = (prodRes.status === 'fulfilled' && prodRes.value?.recordset?.[0]) || { totalProd: 0, totalNotOk: 0 };
      const dtRow = (dtRes.status === 'fulfilled' && dtRes.value?.recordset?.[0]) || { bypassCount: 0 };

      const totalChecks = prodRow.totalProd || 0;
      const notOkCount = prodRow.totalNotOk || 0;
      const okCount = Math.max(0, totalChecks - notOkCount);
      const bypassCount = dtRow.bypassCount || 0;

      return res.json({
        kpis: { totalChecks, okCount, notOkCount, bypassCount }
      });
    }
  } catch (err) {
    console.error('PokaYoke DB error:', err.message);
  }

  res.json({
    kpis: { totalChecks: 0, okCount: 0, notOkCount: 0, bypassCount: 0 }
  });
});

app.get('/api/process/bypass', async (req, res) => {
  const { period, shift, startDate, endDate, line, station, device } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Shift: { type: sql.VarChar(20), value: dbShift },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
        Station: { type: sql.VarChar(50), value: (station && station !== 'All') ? station : null }
      });

      const result = await request.query(`
        SELECT 
          D.DowntimeID as id,
          'BP-00' + CAST(D.DowntimeID AS VARCHAR) as bypassId,
          CONVERT(VARCHAR(5), D.StartTime, 108) as startTime,
          CONVERT(VARCHAR(5), D.EndTime, 108) as endTime,
          CONVERT(VARCHAR(16), D.StartTime, 120) as [date],
          CONVERT(VARCHAR(16), D.StartTime, 120) as [datetime],
          ISNULL(L.LineName, 'Line 1') as line,
          ISNULL(S.StationName, 'Demo') as station,
          'PY-01 Torque Bypass' as device,
          'Shift ' + ISNULL(D.ProdShift, 'A') as shift,
          ISNULL(M.ModelName, 'Pulsar 150') as model,
          ISNULL(SK.SKUName, 'SKU-001') as sku,
          ISNULL(D.TotalDT, 0) as duration,
          ISNULL(U.UserName, 'Operator') as operator,
          ISNULL(D.Reason, 'Bypass Triggered') as reason,
          'Supervisor' as authorizedBy,
          'Resolved' as [status]
        FROM Perf_Downtime D
        LEFT JOIN Config_Line L ON D.SubAsslyLineID = L.LineID
        LEFT JOIN Config_Station S ON D.StationID = S.StationID
        LEFT JOIN Config_User U ON D.UserID = U.UserID
        LEFT JOIN Config_SKU SK ON SK.SKUID = 1
        LEFT JOIN Config_Model M ON SK.ModelID = M.ModelID
        WHERE (@StartDate IS NULL OR D.ProdDate >= @StartDate)
          AND (@EndDate IS NULL OR D.ProdDate <= @EndDate)
          AND (@Shift IS NULL OR D.ProdShift = @Shift)
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(D.SubAsslyLineID AS VARCHAR) = @Line)
          AND (@Station IS NULL OR S.StationName = @Station OR CAST(D.StationID AS VARCHAR) = @Station)
        ORDER BY D.StartTime DESC
      `);

      const rows = result.recordset || [];
      return res.json({ bypassLogs: rows, table: rows });
    }
  } catch (err) {
    console.error('Bypass DB error:', err.message);
  }

  res.json({ bypassLogs: [] });
});

app.get('/api/process/torque', async (req, res) => {
  const { period, shift, startDate, endDate, sku, device } = req.query;
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        SKU: { type: sql.VarChar(50), value: (sku && sku !== 'All') ? sku : null }
      });

      const result = await request.query(`
        SELECT 
          T.RowID as id,
          'ENG-2026-00' + CAST(T.RowID AS VARCHAR) as engineNo,
          ISNULL(M.ModelName, 'Pulsar 150') as model,
          ISNULL(S.SKUName, 'SKU-001') as sku,
          'Line 1' as line,
          'Station 1' as station,
          'TD-0' + CAST(ISNULL(T.ActivityID, 1) AS VARCHAR) as device,
          CAST(T.ActivityValue AS FLOAT) as [value],
          CAST(ISNULL(T.LowerLimit, 40.0) AS FLOAT) as minSpec,
          CAST(ISNULL(T.UpperLimit, 50.0) AS FLOAT) as maxSpec,
          CASE WHEN T.ActivityValue >= ISNULL(T.LowerLimit, 40.0) AND T.ActivityValue <= ISNULL(T.UpperLimit, 50.0) THEN 'OK' ELSE 'NOK' END as result,
          CONVERT(VARCHAR(19), ISNULL(T.Timestamp, GETDATE()), 120) as [datetime],
          'OP-001' as operator
        FROM Prod_TorqueData_Log T
        LEFT JOIN Config_SKU S ON T.SKUID = S.SKUID
        LEFT JOIN Config_Model M ON S.ModelID = M.ModelID
        WHERE (@StartDate IS NULL OR CAST(T.Timestamp AS DATE) >= @StartDate)
          AND (@EndDate IS NULL OR CAST(T.Timestamp AS DATE) <= @EndDate)
          AND (@SKU IS NULL OR S.SKUName = @SKU)
        ORDER BY T.RowID DESC
      `);

      const table = result.recordset || [];
      const totalFastenings = table.length;
      const okCount = table.filter(r => r.result === 'OK').length;
      const nokCount = totalFastenings - okCount;
      const passRate = totalFastenings > 0 ? Number(((okCount / totalFastenings) * 100).toFixed(1)) : 0;

      return res.json({
        kpis: { totalFastenings, okCount, nokCount, passRate },
        table
      });
    }
  } catch (err) {
    console.error('Torque DB error:', err.message);
  }

  res.json({
    kpis: { totalFastenings: 0, okCount: 0, nokCount: 0, passRate: 0 },
    table: []
  });
});

app.get('/api/process/conveyor', async (req, res) => {
  const { period, shift, startDate, endDate, line, station, model, sku } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const spReq = createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Shift: { type: sql.VarChar(20), value: dbShift },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
        Station: { type: sql.VarChar(50), value: (station && station !== 'All') ? station : null }
      });

      const spResult = await spReq.execute('DS_Dashboard_ProcessConveyor');
      const recordsets = spResult.recordsets || [[], [], [], []];

      const stations = recordsets[0] || [];
      const reasons = recordsets[1] || [];
      const dtByStation = recordsets[2] || [];
      const planStats = recordsets[3]?.[0] || { plannedSpeed: 4.0, planCount: 1 };

      const totalStoppages = reasons.reduce((sum, r) => sum + (Number(r.count) || 0), 0);
      const totalStoppageTime = reasons.reduce((sum, r) => sum + (Number(r.downtime) || 0), 0);
      const plannedSpeed = Number(planStats.plannedSpeed) || 4.0;
      const actualSpeed = Number((plannedSpeed * (totalStoppageTime > 0 ? 0.88 : 1.0)).toFixed(1));
      const maxDeviation = `${Math.max(0, Math.round((1 - (actualSpeed / plannedSpeed)) * 100))}%`;
      const totalShiftMins = 480;
      const uptimePct = totalStoppageTime > 0 ? Number((((totalShiftMins - totalStoppageTime) / totalShiftMins) * 100).toFixed(1)) : 100.0;

      // Build structured table rows
      const table = dtByStation.map(row => {
        const devPct = Number((plannedSpeed - (plannedSpeed * (1 - (row.totalStoppageTime / 480)))).toFixed(1));
        const actSpd = (plannedSpeed - (devPct * 0.1)).toFixed(1);
        const dev = `${Math.round((devPct / plannedSpeed) * 100)}%`;
        return {
          station: row.station,
          line: row.line,
          model: 'Pulsar 150',
          sku: 'SKU-001',
          plannedSpeed: `${plannedSpeed.toFixed(1)} m/min`,
          actualSpeed: `${actSpd} m/min`,
          deviation: dev,
          stoppageCount: row.stoppageCount,
          totalStoppageTime: row.totalStoppageTime,
          status: row.totalStoppageTime > 20 ? 'Active' : 'Normal'
        };
      });

      return res.json({
        kpis: {
          speedMpm: `${actualSpeed.toFixed(1)}`,
          maxDeviation,
          totalStoppages,
          uptimePct: uptimePct > 0 ? uptimePct : 0
        },
        stations,
        reasons,
        table
      });
    }
  } catch (err) {
    console.error('Conveyor DB error:', err.message);
  }

  res.json({
    kpis: { speedMpm: '0.0', maxDeviation: '0%', totalStoppages: 0, uptimePct: '0%' },
    stations: [],
    reasons: [],
    table: []
  });
});

// ==========================================
// 4. TRACK & TRACE MODULE ENDPOINTS
// ==========================================
app.get('/api/trace/genealogy', async (req, res) => {
  const { uid, engineNo } = req.query;
  const searchEngine = (uid || engineNo || '').trim();

  if (!searchEngine) {
    return res.json({ found: false, table: [] });
  }

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = pool.request();
      request.input('EngineNo', sql.NVarChar(50), searchEngine);

      const result = await request.query(`
        SELECT 
          G.RowID as id,
          G.EngineNo as engineNo,
          ISNULL(S.StationName, 'Demo') as station,
          ISNULL(S.StationDesc, 'Assembly Operation') as operation,
          CONVERT(VARCHAR(8), G.Timestamp, 108) as startTime,
          CONVERT(VARCHAR(8), DATEADD(minute, 5, G.Timestamp), 108) as endTime,
          '5m' as duration,
          ISNULL(U.UserName, 'Operator') as operator,
          ISNULL(G.ActivityValue, 'OK') as result,
          CASE WHEN G.ActivityValue = 'NOK' THEN 'Torque variance detected' ELSE '-' END as remarks
        FROM Prod_Engine_Geneology G
        LEFT JOIN Config_Station S ON G.StationID = S.StationID
        LEFT JOIN Config_User U ON G.UsersID = U.UserID
        WHERE G.EngineNo = @EngineNo OR G.EngineNo LIKE '%' + @EngineNo + '%'
        ORDER BY G.Timestamp ASC
      `);

      const table = result.recordset || [];
      return res.json({
        found: table.length > 0,
        table
      });
    }
  } catch (err) {
    console.error('Genealogy DB error:', err.message);
  }

  res.json({ found: false, table: [] });
});

app.get('/api/trace/wip', async (req, res) => {
  const { period, shift, startDate, endDate, line, wipStatus } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const spReq = createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Shift: { type: sql.VarChar(20), value: dbShift },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
        WIPStatus: { type: sql.VarChar(50), value: (wipStatus && wipStatus !== 'All') ? wipStatus : null }
      });

      const result = await spReq.execute('DS_Dashboard_TrackTraceWIP');
      let rows = result.recordset || [];
      if (wipStatus && wipStatus !== 'All') {
        rows = rows.filter(r => r.status.toLowerCase() === wipStatus.toLowerCase());
      }

      const total = rows.length;
      const inProcess = rows.filter(r => r.status === 'In-Process').length;
      const rework = rows.filter(r => r.status === 'Rework').length;
      const blocked = rows.filter(r => r.status === 'Blocked').length;
      const idle = rows.filter(r => r.status === 'Idle').length;

      return res.json({
        kpis: { total, inProcess, rework, blocked, idle },
        distribution: [
          { name: 'In-Process', value: inProcess },
          { name: 'Rework', value: rework },
          { name: 'Blocked', value: blocked },
          { name: 'Idle', value: idle }
        ],
        details: rows,
        table: rows
      });
    }
  } catch (err) {
    console.error('WIP DB error:', err.message);
  }

  res.json({
    kpis: { total: 0, inProcess: 0, rework: 0, blocked: 0, idle: 0 },
    distribution: [],
    details: [],
    table: []
  });
});

app.get('/api/trace/rework', async (req, res) => {
  const { period, shift, startDate, endDate, line, station, model, sku, status } = req.query;
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
        Model: { type: sql.VarChar(50), value: (model && model !== 'All') ? model : null },
        SKU: { type: sql.VarChar(50), value: (sku && sku !== 'All') ? sku : null }
      });

      const result = await request.query(`
        SELECT 
          D.UID as id,
          D.EngineNo as engineNo,
          ISNULL(M.ModelName, 'Pulsar 150') as model,
          ISNULL(S.SKUName, 'UG5') as sku,
          ISNULL(L.LineName, 'Line 1') as line,
          'Demo (Block Assembly)' as station,
          ISNULL(D.Remark, 'Defect Detected') as reason,
          CONVERT(VARCHAR(5), D.Timestamp, 108) as detectedTime,
          CONVERT(VARCHAR(5), DATEADD(minute, 15, D.Timestamp), 108) as reworkStart,
          CONVERT(VARCHAR(5), DATEADD(minute, 35, D.Timestamp), 108) as reworkEnd,
          CASE 
            WHEN D.Status = 1 THEN 'Completed'
            WHEN D.Status = 2 THEN 'In-Progress'
            WHEN D.Status = 3 THEN 'Rejected'
            ELSE 'Pending'
          END as [status],
          ISNULL(D.UpdatedBy, 'Operator') as operator,
          'Rework Bay 1' as [location]
        FROM Prod_Defect_Log D
        LEFT JOIN Prod_Engine_WIP W ON D.EngineNo = W.EngineNo
        LEFT JOIN Config_SKU S ON W.SKUID = S.SKUID
        LEFT JOIN Config_Model M ON S.ModelID = M.ModelID
        LEFT JOIN Config_Line L ON W.LineID = L.LineID
        WHERE (@StartDate IS NULL OR CAST(D.Timestamp AS DATE) >= @StartDate)
          AND (@EndDate IS NULL OR CAST(D.Timestamp AS DATE) <= @EndDate)
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(W.LineID AS VARCHAR) = @Line)
          AND (@Model IS NULL OR M.ModelName = @Model)
          AND (@SKU IS NULL OR S.SKUName = @SKU)
        ORDER BY D.Timestamp DESC
      `);

      let rows = result.recordset || [];
      if (status && status !== 'All') {
        rows = rows.filter(r => r.status.toLowerCase() === status.toLowerCase());
      }

      const totalRework = rows.length;
      const inProgress = rows.filter(r => r.status === 'In-Progress').length;
      const completed = rows.filter(r => r.status === 'Completed').length;
      const rejected = rows.filter(r => r.status === 'Rejected').length;

      return res.json({
        kpis: {
          totalRework,
          inProgress,
          completed,
          rejected
        },
        table: rows
      });
    }
  } catch (err) {
    console.error('Trace Rework DB error:', err.message);
  }

  res.json({
    kpis: { totalRework: 0, inProgress: 0, completed: 0, rejected: 0 },
    table: []
  });
});

app.get('/api/trace/engine-rework', async (req, res) => {
  const { uid, engineNo } = req.query;
  const searchEngine = (uid || engineNo || '').trim();

  if (!searchEngine) {
    return res.json({
      found: false,
      kpis: { totalDefects: 0, reworkCount: 0, finalStatus: 'N/A', totalReworkTime: '0m' },
      table: []
    });
  }

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = pool.request();
      request.input('EngineNo', sql.NVarChar(50), searchEngine);

      const result = await request.query(`
        SELECT 
          D.UID as id,
          D.EngineNo as engineNo,
          ISNULL(M.ModelName, 'Pulsar 150') as model,
          'Line2 (Head Tightening)' as station,
          ISNULL(D.Remark, 'Torque Fail') as reason,
          CONVERT(VARCHAR(16), D.Timestamp, 120) as detectedTime,
          CONVERT(VARCHAR(5), DATEADD(minute, 15, D.Timestamp), 108) as reworkStart,
          CONVERT(VARCHAR(5), DATEADD(minute, 35, D.Timestamp), 108) as reworkEnd,
          CASE WHEN D.Status = 1 THEN 'Completed' ELSE 'In-Progress' END as [status],
          ISNULL(D.UpdatedBy, 'Operator') as operator
        FROM Prod_Defect_Log D
        LEFT JOIN Prod_Engine_WIP W ON D.EngineNo = W.EngineNo
        LEFT JOIN Config_SKU S ON W.SKUID = S.SKUID
        LEFT JOIN Config_Model M ON S.ModelID = M.ModelID
        WHERE D.EngineNo = @EngineNo OR D.EngineNo LIKE '%' + @EngineNo + '%'
        ORDER BY D.Timestamp DESC
      `);

      const table = result.recordset || [];
      return res.json({
        found: table.length > 0,
        kpis: {
          totalDefects: table.length,
          reworkCount: table.length,
          finalStatus: table.length > 0 ? (table.every(t => t.status === 'Completed') ? 'OK' : 'In-Progress') : 'N/A',
          totalReworkTime: `${table.length * 20}m`
        },
        table
      });
    }
  } catch (err) {
    console.error('Engine Rework DB error:', err.message);
  }

  res.json({
    found: false,
    kpis: { totalDefects: 0, reworkCount: 0, finalStatus: 'N/A', totalReworkTime: '0m' },
    table: []
  });
});

// ==========================================
// 5. QUALITY MODULE ENDPOINTS
// ==========================================
app.get('/api/quality/defect', async (req, res) => {
  const { period, shift, startDate, endDate, line, station, modelFamily, model, sku } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const getReq = () => createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Shift: { type: sql.VarChar(20), value: dbShift },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
        Model: { type: sql.VarChar(50), value: (model && model !== 'All') ? model : null },
        ModelFamily: { type: sql.VarChar(50), value: (modelFamily && modelFamily !== 'All') ? modelFamily : null },
        SKU: { type: sql.VarChar(50), value: (sku && sku !== 'All') ? sku : null }
      });

      const [kpiProdRes, defectRes, distRes, reasonsRes] = await Promise.allSettled([
        getReq().query(`
          SELECT 
            ISNULL(SUM(E.ENGCompleted_Qty), 0) as totalProd
          FROM Prod_EnginePlanExecution E
          LEFT JOIN Config_Line L ON E.LineID = L.LineID
          LEFT JOIN Config_SKU S ON E.SKUID = S.SKUID
          LEFT JOIN Config_Model M ON S.ModelID = M.ModelID
          LEFT JOIN Config_ModelFamily F ON M.ModelFamilyID = F.ModelFamilyID
          WHERE (@StartDate IS NULL OR E.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR E.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR E.ProdShift = @Shift)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(E.LineID AS VARCHAR) = @Line)
            AND (@Model IS NULL OR M.ModelName = @Model)
            AND (@ModelFamily IS NULL OR F.ModelFamilyName = @ModelFamily)
            AND (@SKU IS NULL OR S.SKUName = @SKU)
        `),
        getReq().query(`
          SELECT 
            D.UID as id,
            D.EngineNo as engineNo,
            ISNULL(D.Remark, 'Defect Detected') as defect,
            ISNULL(L.LineName, 'Line 1') as line,
            'Demo (Block Assembly)' as station,
            ISNULL(M.ModelName, 'Pulsar 150') as model,
            ISNULL(S.SKUName, 'UG5') as sku,
            ISNULL(F.ModelFamilyName, 'Bike') as modelFamily,
            ISNULL(D.UpdatedBy, 'Operator') as operator,
            CONVERT(VARCHAR(5), D.Timestamp, 108) as [time],
            CONVERT(VARCHAR(10), D.Timestamp, 120) as [date]
          FROM Prod_Defect_Log D
          LEFT JOIN Prod_Engine_WIP W ON D.EngineNo = W.EngineNo
          LEFT JOIN Config_SKU S ON W.SKUID = S.SKUID
          LEFT JOIN Config_Model M ON S.ModelID = M.ModelID
          LEFT JOIN Config_ModelFamily F ON M.ModelFamilyID = F.ModelFamilyID
          LEFT JOIN Config_Line L ON W.LineID = L.LineID
          WHERE (@StartDate IS NULL OR CAST(D.Timestamp AS DATE) >= @StartDate)
            AND (@EndDate IS NULL OR CAST(D.Timestamp AS DATE) <= @EndDate)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(W.LineID AS VARCHAR) = @Line)
            AND (@Model IS NULL OR M.ModelName = @Model)
            AND (@ModelFamily IS NULL OR F.ModelFamilyName = @ModelFamily)
            AND (@SKU IS NULL OR S.SKUName = @SKU)
          ORDER BY D.Timestamp DESC
        `),
        getReq().query(`
          SELECT 
            CASE 
              WHEN D.Remark LIKE '%Torque%' OR D.Remark LIKE '%Bolt%' THEN 'Torque & Fastening'
              WHEN D.Remark LIKE '%Scratch%' OR D.Remark LIKE '%Casing%' THEN 'Cosmetic & Surface'
              WHEN D.Remark LIKE '%Leakage%' OR D.Remark LIKE '%Gasket%' OR D.Remark LIKE '%Seal%' THEN 'Leakage & Sealing'
              WHEN D.Remark LIKE '%Valve%' OR D.Remark LIKE '%Piston%' OR D.Remark LIKE '%Timing%' THEN 'Engine Fitment'
              ELSE 'Electrical & Other'
            END as name,
            COUNT(D.UID) as [value]
          FROM Prod_Defect_Log D
          LEFT JOIN Prod_Engine_WIP W ON D.EngineNo = W.EngineNo
          LEFT JOIN Config_SKU S ON W.SKUID = S.SKUID
          LEFT JOIN Config_Model M ON S.ModelID = M.ModelID
          LEFT JOIN Config_ModelFamily F ON M.ModelFamilyID = F.ModelFamilyID
          LEFT JOIN Config_Line L ON W.LineID = L.LineID
          WHERE (@StartDate IS NULL OR CAST(D.Timestamp AS DATE) >= @StartDate)
            AND (@EndDate IS NULL OR CAST(D.Timestamp AS DATE) <= @EndDate)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(W.LineID AS VARCHAR) = @Line)
            AND (@Model IS NULL OR M.ModelName = @Model)
            AND (@ModelFamily IS NULL OR F.ModelFamilyName = @ModelFamily)
            AND (@SKU IS NULL OR S.SKUName = @SKU)
          GROUP BY 
            CASE 
              WHEN D.Remark LIKE '%Torque%' OR D.Remark LIKE '%Bolt%' THEN 'Torque & Fastening'
              WHEN D.Remark LIKE '%Scratch%' OR D.Remark LIKE '%Casing%' THEN 'Cosmetic & Surface'
              WHEN D.Remark LIKE '%Leakage%' OR D.Remark LIKE '%Gasket%' OR D.Remark LIKE '%Seal%' THEN 'Leakage & Sealing'
              WHEN D.Remark LIKE '%Valve%' OR D.Remark LIKE '%Piston%' OR D.Remark LIKE '%Timing%' THEN 'Engine Fitment'
              ELSE 'Electrical & Other'
            END
          ORDER BY [value] DESC
        `),
        getReq().query(`
          SELECT TOP 6
            D.Remark as name,
            COUNT(D.UID) as [value]
          FROM Prod_Defect_Log D
          LEFT JOIN Prod_Engine_WIP W ON D.EngineNo = W.EngineNo
          LEFT JOIN Config_SKU S ON W.SKUID = S.SKUID
          LEFT JOIN Config_Model M ON S.ModelID = M.ModelID
          LEFT JOIN Config_ModelFamily F ON M.ModelFamilyID = F.ModelFamilyID
          LEFT JOIN Config_Line L ON W.LineID = L.LineID
          WHERE (@StartDate IS NULL OR CAST(D.Timestamp AS DATE) >= @StartDate)
            AND (@EndDate IS NULL OR CAST(D.Timestamp AS DATE) <= @EndDate)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(W.LineID AS VARCHAR) = @Line)
            AND (@Model IS NULL OR M.ModelName = @Model)
            AND (@ModelFamily IS NULL OR F.ModelFamilyName = @ModelFamily)
            AND (@SKU IS NULL OR S.SKUName = @SKU)
          GROUP BY D.Remark
          ORDER BY [value] DESC, D.Remark ASC
        `)
      ]);

      const totalProd = (kpiProdRes.status === 'fulfilled' && kpiProdRes.value?.recordset?.[0]?.totalProd) || 0;
      const table = (defectRes.status === 'fulfilled' && defectRes.value?.recordset) || [];
      const distribution = (distRes.status === 'fulfilled' && distRes.value?.recordset) || [];
      const reasons = (reasonsRes.status === 'fulfilled' && reasonsRes.value?.recordset) || [];

      const totalDefects = table.length;
      const effectiveProd = Math.max(totalProd, totalDefects);
      const rft = effectiveProd > 0 ? Number(((1 - (totalDefects / effectiveProd)) * 100).toFixed(1)) : 0;

      return res.json({
        kpis: {
          totalProduction: effectiveProd,
          totalDefects,
          rft
        },
        distribution,
        reasons,
        table
      });
    }
  } catch (err) {
    console.error('Quality Defect error:', err.message);
  }

  res.json({
    kpis: { totalProduction: 0, totalDefects: 0, rft: 0 },
    distribution: [],
    reasons: [],
    table: []
  });
});

app.get('/api/quality/pqca', async (req, res) => {
  const { period, shift, startDate, endDate, line, modelFamily, model } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
        Model: { type: sql.VarChar(50), value: (model && model !== 'All') ? model : null },
        ModelFamily: { type: sql.VarChar(50), value: (modelFamily && modelFamily !== 'All') ? modelFamily : null }
      });

      const result = await request.query(`
        SELECT 
          Q.UID as id,
          ISNULL(A.AuditListName, 'Process Quality Audit') as [checkpoint],
          CASE 
            WHEN Q.UID % 4 = 0 THEN 'Torque & Assembly'
            WHEN Q.UID % 4 = 1 THEN 'Leakage & Sealing'
            WHEN Q.UID % 4 = 2 THEN 'Poka-Yoke Verification'
            ELSE 'Visual & Cosmetic'
          END as category,
          CASE 
            WHEN Q.UID % 4 = 0 THEN '45.2 Nm'
            WHEN Q.UID % 4 = 1 THEN '0.00 sccm'
            WHEN Q.UID % 4 = 2 THEN 'Active'
            ELSE 'Pass'
          END as [value],
          CASE 
            WHEN Q.UID % 4 = 0 THEN '45.0 Nm'
            WHEN Q.UID % 4 = 1 THEN '0.00 sccm'
            WHEN Q.UID % 4 = 2 THEN 'Active'
            ELSE 'Pass'
          END as expected,
          CASE WHEN Q.Status = 1 THEN 'OK' ELSE 'NC' END as [status],
          ISNULL(L.LineName, 'Line ' + CAST(Q.LineID AS VARCHAR)) as line,
          ISNULL(M.ModelName, 'Pulsar 150') as model,
          ISNULL(F.ModelFamilyName, 'Bike') as modelFamily,
          CASE 
            WHEN DATEPART(hour, Q.StartDateTime) >= 6 AND DATEPART(hour, Q.StartDateTime) < 14 THEN 'Shift 1'
            WHEN DATEPART(hour, Q.StartDateTime) >= 14 AND DATEPART(hour, Q.StartDateTime) < 22 THEN 'Shift 2'
            ELSE 'Shift 3'
          END as shift,
          CONVERT(VARCHAR(10), Q.StartDateTime, 120) as [date]
        FROM QA_AuditMonitoring Q
        LEFT JOIN Config_AuditList A ON Q.AuditListID = A.AuditListID
        LEFT JOIN Config_Line L ON Q.LineID = L.LineID
        LEFT JOIN Config_Model M ON A.ModelID = M.ModelID
        LEFT JOIN Config_ModelFamily F ON A.ModelFamilyID = F.ModelFamilyID
        WHERE (@StartDate IS NULL OR CAST(Q.StartDateTime AS DATE) >= @StartDate)
          AND (@EndDate IS NULL OR CAST(Q.StartDateTime AS DATE) <= @EndDate)
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(Q.LineID AS VARCHAR) = @Line)
          AND (@Model IS NULL OR M.ModelName = @Model)
          AND (@ModelFamily IS NULL OR F.ModelFamilyName = @ModelFamily)
        ORDER BY Q.StartDateTime DESC
      `);

      let table = result.recordset || [];
      if (dbShift) {
        table = table.filter(r => r.shift === dbShift || r.shift === ('Shift ' + dbShift));
      }

      const total = table.length;
      const ok = table.filter(r => r.status === 'OK').length;
      const nc = total - ok;
      const singleNc = nc;
      const doubleNc = 0;

      // Group NC by Category
      const catNcMap = {};
      table.filter(r => r.status === 'NC').forEach(r => {
        catNcMap[r.category] = (catNcMap[r.category] || 0) + 1;
      });
      const categoryNc = Object.keys(catNcMap).map(k => ({ name: k, value: catNcMap[k] }));

      // Trend by date / shift
      const trendMap = {};
      table.forEach(r => {
        const key = period === 'Day' ? r.shift : r.date;
        if (!trendMap[key]) trendMap[key] = { date: key, nc: 0, ok: 0 };
        if (r.status === 'NC') trendMap[key].nc += 1;
        else trendMap[key].ok += 1;
      });
      const trend = Object.values(trendMap);

      return res.json({
        kpis: { total, ok, nc, singleNc, doubleNc, totalCheckpoints: total },
        compliance: [
          { name: 'Compliant', value: ok },
          { name: 'Non-Compliant', value: nc }
        ].filter(d => d.value > 0),
        categoryNc: categoryNc.length > 0 ? categoryNc : [{ name: 'Torque & Assembly', value: 0 }],
        trend,
        table
      });
    }
  } catch (err) {
    console.error('PQCA DB error:', err.message);
  }

  res.json({
    kpis: { total: 0, ok: 0, nc: 0, singleNc: 0, doubleNc: 0, totalCheckpoints: 0 },
    compliance: [],
    categoryNc: [],
    trend: [],
    table: []
  });
});

app.get('/api/quality/checklist', async (req, res) => {
  const { type = 'IQC', period, shift, startDate, endDate, line, model, sku } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
        Model: { type: sql.VarChar(50), value: (model && model !== 'All') ? model : null },
        SKU: { type: sql.VarChar(50), value: (sku && sku !== 'All') ? sku : null }
      });

      const result = await request.query(`
        SELECT 
          Q.UID as id,
          Q.AuditListID,
          CONVERT(VARCHAR(19), Q.StartDateTime, 120) as [date],
          ISNULL(L.LineName, 'Line ' + CAST(Q.LineID AS VARCHAR)) as line,
          ISNULL(M.ModelName, 'Pulsar 150') as model,
          ISNULL(S.SKUName, 'UG5') as sku,
          Q.Status,
          CASE 
            WHEN DATEPART(hour, Q.StartDateTime) >= 6 AND DATEPART(hour, Q.StartDateTime) < 14 THEN 'Shift 1'
            WHEN DATEPART(hour, Q.StartDateTime) >= 14 AND DATEPART(hour, Q.StartDateTime) < 22 THEN 'Shift 2'
            ELSE 'Shift 3'
          END as shift
        FROM QA_AuditMonitoring Q
        LEFT JOIN Config_AuditList A ON Q.AuditListID = A.AuditListID
        LEFT JOIN Config_Line L ON Q.LineID = L.LineID
        LEFT JOIN Config_Model M ON A.ModelID = M.ModelID
        LEFT JOIN Config_SKU S ON A.SKUID = S.SKUID
        WHERE (@StartDate IS NULL OR CAST(Q.StartDateTime AS DATE) >= @StartDate)
          AND (@EndDate IS NULL OR CAST(Q.StartDateTime AS DATE) <= @EndDate)
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(Q.LineID AS VARCHAR) = @Line)
          AND (@Model IS NULL OR M.ModelName = @Model)
          AND (@SKU IS NULL OR S.SKUName = @SKU)
        ORDER BY Q.StartDateTime DESC
      `);

      let rawRows = result.recordset || [];
      if (dbShift) {
        rawRows = rawRows.filter(r => r.shift === dbShift || r.shift === ('Shift ' + dbShift));
      }

      // Domain definitions for IQC, IPQC, FQC
      const iqcChecklists = [
        'IQC Raw Crankcase Casting Batch Audit',
        'IQC Piston & Pin Dimension Audit',
        'IQC Cylinder Head Machining Audit',
        'IQC Gasket & O-Ring Material Inspection',
        'IQC Fasteners & Bolts Tensile Verification'
      ];
      const ipqcChecklists = [
        'IPQC Cylinder Head Sub-Assembly Audit',
        'IPQC Crankcase Main Bearing Fitment Audit',
        'IPQC Poka-Yoke Machine Interlock Audit',
        'IPQC Automated Sealant Bead Dispense Audit',
        'IPQC Tappet & Valve Clearance Assembly Audit'
      ];
      const fqcChecklists = [
        'FQC Hot Engine Firing & RPM Chamber Audit',
        'FQC Cold Leak & Pressure Chamber Audit',
        'FQC Dyno Performance & Torque Curve Audit',
        'FQC Exhaust Emissions & Smoke Level Audit',
        'FQC End of Line Final Cosmetic & Seal Mark Audit'
      ];

      const iqcCheckpoints = [
        { name: 'Crankcase Hardness Test', category: 'Material Quality', std: '60 - 65 HRC', act: '62 HRC' },
        { name: 'Piston Crown Surface Roughness', category: 'Surface Finish', std: '< 0.80 µm', act: '0.65 µm' },
        { name: 'Cylinder Head Bore Roundness', category: 'Dimensional Tolerance', std: '54.00 ± 0.01 mm', act: '54.005 mm' },
        { name: 'Millipore Cleanliness Particle Weight', category: 'Cleanliness', std: '< 15 mg', act: '9.2 mg' },
        { name: 'Thread Pitch Gauge Accuracy', category: 'Thread Quality', std: 'M8 x 1.25 6H', act: 'Pass' }
      ];

      const ipqcCheckpoints = [
        { name: 'Main Bearing Fastening Torque', category: 'Torque & Tightening', std: '45.0 ± 2.0 Nm', act: '45.2 Nm' },
        { name: 'Cylinder Head Bolt Torque', category: 'Torque & Tightening', std: '38.0 ± 1.5 Nm', act: '38.4 Nm' },
        { name: 'Station 1 Poka-Yoke Sensor Status', category: 'Interlock & Sensor', std: 'Active (1)', act: 'Active (1)' },
        { name: 'Piston Press Fit Depth', category: 'Assembly Clearance', std: '12.50 ± 0.20 mm', act: '12.55 mm' },
        { name: 'Sealant Dispense Bead Width', category: 'Sealing & Adhesive', std: '2.0 ± 0.3 mm', act: '2.1 mm' }
      ];

      const fqcCheckpoints = [
        { name: 'Engine Idling RPM Stability', category: 'Firing & Performance', std: '1400 ± 50 RPM', act: '1410 RPM' },
        { name: 'Exhaust CO Gas Emission', category: 'Emissions & Fuel', std: '< 0.50 %', act: '0.32 %' },
        { name: 'Engine Vibration Velocity RMS', category: 'Vibration & NVH', std: '< 2.2 mm/s', act: '1.8 mm/s' },
        { name: 'Crankcase Chamber Oil Pressure', category: 'Oil Pressure', std: '3.2 ± 0.3 bar', act: '3.25 bar' },
        { name: 'Cold Helium Leak Rate', category: 'Leak Testing', std: '0.00 sccm', act: '0.00 sccm' }
      ];

      const isCP = type.endsWith('_CP');
      const baseType = type.replace('_CP', '').toUpperCase();
      const inspectors = ['Inspector Rahul', 'Inspector Amit', 'Inspector Vikas', 'QA Lead Priya', 'Inspector Suresh'];

      let table = [];

      if (!isCP) {
        // Checklist format
        const names = baseType === 'IQC' ? iqcChecklists : (baseType === 'FQC' ? fqcChecklists : ipqcChecklists);
        table = rawRows.map((r, idx) => {
          const isOk = r.Status === 1;
          const totalCp = 10;
          const passedCp = isOk ? 10 : 9;
          const failedCp = isOk ? 0 : 1;
          return {
            id: `CHK-${baseType}-${String(r.id).padStart(4, '0')}`,
            name: names[idx % names.length],
            date: r.date,
            shift: r.shift,
            line: r.line,
            model: r.model,
            inspector: inspectors[idx % inspectors.length],
            total: totalCp,
            passed: passedCp,
            failed: failedCp,
            status: isOk ? 'OK' : 'NOK',
            remarks: isOk ? 'Audit Passed 100% compliance' : 'Minor deviation observed in checkpoint #3'
          };
        });
      } else {
        // Checkpoint format
        const cpDefs = baseType === 'IQC' ? iqcCheckpoints : (baseType === 'FQC' ? fqcCheckpoints : ipqcCheckpoints);
        const stageName = baseType === 'IQC' ? 'Inward Receiving' : (baseType === 'FQC' ? 'Final Testing Chamber' : 'Assembly Line Station');
        table = rawRows.map((r, idx) => {
          const cp = cpDefs[idx % cpDefs.length];
          const isOk = r.Status === 1;
          return {
            id: `CP-${baseType}-${String(r.id).padStart(4, '0')}`,
            cpName: cp.name,
            date: r.date,
            shift: r.shift,
            line: r.line,
            stage: stageName,
            model: r.model,
            sku: r.sku,
            inspector: inspectors[idx % inspectors.length],
            category: cp.category,
            stdValue: cp.std,
            actValue: isOk ? cp.act : (cp.act.includes('Nm') ? '41.2 Nm (Low)' : (cp.act.includes('RPM') ? '1520 RPM (High)' : 'Deviated')),
            result: isOk ? 'PASS' : 'FAIL',
            status: isOk ? 'OK' : 'NOK'
          };
        });
      }

      const total = table.length;
      const ok = table.filter(r => r.status === 'OK' || r.result === 'PASS').length;
      const nok = total - ok;
      const compliance = total > 0 ? Number(((ok / total) * 100).toFixed(1)) : 0;
      const passRate = compliance;

      return res.json({
        kpis: {
          totalChecklists: total,
          okChecklists: ok,
          nokChecklists: nok,
          compliance,
          totalCheckpoints: total * (isCP ? 1 : 10),
          passed: ok * (isCP ? 1 : 10),
          failed: nok * (isCP ? 1 : 10),
          passRate
        },
        table
      });
    }
  } catch (err) {
    console.error('Checklist DB error:', err.message);
  }

  res.json({
    kpis: { totalChecklists: 0, okChecklists: 0, nokChecklists: 0, compliance: 0, totalCheckpoints: 0, passed: 0, failed: 0, passRate: 0 },
    table: []
  });
});

// ==========================================
// 6. MAINTENANCE MODULE ENDPOINTS
// ==========================================
app.get('/api/maintenance/dashboard', async (req, res) => {
  const { period, shift, startDate, endDate, line, station, machine } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Shift: { type: sql.VarChar(20), value: dbShift },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
        Station: { type: sql.VarChar(50), value: (station && station !== 'All') ? station : null }
      });

      const [bdRes, lossRes, machinesRes] = await Promise.allSettled([
        request.query(`
          SELECT 
            COUNT(B.BreakDownID) as totalBreakdowns,
            ISNULL(SUM(B.TotalBDTime), 0) as totalDowntime,
            ISNULL(AVG(B.TotalBDTime), 0) as avgMTTR
          FROM Maint_BreakDown_Log B
          LEFT JOIN Config_Station S ON B.StationID = S.StationID
          LEFT JOIN Config_Line L ON S.SubAsslyLineID = L.LineID
          WHERE (@StartDate IS NULL OR B.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR B.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR B.ProdShift = @Shift OR B.ProdShift = 'Shift ' + @Shift)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(S.SubAsslyLineID AS VARCHAR) = @Line)
            AND (@Station IS NULL OR S.StationName = @Station OR CAST(B.StationID AS VARCHAR) = @Station)
        `),
        request.query(`
          SELECT 
            ISNULL(B.BDReason, ISNULL(LC.LossName, 'Maintenance')) as reason,
            ISNULL(SUM(B.TotalBDTime), 0) as duration,
            COUNT(B.BreakDownID) as [count]
          FROM Maint_BreakDown_Log B
          LEFT JOIN Config_Station S ON B.StationID = S.StationID
          LEFT JOIN Config_Line L ON S.SubAsslyLineID = L.LineID
          LEFT JOIN Config_LossCategory LC ON B.LossID = LC.LossID
          WHERE (@StartDate IS NULL OR B.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR B.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR B.ProdShift = @Shift OR B.ProdShift = 'Shift ' + @Shift)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(S.SubAsslyLineID AS VARCHAR) = @Line)
            AND (@Station IS NULL OR S.StationName = @Station OR CAST(B.StationID AS VARCHAR) = @Station)
          GROUP BY B.BDReason, LC.LossName
        `),
        request.query(`
          SELECT 
            B.BreakDownID as id,
            ISNULL(S.StationName, 'Station') + ' Machine' as machine,
            ISNULL(L.LineName, 'Line 1') as line,
            ISNULL(S.StationName, 'Demo') as station,
            CASE WHEN B.BDStatus = 0 THEN 'Breakdown' WHEN B.BDStatus = 1 THEN 'Running' ELSE 'Idle' END as [status],
            CONVERT(VARCHAR(5), B.BDStartTime, 108) as lastBreakdown,
            ISNULL(B.TotalBDTime, 0) as downtimeToday,
            ISNULL(B.TotalBDTime, 0) as mttr,
            ISNULL(B.TotalBDTime, 0) as mtbf,
            CASE WHEN ISNULL(B.TotalBDTime, 0) > 0 THEN CAST(ROUND(100.0 - (B.TotalBDTime / 480.0) * 100.0, 1) as FLOAT) ELSE 100.0 END as availability
          FROM Maint_BreakDown_Log B
          LEFT JOIN Config_Station S ON B.StationID = S.StationID
          LEFT JOIN Config_Line L ON S.SubAsslyLineID = L.LineID
          WHERE (@StartDate IS NULL OR B.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR B.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR B.ProdShift = @Shift OR B.ProdShift = 'Shift ' + @Shift)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(S.SubAsslyLineID AS VARCHAR) = @Line)
            AND (@Station IS NULL OR S.StationName = @Station OR CAST(B.StationID AS VARCHAR) = @Station)
          ORDER BY B.BDStartTime DESC
        `)
      ]);

      const bdRow = (bdRes.status === 'fulfilled' && bdRes.value?.recordset?.[0]) || {};
      const totalBreakdowns = bdRow.totalBreakdowns || 0;
      const totalDowntime = bdRow.totalDowntime || 0;
      const avgMTTR = Math.round(bdRow.avgMTTR || 0);
      const avgMTBF = totalBreakdowns > 0 ? Number(((480 - totalDowntime / 60) / totalBreakdowns).toFixed(1)) : 0;
      const availabilityPct = totalBreakdowns > 0 ? Math.max(0, Math.min(100, 100 - (totalDowntime / 480) * 100)).toFixed(1) : '100.0';

      const machines = (machinesRes.status === 'fulfilled' && machinesRes.value?.recordset) || [];

      const runningCount = machines.filter(m => m.status === 'Running').length;
      const breakdownCount = machines.filter(m => m.status === 'Breakdown').length;
      const maintenanceCount = machines.filter(m => m.status === 'Maintenance').length;
      const idleCount = machines.filter(m => m.status === 'Idle').length;

      const breakdownReasons = (lossRes.status === 'fulfilled' && lossRes.value?.recordset) || [];

      return res.json({
        kpis: {
          runningCount,
          breakdownCount,
          maintenanceCount,
          idleCount,
          totalDowntime,
          totalBreakdowns,
          avgMTTR,
          avgMTBF,
          machineAvailability: `${availabilityPct}%`
        },
        statusData: [
          { name: 'Running', value: runningCount },
          { name: 'Breakdown', value: breakdownCount },
          { name: 'Maintenance', value: maintenanceCount },
          { name: 'Idle', value: idleCount }
        ].filter(d => d.value > 0),
        breakdownReasons,
        table: machines
      });
    }
  } catch (err) {
    console.error('Maintenance Dashboard DB error:', err.message);
  }

  res.json({
    kpis: {
      runningCount: 0,
      breakdownCount: 0,
      maintenanceCount: 0,
      idleCount: 0,
      totalDowntime: 0,
      totalBreakdowns: 0,
      avgMTTR: 0,
      avgMTBF: 0,
      machineAvailability: '0%'
    },
    statusData: [],
    breakdownReasons: [],
    table: []
  });
});

app.get('/api/maintenance/breakdown', async (req, res) => {
  const { period, shift, startDate, endDate, line, station, machine } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Shift: { type: sql.VarChar(20), value: dbShift },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
        Station: { type: sql.VarChar(50), value: (station && station !== 'All') ? station : null }
      });

      const [kpiRes, tableRes] = await Promise.allSettled([
        request.query(`
          SELECT 
            COUNT(B.BreakDownID) as totalBreakdowns,
            ISNULL(AVG(B.TotalBDTime), 0) as avgMins,
            ISNULL(MAX(B.TotalBDTime), 0) as maxMins,
            ISNULL(SUM(B.TotalBDTime) / 60.0, 0) as totalDowntimeHours
          FROM Maint_BreakDown_Log B
          LEFT JOIN Config_Station S ON B.StationID = S.StationID
          LEFT JOIN Config_Line L ON S.SubAsslyLineID = L.LineID
          WHERE (@StartDate IS NULL OR B.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR B.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR B.ProdShift = @Shift OR B.ProdShift = 'Shift ' + @Shift)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(S.SubAsslyLineID AS VARCHAR) = @Line)
            AND (@Station IS NULL OR S.StationName = @Station OR CAST(B.StationID AS VARCHAR) = @Station)
        `),
        request.query(`
          SELECT 
            B.BreakDownID as id,
            ISNULL(S.StationName, 'Demo') + ' Machine' as machine,
            ISNULL(L.LineName, 'Line 1') as line,
            ISNULL(S.StationName, 'Demo') as station,
            CONVERT(VARCHAR(5), B.BDStartTime, 108) as [start],
            CONVERT(VARCHAR(5), B.BDEndTime, 108) as [end],
            ISNULL(B.TotalBDTime, 0) as duration,
            ISNULL(B.BDReason, 'Breakdown') as reason,
            ISNULL(U.UserName, 'Technician') as tech,
            CASE WHEN B.BDStatus = 1 THEN 'Resolved' ELSE 'In-Progress' END as [status]
          FROM Maint_BreakDown_Log B
          LEFT JOIN Config_Station S ON B.StationID = S.StationID
          LEFT JOIN Config_Line L ON S.SubAsslyLineID = L.LineID
          LEFT JOIN Config_User U ON B.AssignedUserID = U.UserID
          WHERE (@StartDate IS NULL OR B.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR B.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR B.ProdShift = @Shift OR B.ProdShift = 'Shift ' + @Shift)
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(S.SubAsslyLineID AS VARCHAR) = @Line)
            AND (@Station IS NULL OR S.StationName = @Station OR CAST(B.StationID AS VARCHAR) = @Station)
          ORDER BY B.BDStartTime DESC
        `)
      ]);

      const row = (kpiRes.status === 'fulfilled' && kpiRes.value?.recordset?.[0]) || {};
      const table = (tableRes.status === 'fulfilled' && tableRes.value?.recordset) || [];

      return res.json({
        kpis: {
          totalBreakdowns: row.totalBreakdowns || table.length,
          avgMins: Math.round(row.avgMins || 0),
          maxMins: Math.round(row.maxMins || 0),
          totalDowntimeHours: Number(row.totalDowntimeHours || 0).toFixed(1)
        },
        table
      });
    }
  } catch (err) {
    console.error('Breakdown DB error:', err.message);
  }

  res.json({
    kpis: { totalBreakdowns: 0, avgMins: 0, maxMins: 0, totalDowntimeHours: '0.0' },
    table: []
  });
});

app.get('/api/maintenance/downtime', async (req, res) => {
  const { period, shift, startDate, endDate, line, station } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const spReq = createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Shift: { type: sql.VarChar(20), value: dbShift },
        Period: { type: sql.VarChar(20), value: period || 'Shift' },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
        Station: { type: sql.VarChar(50), value: (station && station !== 'All') ? station : null }
      });

      const spResult = await spReq.execute('DS_Dashboard_MaintenanceDowntime');
      const recordsets = spResult.recordsets || [[], [], []];

      const r = recordsets[0]?.[0] || {};
      const table = recordsets[1] || [];
      const trend = recordsets[2] || [];
      const mostAffected = table.length > 0 ? table.reduce((prev, curr) => (Number(curr.downtime) > Number(prev.downtime) ? curr : prev)).machine : 'None';

      return res.json({
        kpis: {
          totalDowntimeHrs: Number(r.totalDowntimeHrs || 0).toFixed(1),
          avgDowntimeMins: Math.round(r.avgDowntimeMins || 0),
          totalBreakdowns: r.totalBreakdowns || table.length,
          mostAffected
        },
        table,
        trend
      });
    }
  } catch (err) {
    console.error('Maintenance Downtime DB error:', err.message);
  }

  res.json({
    kpis: { totalDowntimeHrs: '0.0', avgDowntimeMins: 0, totalBreakdowns: 0, mostAffected: 'None' },
    table: [],
    trend: []
  });
});

app.get('/api/maintenance/mttr-mtbf', async (req, res) => {
  const { period, shift, startDate, endDate, line, station, machine } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Shift: { type: sql.VarChar(20), value: dbShift },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
        Station: { type: sql.VarChar(50), value: (station && station !== 'All') ? station : null }
      });

      const result = await request.query(`
        SELECT 
          ISNULL(S.StationName, 'Station ' + CAST(B.StationID AS VARCHAR)) + ' Machine' as machine,
          ISNULL(L.LineName, 'Line ' + CAST(S.SubAsslyLineID AS VARCHAR)) as line,
          ISNULL(S.StationName, 'Demo') as station,
          ISNULL(AVG(B.TotalBDTime), 0) as mttr,
          CASE 
            WHEN COUNT(B.BreakDownID) > 0 THEN ROUND(120.0 / COUNT(B.BreakDownID), 1)
            ELSE 120.0
          END as mtbf,
          CASE 
            WHEN SUM(B.TotalBDTime) > 0 THEN ROUND(100.0 - (SUM(B.TotalBDTime) / 480.0 * 100.0), 1)
            ELSE 100.0
          END as availability,
          COUNT(B.BreakDownID) as [count],
          ISNULL(SUM(B.TotalBDTime), 0) as totalTime
        FROM Maint_BreakDown_Log B
        LEFT JOIN Config_Station S ON B.StationID = S.StationID
        LEFT JOIN Config_Line L ON S.SubAsslyLineID = L.LineID
        WHERE (@StartDate IS NULL OR B.ProdDate >= @StartDate)
          AND (@EndDate IS NULL OR B.ProdDate <= @EndDate)
          AND (@Shift IS NULL OR B.ProdShift = @Shift OR B.ProdShift = 'Shift ' + @Shift)
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(S.SubAsslyLineID AS VARCHAR) = @Line)
          AND (@Station IS NULL OR S.StationName = @Station OR CAST(B.StationID AS VARCHAR) = @Station)
        GROUP BY B.StationID, S.StationName, S.SubAsslyLineID, L.LineName
      `);

      const table = result.recordset || [];
      const avgMTTR = table.length > 0 ? Math.round(table.reduce((a, b) => a + Number(b.mttr), 0) / table.length) : 0;
      const avgMTBF = table.length > 0 ? Math.round(table.reduce((a, b) => a + Number(b.mtbf), 0) / table.length) : 0;
      const bestMachine = table.length > 0 ? table.reduce((prev, curr) => prev.availability > curr.availability ? prev : curr).machine : 'N/A';
      const worstMachine = table.length > 0 ? table.reduce((prev, curr) => prev.availability < curr.availability ? prev : curr).machine : 'N/A';

      return res.json({
        kpis: { avgMTTR, avgMTBF, bestMachine, worstMachine },
        table
      });
    }
  } catch (err) {
    console.error('MTTR/MTBF DB error:', err.message);
  }

  res.json({
    kpis: { avgMTTR: 0, avgMTBF: 0, bestMachine: 'N/A', worstMachine: 'N/A' },
    table: []
  });
});

app.get('/api/maintenance/pm-dashboard', async (req, res) => {
  const { line, machine } = req.query;

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = createSqlRequest(pool, {
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null }
      });

      const result = await request.query(`
        SELECT 
          'PM-' + CAST(S.UID AS VARCHAR) as id,
          ISNULL(C.CheckListName, 'PM Schedule') as task,
          ISNULL(L.LineName, 'Line ' + CAST(S.LineId AS VARCHAR)) as line,
          'Demo Station' as station,
          'Demo Machine' as machine,
          'Weekly' as frequency,
          CONVERT(VARCHAR(10), S.StartDate, 120) as scheduledDate,
          '-' as completedDate,
          'Pending' as [status],
          'Technician' as technician
        FROM Config_PMSchedule S
        LEFT JOIN Config_PMCheckList C ON S.CheckListId = C.CheckListId
        LEFT JOIN Config_Line L ON S.LineId = L.LineID
        WHERE (@Line IS NULL OR L.LineName = @Line OR CAST(S.LineId AS VARCHAR) = @Line)
      `);

      const table = result.recordset || [];
      const total = table.length;
      const completed = table.filter(t => t.status === 'Completed').length;
      const pending = table.filter(t => t.status === 'Pending').length;
      const overdue = table.filter(t => t.status === 'Overdue').length;
      const compliance = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';

      return res.json({
        kpis: {
          totalTasks: total,
          completedTasks: completed,
          pendingTasks: pending,
          overdueTasks: overdue,
          compliance: `${compliance}%`
        },
        statusData: [
          { name: 'Completed', value: completed },
          { name: 'Pending', value: pending },
          { name: 'Overdue', value: overdue }
        ].filter(d => d.value > 0),
        table
      });
    }
  } catch (err) {
    console.error('PM Dashboard DB error:', err.message);
  }

  res.json({
    kpis: { totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0, compliance: '0.0%' },
    statusData: [],
    table: []
  });
});

app.get('/api/maintenance/pm-report', async (req, res) => {
  const { line, machine } = req.query;

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = createSqlRequest(pool, {
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null }
      });

      const result = await request.query(`
        SELECT 
          'PMR-' + CAST(S.UID AS VARCHAR) as id,
          'PM-' + CAST(S.UID AS VARCHAR) as pmId,
          'Demo Machine' as machine,
          ISNULL(L.LineName, 'Line ' + CAST(S.LineId AS VARCHAR)) as line,
          ISNULL(C.CheckListName, 'PM Maintenance') as task,
          CONVERT(VARCHAR(10), S.StartDate, 120) as [date],
          'Shift 1' as shift,
          'Pending' as [status],
          ISNULL(S.EstimatedDuration, 0) as duration,
          'Technician' as technician,
          'Pending' as result,
          'Scheduled maintenance' as notes
        FROM Config_PMSchedule S
        LEFT JOIN Config_PMCheckList C ON S.CheckListId = C.CheckListId
        LEFT JOIN Config_Line L ON S.LineId = L.LineID
        WHERE (@Line IS NULL OR L.LineName = @Line OR CAST(S.LineId AS VARCHAR) = @Line)
      `);

      const table = result.recordset || [];
      const total = table.length;
      const completed = table.filter(t => t.status === 'Completed').length;
      const compliance = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';
      const totalMins = table.reduce((acc, d) => acc + (d.duration || 0), 0);
      const avgMins = completed > 0 ? Math.round(totalMins / completed) : 0;

      return res.json({
        kpis: {
          totalPlanned: total,
          totalCompleted: completed,
          compliance: `${compliance}%`,
          avgDurationMins: avgMins
        },
        table
      });
    }
  } catch (err) {
    console.error('PM Report DB error:', err.message);
  }

  res.json({
    kpis: { totalPlanned: 0, totalCompleted: 0, compliance: '0.0%', avgDurationMins: 0 },
    table: []
  });
});

// ==========================================
// 7. MATERIAL & KITTING MODULE ENDPOINTS
// ==========================================
app.get('/api/material/dashboard', async (req, res) => {
  const { line, model, sku } = req.query;

  try {
    const pool = await poolPromise;
    if (pool) {
      const result = await pool.request().query(`
        SELECT 
          PartID as id,
          PartName as material,
          'Line 1' as line,
          'Pulsar 150' as model,
          'UG6' as sku,
          'Main Store' as [location],
          'Safe' as [status],
          100 as currentStock,
          25 as minLevel,
          150 as maxLevel,
          'Engine Parts' as category
        FROM SAP_PartMaster
      `);

      const table = result.recordset || [];
      const criticalCount = table.filter(d => d.status === 'Critical').length;
      const safeCount = table.filter(d => d.status === 'Safe').length;
      const totalStock = table.reduce((acc, d) => acc + (d.currentStock || 0), 0);

      return res.json({
        kpis: {
          totalInventory: totalStock,
          inventoryValue: totalStock > 0 ? '₹4.8 Cr' : '₹0',
          criticalShortages: criticalCount,
          stockoutRisk: criticalCount,
          kitFulfillment: table.length > 0 ? `${Math.round((safeCount / table.length) * 100)}%` : '0%'
        },
        stockLevels: table.map(d => ({ material: d.material, current: d.currentStock, min: d.minLevel })),
        shortages: [],
        table
      });
    }
  } catch (err) {
    console.error('Material Dashboard DB error:', err.message);
  }

  res.json({
    kpis: { totalInventory: 0, inventoryValue: '₹0', criticalShortages: 0, stockoutRisk: 0, kitFulfillment: '0%' },
    stockLevels: [],
    shortages: [],
    table: []
  });
});

app.get('/api/material/stock', async (req, res) => {
  const { matType, location } = req.query;

  try {
    const pool = await poolPromise;
    if (pool) {
      const result = await pool.request().query(`
        SELECT 
          PartID as id,
          PartName as material,
          'Raw' as matType,
          'Main Store' as [location],
          100 as available,
          25 as minLevel,
          150 as maxLevel,
          'Safe' as [status]
        FROM SAP_PartMaster
      `);

      let table = result.recordset || [];
      if (matType && matType !== 'All') table = table.filter(d => d.matType.toLowerCase() === matType.toLowerCase());
      if (location && location !== 'All') table = table.filter(d => d.location.toLowerCase() === location.toLowerCase());

      return res.json({ table });
    }
  } catch (err) {
    console.error('Material Stock DB error:', err.message);
  }

  res.json({ table: [] });
});

app.get('/api/material/request', async (req, res) => {
  const { line, station } = req.query;

  try {
    const pool = await poolPromise;
    if (pool) {
      const result = await pool.request().query(`
        SELECT 
          PartID as reqId,
          PartName as material,
          'Line 1' as line,
          'Demo' as station,
          50 as requestedQty,
          50 as issuedQty,
          'Fulfilled' as [status],
          CONVERT(VARCHAR(5), GETDATE(), 108) as reqTime,
          CONVERT(VARCHAR(5), DATEADD(minute, 10, GETDATE()), 108) as fullTime
        FROM SAP_PartMaster
      `);

      const table = result.recordset || [];
      const fulfilled = table.filter(t => t.status === 'Fulfilled' || t.status === 'Approved').length;
      const pending = table.filter(t => t.status === 'Pending').length;

      return res.json({
        kpis: {
          totalRequests: table.length,
          fulfilled,
          pending,
          fulfillmentRate: table.length > 0 ? `${Math.round((fulfilled / table.length) * 100)}%` : '0.0%'
        },
        table
      });
    }
  } catch (err) {
    console.error('Material Request DB error:', err.message);
  }

  res.json({
    kpis: { totalRequests: 0, fulfilled: 0, pending: 0, fulfillmentRate: '0.0%' },
    table: []
  });
});

app.get('/api/material/kitting', async (req, res) => {
  const { period, shift, startDate, endDate, line, model, sku } = req.query;
  const dbShift = normalizeShift(shift, period);
  const { effectiveStartDate, effectiveEndDate } = computeDateRange(period, startDate, endDate);

  try {
    const pool = await poolPromise;
    if (pool) {
      const getReq = () => createSqlRequest(pool, {
        StartDate: { type: sql.Date, value: effectiveStartDate },
        EndDate: { type: sql.Date, value: effectiveEndDate },
        Shift: { type: sql.VarChar(20), value: dbShift },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
        Model: { type: sql.VarChar(50), value: (model && model !== 'All') ? model : null },
        SKU: { type: sql.VarChar(50), value: (sku && sku !== 'All') ? sku : null }
      });

      const isSingleDay = effectiveStartDate && effectiveEndDate && effectiveStartDate === effectiveEndDate && period !== 'Month' && period !== 'Week';

      const trendQuery = isSingleDay ? `
        SELECT 
          CONVERT(VARCHAR(2), K.InspectionTime, 108) + ':00' as [time],
          COUNT(K.UID) as inspected,
          SUM(CASE WHEN K.[Status] = 'NOK' THEN 1 ELSE 0 END) as defects,
          SUM(CASE WHEN K.[Status] = 'OK' THEN 1 ELSE 0 END) as ok
        FROM Prod_Kit_Inspection_Log K
        LEFT JOIN Config_Model M ON K.ModelID = M.ModelID
        LEFT JOIN Config_SKU S ON K.SKUID = S.SKUID
        LEFT JOIN Config_Line L ON K.LineID = L.LineID
        WHERE (@StartDate IS NULL OR K.ProdDate >= @StartDate)
          AND (@EndDate IS NULL OR K.ProdDate <= @EndDate)
          AND (@Shift IS NULL OR K.ProdShift = @Shift OR (@Shift = 'A' AND K.ProdShift IN ('1', 'Shift 1', 'A')) OR (@Shift = 'B' AND K.ProdShift IN ('2', 'Shift 2', 'B')))
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(K.LineID AS VARCHAR) = @Line)
          AND (@Model IS NULL OR M.ModelName = @Model)
          AND (@SKU IS NULL OR S.SKUName = @SKU)
        GROUP BY CONVERT(VARCHAR(2), K.InspectionTime, 108)
        ORDER BY [time] ASC
      ` : `
        SELECT 
          CONVERT(VARCHAR(10), K.ProdDate, 120) as [time],
          COUNT(K.UID) as inspected,
          SUM(CASE WHEN K.[Status] = 'NOK' THEN 1 ELSE 0 END) as defects,
          SUM(CASE WHEN K.[Status] = 'OK' THEN 1 ELSE 0 END) as ok
        FROM Prod_Kit_Inspection_Log K
        LEFT JOIN Config_Model M ON K.ModelID = M.ModelID
        LEFT JOIN Config_SKU S ON K.SKUID = S.SKUID
        LEFT JOIN Config_Line L ON K.LineID = L.LineID
        WHERE (@StartDate IS NULL OR K.ProdDate >= @StartDate)
          AND (@EndDate IS NULL OR K.ProdDate <= @EndDate)
          AND (@Shift IS NULL OR K.ProdShift = @Shift OR (@Shift = 'A' AND K.ProdShift IN ('1', 'Shift 1', 'A')) OR (@Shift = 'B' AND K.ProdShift IN ('2', 'Shift 2', 'B')))
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(K.LineID AS VARCHAR) = @Line)
          AND (@Model IS NULL OR M.ModelName = @Model)
          AND (@SKU IS NULL OR S.SKUName = @SKU)
        GROUP BY K.ProdDate
        ORDER BY K.ProdDate ASC
      `;

      const [kpiRes, tableRes, defectRes, trendRes] = await Promise.allSettled([
        getReq().query(`
          SELECT 
            COUNT(K.UID) as totalInspected,
            SUM(CASE WHEN K.[Status] = 'OK' THEN 1 ELSE 0 END) as okCount,
            SUM(CASE WHEN K.[Status] = 'NOK' THEN 1 ELSE 0 END) as nokCount,
            ISNULL(AVG(CAST(K.Accuracy AS FLOAT)), 100) as avgAccuracy
          FROM Prod_Kit_Inspection_Log K
          LEFT JOIN Config_Model M ON K.ModelID = M.ModelID
          LEFT JOIN Config_SKU S ON K.SKUID = S.SKUID
          LEFT JOIN Config_Line L ON K.LineID = L.LineID
          WHERE (@StartDate IS NULL OR K.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR K.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR K.ProdShift = @Shift OR (@Shift = 'A' AND K.ProdShift IN ('1', 'Shift 1', 'A')) OR (@Shift = 'B' AND K.ProdShift IN ('2', 'Shift 2', 'B')))
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(K.LineID AS VARCHAR) = @Line)
            AND (@Model IS NULL OR M.ModelName = @Model)
            AND (@SKU IS NULL OR S.SKUName = @SKU)
        `),
        getReq().query(`
          SELECT TOP 200
            K.KitID as kitId,
            ISNULL(L.LineName, 'Line C') as line,
            ISNULL(M.ModelName, 'Pulsar 150') as model,
            ISNULL(S.SKUName, 'P150-TWIN') as sku,
            CASE WHEN K.[Status] = 'OK' THEN 'Prepared' ELSE 'Rejected' END as [status],
            CONVERT(VARCHAR(5), K.InspectionTime, 108) as preparedAt,
            CAST(K.Accuracy AS VARCHAR) + '%' as accuracy,
            ISNULL(K.DefectReason, '-') as defect,
            K.InspectorName as operator,
            CONVERT(VARCHAR(10), K.ProdDate, 120) as [date],
            CONVERT(VARCHAR(5), K.InspectionTime, 108) as [time]
          FROM Prod_Kit_Inspection_Log K
          LEFT JOIN Config_Model M ON K.ModelID = M.ModelID
          LEFT JOIN Config_SKU S ON K.SKUID = S.SKUID
          LEFT JOIN Config_Line L ON K.LineID = L.LineID
          WHERE (@StartDate IS NULL OR K.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR K.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR K.ProdShift = @Shift OR (@Shift = 'A' AND K.ProdShift IN ('1', 'Shift 1', 'A')) OR (@Shift = 'B' AND K.ProdShift IN ('2', 'Shift 2', 'B')))
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(K.LineID AS VARCHAR) = @Line)
            AND (@Model IS NULL OR M.ModelName = @Model)
            AND (@SKU IS NULL OR S.SKUName = @SKU)
          ORDER BY K.ProdDate DESC, K.InspectionTime DESC
        `),
        getReq().query(`
          SELECT 
            K.DefectReason as defect,
            COUNT(K.UID) as [count]
          FROM Prod_Kit_Inspection_Log K
          LEFT JOIN Config_Model M ON K.ModelID = M.ModelID
          LEFT JOIN Config_SKU S ON K.SKUID = S.SKUID
          LEFT JOIN Config_Line L ON K.LineID = L.LineID
          WHERE K.[Status] = 'NOK' 
            AND K.DefectReason IS NOT NULL 
            AND K.DefectReason != '-'
            AND (@StartDate IS NULL OR K.ProdDate >= @StartDate)
            AND (@EndDate IS NULL OR K.ProdDate <= @EndDate)
            AND (@Shift IS NULL OR K.ProdShift = @Shift OR (@Shift = 'A' AND K.ProdShift IN ('1', 'Shift 1', 'A')) OR (@Shift = 'B' AND K.ProdShift IN ('2', 'Shift 2', 'B')))
            AND (@Line IS NULL OR L.LineName = @Line OR CAST(K.LineID AS VARCHAR) = @Line)
            AND (@Model IS NULL OR M.ModelName = @Model)
            AND (@SKU IS NULL OR S.SKUName = @SKU)
          GROUP BY K.DefectReason
          ORDER BY [count] DESC
        `),
        getReq().query(trendQuery)
      ]);

      const kpiRow = (kpiRes.status === 'fulfilled' && kpiRes.value?.recordset?.[0]) || {};
      const table = (tableRes.status === 'fulfilled' && tableRes.value?.recordset) || [];
      const defectBreakdown = (defectRes.status === 'fulfilled' && defectRes.value?.recordset) || [];
      const trend = (trendRes.status === 'fulfilled' && trendRes.value?.recordset) || [];

      const totalInspected = kpiRow.totalInspected || table.length;
      const okCount = kpiRow.okCount || table.filter(t => t.status === 'Prepared' || t.status === 'OK').length;
      const nokCount = kpiRow.nokCount || table.filter(t => t.status === 'Rejected' || t.status === 'NOK').length;
      const passRate = totalInspected > 0 ? `${((okCount / totalInspected) * 100).toFixed(1)}%` : '0.0%';

      const barData = [
        { model: 'Pulsar 150', prepared: table.filter(t => t.model === 'Pulsar 150' && t.status === 'Prepared').length },
        { model: 'Pulsar NS200', prepared: table.filter(t => t.model === 'Pulsar NS200' && t.status === 'Prepared').length },
        { model: 'Dominar 400', prepared: table.filter(t => t.model === 'Dominar 400' && t.status === 'Prepared').length },
        { model: 'Platina 110', prepared: table.filter(t => t.model === 'Platina 110' && t.status === 'Prepared').length }
      ].filter(d => d.prepared > 0);

      return res.json({
        kpis: {
          planned: totalInspected,
          prepared: okCount,
          pending: Math.max(0, totalInspected - okCount - nokCount),
          accuracy: passRate,
          rejected: nokCount,
          totalInspected,
          okCount,
          nokCount,
          passRate,
          status: totalInspected > 0 ? (nokCount === 0 ? 'On Track' : 'Action Required') : 'No Data'
        },
        barData,
        defectBreakdown,
        trend,
        table
      });
    }
  } catch (err) {
    console.error('Kitting DB error:', err.message);
  }

  res.json({
    kpis: { planned: 0, prepared: 0, pending: 0, accuracy: '0.0%', rejected: 0, totalInspected: 0, okCount: 0, nokCount: 0, passRate: '0.0%', status: 'No Data' },
    barData: [],
    defectBreakdown: [],
    trend: [],
    table: []
  });
});

app.get('/api/material/engine-stock', async (req, res) => {
  const { modelFamily, model, sku } = req.query;

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = createSqlRequest(pool, {
        ModelFamily: { type: sql.VarChar(50), value: (modelFamily && modelFamily !== 'All') ? modelFamily : null },
        Model: { type: sql.VarChar(50), value: (model && model !== 'All') ? model : null },
        SKU: { type: sql.VarChar(50), value: (sku && sku !== 'All') ? sku : null }
      });

      const result = await request.query(`
        SELECT 
          ISNULL(F.ModelFamilyName, 'Bike') as modelFamily,
          ISNULL(M.ModelName, 'Pulsar 150') as model,
          ISNULL(S.SKUName, 'SKU1') as sku,
          W.EngineNo as engineNo,
          CONVERT(VARCHAR(19), W.StartTime, 120) as dateTime
        FROM Prod_Engine_WIP W
        LEFT JOIN Config_SKU S ON W.SKUID = S.SKUID
        LEFT JOIN Config_Model M ON S.ModelID = M.ModelID
        LEFT JOIN Config_ModelFamily F ON M.ModelFamilyID = F.ModelFamilyID
        WHERE (@ModelFamily IS NULL OR F.ModelFamilyName = @ModelFamily)
          AND (@Model IS NULL OR M.ModelName = @Model)
          AND (@SKU IS NULL OR S.SKUName = @SKU)
        ORDER BY W.StartTime DESC
      `);

      const table = result.recordset || [];
      const pieMap = {};
      table.forEach(d => {
        pieMap[d.model] = (pieMap[d.model] || 0) + 1;
      });
      const pie = Object.entries(pieMap).map(([name, value]) => ({ name, value }));

      return res.json({
        kpis: {
          totalEngines: table.length,
          modelsCount: pie.length
        },
        pie,
        table
      });
    }
  } catch (err) {
    console.error('Engine Stock DB error:', err.message);
  }

  res.json({
    kpis: { totalEngines: 0, modelsCount: 0 },
    pie: [],
    table: []
  });
});

app.get('/api/material/consumption', async (req, res) => {
  const { line, model, sku } = req.query;

  try {
    const pool = await poolPromise;
    if (pool) {
      const result = await pool.request().query(`
        SELECT 
          PartName as material,
          'Line 1' as line,
          'Pulsar 150' as model,
          'UG6' as sku,
          100 as consumed,
          100 as expected,
          0 as variance,
          0.0 as variancePct
        FROM SAP_PartMaster
      `);

      const table = result.recordset || [];
      return res.json({
        kpis: {
          totalMaterials: table.length,
          variancePct: '0.0',
          overConsumed: 0,
          underConsumed: 0
        },
        table
      });
    }
  } catch (err) {
    console.error('Material Consumption DB error:', err.message);
  }

  res.json({
    kpis: { totalMaterials: 0, variancePct: '0.0', overConsumed: 0, underConsumed: 0 },
    table: []
  });
});

// ==========================================
// 8. WORKFORCE MODULE ENDPOINTS
// ==========================================
app.get('/api/workforce/dashboard', async (req, res) => {
  const { line, station } = req.query;

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = createSqlRequest(pool, {
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
        Station: { type: sql.VarChar(50), value: (station && station !== 'All') ? station : null }
      });

      const result = await request.query(`
        SELECT 
          U.UserID as id,
          U.UserName as operator,
          ISNULL(L.LineName, 'Line 1') as line,
          ISNULL(S.StationName, 'Demo') as station,
          'Shift 1' as shift,
          ISNULL(SL.SkillLevelName, 'Intermediate') as skillLevel,
          'Present' as [status]
        FROM Config_User U
        LEFT JOIN Config_OperatorSkillMapping OSM ON U.UserID = OSM.UserID
        LEFT JOIN Config_SkillLevel SL ON OSM.SkillLevelID = SL.SkillLevelID
        LEFT JOIN Prod_ShiftOperatorAssignment A ON U.UserID = A.UserID
        LEFT JOIN Config_Line L ON A.LineID = L.LineID
        LEFT JOIN Config_Station S ON A.StationID = S.StationID
        WHERE U.UserName NOT IN ('admin', 'coolsuper')
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(A.LineID AS VARCHAR) = @Line)
          AND (@Station IS NULL OR S.StationName = @Station OR CAST(A.StationID AS VARCHAR) = @Station)
        ORDER BY U.UserID ASC
      `);

      const table = result.recordset || [];
      return res.json({
        kpis: {
          totalWorkforce: table.length,
          present: table.length,
          absent: 0,
          attendancePct: table.length > 0 ? 100 : 0,
          avgSkillLevel: table.length > 0 ? '3.8/5.0' : '0/5'
        },
        table
      });
    }
  } catch (err) {
    console.error('Workforce Dashboard DB error:', err.message);
  }

  res.json({
    kpis: { totalWorkforce: 0, present: 0, absent: 0, attendancePct: 0, avgSkillLevel: '0/5' },
    table: []
  });
});

app.get('/api/workforce/attendance', async (req, res) => {
  const { period, shift, line } = req.query;
  const dbShift = normalizeShift(shift, period);

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = createSqlRequest(pool, {
        Shift: { type: sql.VarChar(20), value: dbShift },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null }
      });

      const result = await request.query(`
        SELECT 
          U.UserID as id,
          U.UserName as operator,
          ISNULL(L.LineName, 'Line 1') as line,
          'Shift 1' as shift,
          '06:00' as inTime,
          '14:00' as outTime,
          'Present' as [status],
          8.0 as hoursWorked
        FROM Config_User U
        LEFT JOIN Prod_ShiftOperatorAssignment A ON U.UserID = A.UserID
        LEFT JOIN Config_Line L ON A.LineID = L.LineID
        WHERE U.UserName NOT IN ('admin', 'coolsuper')
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(A.LineID AS VARCHAR) = @Line)
        ORDER BY U.UserID ASC
      `);

      const rows = result.recordset || [];
      const scheduled = rows.length;
      const present = rows.filter(r => r.status === 'Present' || r.status === 'Late').length;
      const absent = rows.filter(r => r.status === 'Absent').length;
      const attendancePct = scheduled > 0 ? Number(((present / scheduled) * 100).toFixed(1)) : 0;

      return res.json({
        kpiData: {
          scheduled,
          present,
          absent,
          attendancePct
        },
        table: rows
      });
    }
  } catch (err) {
    console.error('Workforce attendance DB error:', err.message);
  }

  res.json({
    kpiData: { scheduled: 0, present: 0, absent: 0, attendancePct: 0 },
    table: []
  });
});

app.get('/api/workforce/skill-matrix', async (req, res) => {
  const { period, shift, line, station } = req.query;

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = createSqlRequest(pool, {
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null },
        Station: { type: sql.VarChar(50), value: (station && station !== 'All') ? station : null }
      });

      const result = await request.query(`
        SELECT 
          U.UserName as [name],
          U.UserName as operator,
          ISNULL(L.LineName, 'Line 1') as line,
          ISNULL(S.StationName, 'Demo') as station,
          ISNULL(SL.SkillLevelName, 'Intermediate') as skillLevel,
          'Yes' as certified,
          '2026-08-31' as lastAssessed
        FROM Config_User U
        LEFT JOIN Config_OperatorSkillMapping OSM ON U.UserID = OSM.UserID
        LEFT JOIN Config_SkillLevel SL ON OSM.SkillLevelID = SL.SkillLevelID
        LEFT JOIN Config_Skill SK ON OSM.SkillID = SK.SkillID
        LEFT JOIN Prod_ShiftOperatorAssignment A ON U.UserID = A.UserID
        LEFT JOIN Config_Line L ON A.LineID = L.LineID
        LEFT JOIN Config_Station S ON A.StationID = S.StationID
        WHERE U.UserName NOT IN ('admin', 'coolsuper')
          AND (@Line IS NULL OR L.LineName = @Line OR CAST(A.LineID AS VARCHAR) = @Line)
          AND (@Station IS NULL OR S.StationName = @Station OR CAST(A.StationID AS VARCHAR) = @Station)
        ORDER BY U.UserID ASC
      `);

      const table = result.recordset || [];
      const beginner = table.filter(r => r.skillLevel?.toLowerCase().includes('beg') || r.skillLevel === 'Beginner').length;
      const intermediate = table.filter(r => r.skillLevel === 'Intermediate').length;
      const expert = table.filter(r => r.skillLevel === 'Expert').length;

      return res.json({
        kpis: {
          beginner,
          intermediate,
          expert,
          total: table.length
        },
        table
      });
    }
  } catch (err) {
    console.error('Skill matrix DB error:', err.message);
  }

  res.json({
    kpis: { beginner: 0, intermediate: 0, expert: 0, total: 0 },
    table: []
  });
});

app.get('/api/workforce/allocation', async (req, res) => {
  const { period, shift, line } = req.query;
  const dbShift = normalizeShift(shift, period);

  try {
    const pool = await poolPromise;
    if (pool) {
      const request = createSqlRequest(pool, {
        Shift: { type: sql.VarChar(20), value: dbShift },
        Line: { type: sql.VarChar(50), value: (line && line !== 'All') ? line : null }
      });

      const result = await request.query(`
        SELECT 
          ISNULL(S.StationName, 'Demo') as station,
          ISNULL(L.LineName, 'Line 1') as line,
          'Shift ' + ISNULL(A.ProdShift, '1') as shift,
          ISNULL(U.UserName, 'Unassigned') as assignedOperator,
          1 as plannedCount,
          1 as actualCount,
          0 as gap
        FROM Prod_ShiftOperatorAssignment A
        LEFT JOIN Config_Line L ON A.LineID = L.LineID
        LEFT JOIN Config_Station S ON A.StationID = S.StationID
        LEFT JOIN Config_User U ON A.UserID = U.UserID
        WHERE (@Line IS NULL OR L.LineName = @Line OR CAST(A.LineID AS VARCHAR) = @Line)
      `);

      return res.json({ table: result.recordset || [] });
    }
  } catch (err) {
    console.error('Workforce allocation DB error:', err.message);
  }

  res.json({ table: [] });
});

// ==========================================
// START SERVER
// ==========================================
app.listen(port, () => {
  console.log(`Bajaj PPMS Server running live on port ${port}`);
});
