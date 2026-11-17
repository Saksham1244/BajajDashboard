import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  Printer, 
  Mail, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ArrowUpDown,
  MessageSquare,
  Paperclip,
  Check,
  Copy
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import { exportToXLSX } from '../../utils/exportExcel';
import useReportFilters from '../../hooks/useReportFilters';

export default function TicketEscalationReport() {
  const { period, shift, startDate, endDate, setPeriod, setShift, setStartDate, setEndDate } = useReportFilters();

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLine, setSelectedLine] = useState('All');
  const [selectedCreatedBy, setSelectedCreatedBy] = useState('All');
  const [selectedActionBy, setSelectedActionBy] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveShiftActive, setLiveShiftActive] = useState(true);

  // Data & State
  const [data, setData] = useState({ kpis: {}, tickets: [], filterOptions: {} });
  const [loading, setLoading] = useState(true);
  const [expandedTicketIds, setExpandedTicketIds] = useState(new Set([5, 8])); // Expand escalated tickets by default
  const [copiedId, setCopiedId] = useState(null);

  // Management Comment Inline State: { [ticketId]: string }
  const [inlineComments, setInlineComments] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailModalTicket, setEmailModalTicket] = useState(null);
  const [emailRecipients, setEmailRecipients] = useState('planthead@bajajauto.co.in; qualityhead@bajajauto.co.in');
  const [emailSubject, setEmailSubject] = useState('');
  const [managementComment, setManagementComment] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccessMessage, setEmailSuccessMessage] = useState('');

  // Fetch Data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (shift && shift !== 'All') params.append('shift', shift);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedLine && selectedLine !== 'All') params.append('line', selectedLine);
      if (selectedStatus && selectedStatus !== 'All') params.append('status', selectedStatus);
      if (selectedCreatedBy && selectedCreatedBy !== 'All') params.append('createdBy', selectedCreatedBy);
      if (selectedActionBy && selectedActionBy !== 'All') params.append('actionBy', selectedActionBy);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

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
  }, [period, shift, startDate, endDate, selectedStatus, selectedLine, selectedCreatedBy, selectedActionBy, searchQuery]);

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
    const allIds = new Set(data.tickets.map(t => t.TicketID));
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

  // Submit Inline Management Comment
  const handleAddComment = async (ticketId) => {
    const comment = inlineComments[ticketId]?.trim();
    if (!comment) return;

    setSubmittingComment(prev => ({ ...prev, [ticketId]: true }));
    try {
      const res = await fetch('/api/trace/ticket-escalation/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          comment,
          department: 'Higher Management',
          role: 'Plant Head / Mgmt',
          actionBy: 'Higher Management',
          escalate: true
        })
      });
      if (res.ok) {
        setInlineComments(prev => ({ ...prev, [ticketId]: '' }));
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  // Open Email Modal
  const openEmailModal = (ticket) => {
    setEmailModalTicket(ticket);
    setEmailSubject(ticket 
      ? `[PPMS Escalation Alert] Ticket #${ticket.TicketID} - ${ticket.Reason} (Line: ${ticket.LineName})`
      : `[PPMS Escalation Summary] Active Escalated Tickets Report`
    );
    setManagementComment('');
    setEmailSuccessMessage('');
    setIsEmailModalOpen(true);
  };

  // Send Email & Record Comment
  const handleSendEmail = async () => {
    if (!emailModalTicket) return;
    setEmailSending(true);
    setEmailSuccessMessage('');

    try {
      const res = await fetch('/api/trace/ticket-escalation/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: emailModalTicket.TicketID,
          recipients: emailRecipients,
          subject: emailSubject,
          managementComment: managementComment
        })
      });

      const json = await res.json();
      if (json.success) {
        setEmailSuccessMessage('Escalation email logged and comment appended to communication history.');
        await fetchData();
        setTimeout(() => {
          setIsEmailModalOpen(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to send email:', err);
    } finally {
      setEmailSending(false);
    }
  };

  // Export to Excel (Multiple Sheets for Ticket, Communication, Hold & Defects)
  const handleExportExcel = () => {
    if (!data.tickets || data.tickets.length === 0) return;

    // Sheet 1: Section 3 Ticket Details
    const ticketRows = data.tickets.map(t => ({
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
      'Is Escalated': t.isEscalated ? 'YES (Escalated)' : 'NO'
    }));

    // Sheet 2: Section 4 Ticket Communication Details
    const commRows = [];
    data.tickets.forEach(t => {
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

    // Sheet 3: Section 5 Engine Hold Details
    const holdRows = [];
    data.tickets.forEach(t => {
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

    // Sheet 4: Section 5 Defect Details
    const defectRows = [];
    data.tickets.forEach(t => {
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

    const sheets = [
      { name: 'Ticket Details', rows: ticketRows },
      { name: 'Communication Details', rows: commRows },
      { name: 'Engine Hold Details', rows: holdRows },
      { name: 'Hold Defect Logs', rows: defectRows }
    ];

    exportToXLSX(sheets, `Bajaj_Ticket_Escalation_Report_${new Date().toISOString().split('T')[0]}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const kpis = data.kpis || {};

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
          
          {/* Left Title & Period Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
              <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-900 leading-tight">Ticket Escalation Report</h1>
                <span className="text-[10.5px] font-bold text-orange-600 tracking-wider uppercase">Track & Trace Module</span>
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

            {/* Email Escalation Button */}
            <button
              onClick={() => openEmailModal(data.tickets.find(t => t.isEscalated) || data.tickets[0])}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
              title="Send report email for higher management comment"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Escalation</span>
            </button>

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

        {/* Row 2: Secondary Filter Dropdowns (Status, Shift, Line, CreatedBy, ActionBy, Search) */}
        <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-2.5 border-t border-slate-100">
          
          {/* Status Filter (Section 3 Requirement) */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-600">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-slate-300 font-bold rounded-md px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Escalated">⚠️ Escalated Only</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Shift Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-600">Shift:</span>
            <select
              value={shift || 'All'}
              onChange={(e) => setShift(e.target.value)}
              className="bg-white border border-slate-300 font-medium rounded-md px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="All">All Shifts</option>
              <option value="Shift A">Shift A (Morning)</option>
              <option value="Shift B">Shift B (Evening)</option>
              <option value="Shift C">Shift C (Night)</option>
            </select>
          </div>

          {/* Line Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-600">Line:</span>
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="bg-white border border-slate-300 font-medium rounded-md px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="All">All Lines</option>
              <option value="Line C">Line C</option>
              <option value="Line D">Line D</option>
            </select>
          </div>

          {/* Created By Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-600">Created By:</span>
            <select
              value={selectedCreatedBy}
              onChange={(e) => setSelectedCreatedBy(e.target.value)}
              className="bg-white border border-slate-300 font-medium rounded-md px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="All">All Departments</option>
              <option value="Quality">Quality</option>
              <option value="Production">Production</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {/* Action By Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-600">Action By:</span>
            <select
              value={selectedActionBy}
              onChange={(e) => setSelectedActionBy(e.target.value)}
              className="bg-white border border-slate-300 font-medium rounded-md px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="All">All Action Roles</option>
              <option value="Higher Management">Higher Management</option>
              <option value="Quality">Quality</option>
              <option value="Production">Production</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-[320px] ml-auto">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Ticket, Engine#, Reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white"
            />
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
          value={kpis.totalCreated ?? 0}
          color="blue"
          sub="Tracked in PPMS"
          period={period}
        />
        <StatCard 
          title="Total Ticket Opened" 
          value={kpis.totalOpened ?? 0}
          color="amber"
          sub="Active & In-Progress"
          period={period}
        />
        <StatCard 
          title="Total Ticket Closed" 
          value={kpis.totalClosed ?? 0}
          color="green"
          sub="Resolved & Cleared"
          period={period}
        />
        <StatCard 
          title="Total Ticket Escalated" 
          value={kpis.totalEscalated ?? 0}
          color="red"
          sub="Urgent Management Attention"
          period={period}
          trend={kpis.totalEscalated > 0 ? "⚠️ Attention" : "Normal"}
        />
      </div>

      {/* Main Content Area: Section 3 Ticket Details Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Section 3 Header Banner */}
        <div className="bg-[#ffedd5] border-b border-orange-200 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-orange-600 text-white rounded text-[11px] font-black tracking-wider uppercase">
              Section 3
            </span>
            <h2 className="text-sm font-black text-slate-800">
              Ticket Details
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              ({data.tickets?.length || 0} Tickets Found)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Escalated Tag Highlighted</span>
            </span>
            <span className="text-slate-500 font-medium">Click row or ^ icon to view Communications & Hold Details</span>
          </div>
        </div>

        {/* Tickets Table / List */}
        <div className="divide-y divide-slate-200 overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-medium text-sm flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
              <span>Loading Ticket Escalation Data...</span>
            </div>
          ) : data.tickets?.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium text-sm">
              No tickets matched the selected filters.
            </div>
          ) : (
            data.tickets.map((ticket) => {
              const isExpanded = expandedTicketIds.has(ticket.TicketID);

              return (
                <div 
                  key={ticket.TicketID}
                  className={`transition-colors ${
                    ticket.isEscalated 
                      ? 'bg-rose-50/20 hover:bg-rose-50/40' 
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  {/* Row 1: Primary Header Bar for this Ticket (Matching Section 3 Columns) */}
                  <div 
                    onClick={() => toggleExpand(ticket.TicketID)}
                    className="p-3.5 cursor-pointer grid grid-cols-12 gap-3 items-center select-none"
                  >
                    {/* Expand Chevron & Ticket ID */}
                    <div className="col-span-12 sm:col-span-2 flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleExpand(ticket.TicketID); }}
                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-600 flex items-center justify-center transition-colors flex-shrink-0"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <div className="flex items-center gap-1 font-mono font-bold text-xs text-slate-900">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          TKT-{ticket.TicketID}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(ticket.TicketID, ticket.TicketID); }}
                          className="text-slate-400 hover:text-slate-700"
                          title="Copy Ticket ID"
                        >
                          {copiedId === ticket.TicketID ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="col-span-12 sm:col-span-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-xs text-slate-900 leading-snug">
                          {ticket.Reason}
                        </span>
                        {ticket.isEscalated && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-full shadow-sm animate-pulse">
                            ⚠️ Escalated
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        {ticket.TimeDate ? new Date(ticket.TimeDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </div>
                    </div>

                    {/* Line & Station */}
                    <div className="col-span-6 sm:col-span-2 text-xs">
                      <div className="font-bold text-slate-800">{ticket.LineName}</div>
                      <div className="text-[11px] text-slate-500 font-medium truncate" title={ticket.StationName}>
                        {ticket.StationName}
                      </div>
                    </div>

                    {/* Engine No & Part */}
                    <div className="col-span-6 sm:col-span-2 text-xs">
                      <div className="font-mono font-bold text-indigo-700 truncate" title={ticket.EngineNo}>
                        {ticket.EngineNo !== '-' ? ticket.EngineNo : 'No Engine'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate" title={ticket.PartName}>
                        {ticket.PartName !== '-' ? ticket.PartName : 'General'}
                      </div>
                    </div>

                    {/* RaiseBy & ActionBy */}
                    <div className="col-span-6 sm:col-span-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">By:</span>
                        <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded text-[11px]">
                          {ticket.RaiseBy}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-slate-400">To:</span>
                        <span className="font-semibold text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded text-[11px]">
                          {ticket.ActionBy}
                        </span>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="col-span-6 sm:col-span-1 flex items-center justify-end gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${
                        ticket.statusText === 'Escalated' || ticket.isEscalated
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : ticket.statusText === 'Closed'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {ticket.statusText}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Secondary Metadata Strip (ActionBy, Remark, Expected Closure, Quick Email) */}
                  <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-500">Remark:</span>
                        <span className="text-slate-800 font-medium italic">"{ticket.Remark}"</span>
                      </div>

                      {ticket.ExpectedClosure && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-slate-500">Target Closure:</span>
                          <span className={`font-semibold ${
                            new Date(ticket.ExpectedClosure) < new Date() && ticket.statusText !== 'Closed'
                              ? 'text-rose-600 font-bold'
                              : 'text-slate-700'
                          }`}>
                            {new Date(ticket.ExpectedClosure).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      )}

                      {ticket.BreakdownID && ticket.BreakdownID !== '-' && (
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-500">BD ID:</span>
                          <span className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {ticket.BreakdownID}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Action: Open Email / Management Comment Modal */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openEmailModal(ticket); }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 hover:border-orange-300 rounded font-bold text-[11px] shadow-2xs transition-colors"
                      >
                        <Mail className="w-3 h-3 text-orange-600" />
                        <span>Email Escalation</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Accordion Body: Section 4 & Section 5 */}
                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-slate-200 space-y-5">
                      
                      {/* ============================================================== */}
                      {/* SECTION 4: TICKET COMMUNICATION DETAILS */}
                      {/* ============================================================== */}
                      <div className="rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                        <div className="bg-[#fed7aa]/40 px-3.5 py-2 border-b border-orange-200/80 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-800 text-white rounded text-[10px] font-black uppercase">
                              Section 4
                            </span>
                            <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                              <span>Ticket Communication Details</span>
                            </h3>
                          </div>
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {ticket.communications?.length || 0} Communication Entries
                          </span>
                        </div>

                        {/* Communications Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                              <tr>
                                <th className="p-2.5 w-40">Department</th>
                                <th className="p-2.5 w-40">Role</th>
                                <th className="p-2.5">Remark</th>
                                <th className="p-2.5 w-44">TimeDate</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {ticket.communications?.length > 0 ? (
                                ticket.communications.map((comm, cIdx) => (
                                  <tr 
                                    key={cIdx} 
                                    className={comm.Department === 'Higher Management' ? 'bg-amber-50/50 font-medium' : 'hover:bg-slate-50/50'}
                                  >
                                    <td className="p-2.5">
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
                                    <td className="p-2.5 font-semibold text-slate-700">
                                      {comm.Role}
                                    </td>
                                    <td className="p-2.5 text-slate-800">
                                      {comm.Remark}
                                    </td>
                                    <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                                      {comm.TimeDate ? new Date(comm.TimeDate).toLocaleString('en-IN') : '-'}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" className="p-3 text-center text-slate-400 italic">
                                    No communication log recorded yet.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Inline Management Comment Box */}
                        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            placeholder="Add Higher Management Comment / Instructions..."
                            value={inlineComments[ticket.TicketID] || ''}
                            onChange={(e) => setInlineComments({ ...inlineComments, [ticket.TicketID]: e.target.value })}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(ticket.TicketID); }}
                            className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(ticket.TicketID)}
                            disabled={submittingComment[ticket.TicketID] || !inlineComments[ticket.TicketID]?.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-md text-xs font-bold shadow-2xs transition-all"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{submittingComment[ticket.TicketID] ? 'Saving...' : 'Add Comment'}</span>
                          </button>
                        </div>
                      </div>

                      {/* ============================================================== */}
                      {/* SECTION 5: ENGINE HOLD DETAILS */}
                      {/* ============================================================== */}
                      <div className="rounded-lg border border-slate-200 overflow-hidden shadow-2xs space-y-3">
                        <div className="bg-[#fed7aa]/40 px-3.5 py-2 border-b border-orange-200/80 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-800 text-white rounded text-[10px] font-black uppercase">
                              Section 5
                            </span>
                            <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                              <span>Engine Hold Details</span>
                            </h3>
                          </div>
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {ticket.engineHold?.holdSummary?.length || 0} Hold Logs • {ticket.engineHold?.defectDetails?.length || 0} Defect Points
                          </span>
                        </div>

                        {/* Table 1: Hold Summary */}
                        <div className="px-3">
                          <p className="text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                            Hold Summary:
                          </p>
                          <div className="border border-slate-200 rounded-md overflow-x-auto">
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
                                {ticket.engineHold?.holdSummary?.length > 0 ? (
                                  ticket.engineHold.holdSummary.map((h, hIdx) => (
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
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="11" className="p-3 text-center text-slate-400 italic">
                                      No engine hold records for this ticket.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Table 2: Hold Defect Details */}
                        <div className="px-3 pb-3">
                          <p className="text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                            Defect Points & Inspection Logs:
                          </p>
                          <div className="border border-slate-200 rounded-md overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                                <tr>
                                  <th className="p-2">Inspection Point</th>
                                  <th className="p-2">Defect Point</th>
                                  <th className="p-2">Engine No</th>
                                  <th className="p-2">Remark</th>
                                  <th className="p-2">DateTime</th>
                                  <th className="p-2">Engine Status</th>
                                  <th className="p-2">Defect Status</th>
                                  <th className="p-2">Updated By</th>
                                  <th className="p-2">Last Updated Time</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {ticket.engineHold?.defectDetails?.length > 0 ? (
                                  ticket.engineHold.defectDetails.map((d, dIdx) => (
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
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="9" className="p-3 text-center text-slate-400 italic">
                                      No defect point logs associated with this ticket.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* EMAIL ESCALATION MODAL FOR HIGHER MANAGEMENT COMMENT */}
      {/* ============================================================== */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-orange-600 px-5 py-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-orange-200" />
                <h3 className="text-base font-black">
                  Send Escalation Report to Higher Management
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              
              {/* Ticket Overview Pill */}
              {emailModalTicket && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-orange-900 bg-orange-200/70 px-1.5 py-0.5 rounded mr-2">
                      TKT-{emailModalTicket.TicketID}
                    </span>
                    <span className="font-bold text-slate-800">{emailModalTicket.Reason}</span>
                    <span className="text-slate-500 ml-2">({emailModalTicket.LineName} • {emailModalTicket.StationName})</span>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black uppercase">
                    Escalation Priority
                  </span>
                </div>
              )}

              {/* Recipients Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Recipient Email(s) (Plant Head / Quality Head / Management):
                </label>
                <input
                  type="text"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              {/* Subject Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Subject:
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              {/* Higher Management Comment Box */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Higher Management Comment / Directive:</span>
                  <span className="text-[10.5px] text-orange-600 font-semibold">*Saved directly to Communication History</span>
                </label>
                <textarea
                  rows="4"
                  placeholder="Enter high-level guidance, quarantine instructions, or root cause action requirements..."
                  value={managementComment}
                  onChange={(e) => setManagementComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              {/* Success Notification */}
              {emailSuccessMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-lg flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{emailSuccessMessage}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              <a
                href={`mailto:${emailRecipients}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(
                  `Escalation Notice for Ticket #${emailModalTicket?.TicketID || ''}\n\nManagement Comment:\n${managementComment}\n\nGenerated by PPMS Track & Trace.`
                )}`}
                className="text-slate-600 hover:text-slate-900 font-bold text-xs flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Desktop Email (Outlook)</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={emailSending}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{emailSending ? 'Dispatching...' : 'Send Escalation Email'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
