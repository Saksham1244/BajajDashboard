import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Header({ sidebarOpen, setSidebarOpen }) {
  return (
    <header className="print:hidden h-[72px] bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between flex-shrink-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all duration-200 border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 shadow-sm"
          title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-5 h-5 transition-transform duration-200" />
          ) : (
            <ChevronRight className="w-5 h-5 transition-transform duration-200" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-4">
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
