import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

/**
 * Reusable searchable Part dropdown (Smart Search Combobox)
 * Props:
 *   parts: [{ partId, partName, partLevel }]
 *   selectedPartId: string ('All' or partId)
 *   onSelectPart: (partId) => void
 *   allowAll: boolean (default false)
 *   label: string (default 'Part')
 */
export default function SmartPartCombobox({
  parts = [],
  selectedPartId,
  onSelectPart,
  allowAll = false,
  label = 'Part'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredParts = useMemo(() => {
    if (!searchQuery.trim()) return parts;
    const q = searchQuery.toLowerCase();
    return parts.filter(
      p =>
        (p.partId && p.partId.toLowerCase().includes(q)) ||
        (p.partName && p.partName.toLowerCase().includes(q))
    );
  }, [parts, searchQuery]);

  const selectedPart = useMemo(() => {
    if (allowAll && selectedPartId === 'All') return null;
    return parts.find(p => p.partId === selectedPartId) || (!allowAll ? parts[0] : null);
  }, [parts, selectedPartId, allowAll]);

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-1 min-w-[220px]">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none flex items-center justify-between gap-2">
        <span>{label}</span>
        {!allowAll && <span className="text-[9px] text-[#0369a1] font-semibold lowercase">smart search</span>}
      </span>

      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="text-xs font-bold text-brand-dark bg-slate-50 border border-slate-200 rounded px-2.5 h-[31px] focus:outline-none focus:ring-1 focus:ring-[#0369a1] flex items-center justify-between gap-2 shadow-xs hover:bg-slate-100 transition-colors text-left"
      >
        <span className="truncate">
          {allowAll && selectedPartId === 'All' ? (
            <span className="text-slate-700">All Parts</span>
          ) : selectedPart ? (
            <span className="flex items-center gap-1.5 truncate">
              <span className="font-mono text-[11px] text-[#0369a1] font-bold bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                {selectedPart.partId}
              </span>
              <span className="truncate text-slate-700">{selectedPart.partName}</span>
            </span>
          ) : (
            <span className="text-slate-400 font-normal">Select Part...</span>
          )}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-[52px] left-0 z-50 w-[330px] bg-white border border-slate-200 rounded-lg shadow-xl p-2 flex flex-col gap-1.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search part ID or name..."
              className="w-full pl-8 pr-6 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0369a1] font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-semibold">
            <span>{filteredParts.length} parts found</span>
            <span>Click to select</span>
          </div>

          <div className="max-h-[220px] overflow-y-auto flex flex-col gap-0.5 divide-y divide-slate-100">
            {allowAll && !searchQuery.trim() && (
              <button
                type="button"
                onClick={() => {
                  onSelectPart('All');
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                className={`p-2 text-left rounded flex items-center justify-between gap-2 transition-colors ${
                  selectedPartId === 'All' ? 'bg-blue-50 text-[#0369a1]' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-xs font-bold">All Parts</span>
                {selectedPartId === 'All' && <Check className="w-4 h-4 text-[#0369a1] flex-shrink-0" />}
              </button>
            )}
            {filteredParts.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">No matching parts</div>
            ) : (
              filteredParts.map(p => {
                const isSelected = p.partId === selectedPartId;
                return (
                  <button
                    key={p.partId}
                    type="button"
                    onClick={() => {
                      onSelectPart(p.partId);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`p-2 text-left rounded flex items-center justify-between gap-2 transition-colors ${
                      isSelected ? 'bg-blue-50 text-[#0369a1]' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-900">{p.partId}</span>
                        {p.partLevel && (
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-semibold">
                            L{p.partLevel}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 truncate">{p.partName}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#0369a1] flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
