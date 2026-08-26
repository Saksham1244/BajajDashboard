const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { poolPromise, sql } = require('./db');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DALI-SOFT API is running with DB connection' });
});

// Real Dashboard Data Routes
app.get('/api/dashboard/production', async (req, res) => {
  try {
    const pool = await poolPromise;
    
    // Fetch Plan Vs Actual
    const planResult = await pool.request().query(`
      SELECT 
        ProdShift as name,
        SUM(PlanQty) as [plan],
        SUM(ENGCompleted_Qty) as actual
      FROM Prod_EnginePlanExecution
      GROUP BY ProdShift
    `);

    // Fetch Straight Pass
    const straightPassResult = await pool.request().query(`
      SELECT 
        L.LineName as name,
        SUM(E.ENGCompleted_Qty) - SUM(E.ENGReworkOK_Qty) as straight,
        SUM(E.ENGReworkOK_Qty) as reworked
      FROM Prod_EnginePlanExecution E
      LEFT JOIN Config_Line L ON E.LineID = L.LineID
      GROUP BY L.LineName
    `);

    res.json({
      planVsActual: planResult.recordset.length ? planResult.recordset : [
        { name: 'Shift 1', plan: 400, actual: 380 }
      ],
      straightPass: straightPassResult.recordset.length ? straightPassResult.recordset : [
        { name: 'Line A', straight: 85, reworked: 15 }
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/api/dashboard/performance', async (req, res) => {
  try {
    const pool = await poolPromise;
    const perfResult = await pool.request().query(`
      SELECT TOP 1 
        AVG(OLE) as ole,
        AVG(Availability * Performance * Quality / 10000) as oee,
        AVG(Availability) as availability,
        AVG(Performance) as performance
      FROM Perf_Hourly_OLE
    `);
    
    const kpis = perfResult.recordset[0] || { ole: 82.5, oee: 76.4, availability: 91.2, performance: 88.3 };

    res.json({
      kpis,
      downtime: [
        { category: 'Mechanical', duration: 120, occurrences: 5 },
        { category: 'Electrical', duration: 45, occurrences: 2 },
        { category: 'Process', duration: 80, occurrences: 8 },
        { category: 'Setup', duration: 30, occurrences: 1 },
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Keeping mock endpoints for other modules until they are implemented
app.get('/api/process/pokayoke', (req, res) => {
  res.json({
    hourlyOkNotOk: [
      { hour: '08:00', ok: 150, notOk: 5 },
      { hour: '09:00', ok: 162, notOk: 2 }
    ],
    hourlyBypass: [
      { start: '08:15', end: '08:30', duration: 15, hour: '08:00' }
    ]
  });
});

// Maintenance Mock Data
app.get('/api/maintenance/breakdown', (req, res) => {
  res.json({
    kpis: { totalBreakdowns: 15, mtbf: '24.5 hrs', mttr: '1.2 hrs' },
    table: [
      { id: 1, machine: 'Conveyor A', issue: 'Belt Slip', duration: '45 mins', date: '2026-08-25' },
      { id: 2, machine: 'Torque Gun 3', issue: 'Calibration', duration: '15 mins', date: '2026-08-25' }
    ]
  });
});

app.get('/api/maintenance/pm', (req, res) => {
  res.json({
    kpis: { completionRate: '94%', pending: 3, delayed: 1 },
    table: [
      { id: 1, task: 'Lubrication', machine: 'Press 1', status: 'Completed', date: '2026-08-25' },
      { id: 2, task: 'Filter Change', machine: 'HVAC', status: 'Pending', date: '2026-08-26' }
    ]
  });
});

// Material Mock Data
app.get('/api/material/stock', (req, res) => {
  res.json({
    kpis: { totalItems: 1420, lowStock: 15, outOfStock: 2 },
    table: [
      { id: 1, item: 'M8 Bolt', qty: 500, minStock: 200, status: 'Healthy' },
      { id: 2, item: 'O-Ring Seal', qty: 45, minStock: 100, status: 'Low Stock' }
    ]
  });
});

app.get('/api/material/kitting', (req, res) => {
  res.json({
    kpis: { kitsPrepared: 450, kitsPending: 50, efficiency: '92%' },
    table: [
      { id: 1, kitNo: 'KIT-101', model: 'Pulsar 150', status: 'Ready', time: '08:15 AM' },
      { id: 2, kitNo: 'KIT-102', model: 'Dominar 400', status: 'In Progress', time: '09:00 AM' }
    ]
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
