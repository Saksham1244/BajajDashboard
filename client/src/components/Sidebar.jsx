import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { 
  LayoutDashboard, 
  Activity, 
  Settings2, 
  Network, 
  CheckCircle2, 
  User, 
  LogOut, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Wrench,
  Package,
  Users
} from 'lucide-react'

const navItems = [
  { 
    name: 'Production Management', 
    icon: LayoutDashboard,
    subItems: [
      { path: '/production/report', name: 'Production Report' },
      { path: '/production/straight-pass', name: 'Straight Pass Report' },
    ]
  },
  { 
    name: 'Performance Management', 
    icon: Activity,
    subItems: [
      { path: '/performance', name: 'Performance Report' },
      { path: '/performance/downtime', name: 'Downtime (Loss) Report' },
    ]
  },
  { 
    name: 'Process Monitoring', 
    icon: Settings2,
    subItems: [
      { path: '/process/pokayoke', name: 'Poka Yoke Report' },
      { path: '/process/bypass', name: 'Poka Yoke Bypass Report' },
      { path: '/process/torque', name: 'Torque Report' },
      { path: '/process/conveyor', name: 'Process Parameter: Conveyor' },
    ]
  },
  { 
    name: 'Track & Trace', 
    icon: Network,
    subItems: [
      { path: '/trace/genealogy', name: 'Genealogy Report' },
      { path: '/trace/wip', name: 'WIP Report' },
      { path: '/trace/rework', name: 'Rework Status Report' },
      { path: '/trace/engine-rework', name: 'Engine Wise Rework Summary' },
    ]
  },
  { 
    name: 'Quality Module', 
    icon: CheckCircle2,
    subItems: [
      { path: '/quality/defect', name: 'Defect Report' },
      { path: '/quality/pqca', name: 'PQCA Report' },
      { path: '/quality/iqc-checklist', name: 'IQC Checklist Report' },
      { path: '/quality/ipqc-checklist', name: 'IPQC Checklist Report' },
      { path: '/quality/fqc-checklist', name: 'FQC Checklist Report' },
      { path: '/quality/iqc-checkpoint', name: 'IQC Checkpoint Report' },
      { path: '/quality/ipqc-checkpoint', name: 'IPQC Checkpoint Report' },
      { path: '/quality/fqc-checkpoint', name: 'FQC Checkpoint Report' },
    ]
  },
  {
    name: 'Maintenance Module',
    icon: Wrench,
    subItems: [
      { path: '/maintenance/dashboard', name: 'Maintenance Dashboard' },
      { path: '/maintenance/breakdown', name: 'Breakdown Report' },
      { path: '/maintenance/downtime', name: 'Downtime Summary Report' },
      { path: '/maintenance/mttr-mtbf', name: 'MTTR MTBF Report' },
      { path: '/maintenance/pm-dashboard', name: 'PM Dashboard' },
      { path: '/maintenance/pm-report', name: 'PM Report' },
    ]
  },
  {
    name: 'Material & Kitting',
    icon: Package,
    subItems: [
      { path: '/material/dashboard', name: 'Material Dashboard' },
      { path: '/material/request', name: 'Material Request Report' },
      { path: '/material/stock', name: 'Stock Status Report' },
      { path: '/material/engine-stock', name: 'Engine Stock Status Report' },
      { path: '/material/kitting-dashboard', name: 'Kitting Dashboard' },
      { path: '/material/kit-inspection', name: 'Kit Inspection Report' },
      { path: '/material/kit-production', name: 'Kit vs Production Report' },
      { path: '/material/consumption', name: 'Material Consumption Report' },
    ]
  },
  {
    name: 'Workforce Module',
    icon: Users,
    subItems: [
      { path: '/workforce/dashboard', name: 'Workforce Dashboard' },
      { path: '/workforce/skill-matrix-dashboard', name: 'Skill Matrix Dashboard' },
      { path: '/workforce/attendance', name: 'Attendance Report' },
      { path: '/workforce/skill-matrix-report', name: 'Skill Matrix Report' },
      { path: '/workforce/allocation', name: 'Workforce Allocation Report' },
    ]
  }
]

const searchIndex = navItems.flatMap(module => 
  module.subItems ? module.subItems.map(sub => ({ name: sub.name, path: sub.path })) : []
)

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth()
  const [expandedMenus, setExpandedMenus] = useState({ 'Process Monitoring': true })
  const location = useLocation()
  const navigate = useNavigate()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)

  const filteredResults = searchIndex.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (path) => {
    navigate(path)
    setSearchTerm('')
    setShowResults(false)
  }

  const toggleMenu = (name) => {
    if (isOpen) {
      setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }))
    }
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 80 }}
      className="print:hidden bg-brand-dark text-slate-300 flex-shrink-0 z-20 hidden md:flex flex-col relative h-full transition-all duration-300"
    >
      {/* Search Header Area */}
      <div className="h-[72px] flex-shrink-0 border-b border-slate-800 px-4 flex items-center justify-center relative" ref={searchRef}>
        {isOpen ? (
          <div className="w-full relative">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 rounded-lg border border-slate-700/50 focus-within:border-brand-accent focus-within:bg-slate-800 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowResults(true)
                }}
                onFocus={() => setShowResults(true)}
                className="bg-transparent border-none outline-none text-sm w-full text-slate-200 placeholder:text-slate-500"
              />
            </div>

            <AnimatePresence>
              {showResults && searchTerm && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 w-[240px] bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden z-50"
                >
                  {filteredResults.length > 0 ? (
                    <ul className="max-h-64 overflow-y-auto py-2 custom-scrollbar">
                      {filteredResults.map((result, idx) => (
                        <li key={idx}>
                          <button
                            onClick={() => handleSelect(result.path)}
                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                          >
                            {result.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500 text-center">
                      No reports found
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400">
            <Search className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 no-scrollbar">
        {navItems.map((item) => {
          const hasSubItems = !!item.subItems
          const isExpanded = expandedMenus[item.name]
          const isChildActive = hasSubItems && item.subItems.some(sub => location.pathname.startsWith(sub.path))
          const isItemActive = !hasSubItems && location.pathname.startsWith(item.path)

          return (
            <div key={item.name} className="flex flex-col">
              {hasSubItems ? (
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`
                    flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 w-full
                    ${isChildActive ? 'bg-slate-800/80 text-white' : 'hover:bg-slate-800/50 hover:text-white'}
                  `}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 flex-shrink-0 text-brand-secondary" />
                    {isOpen && <span className="ml-3 whitespace-nowrap font-medium text-sm">{item.name}</span>}
                  </div>
                  {isOpen && (
                    <div className="flex-shrink-0 ml-2">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  )}
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  className={`
                    flex items-center px-3 py-3 rounded-xl transition-all duration-200
                    ${isItemActive ? 'bg-brand-accent/20 text-brand-accent font-medium' : 'hover:bg-slate-800/50 hover:text-white'}
                  `}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0 text-brand-secondary" />
                  {isOpen && <span className="ml-3 whitespace-nowrap font-medium text-sm">{item.name}</span>}
                </NavLink>
              )}

              {/* Sub Items */}
              <AnimatePresence>
                {hasSubItems && isOpen && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden ml-9 mt-1 space-y-1"
                  >
                      {item.subItems.map(sub => (
                        <NavLink key={sub.path} to={sub.path} end
                          className={({ isActive }) => `
                            block px-3 py-2 text-sm transition-all duration-200 border-l-2
                            ${isActive ? 'border-brand-accent text-white font-medium bg-slate-800/30' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800/10'}
                          `}
                        >
                          {sub.name}
                        </NavLink>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      {/* User Footer */}
      <div className="flex-shrink-0 border-t border-slate-800/80 bg-slate-950/40 p-3.5">
        {isOpen ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-900/30 ring-2 ring-white/10">
                  {user?.UserName ? user.UserName.charAt(0).toUpperCase() : <User className="w-5 h-5 text-white" />}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-sm font-semibold text-white truncate tracking-tight">{user?.UserName || 'admin'}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                  <span className="font-medium text-slate-300">ID: #{user?.UserID || '2'}</span>
                  <span>•</span>
                  <span className="text-sky-400 font-medium">{user?.DepartmentRoleID === 1 ? 'Administrator' : 'Plant Operator'}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20 border border-transparent hover:border-red-500/20 transition-all cursor-pointer flex-shrink-0" 
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="relative" title={`${user?.UserName || 'admin'} (ID: #${user?.UserID || '2'} • ${user?.DepartmentRoleID === 1 ? 'Administrator' : 'Plant Operator'})`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-900/30 ring-2 ring-white/10">
                {user?.UserName ? user.UserName.charAt(0).toUpperCase() : <User className="w-4 h-4 text-white" />}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            <button 
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20 transition-colors cursor-pointer" 
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  )
}


