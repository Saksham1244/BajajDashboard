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
  Copy,
  LayoutDashboard
} from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import useReportFilters from '../../hooks/useReportFilters';

export default function TicketEscalationReport() {
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();

  // Filters (Line filter is completely removed)
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCreatedBy, setSelectedCreatedBy] = useState('All');
  const [selectedActionBy, setSelectedActionBy] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Data & State
  const [data, setData] = useState({ kpis: {}, tickets: [], filterOptions: {} });
  const [loading, setLoading] = useState(true);
  const [expandedTicketIds, setExpandedTicketIds] = useState(new Set()); // All tickets collapsed by default
  const [expandedSubSections, setExpandedSubSections] = useState(new Set()); // Hold Summary & Defect logs collapsed by default
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

  // Toggle Sub-Sections (Hold Summary, Defect Details)
  const toggleSubSection = (key) => {
    setExpandedSubSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
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
    setExpandedSubSections(new Set());
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
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      {/* Standard Filter Bar (Matches Application Standard - Image 1) */}
      <StandardFilterBar
        title="Ticket Escalation Report"
        icon={LayoutDashboard}
        onExcelClick={handleExportExcel}
        onPrintClick={handlePrint}
        filters={[
          ...getBaseFilters(),
          { 
            type: 'dropdown', 
            label: 'Created By', 
            options: ['All', 'Quality', 'Production', 'Maintenance'], 
            value: selectedCreatedBy, 
            onChange: setSelectedCreatedBy 
          },
          { 
            type: 'dropdown', 
            label: 'Action By', 
            options: ['All', 'Higher Management', 'Quality', 'Production', 'Maintenance'], 
            value: selectedActionBy, 
            onChange: setSelectedActionBy 
          },
          { 
            type: 'search', 
            label: 'Search', 
            value: searchQuery, 
            onChange: setSearchQuery, 
            placeholder: 'Ticket ID, Engine, Reason...' 
          }
        ]}
        extraActions={(
          <div className="flex items-center gap-1.5 mr-1">
            <button
              type="button"
              onClick={expandAll}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded transition-colors whitespace-nowrap"
              title="Expand All Ticket Sub-Details"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded transition-colors whitespace-nowrap"
              title="Collapse All Ticket Sub-Details"
            >
              Collapse All
            </button>
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      />

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
            <div className="flex items-center gap-2 bg-white border border-orange-300 hover:border-orange-400 rounded-lg px-2.5 py-1 shadow-2xs transition-colors">
              <span className="font-black text-orange-900 uppercase tracking-wider text-[10.5px]">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent font-bold text-xs text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Escalated">Escalated</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <span className="flex items-center gap-1.5 font-bold text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Escalated Tag Highlighted</span>
            </span>
          </div>
        </div>

        {/* Complete Table with All Columns and Dedicated Header */}
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed text-left text-[11px] border-collapse">
            {/* Comprehensive Table Header with ALL columns */}
            <thead className="bg-[#fed7aa]/35 border-b border-orange-200 text-slate-800 font-black tracking-tight select-none">
              <tr>
                <th className="p-1.5 text-center w-[2.5%]"></th>
                <th className="p-1.5 w-[6%] truncate" title="Ticket ID">Ticket ID</th>
                <th className="p-1.5 w-[9.5%] truncate" title="Reason">Reason</th>
                <th className="p-1.5 w-[7%] truncate" title="Date & Time">Date & Time</th>
                <th className="p-1.5 w-[4%] truncate" title="Line Name">Line</th>
                <th className="p-1.5 w-[8%] truncate" title="Station Name">Station</th>
                <th className="p-1.5 w-[4%] truncate" title="Activity Desc">Activity</th>
                <th className="p-1.5 w-[6.5%] truncate" title="Part Name">Part Name</th>
                <th className="p-1.5 w-[5%] truncate" title="Equipment Name">Equipment</th>
                <th className="p-1.5 w-[4.5%] truncate" title="Breakdown ID">Breakdown</th>
                <th className="p-1.5 w-[7.5%] truncate" title="Engine No">Engine No</th>
                <th className="p-1.5 w-[5%] truncate" title="Raised By">Raised By</th>
                <th className="p-1.5 w-[7%] truncate" title="Action By">Action By</th>
                <th className="p-1.5 w-[8.5%] truncate" title="Remark">Remark</th>
                <th className="p-1.5 text-center w-[6.5%] whitespace-nowrap" title="Expected Closure">Exp Closure</th>
                <th className="p-1.5 text-center w-[8.5%] whitespace-nowrap" title="Status">Status</th>
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

                  const isHoldOpen = expandedSubSections.has(`hold_${ticket.TicketID}`);
                  const isDefectOpen = expandedSubSections.has(`defect_${ticket.TicketID}`);

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
                        <td className="p-1.5 text-center">
                          {hasSubDetails ? (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); toggleExpand(ticket.TicketID); }}
                              className="w-4 h-4 rounded bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-600 inline-flex items-center justify-center transition-colors"
                              title={isExpanded ? "Collapse Details" : "Expand Details"}
                            >
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          ) : (
                            <span className="text-slate-300 text-xs font-bold">-</span>
                          )}
                        </td>

                        {/* 2. Ticket ID */}
                        <td className="p-1.5 font-mono font-bold text-slate-900 truncate">
                          <div className="flex items-center gap-1">
                            <span className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-[10px]">
                              TKT-{ticket.TicketID}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); copyToClipboard(ticket.TicketID, ticket.TicketID); }}
                              className="text-slate-400 hover:text-slate-700 shrink-0"
                              title="Copy Ticket ID"
                            >
                              {copiedId === ticket.TicketID ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                            </button>
                          </div>
                        </td>

                        {/* 3. Reason */}
                        <td className="p-1.5 font-bold text-slate-900 leading-tight truncate" title={ticket.Reason}>
                          {ticket.Reason}
                        </td>

                        {/* 4. Date & Time */}
                        <td className="p-1.5 text-slate-600 text-[10px] leading-tight truncate" title={ticket.TimeDate ? new Date(ticket.TimeDate).toLocaleString('en-IN') : '-'}>
                          {ticket.TimeDate ? (
                            <>
                              <div>{new Date(ticket.TimeDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                              <div className="text-slate-400 text-[9.5px]">{new Date(ticket.TimeDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                            </>
                          ) : '-'}
                        </td>

                        {/* 5. Line Name */}
                        <td className="p-1.5 font-semibold text-slate-800 text-[10.5px] truncate" title={ticket.LineName}>
                          {ticket.LineName}
                        </td>

                        {/* 6. Station Name */}
                        <td className="p-1.5 text-slate-700 font-medium text-[10.5px] truncate" title={ticket.StationName}>
                          {ticket.StationName}
                        </td>

                        {/* 7. Activity Desc */}
                        <td className="p-1.5 text-slate-600 text-[10.5px] truncate" title={ticket.ActivityDesc}>
                          {ticket.ActivityDesc !== '-' ? ticket.ActivityDesc : '-'}
                        </td>

                        {/* 8. Part Name */}
                        <td className="p-1.5 text-slate-700 font-mono text-[10px] truncate" title={ticket.PartName}>
                          {ticket.PartName !== '-' ? ticket.PartName : '-'}
                        </td>

                        {/* 9. Equipment Name */}
                        <td className="p-1.5 text-slate-600 text-[10.5px] truncate" title={ticket.EquipmentName}>
                          {ticket.EquipmentName !== '-' ? ticket.EquipmentName : '-'}
                        </td>

                        {/* 10. Breakdown ID */}
                        <td className="p-1.5 font-mono text-slate-600 text-[10px] truncate" title={ticket.BreakdownID}>
                          {ticket.BreakdownID !== '-' ? (
                            <span className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                              {ticket.BreakdownID}
                            </span>
                          ) : '-'}
                        </td>

                        {/* 11. Engine No */}
                        <td className="p-1.5 font-mono font-bold text-indigo-700 text-[10.5px] truncate" title={ticket.EngineNo}>
                          {ticket.EngineNo !== '-' ? ticket.EngineNo : '-'}
                        </td>

                        {/* 12. Raised By */}
                        <td className="p-1.5 truncate" title={ticket.RaiseBy}>
                          <span className="font-semibold text-slate-700 bg-slate-100 px-1 py-0.5 rounded text-[10px] truncate inline-block max-w-full">
                            {ticket.RaiseBy}
                          </span>
                        </td>

                        {/* 13. Action By */}
                        <td className="p-1.5 truncate" title={ticket.ActionBy}>
                          <span className={`font-semibold px-2 py-0.5 rounded-full text-[10.5px] truncate inline-block max-w-full ${
                            ticket.ActionBy === 'Higher Management'
                              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {ticket.ActionBy === 'Higher Management' ? 'Higher Mgmt' : ticket.ActionBy}
                          </span>
                        </td>

                        {/* 14. Remark */}
                        <td className="p-1.5 text-slate-800 text-[10.5px] truncate" title={ticket.Remark}>
                          "{ticket.Remark}"
                        </td>

                        {/* 15. Expected Closure */}
                        <td className="p-1.5 text-center whitespace-nowrap text-[10.5px]" title={ticket.ExpectedClosure ? new Date(ticket.ExpectedClosure).toLocaleDateString('en-IN') : '-'}>
                          {ticket.ExpectedClosure ? (
                            <span className={`font-semibold ${
                              new Date(ticket.ExpectedClosure) < new Date() && ticket.statusText !== 'Closed'
                                ? 'text-rose-600 font-bold'
                                : 'text-slate-700'
                            }`}>
                              {new Date(ticket.ExpectedClosure).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </span>
                          ) : '-'}
                        </td>

                        {/* 16. Status (with Escalated tag) */}
                        <td className="p-1.5 text-center whitespace-nowrap">
                          {ticket.isEscalated ? (
                            <span 
                              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs whitespace-nowrap"
                              title="Escalated Ticket - Requires Management Attention"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                              <span>Escalated</span>
                            </span>
                          ) : ticket.statusText === 'Closed' ? (
                            <span 
                              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs whitespace-nowrap"
                              title="Closed Ticket"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span>Closed</span>
                            </span>
                          ) : (
                            <span 
                              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs whitespace-nowrap"
                              title="Open Ticket"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span>Open</span>
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

                              {/* Hold Summary (Collapsible - Collapsed by default) */}
                              {hasHolds && (
                                <div className="rounded-lg border border-slate-200 overflow-hidden shadow-2xs bg-white">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSubSection(`hold_${ticket.TicketID}`);
                                    }}
                                    className={`w-full bg-[#fed7aa]/30 hover:bg-[#fed7aa]/50 px-3.5 py-2 flex items-center justify-between transition-colors text-left ${
                                      isHoldOpen ? 'border-b border-orange-200' : ''
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                                      <span className="text-xs font-black text-slate-800">Hold Summary</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-slate-600 font-semibold bg-white/90 px-2 py-0.5 rounded border border-orange-200">
                                        {ticket.engineHold.holdSummary.length} Hold Records
                                      </span>
                                      <span className="w-5 h-5 rounded bg-white/90 border border-orange-200 inline-flex items-center justify-center text-slate-600">
                                        {isHoldOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                      </span>
                                    </div>
                                  </button>

                                  {isHoldOpen && (
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
                                  )}
                                </div>
                              )}

                              {/* Defect Points & Inspection Logs (Collapsible - Collapsed by default) */}
                              {hasDefects && (
                                <div className="rounded-lg border border-slate-200 overflow-hidden shadow-2xs bg-white">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSubSection(`defect_${ticket.TicketID}`);
                                    }}
                                    className={`w-full bg-[#fed7aa]/30 hover:bg-[#fed7aa]/50 px-3.5 py-2 flex items-center justify-between transition-colors text-left ${
                                      isDefectOpen ? 'border-b border-orange-200' : ''
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                      <span className="text-xs font-black text-slate-800">Defect Points & Inspection Logs</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-slate-600 font-semibold bg-white/90 px-2 py-0.5 rounded border border-orange-200">
                                        {ticket.engineHold.defectDetails.length} Defect Points
                                      </span>
                                      <span className="w-5 h-5 rounded bg-white/90 border border-orange-200 inline-flex items-center justify-center text-slate-600">
                                        {isDefectOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                      </span>
                                    </div>
                                  </button>

                                  {isDefectOpen && (
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
                                  )}
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
