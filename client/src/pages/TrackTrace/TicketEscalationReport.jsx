import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  X,
  RefreshCw,
  ShieldAlert,
  MessageSquare,
  Check,
  Copy
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import useReportFilters from '../../hooks/useReportFilters';

export default function TicketEscalationReport() {
  const { period, shift, startDate, endDate, setPeriod, setShift, setStartDate, setEndDate } = useReportFilters();

  // Filters (Line filter is completely removed)
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCreatedBy, setSelectedCreatedBy] = useState('All');
  const [selectedActionBy, setSelectedActionBy] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveShiftActive, setLiveShiftActive] = useState(true);

  // Data & State
  const [data, setData] = useState({ kpis: {}, tickets: [], filterOptions: {} });
  const [loading, setLoading] = useState(true);
  const [expandedTicketIds, setExpandedTicketIds] = useState(new Set()); // All tickets collapsed by default
  const [copiedId, setCopiedId] = useState(null);

  // Fetch Data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (shift && shift !== 'All') params.append('shift', shift);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedStatus && selectedStatus !== 'All') params.append('status', selectedStatus);
      if (selectedCreatedBy && selectedCreatedBy !== 'All') params.append('createdBy', selectedCreatedBy);
      if (selectedActionBy && selectedActionBy !== 'All') params.append('actionBy', selectedActionBy);

      const res = await fetch(`/api/trace/ticket-escalation?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching ticket escalation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, shift, startDate, endDate, selectedStatus, selectedCreatedBy, selectedActionBy]);

  // Instant, robust client-side search filtering across all ticket fields, communications, and holds
  const filteredTickets = useMemo(() => {
    if (!data.tickets || !Array.isArray(data.tickets)) return [];
    let list = data.tickets;

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const cleanId = q.replace(/^tkt-?/i, '').trim();

      list = list.filter(t => {
        // Ticket ID matching (e.g. 5, "5", "tkt-5", "TKT-5")
        if (cleanId && String(t.TicketID) === cleanId) return true;
        if (String(t.TicketID).includes(q)) return true;
        if (`tkt-${t.TicketID}`.toLowerCase().includes(q)) return true;

        // Core fields
        if (t.EngineNo && t.EngineNo.toLowerCase().includes(q)) return true;
        if (t.Reason && t.Reason.toLowerCase().includes(q)) return true;
        if (t.Remark && t.Remark.toLowerCase().includes(q)) return true;
        if (t.LineName && t.LineName.toLowerCase().includes(q)) return true;
        if (t.StationName && t.StationName.toLowerCase().includes(q)) return true;
        if (t.PartName && t.PartName.toLowerCase().includes(q)) return true;
        if (t.EquipmentName && t.EquipmentName.toLowerCase().includes(q)) return true;
        if (t.ActivityDesc && t.ActivityDesc.toLowerCase().includes(q)) return true;
        if (t.BreakdownID && String(t.BreakdownID).toLowerCase().includes(q)) return true;
        if (t.RaiseBy && t.RaiseBy.toLowerCase().includes(q)) return true;
        if (t.ActionBy && t.ActionBy.toLowerCase().includes(q)) return true;
        if (t.statusText && t.statusText.toLowerCase().includes(q)) return true;
        if (t.isEscalated && (q.includes('escalat') || q === 'alert' || q === 'urgent')) return true;

        // Sub communication fields
        if (t.communications?.some(c => 
          c.Remark?.toLowerCase().includes(q) || 
          c.Department?.toLowerCase().includes(q) || 
          c.Role?.toLowerCase().includes(q)
        )) return true;

        // Sub hold & defect fields
        if (t.engineHold?.holdSummary?.some(h => 
          h.PartID?.toLowerCase().includes(q) || 
          h.PartBatchID?.toLowerCase().includes(q) || 
          h.HoldType?.toLowerCase().includes(q) ||
          h.Status?.toLowerCase().includes(q)
        )) return true;

        if (t.engineHold?.defectDetails?.some(d => 
          d.DefectPoint?.toLowerCase().includes(q) || 
          d.Remark?.toLowerCase().includes(q) || 
          d.InspectionPoint?.toLowerCase().includes(q) ||
          d.UpdatedBy?.toLowerCase().includes(q)
        )) return true;

        return false;
      });
    }

    return list;
  }, [data.tickets, searchQuery]);

  // Dynamic KPIs matching filtered results
  const dynamicKpis = useMemo(() => {
    const list = filteredTickets;
    return {
      totalCreated: list.length,
      totalOpened: list.filter(t => t.statusText === 'Open').length,
      totalClosed: list.filter(t => t.statusText === 'Closed').length,
      totalEscalated: list.filter(t => t.isEscalated).length
    };
  }, [filteredTickets]);

  // Toggle Ticket Accordion
  const toggleExpand = (ticketId) => {
    setExpandedTicketIds(prev => {
      const next = new Set(prev);
      if (next.has(ticketId)) {
        next.delete(ticketId);
      } else {
        next.add(ticketId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set(filteredTickets.map(t => t.TicketID));
    setExpandedTicketIds(allIds);
  };

  const collapseAll = () => {
    setExpandedTicketIds(new Set());
  };

  // Copy Ticket ID
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(String(text));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export to Excel (Multiple Sheets for Ticket, Communication, Hold & Defects)
  const handleExportExcel = () => {
    if (!filteredTickets || filteredTickets.length === 0) return;

    // Sheet 1: Ticket Details
    const ticketRows = filteredTickets.map(t => ({
      'Ticket ID': `TKT-${t.TicketID}`,
      'Reason': t.Reason,
      'Date & Time': t.TimeDate ? new Date(t.TimeDate).toLocaleString('en-IN') : '-',
      'Line Name': t.LineName,
      'Station Name': t.StationName,
      'Activity Description': t.ActivityDesc,
      'Part Name': t.PartName,
      'Equipment Name': t.EquipmentName,
      'Breakdown ID': t.BreakdownID,
      'Engine No': t.EngineNo,
      'Raised By': t.RaiseBy,
      'Action By': t.ActionBy,
      'Remark': t.Remark,
      'Expected Closure': t.ExpectedClosure ? new Date(t.ExpectedClosure).toLocaleDateString('en-IN') : '-',
      'Status': t.statusText,
      'Escalated': t.isEscalated ? 'YES' : 'NO'
    }));

    const sheets = [{ name: 'Ticket Details', rows: ticketRows }];

    // Sheet 2: Communication Details (only if communications exist)
    const commRows = [];
    filteredTickets.forEach(t => {
      if (t.communications && t.communications.length > 0) {
        t.communications.forEach((c, idx) => {
          commRows.push({
            'Ticket ID': `TKT-${t.TicketID}`,
            'Seq': idx + 1,
            'Department': c.Department,
            'Role': c.Role,
            'Remark / Message': c.Remark,
            'Date & Time': c.TimeDate ? new Date(c.TimeDate).toLocaleString('en-IN') : '-'
          });
        });
      }
    });
    if (commRows.length > 0) {
      sheets.push({ name: 'Communication Details', rows: commRows });
    }

    // Sheet 3: Engine Hold Details (only if holds exist)
    const holdRows = [];
    filteredTickets.forEach(t => {
      if (t.engineHold?.holdSummary && t.engineHold.holdSummary.length > 0) {
        t.engineHold.holdSummary.forEach(h => {
          holdRows.push({
            'Ticket ID': `TKT-${t.TicketID}`,
            'Audit Group': h.AuditGroup,
            'Hold Type': h.HoldType,
            'Part ID': h.PartID,
            'Part Batch ID': h.PartBatchID,
            'Plan ID': h.PlanID,
            'Engine No': h.EngineNo,
            'Forward Qty': h.ForwardQty,
            'Backward Qty': h.BackwardQty,
            'OK Qty': h.OkQty,
            'Rejected Qty': h.RejectedQty,
            'Hold Status': h.Status
          });
        });
      }
    });
    if (holdRows.length > 0) {
      sheets.push({ name: 'Engine Hold Details', rows: holdRows });
    }

    // Sheet 4: Hold Defect Logs (only if defects exist)
    const defectRows = [];
    filteredTickets.forEach(t => {
      if (t.engineHold?.defectDetails && t.engineHold.defectDetails.length > 0) {
        t.engineHold.defectDetails.forEach(d => {
          defectRows.push({
            'Ticket ID': `TKT-${t.TicketID}`,
            'Inspection Point': d.InspectionPoint,
            'Defect Point': d.DefectPoint,
            'Engine No': d.EngineNo,
            'Remark': d.Remark,
            'Date & Time': d.DateTime ? new Date(d.DateTime).toLocaleString('en-IN') : '-',
            'Engine Status': d.EngineStatus,
            'Defect Status': d.DefectStatus,
            'Updated By': d.UpdatedBy,
            'Last Updated Time': d.LastUpdatedTime ? new Date(d.LastUpdatedTime).toLocaleString('en-IN') : '-'
          });
        });
      }
    });
    if (defectRows.length > 0) {
      sheets.push({ name: 'Hold Defect Logs', rows: defectRows });
    }

    exportToXLSX(sheets, `Bajaj_Ticket_Escalation_Report_${new Date().toISOString().split('T')[0]}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Executive Printable Banner */}
      <div className="hidden print:flex items-center justify-between pb-3 mb-4 border-b-2 border-orange-500 w-full">
        <div>
          <h1 className="text-2xl font-black text-slate-800">BAJAJ AUTO LIMITED • PPMS</h1>
          <p className="text-xs font-semibold text-slate-600">Track & Trace • Ticket Escalation & Communication Report</p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div>Generated: {new Date().toLocaleString('en-IN')}</div>
          <div className="font-bold text-rose-600">CONFIDENTIAL • HIGHER MANAGEMENT AUDIT</div>
        </div>
      </div>

      {/* Screen Interactive Filter Bar */}
      <div className="print:hidden w-full bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-3 sticky top-0 z-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Left Title & Primary Header Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
              <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-900 leading-tight">Ticket Escalation Report</h1>
                <span className="text-[10.5px] font-bold text-orange-600 tracking-wider uppercase">Track & Trace</span>
              </div>
            </div>

            {/* Period Pills (Shift / Day / Week / Month) */}
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              {['Shift', 'Day', 'Week', 'Month'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    period === p 
                      ? 'bg-white text-orange-600 shadow-sm border border-slate-200/60' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Date Range Inputs */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <span className="text-slate-400 font-semibold">From:</span>
              <input 
                type="date" 
                value={startDate || ''} 
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-slate-800 font-medium focus:outline-none text-xs" 
              />
              <span className="text-slate-400 font-semibold ml-1">To:</span>
              <input 
                type="date" 
                value={endDate || ''} 
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-slate-800 font-medium focus:outline-none text-xs" 
              />
            </div>

            {/* Shift Dropdown */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <span className="font-semibold text-slate-600">Shift:</span>
              <select
                value={shift || 'All'}
                onChange={(e) => setShift(e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none text-xs"
              >
                <option value="All">All Shifts</option>
                <option value="Shift A">Shift A</option>
                <option value="Shift B">Shift B</option>
                <option value="Shift C">Shift C</option>
              </select>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Live Shift Indicator */}
            <div 
              onClick={() => setLiveShiftActive(!liveShiftActive)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold cursor-pointer hover:bg-emerald-100 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Shift</span>
            </div>

            {/* Excel Export Button */}
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>

            {/* Print / PDF Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF / Print</span>
            </button>

            {/* Refresh */}
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Filter Dropdowns & Working Search */}
        <div className="flex flex-wrap items-center gap-3 mt-2.5 pt-2.5 border-t border-slate-100">
          
          {/* Created By Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-600">Created By:</span>
            <select
              value={selectedCreatedBy}
              onChange={(e) => setSelectedCreatedBy(e.target.value)}
              className="bg-white border border-slate-300 font-medium rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="All">All Departments</option>
              <option value="Quality">Quality</option>
              <option value="Production">Production</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {/* Action By Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-600">Action By:</span>
            <select
              value={selectedActionBy}
              onChange={(e) => setSelectedActionBy(e.target.value)}
              className="bg-white border border-slate-300 font-medium rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="All">All Action Roles</option>
              <option value="Higher Management">Higher Management</option>
              <option value="Quality">Quality</option>
              <option value="Production">Production</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {/* Search Box with instant client filtering & clear button */}
          <div className="relative flex-1 min-w-[240px] max-w-[360px] ml-auto">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Ticket ID, Engine#, Reason, Station, Remark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-7 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Expand / Collapse All */}
          <div className="flex items-center gap-1">
            <button
              onClick={expandAll}
              className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Top Row: KPI Summary Cards (Total Created, Total Opened, Total Closed, Total Escalated) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <StatCard 
          title="Total Ticket Created" 
          value={dynamicKpis.totalCreated}
          color="blue"
          sub="Tracked in PPMS"
          period={period}
        />
        <StatCard 
          title="Total Ticket Opened" 
          value={dynamicKpis.totalOpened}
          color="amber"
          sub="Active & In-Progress"
          period={period}
        />
        <StatCard 
          title="Total Ticket Closed" 
          value={dynamicKpis.totalClosed}
          color="green"
          sub="Resolved & Cleared"
          period={period}
        />
        <StatCard 
          title="Total Ticket Escalated" 
          value={dynamicKpis.totalEscalated}
          color="red"
          sub="Urgent Management Attention"
          period={period}
          trend={dynamicKpis.totalEscalated > 0 ? "⚠️ Attention" : "Normal"}
        />
      </div>

      {/* Main Content Area: Ticket Details Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Table Title Banner (No Section identification) */}
        <div className="bg-[#ffedd5]/60 border-b border-orange-200/80 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-slate-900">
              Ticket Details
            </h2>
            <span className="text-xs font-bold text-orange-800 bg-orange-100/80 px-2 py-0.5 rounded-full border border-orange-200">
              {filteredTickets.length} Tickets
            </span>
            {searchQuery && (
              <span className="text-xs text-slate-500 italic">
                (Filtered by "{searchQuery}")
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Status Selector moved to the table header beside Escalated Tag Highlight */}
            <div className="flex items-center gap-1.5 bg-white border border-orange-300 rounded-lg px-2.5 py-1 shadow-2xs">
              <span className="font-black text-orange-900 uppercase tracking-wider text-[10.5px]">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-white font-bold rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Escalated">⚠️ Escalated</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <span className="flex items-center gap-1.5 font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Escalated Tag Highlighted</span>
            </span>
          </div>
        </div>

        {/* Complete Table with All Columns and Dedicated Header */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1250px]">
            {/* Comprehensive Table Header with ALL columns */}
            <thead className="bg-[#fed7aa]/35 border-b border-orange-200 text-slate-800 font-black tracking-tight select-none">
              <tr>
                <th className="p-2.5 text-center w-10">Expand</th>
                <th className="p-2.5 w-24">Ticket ID</th>
                <th className="p-2.5 w-44">Reason</th>
                <th className="p-2.5 w-32">Date & Time</th>
                <th className="p-2.5 w-24">Line Name</th>
                <th className="p-2.5 w-36">Station Name</th>
                <th className="p-2.5 w-32">Activity Desc</th>
                <th className="p-2.5 w-36">Part Name</th>
                <th className="p-2.5 w-32">Equipment Name</th>
                <th className="p-2.5 w-24">Breakdown ID</th>
                <th className="p-2.5 w-32">Engine No</th>
                <th className="p-2.5 w-24">Raised By</th>
                <th className="p-2.5 w-28">Action By</th>
                <th className="p-2.5 min-w-[200px]">Remark</th>
                <th className="p-2.5 w-28">Expected Closure</th>
                <th className="p-2.5 text-center w-28">Status</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="16" className="p-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
                      <span>Loading Ticket Details...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="16" className="p-12 text-center text-slate-400 font-medium">
                    No tickets found matching the active filters or search query.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const isExpanded = expandedTicketIds.has(ticket.TicketID);
                  const hasComms = ticket.communications && ticket.communications.length > 0;
                  const hasHolds = ticket.engineHold?.holdSummary && ticket.engineHold.holdSummary.length > 0;
                  const hasDefects = ticket.engineHold?.defectDetails && ticket.engineHold.defectDetails.length > 0;
                  const hasSubDetails = hasComms || hasHolds || hasDefects;

                  return (
                    <React.Fragment key={ticket.TicketID}>
                      {/* Primary Table Row */}
                      <tr 
                        onClick={() => hasSubDetails && toggleExpand(ticket.TicketID)}
                        className={`transition-colors ${
                          hasSubDetails ? 'cursor-pointer' : ''
                        } ${
                          ticket.isEscalated 
                            ? 'bg-rose-50/25 hover:bg-rose-50/50' 
                            : 'hover:bg-slate-50/80'
                        } ${isExpanded ? 'bg-orange-50/20' : ''}`}
                      >
                        {/* 1. Expand Toggle */}
                        <td className="p-2.5 text-center">
                          {hasSubDetails ? (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); toggleExpand(ticket.TicketID); }}
                              className="w-5 h-5 rounded bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-600 inline-flex items-center justify-center transition-colors"
                              title={isExpanded ? "Collapse Details" : "Expand Details"}
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          ) : (
                            <span className="text-slate-300 text-xs font-bold">-</span>
                          )}
                        </td>

                        {/* 2. Ticket ID */}
                        <td className="p-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              TKT-{ticket.TicketID}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); copyToClipboard(ticket.TicketID, ticket.TicketID); }}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy Ticket ID"
                            >
                              {copiedId === ticket.TicketID ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        {/* 3. Reason */}
                        <td className="p-2.5 font-bold text-slate-900 leading-snug">
                          {ticket.Reason}
                        </td>

                        {/* 4. Date & Time */}
                        <td className="p-2.5 text-slate-600 whitespace-nowrap">
                          {ticket.TimeDate ? new Date(ticket.TimeDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>

                        {/* 5. Line Name */}
                        <td className="p-2.5 font-semibold text-slate-800 whitespace-nowrap">
                          {ticket.LineName}
                        </td>

                        {/* 6. Station Name */}
                        <td className="p-2.5 text-slate-700 font-medium truncate max-w-[150px]" title={ticket.StationName}>
                          {ticket.StationName}
                        </td>

                        {/* 7. Activity Desc */}
                        <td className="p-2.5 text-slate-600 truncate max-w-[130px]" title={ticket.ActivityDesc}>
                          {ticket.ActivityDesc !== '-' ? ticket.ActivityDesc : '-'}
                        </td>

                        {/* 8. Part Name */}
                        <td className="p-2.5 text-slate-700 font-mono text-[11px] truncate max-w-[140px]" title={ticket.PartName}>
                          {ticket.PartName !== '-' ? ticket.PartName : '-'}
                        </td>

                        {/* 9. Equipment Name */}
                        <td className="p-2.5 text-slate-600 truncate max-w-[130px]" title={ticket.EquipmentName}>
                          {ticket.EquipmentName !== '-' ? ticket.EquipmentName : '-'}
                        </td>

                        {/* 10. Breakdown ID */}
                        <td className="p-2.5 font-mono text-slate-600 whitespace-nowrap">
                          {ticket.BreakdownID !== '-' ? (
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {ticket.BreakdownID}
                            </span>
                          ) : '-'}
                        </td>

                        {/* 11. Engine No */}
                        <td className="p-2.5 font-mono font-bold text-indigo-700 whitespace-nowrap">
                          {ticket.EngineNo !== '-' ? ticket.EngineNo : '-'}
                        </td>

                        {/* 12. Raised By */}
                        <td className="p-2.5 whitespace-nowrap">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {ticket.RaiseBy}
                          </span>
                        </td>

                        {/* 13. Action By */}
                        <td className="p-2.5 whitespace-nowrap">
                          <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                            ticket.ActionBy === 'Higher Management'
                              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                              : 'bg-orange-50 text-orange-800'
                          }`}>
                            {ticket.ActionBy}
                          </span>
                        </td>

                        {/* 14. Remark */}
                        <td className="p-2.5 text-slate-800 max-w-[240px] truncate" title={ticket.Remark}>
                          "{ticket.Remark}"
                        </td>

                        {/* 15. Expected Closure */}
                        <td className="p-2.5 whitespace-nowrap">
                          {ticket.ExpectedClosure ? (
                            <span className={`font-semibold ${
                              new Date(ticket.ExpectedClosure) < new Date() && ticket.statusText !== 'Closed'
                                ? 'text-rose-600 font-bold'
                                : 'text-slate-700'
                            }`}>
                              {new Date(ticket.ExpectedClosure).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          ) : '-'}
                        </td>

                        {/* 16. Status (with Escalated tag) */}
                        <td className="p-2.5 text-center whitespace-nowrap">
                          {ticket.isEscalated ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 text-white rounded-full text-[10.5px] font-black uppercase shadow-xs animate-pulse">
                              ⚠️ Escalated
                            </span>
                          ) : (
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-black uppercase ${
                              ticket.statusText === 'Closed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {ticket.statusText}
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Expandable Sub-Detail Row (Only renders sections that have actual data) */}
                      {isExpanded && hasSubDetails && (
                        <tr className="bg-slate-50/60">
                          <td colSpan="16" className="p-4 border-b border-slate-200">
                            <div className="space-y-4">
                              
                              {/* Communication Details (Only rendered if data exists; NO Section identifier; NO Comment input) */}
                              {hasComms && (
                                <div className="rounded-lg border border-slate-200 overflow-hidden shadow-2xs bg-white">
                                  <div className="bg-[#fed7aa]/30 px-3.5 py-1.5 border-b border-orange-200 flex items-center justify-between">
                                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                      <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                                      <span>Communication Details</span>
                                    </h3>
                                    <span className="text-[11px] text-slate-500 font-semibold">
                                      {ticket.communications.length} Entries
                                    </span>
                                  </div>

                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                                        <tr>
                                          <th className="p-2 w-36">Department</th>
                                          <th className="p-2 w-36">Role</th>
                                          <th className="p-2">Remark</th>
                                          <th className="p-2 w-44">Date & Time</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {ticket.communications.map((comm, cIdx) => (
                                          <tr 
                                            key={cIdx} 
                                            className={comm.Department === 'Higher Management' ? 'bg-amber-50/50 font-medium' : 'hover:bg-slate-50/50'}
                                          >
                                            <td className="p-2">
                                              <span className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-bold ${
                                                comm.Department === 'Higher Management'
                                                  ? 'bg-amber-200/70 text-amber-900 border border-amber-300'
                                                  : comm.Department === 'Quality'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : 'bg-slate-100 text-slate-800'
                                              }`}>
                                                {comm.Department}
                                              </span>
                                            </td>
                                            <td className="p-2 font-semibold text-slate-700">
                                              {comm.Role}
                                            </td>
                                            <td className="p-2 text-slate-800">
                                              {comm.Remark}
                                            </td>
                                            <td className="p-2 text-slate-500 font-mono text-[11px]">
                                              {comm.TimeDate ? new Date(comm.TimeDate).toLocaleString('en-IN') : '-'}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Hold Summary (Only rendered if data exists; NO Section identifier) */}
                              {hasHolds && (
                                <div className="rounded-lg border border-slate-200 overflow-hidden shadow-2xs bg-white">
                                  <div className="bg-[#fed7aa]/30 px-3.5 py-1.5 border-b border-orange-200 flex items-center justify-between">
                                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                                      <span>Hold Summary</span>
                                    </h3>
                                    <span className="text-[11px] text-slate-500 font-semibold">
                                      {ticket.engineHold.holdSummary.length} Hold Records
                                    </span>
                                  </div>

                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                                        <tr>
                                          <th className="p-2">Audit Group</th>
                                          <th className="p-2">HoldType</th>
                                          <th className="p-2">PartID</th>
                                          <th className="p-2">PartBatch ID</th>
                                          <th className="p-2">PlanID</th>
                                          <th className="p-2">Engine No</th>
                                          <th className="p-2 text-right">Forward Qty</th>
                                          <th className="p-2 text-right">Backward Qty</th>
                                          <th className="p-2 text-right">OkQty</th>
                                          <th className="p-2 text-right">RejectedQty</th>
                                          <th className="p-2 text-center">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {ticket.engineHold.holdSummary.map((h, hIdx) => (
                                          <tr key={hIdx} className="hover:bg-slate-50/50">
                                            <td className="p-2 font-medium text-slate-700">{h.AuditGroup}</td>
                                            <td className="p-2 font-semibold text-rose-600">{h.HoldType}</td>
                                            <td className="p-2 font-mono text-[11px]">{h.PartID}</td>
                                            <td className="p-2 font-mono text-[11px] text-slate-600">{h.PartBatchID}</td>
                                            <td className="p-2 font-mono text-[11px]">{h.PlanID}</td>
                                            <td className="p-2 font-mono font-bold text-slate-900">{h.EngineNo}</td>
                                            <td className="p-2 text-right font-bold text-slate-800">{h.ForwardQty}</td>
                                            <td className="p-2 text-right font-bold text-slate-800">{h.BackwardQty}</td>
                                            <td className="p-2 text-right font-bold text-emerald-600">{h.OkQty}</td>
                                            <td className="p-2 text-right font-bold text-rose-600">{h.RejectedQty}</td>
                                            <td className="p-2 text-center">
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                h.Status === 'Active Hold' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                                              }`}>
                                                {h.Status}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Defect Points & Inspection Logs (Only rendered if data exists; NO Section identifier) */}
                              {hasDefects && (
                                <div className="rounded-lg border border-slate-200 overflow-hidden shadow-2xs bg-white">
                                  <div className="bg-[#fed7aa]/30 px-3.5 py-1.5 border-b border-orange-200 flex items-center justify-between">
                                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Defect Points & Inspection Logs</span>
                                    </h3>
                                    <span className="text-[11px] text-slate-500 font-semibold">
                                      {ticket.engineHold.defectDetails.length} Defect Points
                                    </span>
                                  </div>

                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                                        <tr>
                                          <th className="p-2">Inspection Point</th>
                                          <th className="p-2">Defect Point</th>
                                          <th className="p-2">Engine No</th>
                                          <th className="p-2">Remark</th>
                                          <th className="p-2">Date & Time</th>
                                          <th className="p-2">Engine Status</th>
                                          <th className="p-2">Defect Status</th>
                                          <th className="p-2">Updated By</th>
                                          <th className="p-2">Last Updated Time</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {ticket.engineHold.defectDetails.map((d, dIdx) => (
                                          <tr key={dIdx} className="hover:bg-slate-50/50">
                                            <td className="p-2 font-medium text-slate-800">{d.InspectionPoint}</td>
                                            <td className="p-2 font-bold text-rose-700">{d.DefectPoint}</td>
                                            <td className="p-2 font-mono font-bold text-indigo-700">{d.EngineNo}</td>
                                            <td className="p-2 text-slate-600 italic">"{d.Remark}"</td>
                                            <td className="p-2 text-slate-500 font-mono text-[11px]">
                                              {d.DateTime ? new Date(d.DateTime).toLocaleString('en-IN') : '-'}
                                            </td>
                                            <td className="p-2 font-medium text-amber-700">{d.EngineStatus}</td>
                                            <td className="p-2">
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                d.DefectStatus === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                              }`}>
                                                {d.DefectStatus}
                                              </span>
                                            </td>
                                            <td className="p-2 text-slate-700">{d.UpdatedBy}</td>
                                            <td className="p-2 text-slate-500 font-mono text-[11px]">
                                              {d.LastUpdatedTime ? new Date(d.LastUpdatedTime).toLocaleString('en-IN') : '-'}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
