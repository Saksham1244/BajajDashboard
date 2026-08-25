const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DALI-SOFT API is running' });
});

// Mock Dashboard Data Route
app.get('/api/dashboard/production', (req, res) => {
  res.json({
    planVsActual: [
      { name: 'Shift 1', plan: 400, actual: 380 },
      { name: 'Shift 2', plan: 400, actual: 410 },
      { name: 'Shift 3', plan: 300, actual: 290 },
    ],
    straightPass: [
      { name: 'Line A', straight: 85, reworked: 15 },
      { name: 'Line B', straight: 92, reworked: 8 },
      { name: 'Line C', straight: 78, reworked: 22 },
    ]
  });
});

app.get('/api/dashboard/performance', (req, res) => {
  res.json({
    kpis: {
      ole: 82.5,
      oee: 76.4,
      availability: 91.2,
      performance: 88.3
    },
    downtime: [
      { category: 'Mechanical', duration: 120, occurrences: 5 },
      { category: 'Electrical', duration: 45, occurrences: 2 },
      { category: 'Process', duration: 80, occurrences: 8 },
      { category: 'Setup', duration: 30, occurrences: 1 },
    ]
  });
});

// Process Monitoring Mock Data
app.get('/api/process/pokayoke', (req, res) => {
  res.json({
    hourlyOkNotOk: [
      { hour: '08:00', ok: 150, notOk: 5 },
      { hour: '09:00', ok: 162, notOk: 2 },
      { hour: '10:00', ok: 145, notOk: 8 },
      { hour: '11:00', ok: 155, notOk: 3 },
      { hour: '12:00', ok: 140, notOk: 12 },
    ],
    hourlyBypass: [
      { start: '08:15', end: '08:30', duration: 15, hour: '08:00' },
      { start: '10:45', end: '11:00', duration: 15, hour: '10:00' },
      { start: '12:10', end: '12:40', duration: 30, hour: '12:00' },
    ]
  });
});

app.get('/api/process/torque', (req, res) => {
  res.json({
    torqueValues: [
      { engine: 'ENG-001', value: 45.2, target: 45.0 },
      { engine: 'ENG-002', value: 44.8, target: 45.0 },
      { engine: 'ENG-003', value: 46.1, target: 45.0 },
      { engine: 'ENG-004', value: 45.0, target: 45.0 },
      { engine: 'ENG-005', value: 43.9, target: 45.0 },
    ],
    torqueTable: [
      { id: 1, engine: 'ENG-001', device: 'Dev-A', value: 45.2, status: 'Pass', time: '08:05' },
      { id: 2, engine: 'ENG-002', device: 'Dev-B', value: 44.8, status: 'Pass', time: '08:12' },
      { id: 3, engine: 'ENG-003', device: 'Dev-A', value: 46.1, status: 'Fail', time: '08:18' },
    ]
  });
});

app.get('/api/process/conveyor', (req, res) => {
  res.json({
    topStations: [
      { name: 'Station 12', value: 45 },
      { name: 'Station 04', value: 25 },
      { name: 'Station 08', value: 20 },
      { name: 'Station 02', value: 10 },
    ],
    topReasons: [
      { name: 'Motor Fault', value: 50 },
      { name: 'Belt Slip', value: 30 },
      { name: 'Sensor Error', value: 15 },
      { name: 'Blockage', value: 5 },
    ],
    performanceTable: [
      { id: 1, line: 'Line A', station: 'Station 12', reason: 'Motor Fault', duration: '45 min', time: '09:00' },
      { id: 2, line: 'Line A', station: 'Station 04', reason: 'Belt Slip', duration: '25 min', time: '11:30' },
    ]
  });
});

// Track & Trace Mock Data
app.get('/api/trace/genealogy', (req, res) => {
  res.json({
    history: [
      { id: 1, stage: 'Block Assembly', time: '08:00 AM', status: 'OK', operator: 'John D', station: 'Stn 01' },
      { id: 2, stage: 'Piston Insertion', time: '08:15 AM', status: 'OK', operator: 'Sarah M', station: 'Stn 04' },
      { id: 3, stage: 'Head Assembly', time: '08:45 AM', status: 'Reworked', operator: 'Mike T', station: 'Stn 08' },
      { id: 4, stage: 'Testing', time: '09:30 AM', status: 'OK', operator: 'Alex B', station: 'Stn 12' },
    ]
  });
});

app.get('/api/trace/wip', (req, res) => {
  res.json({
    totalWip: 142,
    details: [
      { id: 1, engine: 'ENG-901', line: 'Line A', station: 'Stn 04', status: 'In Progress', time: '10:00 AM' },
      { id: 2, engine: 'ENG-902', line: 'Line A', station: 'Stn 08', status: 'Waiting', time: '10:15 AM' },
      { id: 3, engine: 'ENG-903', line: 'Line B', station: 'Stn 02', status: 'In Progress', time: '10:30 AM' },
    ]
  });
});

app.get('/api/trace/rework', (req, res) => {
  res.json({
    topDefects: [
      { name: 'Scratch', value: 45 },
      { name: 'Missing Bolt', value: 25 },
      { name: 'Alignment', value: 20 },
      { name: 'Seal Leak', value: 10 },
    ],
    topStations: [
      { name: 'Station 08', value: 40 },
      { name: 'Station 12', value: 30 },
      { name: 'Station 04', value: 20 },
      { name: 'Station 02', value: 10 },
    ],
    table: [
      { id: 1, engine: 'ENG-102', defect: 'Scratch', station: 'Stn 08', status: 'Pending', date: 'Oct 12' },
      { id: 2, engine: 'ENG-105', defect: 'Alignment', station: 'Stn 12', status: 'Fixed', date: 'Oct 12' },
    ]
  });
});

app.get('/api/trace/engine-rework', (req, res) => {
  res.json({
    kpis: {
      totalDefects: 3,
      reworkCount: 2,
      finalStatus: 'Cleared',
      totalReworkTime: '45 mins'
    },
    table: [
      { id: 1, defect: 'Scratch', station: 'Stn 08', action: 'Polished', timeSpent: '15 mins', date: 'Oct 12' },
      { id: 2, defect: 'Alignment', station: 'Stn 12', action: 'Re-aligned', timeSpent: '30 mins', date: 'Oct 12' },
    ]
  });
});

// Quality Module Mock Data
app.get('/api/quality/defect', (req, res) => {
  res.json({
    distribution: [
      { name: 'Mechanical', value: 45 },
      { name: 'Electrical', value: 30 },
      { name: 'Cosmetic', value: 15 },
      { name: 'Other', value: 10 },
    ],
    reasons: [
      { name: 'Scratch', value: 40 },
      { name: 'Missing Part', value: 25 },
      { name: 'Alignment', value: 20 },
      { name: 'Leakage', value: 15 },
    ],
    table: [
      { id: 1, engine: 'ENG-101', defect: 'Scratch', category: 'Cosmetic', station: 'Stn 04', status: 'Pending' },
      { id: 2, engine: 'ENG-102', defect: 'Alignment', category: 'Mechanical', station: 'Stn 08', status: 'Fixed' },
    ]
  });
});

app.get('/api/quality/pqca', (req, res) => {
  res.json({
    kpis: {
      total: 1250,
      ok: 1180,
      nc: 70,
      singleNc: 50,
      doubleNc: 20
    },
    compliance: [
      { name: 'Compliant', value: 94 },
      { name: 'Non-Compliant', value: 6 },
    ],
    categoryNc: [
      { name: 'Torque', value: 40 },
      { name: 'Visual', value: 35 },
      { name: 'Clearance', value: 25 },
    ],
    trend: [
      { date: 'Mon', nc: 12 },
      { date: 'Tue', nc: 15 },
      { date: 'Wed', nc: 8 },
      { date: 'Thu', nc: 10 },
      { date: 'Fri', nc: 25 },
    ],
    table: [
      { id: 1, checkpoint: 'Bolt Torque', category: 'Torque', value: '44 Nm', expected: '45 Nm', status: 'NC' },
      { id: 2, checkpoint: 'Gap Clearance', category: 'Clearance', value: '1.2 mm', expected: '1.0 mm', status: 'NC' },
    ]
  });
});

app.get('/api/quality/checklist', (req, res) => {
  const { type } = req.query;
  res.json({
    table: [
      { id: 1, param: 'Visual Inspection', standard: 'No Scratches', actual: 'Pass', status: 'OK', inspector: 'John D' },
      { id: 2, param: 'Fluid Levels', standard: 'Max line', actual: 'Pass', status: 'OK', inspector: 'Mike T' },
      { id: 3, param: 'Seal Check', standard: 'No Leaks', actual: 'Fail', status: 'NG', inspector: 'Sarah M' },
    ]
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
