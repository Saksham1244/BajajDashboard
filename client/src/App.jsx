import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/Auth/LoginPage'

// Production Module
import Production from './pages/Production'
import StraightPassReport from './pages/Production/StraightPassReport'

// Performance Module
import Performance from './pages/Performance'

// Placeholder for not-yet-loaded routes
import UnderConstruction from './pages/UnderConstruction'

// Lazy load all other reports to avoid a huge bundle
import { lazy, Suspense } from 'react'

const DowntimeReport         = lazy(() => import('./pages/Performance/DowntimeReport'))

const PokaYokeReport         = lazy(() => import('./pages/ProcessMonitoring/PokaYokeReport'))
const PokaYokeBypassReport   = lazy(() => import('./pages/ProcessMonitoring/PokaYokeBypassReport'))
const TorqueReport           = lazy(() => import('./pages/ProcessMonitoring/TorqueReport'))
const ConveyorReport         = lazy(() => import('./pages/ProcessMonitoring/ConveyorReport'))

const GenealogyReport        = lazy(() => import('./pages/TrackTrace/GenealogyReport'))
const WIPReport              = lazy(() => import('./pages/TrackTrace/WIPReport'))
const ReworkStatusReport     = lazy(() => import('./pages/TrackTrace/ReworkStatusReport'))
const EngineReworkReport     = lazy(() => import('./pages/TrackTrace/EngineReworkReport'))

const DefectReport           = lazy(() => import('./pages/Quality/DefectReport'))
const PQCAReport             = lazy(() => import('./pages/Quality/PQCAReport'))
const IQCChecklistReport     = lazy(() => import('./pages/Quality/IQCChecklistReport'))
const IPQCChecklistReport    = lazy(() => import('./pages/Quality/IPQCChecklistReport'))
const FQCChecklistReport     = lazy(() => import('./pages/Quality/FQCChecklistReport'))
const IQCCheckpointReport    = lazy(() => import('./pages/Quality/IQCCheckpointReport'))
const IPQCCheckpointReport   = lazy(() => import('./pages/Quality/IPQCCheckpointReport'))
const FQCCheckpointReport    = lazy(() => import('./pages/Quality/FQCCheckpointReport'))

const MaintenanceDashboard   = lazy(() => import('./pages/Maintenance/MaintenanceDashboard'))
const BreakdownReport        = lazy(() => import('./pages/Maintenance/BreakdownReport'))
const DowntimeSummaryReport  = lazy(() => import('./pages/Maintenance/DowntimeSummaryReport'))
const MTTRMTBFReport         = lazy(() => import('./pages/Maintenance/MTTRMTBFReport'))
const PMDashboard            = lazy(() => import('./pages/Maintenance/PMDashboard'))
const PMReport               = lazy(() => import('./pages/Maintenance/PMReport'))

const MaterialDashboard      = lazy(() => import('./pages/Material/MaterialDashboard'))
const MaterialRequestReport  = lazy(() => import('./pages/Material/MaterialRequestReport'))
const StockStatusReport      = lazy(() => import('./pages/Material/StockStatusReport'))
const EngineStockReport      = lazy(() => import('./pages/Material/EngineStockReport'))
const KittingDashboard       = lazy(() => import('./pages/Material/KittingDashboard'))
const KitInspectionReport    = lazy(() => import('./pages/Material/KitInspectionReport'))
const KitVsProductionReport  = lazy(() => import('./pages/Material/KitVsProductionReport'))
const MaterialConsumptionReport = lazy(() => import('./pages/Material/MaterialConsumptionReport'))

const WorkforceDashboard        = lazy(() => import('./pages/Workforce/WorkforceDashboard'))
const SkillMatrixDashboard      = lazy(() => import('./pages/Workforce/SkillMatrixDashboard'))
const AttendanceReport          = lazy(() => import('./pages/Workforce/AttendanceReport'))
const SkillMatrixReport         = lazy(() => import('./pages/Workforce/SkillMatrixReport'))
const WorkforceAllocationReport = lazy(() => import('./pages/Workforce/WorkforceAllocationReport'))

const Loading = () => (
  <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-bold animate-pulse">
    Loading report...
  </div>
)

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/production/report" replace />} />

          {/* Production Module */}
          <Route path="production">
            <Route index element={<Navigate to="report" replace />} />
            <Route path="report" element={<Production />} />
            <Route path="straight-pass" element={<StraightPassReport />} />
          </Route>

          {/* Performance Module */}
          <Route path="performance" element={<Performance />} />
          <Route path="performance/downtime" element={<Suspense fallback={<Loading />}><DowntimeReport /></Suspense>} />

          {/* Process Monitoring Module */}
          <Route path="process">
            <Route index element={<Navigate to="pokayoke" replace />} />
            <Route path="pokayoke" element={<Suspense fallback={<Loading />}><PokaYokeReport /></Suspense>} />
            <Route path="bypass" element={<Suspense fallback={<Loading />}><PokaYokeBypassReport /></Suspense>} />
            <Route path="torque" element={<Suspense fallback={<Loading />}><TorqueReport /></Suspense>} />
            <Route path="conveyor" element={<Suspense fallback={<Loading />}><ConveyorReport /></Suspense>} />
          </Route>

          {/* Track & Trace Module */}
          <Route path="trace">
            <Route index element={<Navigate to="genealogy" replace />} />
            <Route path="genealogy" element={<Suspense fallback={<Loading />}><GenealogyReport /></Suspense>} />
            <Route path="wip" element={<Suspense fallback={<Loading />}><WIPReport /></Suspense>} />
            <Route path="rework" element={<Suspense fallback={<Loading />}><ReworkStatusReport /></Suspense>} />
            <Route path="engine-rework" element={<Suspense fallback={<Loading />}><EngineReworkReport /></Suspense>} />
          </Route>

          {/* Quality Module */}
          <Route path="quality">
            <Route index element={<Navigate to="defect" replace />} />
            <Route path="defect" element={<Suspense fallback={<Loading />}><DefectReport /></Suspense>} />
            <Route path="pqca" element={<Suspense fallback={<Loading />}><PQCAReport /></Suspense>} />
            <Route path="iqc-checklist" element={<Suspense fallback={<Loading />}><IQCChecklistReport /></Suspense>} />
            <Route path="ipqc-checklist" element={<Suspense fallback={<Loading />}><IPQCChecklistReport /></Suspense>} />
            <Route path="fqc-checklist" element={<Suspense fallback={<Loading />}><FQCChecklistReport /></Suspense>} />
            <Route path="iqc-checkpoint" element={<Suspense fallback={<Loading />}><IQCCheckpointReport /></Suspense>} />
            <Route path="ipqc-checkpoint" element={<Suspense fallback={<Loading />}><IPQCCheckpointReport /></Suspense>} />
            <Route path="fqc-checkpoint" element={<Suspense fallback={<Loading />}><FQCCheckpointReport /></Suspense>} />
          </Route>

          {/* Maintenance Module */}
          <Route path="maintenance">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Suspense fallback={<Loading />}><MaintenanceDashboard /></Suspense>} />
            <Route path="breakdown" element={<Suspense fallback={<Loading />}><BreakdownReport /></Suspense>} />
            <Route path="downtime-summary" element={<Suspense fallback={<Loading />}><DowntimeSummaryReport /></Suspense>} />
            <Route path="mttr-mtbf" element={<Suspense fallback={<Loading />}><MTTRMTBFReport /></Suspense>} />
          </Route>

          {/* Material & Kitting Module */}
          <Route path="material">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Suspense fallback={<Loading />}><MaterialDashboard /></Suspense>} />
            <Route path="request" element={<Suspense fallback={<Loading />}><MaterialRequestReport /></Suspense>} />
            <Route path="stock" element={<Suspense fallback={<Loading />}><StockStatusReport /></Suspense>} />
            <Route path="engine-stock" element={<Suspense fallback={<Loading />}><EngineStockReport /></Suspense>} />
            <Route path="kitting-dashboard" element={<Suspense fallback={<Loading />}><KittingDashboard /></Suspense>} />
            <Route path="kit-inspection" element={<Suspense fallback={<Loading />}><KitInspectionReport /></Suspense>} />
            <Route path="kit-production" element={<Suspense fallback={<Loading />}><KitVsProductionReport /></Suspense>} />
            <Route path="consumption" element={<Suspense fallback={<Loading />}><MaterialConsumptionReport /></Suspense>} />
          </Route>

          {/* Workforce Module */}
          <Route path="workforce">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Suspense fallback={<Loading />}><WorkforceDashboard /></Suspense>} />
            <Route path="skill-matrix-dashboard" element={<Suspense fallback={<Loading />}><SkillMatrixDashboard /></Suspense>} />
            <Route path="attendance" element={<Suspense fallback={<Loading />}><AttendanceReport /></Suspense>} />
            <Route path="skill-matrix" element={<Suspense fallback={<Loading />}><SkillMatrixReport /></Suspense>} />
            <Route path="skill-matrix-report" element={<Suspense fallback={<Loading />}><SkillMatrixReport /></Suspense>} />
            <Route path="allocation" element={<Suspense fallback={<Loading />}><WorkforceAllocationReport /></Suspense>} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<UnderConstruction />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
