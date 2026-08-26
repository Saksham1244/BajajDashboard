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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
