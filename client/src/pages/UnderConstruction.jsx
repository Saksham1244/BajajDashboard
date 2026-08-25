import React from 'react';
import { Hammer, AlertTriangle } from 'lucide-react';

export default function UnderConstruction() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-8 m-4">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <Hammer className="w-10 h-10 text-[#0369a1]" />
      </div>
      <h2 className="text-2xl font-black text-slate-700 mb-2">Under Development</h2>
      <p className="text-slate-500 text-center max-w-md mb-8">
        This module is currently being built. It will integrate directly with your database schema to provide real-time metrics.
      </p>
      
      <div className="flex gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3 w-48">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
            <p className="text-sm font-bold text-brand-dark">Pending UI</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3 w-48">
          <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Next Step</p>
            <p className="text-sm font-bold text-brand-dark">Database Integration</p>
          </div>
        </div>
      </div>
    </div>
  );
}