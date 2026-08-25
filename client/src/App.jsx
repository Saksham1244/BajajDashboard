import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Lenis from '@studio-freight/lenis'
import Layout from './components/Layout'

// Pages
import Production from './pages/Production'
import StraightPassReport from './pages/Production/StraightPassReport'
import Performance from './pages/Performance'
import PokaYokeReport from './pages/ProcessMonitoring/PokaYokeReport'
import PokaYokeBypassReport from './pages/ProcessMonitoring/PokaYokeBypassReport'
import TorqueReport from './pages/ProcessMonitoring/TorqueReport'
import ConveyorReport from './pages/ProcessMonitoring/ConveyorReport'

// Track & Trace Pages
import GenealogyReport from './pages/TrackTrace/GenealogyReport'
import WIPReport from './pages/TrackTrace/WIPReport'
import ReworkStatusReport from './pages/TrackTrace/ReworkStatusReport'
import EngineReworkReport from './pages/TrackTrace/EngineReworkReport'

// Quality Module Pages
import DefectReport from './pages/Quality/DefectReport'
import PQCAReport from './pages/Quality/PQCAReport'
import GenericChecklistReport from './pages/Quality/GenericChecklistReport'

// Placeholder
import UnderConstruction from './pages/UnderConstruction'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/production/report" replace />} />
        
        {/* Production Module */}
        <Route path="production">
          <Route index element={<Navigate to="report" replace />} />
          <Route path="report" element={<Production />} />
          <Route path="straight-pass" element={<StraightPassReport />} />
        </Route>

        <Route path="performance" element={<Performance />} />
        <Route path="performance/downtime" element={<UnderConstruction />} />
        
        {/* Process Monitoring Module */}
        <Route path="process">
          <Route index element={<Navigate to="pokayoke" replace />} />
          <Route path="pokayoke" element={<PokaYokeReport />} />
          <Route path="bypass" element={<PokaYokeBypassReport />} />
          <Route path="torque" element={<TorqueReport />} />
          <Route path="conveyor" element={<ConveyorReport />} />
        </Route>

        {/* Track & Trace Module */}
        <Route path="trace">
          <Route index element={<Navigate to="genealogy" replace />} />
          <Route path="genealogy" element={<GenealogyReport />} />
          <Route path="wip" element={<WIPReport />} />
          <Route path="rework" element={<ReworkStatusReport />} />
          <Route path="engine-rework" element={<EngineReworkReport />} />
        </Route>

        {/* Quality Module */}
        <Route path="quality">
          <Route index element={<Navigate to="defect" replace />} />
          <Route path="defect" element={<DefectReport />} />
          <Route path="pqca" element={<PQCAReport />} />
          
          <Route path="iqc-checklist" element={<GenericChecklistReport title="IQC Checklist Report" typeStr="IQC" />} />
          <Route path="ipqc-checklist" element={<GenericChecklistReport title="IPQC Checklist Report" typeStr="IPQC" />} />
          <Route path="fqc-checklist" element={<GenericChecklistReport title="FQC Checklist Report" typeStr="FQC" />} />
          
          <Route path="iqc-checkpoint" element={<GenericChecklistReport title="IQC Checkpoint Report" typeStr="IQC-CHK" />} />
          <Route path="ipqc-checkpoint" element={<GenericChecklistReport title="IPQC Checkpoint Report" typeStr="IPQC-CHK" />} />
          <Route path="fqc-checkpoint" element={<GenericChecklistReport title="FQC Checkpoint Report" typeStr="FQC-CHK" />} />
        </Route>

        {/* Catch-all for unbuilt routes mapped in the Sidebar */}
        <Route path="*" element={<UnderConstruction />} />
      </Route>
    </Routes>
  )
}

export default App
