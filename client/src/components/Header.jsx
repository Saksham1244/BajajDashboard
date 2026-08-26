import { Menu } from 'lucide-react'

export default function Header({ sidebarOpen, setSidebarOpen }) {
  return (
    <header className="print:hidden h-[72px] bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between flex-shrink-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-10 w-32 flex justify-end overflow-hidden">
          <img 
            src="/bajaj-logo.png" 
            alt="Bajaj Logo" 
            className="w-full h-full object-contain scale-[1.3] origin-right"
          />
        </div>
      </div>
    </header>
  )
}


