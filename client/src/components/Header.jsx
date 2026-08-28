import { Menu, LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth()

  return (
    <header className="print:hidden h-[72px] bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between flex-shrink-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-5">
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 flex items-center justify-center font-bold text-xs">
                {user.UserName ? user.UserName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-none">
                  {user.UserName || 'Logged In'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                  ID: #{user.UserID} • Role: {user.DepartmentRoleID === 1 ? 'Supervisor/Admin' : 'Operator'}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        )}

        <div className="h-14 w-48 flex justify-end">
          <img 
            src="/bajaj-logo.png" 
            alt="Bajaj Logo" 
            className="w-full h-full object-contain object-right"
          />
        </div>
      </div>
    </header>
  )
}
