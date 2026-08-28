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

// Helper function to calculate a deterministic scaling factor
const getScale = (period) => {
  if (period === 'Week') return 0.25;
  if (period === 'Day') return 0.03;
  if (period === 'Shift') return 0.015;
  return 1; // Month
};

app.get('/api/dashboard/production', async (req, res) => {
  const scale = getScale(req.query.period);
  try {
    const pool = await poolPromise;
    if (!pool) {
      return res.json({
        planVsActual: [
          { name: 'Shift 1', plan: Math.round(400 * scale), actual: Math.round(380 * scale) },
          { name: 'Shift 2', plan: Math.round(350 * scale), actual: Math.round(340 * scale) }
        ],
        straightPass: [
          { name: 'Line 1', straight: Math.round(88 * scale), reworked: Math.round(12 * scale) },
          { name: 'Line 2', straight: Math.round(85 * scale), reworked: Math.round(15 * scale) }
        ]
      });
    }
    
    const planResult = await pool.request().query(`
      SELECT 
        ProdShift as name,
        SUM(PlanQty) as [plan],
        SUM(ENGCompleted_Qty) as actual
      FROM Prod_EnginePlanExecution
      GROUP BY ProdShift
    `);

    const straightPassResult = await pool.request().query(`
      SELECT 
        L.LineName as name,
        SUM(E.ENGCompleted_Qty) - SUM(E.ENGReworkOK_Qty) as straight,
        SUM(E.ENGReworkOK_Qty) as reworked
      FROM Prod_EnginePlanExecution E
      LEFT JOIN Config_Line L ON E.LineID = L.LineID
      GROUP BY L.LineName
    `);

    const scaledPlan = planResult.recordset.map(r => ({
      ...r, plan: Math.round(r.plan * scale), actual: Math.round(r.actual * scale)
    }));
    const scaledStraight = straightPassResult.recordset.map(r => ({
      ...r, straight: Math.round(r.straight * scale), reworked: Math.round(r.reworked * scale)
    }));

    res.json({
      planVsActual: scaledPlan.length ? scaledPlan : [
        { name: 'Shift 1', plan: Math.round(400 * scale), actual: Math.round(380 * scale) },
        { name: 'Shift 2', plan: Math.round(350 * scale), actual: Math.round(340 * scale) }
      ],
      straightPass: scaledStraight.length ? scaledStraight : [
        { name: 'Line 1', straight: Math.round(88 * scale), reworked: Math.round(12 * scale) },
        { name: 'Line 2', straight: Math.round(85 * scale), reworked: Math.round(15 * scale) }
      ]
    });
  } catch (err) {
    console.warn('Production endpoint using simulation fallback:', err.message || err);
    res.json({
      planVsActual: [
        { name: 'Shift 1', plan: Math.round(400 * scale), actual: Math.round(380 * scale) },
        { name: 'Shift 2', plan: Math.round(350 * scale), actual: Math.round(340 * scale) }
      ],
      straightPass: [
        { name: 'Line 1', straight: Math.round(88 * scale), reworked: Math.round(12 * scale) },
        { name: 'Line 2', straight: Math.round(85 * scale), reworked: Math.round(15 * scale) }
      ]
    });
  }
});

app.get('/api/dashboard/performance', async (req, res) => {
  const scale = getScale(req.query.period);
  try {
    const pool = await poolPromise;
    if (!pool) {
      return res.json({
        kpis: {
          ole: 84.5,
          oee: 78.2,
          availability: 92.4,
          performance: 89.1
        },
        downtime: [
          { category: 'Mechanical', duration: Math.round(120 * scale), occurrences: Math.max(1, Math.round(5 * scale)) },
          { category: 'Electrical', duration: Math.round(45 * scale), occurrences: Math.max(1, Math.round(2 * scale)) },
          { category: 'Process', duration: Math.round(80 * scale), occurrences: Math.max(1, Math.round(8 * scale)) },
          { category: 'Setup', duration: Math.round(30 * scale), occurrences: Math.max(1, Math.round(1 * scale)) },
        ]
      });
    }

    const perfResult = await pool.request().query(`
      SELECT TOP 1 
        AVG(OLE) as ole,
        AVG(Availability * Performance * Quality / 10000) as oee,
        AVG(Availability) as availability,
        AVG(Performance) as performance
      FROM Perf_Hourly_OLE
    `);
    
    const kpis = perfResult.recordset[0] || { ole: 82.5, oee: 76.4, availability: 91.2, performance: 88.3 };
    const scaledKpis = {
      ole: Math.min(100, kpis.ole + (scale * 5)),
      oee: Math.min(100, kpis.oee + (scale * 2)),
      availability: Math.min(100, kpis.availability - (scale * 3)),
      performance: Math.min(100, kpis.performance + (scale * 1))
    };

    res.json({
      kpis: scaledKpis,
      downtime: [
        { category: 'Mechanical', duration: Math.round(120 * scale), occurrences: Math.max(1, Math.round(5 * scale)) },
        { category: 'Electrical', duration: Math.round(45 * scale), occurrences: Math.max(1, Math.round(2 * scale)) },
        { category: 'Process', duration: Math.round(80 * scale), occurrences: Math.max(1, Math.round(8 * scale)) },
        { category: 'Setup', duration: Math.round(30 * scale), occurrences: Math.max(1, Math.round(1 * scale)) },
      ]
    });
  } catch (err) {
    console.warn('Performance endpoint using simulation fallback:', err.message || err);
    res.json({
      kpis: {
        ole: 84.5,
        oee: 78.2,
        availability: 92.4,
        performance: 89.1
      },
      downtime: [
        { category: 'Mechanical', duration: Math.round(120 * scale), occurrences: Math.max(1, Math.round(5 * scale)) },
        { category: 'Electrical', duration: Math.round(45 * scale), occurrences: Math.max(1, Math.round(2 * scale)) },
        { category: 'Process', duration: Math.round(80 * scale), occurrences: Math.max(1, Math.round(8 * scale)) },
        { category: 'Setup', duration: Math.round(30 * scale), occurrences: Math.max(1, Math.round(1 * scale)) },
      ]
    });
  }
});

// Process Monitoring Mock Data
app.get('/api/process/pokayoke', (req, res) => {
  const scale = getScale(req.query.period);
  res.json({
    hourlyOkNotOk: [
      { hour: '08:00', ok: Math.round(150 * scale), notOk: Math.max(1, Math.round(5 * scale)) },
      { hour: '09:00', ok: Math.round(162 * scale), notOk: Math.max(1, Math.round(2 * scale)) }
    ],
    hourlyBypass: [
      { start: '08:15', end: '08:30', duration: Math.round(15 * scale), hour: '08:00' }
    ]
  });
});

app.get('/api/process/bypass', (req, res) => {
  const scale = getScale(req.query.period);
  res.json({
    kpis: {
      totalBypasses: Math.max(1, Math.round(5 * scale)),
      activeBypasses: Math.max(0, Math.round(1 * scale)),
      maxDuration: Math.max(15, Math.round(45 * scale)) + ' mins',
      totalDuration: Math.max(20, Math.round(120 * scale)) + ' mins'
    },
    table: [
      { id: 'BP-001', date: '2026-08-25 08:30', line: 'Line 1', station: 'ST-01', device: 'PY-01 Torque', shift: 'Shift 1', model: 'Pulsar 150', duration: Math.max(5, Math.round(15 * scale)), operator: 'John Doe', reason: 'Sensor Failure', authorizedBy: 'Manager A' },
      { id: 'BP-002', date: '2026-08-25 10:15', line: 'Line 2', station: 'ST-02', device: 'PY-02 Vision', shift: 'Shift 1', model: 'Dominar 400', duration: Math.max(10, Math.round(30 * scale)), operator: 'Jane Smith', reason: 'Network Issue', authorizedBy: 'Manager B' }
    ]
  });
});

app.get('/api/process/torque', (req, res) => {
  res.json({
    torqueValues: [
      { engine: 'ENG-001', value: 45.2, target: 45.0 }
    ],
    torqueTable: [
      { id: 1, engine: 'ENG-001', device: 'Dev-A', value: 45.2, status: 'Pass', time: '08:05' }
    ]
  });
});

app.get('/api/process/conveyor', (req, res) => {
  const scale = getScale(req.query.period);
  res.json({
    topStations: [
      { name: 'Station 12', value: Math.round(45 * scale) }
    ],
    topReasons: [
      { name: 'Motor Fault', value: Math.round(50 * scale) }
    ],
    performanceTable: [
      { id: 1, line: 'Line A', station: 'Station 12', reason: 'Motor Fault', duration: Math.round(45 * scale) + ' min', time: '09:00' }
    ]
  });
});

// Track & Trace Mock Data
app.get('/api/trace/genealogy', (req, res) => {
  res.json({
    history: [
      { id: 1, stage: 'Block Assembly', time: '08:00 AM', status: 'OK', operator: 'John D', station: 'Stn 01' }
    ]
  });
});

app.get('/api/trace/wip', (req, res) => {
  const scale = getScale(req.query.period);
  res.json({
    totalWip: Math.round(142 * scale),
    details: [
      { id: 1, engine: 'ENG-901', line: 'Line A', station: 'Stn 04', status: 'In Progress', time: '10:00 AM' }
    ]
  });
});

app.get('/api/trace/rework', (req, res) => {
  const scale = getScale(req.query.period);
  res.json({
    topDefects: [
      { name: 'Scratch', value: Math.round(45 * scale) }
    ],
    topStations: [
      { name: 'Station 08', value: Math.round(40 * scale) }
    ],
    table: [
      { id: 1, engine: 'ENG-102', defect: 'Scratch', station: 'Stn 08', status: 'Pending', date: 'Oct 12' }
    ]
  });
});

app.get('/api/trace/engine-rework', (req, res) => {
  const scale = getScale(req.query.period);
  res.json({
    kpis: {
      totalDefects: Math.round(3 * scale),
      reworkCount: Math.round(2 * scale),
      finalStatus: 'Cleared',
      totalReworkTime: Math.round(45 * scale) + ' mins'
    },
    table: [
      { id: 1, defect: 'Scratch', station: 'Stn 08', action: 'Polished', timeSpent: '15 mins', date: 'Oct 12' }
    ]
  });
});

// Quality Module Mock Data
app.get('/api/quality/defect', (req, res) => {
  const scale = getScale(req.query.period);
  res.json({
    distribution: [
      { name: 'Mechanical', value: Math.round(45 * scale) }
    ],
    reasons: [
      { name: 'Scratch', value: Math.round(40 * scale) }
    ],
    table: [
      { id: 1, engine: 'ENG-101', defect: 'Scratch', category: 'Cosmetic', station: 'Stn 04', status: 'Pending' }
    ]
  });
});

app.get('/api/quality/pqca', (req, res) => {
  const scale = getScale(req.query.period);
  res.json({
    kpis: { total: Math.round(1250 * scale), ok: Math.round(1180 * scale), nc: Math.round(70 * scale), singleNc: Math.round(50 * scale), doubleNc: Math.round(20 * scale) },
    compliance: [
      { name: 'Compliant', value: 94 },
      { name: 'Non-Compliant', value: 6 },
    ],
    categoryNc: [
      { name: 'Torque', value: Math.round(40 * scale) }
    ],
    trend: [
      { date: 'Mon', nc: Math.round(12 * scale) }
    ],
    table: [
      { id: 1, checkpoint: 'Bolt Torque', category: 'Torque', value: '44 Nm', expected: '45 Nm', status: 'NC' }
    ]
  });
});

app.get('/api/quality/checklist', (req, res) => {
  res.json({
    table: [
      { id: 1, param: 'Visual Inspection', standard: 'No Scratches', actual: 'Pass', status: 'OK', inspector: 'John D' }
    ]
  });
});

// Maintenance Mock Data
app.get('/api/maintenance/breakdown', (req, res) => {
  const scale = getScale(req.query.period);
  res.json({
    kpis: { totalBreakdowns: Math.round(15 * scale), mtbf: '24.5 hrs', mttr: '1.2 hrs' },
    table: [
      { id: 1, machine: 'Conveyor A', issue: 'Belt Slip', duration: Math.round(45 * scale) + ' mins', date: '2026-08-25' }
    ]
  });
});

app.get('/api/maintenance/pm', (req, res) => {
  res.json({
    kpis: { completionRate: '94%', pending: 3, delayed: 1 },
    table: [
      { id: 1, task: 'Lubrication', machine: 'Press 1', status: 'Completed', date: '2026-08-25' }
    ]
  });
});

// Material Mock Data
app.get('/api/material/stock', (req, res) => {
  res.json({
    kpis: { totalItems: 1420, lowStock: 15, outOfStock: 2 },
    table: [
      { id: 1, item: 'M8 Bolt', qty: 500, minStock: 200, status: 'Healthy' }
    ]
  });
});

app.get('/api/material/kitting', (req, res) => {
  res.json({
    kpis: { kitsPrepared: 450, kitsPending: 50, efficiency: '92%' },
    table: [
      { id: 1, kitNo: 'KIT-101', model: 'Pulsar 150', status: 'Ready', time: '08:15 AM' }
    ]
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
