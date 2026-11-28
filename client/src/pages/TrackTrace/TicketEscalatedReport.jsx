import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ShieldAlert,
  MessageSquare,
  Check,
  Copy,
  Send
} from 'lucide-react';
import StandardFilterBar from '../../components/StandardFilterBar';
import { exportToXLSX } from '../../utils/exportExcel';
import useReportFilters from '../../hooks/useReportFilters';
import { useAuth } from '../../context/AuthContext';

export default function TicketEscalatedReport() {
  const { user } = useAuth();
  const { period, shift, startDate, endDate, getBaseFilters } = useReportFilters();

  // Filters (Status filter requested in wireframe; logged-in UserID enforced)
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Data & Expand States (all collapsed by default)
  const [data, setData] = useState({ loggedInUserId: null, tickets: [], filterOptions: {} });
  const [loading, setLoading] = useState(true);
  const [expandedTicketIds, setExpandedTicketIds] = useState(new Set());
  const [expandedSubSections, setExpandedSubSections] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);

  // Add Comment State (Section 4)
  const [commentInputs, setCommentInputs] = useState({});
  const [commentStatusAction, setCommentStatusAction] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [commentFeedback, setCommentFeedback] = useState({});

  const loggedInUserId = user?.UserID ? String(user.UserID).trim() : '';

  const fetchData = async () => {
    if (!loggedInUserId) {
      setData({ loggedInUserId: null, tickets: [], filterOptions: {} });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('userId', loggedInUserId);
      if (period) params.append('period', period);
      if (shift && shift !== 'All') params.append('shift', shift);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedStatus && selectedStatus !== 'All') params.append('status', selectedStatus);

      const res = await fetch(`/api/trace/ticket-escalated?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching escalated tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [loggedInUserId, period, shift, startDate, endDate, selectedStatus]);

  // Client-side search across ticket fields, communications, holds, and defect logs
  const filteredTickets = useMemo(() => {
    if (!data.tickets || !Array.isArray(data.tickets)) return [];
    if (!searchQuery || !searchQuery.trim()) return data.tickets;

    const q = searchQuery.trim().toLowerCase();
    const cleanId = q.replace(/^tkt-?/i, '').trim();

    return data.tickets.filter(t => {
      if (cleanId && String(t.TicketID) === cleanId) return true;
      if (String(t.TicketID).includes(q)) return true;
      if (`tkt-${t.TicketID}`.toLowerCase().includes(q)) return true;

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

      if (t.communications?.some(c =>
        c.Remark?.toLowerCase().includes(q) ||
        c.Department?.toLowerCase().includes(q) ||
        c.Role?.toLowerCase().includes(q)
      )) return true;

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
  }, [data.tickets, searchQuery]);

  const toggleExpand = (ticketId) => {
    setExpandedTicketIds(prev => {
      const next = new Set(prev);
      if (next.has(ticketId)) next.delete(ticketId);
      else next.add(ticketId);
      return next;
    });
  };

  const toggleSubSection = (key) => {
    setExpandedSubSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedTicketIds(new Set(filteredTickets.map(t => t.TicketID)));
  };

  const collapseAll = () => {
    setExpandedTicketIds(new Set());
    setExpandedSubSections(new Set());
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(String(text));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Add Comment Handler (Section 4)
  const handleAddComment = async (ticketId) => {
    const comment = (commentInputs[ticketId] || '').trim();
    if (!comment || !loggedInUserId) return;

    setSubmittingComment(prev => ({ ...prev, [ticketId]: true }));
    setCommentFeedback(prev => ({ ...prev, [ticketId]: null }));

    try {
      const res = await fetch('/api/trace/ticket-escalated/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          comment,
          userId: loggedInUserId,
          statusAction: commentStatusAction[ticketId] || ''
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setCommentInputs(prev => ({ ...prev, [ticketId]: '' }));
        setCommentStatusAction(prev => ({ ...prev, [ticketId]: '' }));
        setCommentFeedback(prev => ({ ...prev, [ticketId]: { type: 'success', text: 'Comment added to communication log.' } }));
        await fetchData();
        setTimeout(() => {
          setCommentFeedback(prev => ({ ...prev, [ticketId]: null }));
        }, 3000);
      } else {
        setCommentFeedback(prev => ({ ...prev, [ticketId]: { type: 'error', text: result.error || 'Failed to save comment.' } }));
      }
    } catch (err) {
      console.error('Error submitting escalated comment:', err);
      setCommentFeedback(prev => ({ ...prev, [ticketId]: { type: 'error', text: 'Network error saving comment.' } }));
    } finally {
      setSubmittingComment(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    if (!filteredTickets || filteredTickets.length === 0) return;

    const ticketRows = [
      ['Ticket ID', 'Reason', 'Date & Time', 'Line Name', 'Station Name', 'Activity Description', 'Part Name', 'Equipment Name', 'Breakdown ID', 'Engine No', 'Raised By', 'Action By', 'Remark', 'Expected Closure', 'Status', 'Escalation To (UserID)'],
      ...filteredTickets.map(t => [
        `TKT-${t.TicketID}`,
        t.Reason,
        t.TimeDate ? new Date(t.TimeDate).toLocaleString('en-IN') : '-',
        t.LineName,
        t.StationName,
        t.ActivityDesc,
        t.PartName,
        t.EquipmentName,
        t.BreakdownID,
        t.EngineNo,
        t.RaiseBy,
        t.ActionBy,
        t.Remark,
        t.ExpectedClosure ? new Date(t.ExpectedClosure).toLocaleDateString('en-IN') : '-',
        t.statusText,
        t.EscalationTo ? `#${t.EscalationTo}${t.EscalationToName ? ` (${t.EscalationToName})` : ''}` : '-'
      ])
    ];

    const sheets = [{ name: 'Escalated Ticket Details', rows: ticketRows }];

    const commData = [];
    filteredTickets.forEach(t => {
      (t.communications || []).forEach((c, idx) => {
        commData.push([
          `TKT-${t.TicketID}`,
          idx + 1,
          c.Department,
          c.Role,
          c.Remark,
          c.TimeDate ? new Date(c.TimeDate).toLocaleString('en-IN') : '-'
        ]);
      });
    });
    if (commData.length > 0) {
      sheets.push({
        name: 'Communication Details',
        rows: [['Ticket ID', 'Seq', 'Department', 'Role', 'Remark / Message', 'Date & Time'], ...commData]
      });
    }

    const holdData = [];
    filteredTickets.forEach(t => {
      (t.engineHold?.holdSummary || []).forEach(h => {
        holdData.push([
          `TKT-${t.TicketID}`,
          h.AuditGroup,
          h.HoldType,
          h.PartID,
          h.PartBatchID,
          h.PlanID,
          h.EngineNo,
          h.ForwardQty,
          h.BackwardQty,
          h.OkQty,
          h.RejectedQty,
          h.Status
        ]);
      });
    });
    if (holdData.length > 0) {
      sheets.push({
        name: 'Engine Hold Details',
        rows: [['Ticket ID', 'Audit Group', 'Hold Type', 'Part ID', 'Part Batch ID', 'Plan ID', 'Engine No', 'Forward Qty', 'Backward Qty', 'OK Qty', 'Rejected Qty', 'Hold Status'], ...holdData]
      });
    }

    const defectData = [];
    filteredTickets.forEach(t => {
      (t.engineHold?.defectDetails || []).forEach(d => {
        defectData.push([
          `TKT-${t.TicketID}`,
          d.InspectionPoint,
          d.DefectPoint,
          d.EngineNo,
          d.Remark,
          d.DateTime ? new Date(d.DateTime).toLocaleString('en-IN') : '-',
          d.EngineStatus,
          d.DefectStatus,
          d.UpdatedBy,
          d.LastUpdatedTime ? new Date(d.LastUpdatedTime).toLocaleString('en-IN') : '-'
        ]);
      });
    });
    if (defectData.length > 0) {
      sheets.push({
        name: 'Hold Defect Logs',
        rows: [['Ticket ID', 'Inspection Point', 'Defect Point', 'Engine No', 'Remark', 'Date & Time', 'Engine Status', 'Defect Status', 'Updated By', 'Last Updated Time'], ...defectData]
      });
    }

    exportToXLSX(`Bajaj_Ticket_Escalated_Report_${new Date().toISOString().split('T')[0]}.xlsx`, sheets);
  };

  return (
    <div className="pb-4 max-w-[1600px] mx-auto px-1 flex flex-col gap-3 h-full">
      {/* SECTION 1: Filter Bar (Shift, Day, Week, Month, StartDate, EndDate, Shift dropdown, Status, Live Shift, Excel, PDF) */}
      <StandardFilterBar
        title="Ticket Escalated Report"
        icon={ShieldAlert}
        onExcelClick={handleExportExcel}
        onPrintClick={() => window.print()}
        filters={[
          ...getBaseFilters(),
          {
            type: 'dropdown',
            label: 'Status',
            options: ['All', 'Escalated', 'Open', 'Closed'],
            value: selectedStatus,
            onChange: setSelectedStatus
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

      {/* SECTION 3: Escalated Ticket Details Table (Directly below Section 1 per wireframe) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Table Title Banner */}
        <div className="bg-[#ffedd5]/60 border-b border-orange-200/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-slate-900">
              Escalated Ticket Details
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
            <div className="flex items-center gap-2 bg-white border border-orange-300 hover:border-orange-400 rounded-lg px-2.5 py-1 shadow-2xs transition-colors">
              <span className="font-black text-orange-900 uppercase tracking-wider text-[10.5px]">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent font-bold text-xs text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="All">All Statuses</option>
                <option value="Escalated">Escalated</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <span className="flex items-center gap-1.5 font-bold text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Escalated To: {user?.UserName || 'User'} (#{loggedInUserId || '-'})</span>
            </span>
          </div>
        </div>

        {/* Main Ticket Table (100% Width, No Horizontal Scroll) */}
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed text-left text-[11px] border-collapse">
            <thead className="bg-[#fed7aa]/35 border-b border-orange-200 text-slate-800 font-black tracking-tight select-none">
              <tr>
                <th className="p-1.5 text-center w-[2.5%]"></th>
                <th className="p-1.5 w-[6%] truncate" title="Ticket ID">Ticket ID</th>
                <th className="p-1.5 w-[9.5%] truncate" title="Reason">Reason</th>
                <th className="p-1.5 w-[7%] truncate" title="Date & Time">TimeDate</th>
                <th className="p-1.5 w-[4.5%] truncate" title="Line Name">Line Name</th>
                <th className="p-1.5 w-[8%] truncate" title="Station Name">Station Name</th>
                <th className="p-1.5 w-[4.5%] truncate" title="Activity Desc">Activity Desc</th>
                <th className="p-1.5 w-[6.5%] truncate" title="Part Name">Part Name</th>
                <th className="p-1.5 w-[5%] truncate" title="Equipment Name">Equipment</th>
                <th className="p-1.5 w-[4.5%] truncate" title="Breakdown ID">Breakdown ID</th>
                <th className="p-1.5 w-[7.5%] truncate" title="Engine No">EngineNo</th>
                <th className="p-1.5 w-[5%] truncate" title="RaiseBy">RaiseBy</th>
                <th className="p-1.5 w-[6.5%] truncate" title="ActionBy">ActionBy</th>
                <th className="p-1.5 w-[7%] truncate" title="Remark">Remark</th>
                <th className="p-1.5 text-center w-[7.5%] truncate" title="Expected Closure">Expected Closure</th>
                <th className="p-1.5 text-center w-[8.5%] truncate" title="Status">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="16" className="p-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
                      <span>Loading Escalated Tickets for {user?.UserName || 'User'}...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="16" className="p-12 text-center text-slate-400 font-medium">
                    No escalated tickets assigned to {user?.UserName || 'current user'} (User ID #{loggedInUserId || '-'}) for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const isExpanded = expandedTicketIds.has(ticket.TicketID);
                  const hasHolds = ticket.engineHold?.holdSummary && ticket.engineHold.holdSummary.length > 0;
                  const hasDefects = ticket.engineHold?.defectDetails && ticket.engineHold.defectDetails.length > 0;
                  const isHoldOpen = expandedSubSections.has(`hold_${ticket.TicketID}`);
                  const isDefectOpen = expandedSubSections.has(`defect_${ticket.TicketID}`);

                  return (
                    <React.Fragment key={ticket.TicketID}>
                      {/* Primary Ticket Row (Always expandable so user can view/add comments in Section 4) */}
                      <tr
                        onClick={() => toggleExpand(ticket.TicketID)}
                        className={`cursor-pointer transition-colors ${
                          ticket.isEscalated
                            ? 'bg-rose-50/25 hover:bg-rose-50/50'
                            : 'hover:bg-slate-50/80'
                        } ${isExpanded ? 'bg-orange-50/25' : ''}`}
                      >
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleExpand(ticket.TicketID); }}
                            className="w-4 h-4 rounded bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-600 inline-flex items-center justify-center transition-colors"
                            title={isExpanded ? 'Collapse Details' : 'Expand Details'}
                          >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </td>

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

                        <td className="p-1.5 font-bold text-slate-900 leading-tight truncate" title={ticket.Reason}>
                          {ticket.Reason}
                        </td>

                        <td className="p-1.5 text-slate-600 text-[10px] leading-tight truncate" title={ticket.TimeDate ? new Date(ticket.TimeDate).toLocaleString('en-IN') : '-'}>
                          {ticket.TimeDate ? (
                            <>
                              <div>{new Date(ticket.TimeDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                              <div className="text-slate-400 text-[9.5px]">{new Date(ticket.TimeDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                            </>
                          ) : '-'}
                        </td>

                        <td className="p-1.5 font-semibold text-slate-800 text-[10.5px] truncate" title={ticket.LineName}>
                          {ticket.LineName}
                        </td>

                        <td className="p-1.5 text-slate-700 font-medium text-[10.5px] truncate" title={ticket.StationName}>
                          {ticket.StationName}
                        </td>

                        <td className="p-1.5 text-slate-600 text-[10.5px] truncate" title={ticket.ActivityDesc}>
                          {ticket.ActivityDesc !== '-' ? ticket.ActivityDesc : '-'}
                        </td>

                        <td className="p-1.5 text-slate-700 font-mono text-[10px] truncate" title={ticket.PartName}>
                          {ticket.PartName !== '-' ? ticket.PartName : '-'}
                        </td>

                        <td className="p-1.5 text-slate-600 text-[10.5px] truncate" title={ticket.EquipmentName}>
                          {ticket.EquipmentName !== '-' ? ticket.EquipmentName : '-'}
                        </td>

                        <td className="p-1.5 font-mono text-slate-600 text-[10px] truncate" title={ticket.BreakdownID}>
                          {ticket.BreakdownID !== '-' ? (
                            <span className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                              {ticket.BreakdownID}
                            </span>
                          ) : '-'}
                        </td>

                        <td className="p-1.5 font-mono font-bold text-indigo-700 text-[10.5px] truncate" title={ticket.EngineNo}>
                          {ticket.EngineNo !== '-' ? ticket.EngineNo : '-'}
                        </td>

                        <td className="p-1.5 truncate" title={ticket.RaiseBy}>
                          <span className="font-semibold text-slate-700 bg-slate-100 px-1 py-0.5 rounded text-[10px] truncate inline-block max-w-full">
                            {ticket.RaiseBy}
                          </span>
                        </td>

                        <td className="p-1.5 truncate" title={ticket.ActionBy}>
                          <span className={`font-semibold px-2 py-0.5 rounded-full text-[10.5px] truncate inline-block max-w-full ${
                            ticket.ActionBy === 'Higher Management'
                              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {ticket.ActionBy === 'Higher Management' ? 'Higher Mgmt' : ticket.ActionBy}
                          </span>
                        </td>

                        <td className="p-1.5 text-slate-800 text-[10.5px] truncate" title={ticket.Remark}>
                          "{ticket.Remark}"
                        </td>

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

                        <td className="p-1.5 text-center whitespace-nowrap">
                          {ticket.isEscalated ? (
                            <span
                              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs whitespace-nowrap"
                              title="Escalated Ticket - Requires Action"
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

                      {/* EXPANDABLE SUB-SECTIONS: Section 4 (Ticket Communication Details + Add Comment) & Section 5 (Engine Hold Details) */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70">
                          <td colSpan="16" className="p-4 border-b border-slate-200">
                            <div className="space-y-4">
                              {/* SECTION 4: TICKET COMMUNICATION DETAILS + ADD COMMENT */}
                              <div className="rounded-lg border border-slate-200 overflow-hidden shadow-2xs bg-white">
                                <div className="bg-[#fed7aa]/30 px-3.5 py-1.5 border-b border-orange-200 flex items-center justify-between">
                                  <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                                    <span>Ticket Communication Details</span>
                                  </h3>
                                  <span className="text-[11px] text-slate-500 font-semibold">
                                    {(ticket.communications || []).length} Entries
                                  </span>
                                </div>

                                {(ticket.communications && ticket.communications.length > 0) ? (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                                        <tr>
                                          <th className="p-2 w-40">Department</th>
                                          <th className="p-2 w-40">Role</th>
                                          <th className="p-2">Remark</th>
                                          <th className="p-2 w-44">TimeDate</th>
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
                                            <td className="p-2 font-semibold text-slate-700">{comm.Role}</td>
                                            <td className="p-2 text-slate-800">{comm.Remark}</td>
                                            <td className="p-2 text-slate-500 font-mono text-[11px]">
                                              {comm.TimeDate ? new Date(comm.TimeDate).toLocaleString('en-IN') : '-'}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="px-4 py-3 text-xs text-slate-400 italic">
                                    No prior communication entries logged yet. Add a comment below.
                                  </div>
                                )}

                                {/* Add Comment Bar (Matches light-blue "Add Comment" wireframe block) */}
                                <div className="bg-slate-50/90 border-t border-slate-200 p-2.5 flex flex-col gap-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <input
                                      type="text"
                                      placeholder={`Add comment as ${user?.UserName || 'User'} (#${loggedInUserId})...`}
                                      value={commentInputs[ticket.TicketID] || ''}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [ticket.TicketID]: e.target.value }))}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleAddComment(ticket.TicketID);
                                        }
                                      }}
                                      className="flex-1 min-w-[240px] bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0369a1]"
                                    />
                                    <select
                                      value={commentStatusAction[ticket.TicketID] || ''}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => setCommentStatusAction(prev => ({ ...prev, [ticket.TicketID]: e.target.value }))}
                                      className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0369a1]"
                                      title="Optional status update when commenting"
                                    >
                                      <option value="">Keep Current Status</option>
                                      <option value="Open">Mark as Open</option>
                                      <option value="Escalated">Keep Escalated</option>
                                      <option value="Closed">Mark as Closed</option>
                                    </select>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddComment(ticket.TicketID);
                                      }}
                                      disabled={submittingComment[ticket.TicketID] || !(commentInputs[ticket.TicketID] || '').trim()}
                                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#dbeafe] hover:bg-[#bfdbfe] text-[#0369a1] border border-[#93c5fd] disabled:opacity-50 rounded-md text-xs font-bold shadow-2xs transition-all cursor-pointer"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                      <span>{submittingComment[ticket.TicketID] ? 'Saving...' : 'Add Comment'}</span>
                                    </button>
                                  </div>
                                  {commentFeedback[ticket.TicketID] && (
                                    <div className={`text-[11px] font-semibold px-2 ${
                                      commentFeedback[ticket.TicketID].type === 'success' ? 'text-emerald-700' : 'text-rose-600'
                                    }`}>
                                      {commentFeedback[ticket.TicketID].text}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* SECTION 5: ENGINE HOLD DETAILS (Collapsible, arrow on left, collapsed by default) */}
                              {(hasHolds || hasDefects) && (
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
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded bg-white/90 border border-orange-200 inline-flex items-center justify-center text-slate-600 shrink-0">
                                        {isHoldOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                      </span>
                                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                      <span className="text-xs font-black text-slate-800">Engine Hold Details</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {hasHolds && (
                                        <span className="text-[11px] text-slate-600 font-semibold bg-white/90 px-2 py-0.5 rounded border border-orange-200">
                                          {ticket.engineHold.holdSummary.length} Hold Records
                                        </span>
                                      )}
                                      {hasDefects && (
                                        <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                          {ticket.engineHold.defectDetails.length} Defect Points
                                        </span>
                                      )}
                                    </div>
                                  </button>

                                  {isHoldOpen && (
                                    <div>
                                      {hasHolds && (
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                                              <tr>
                                                <th className="p-2">Audit Group</th>
                                                <th className="p-2">HoldType</th>
                                                <th className="p-2">PartID</th>
                                                <th className="p-2">PartBatchID</th>
                                                <th className="p-2">PlanID</th>
                                                <th className="p-2">Engine No</th>
                                                <th className="p-2 text-right">Forward Qty</th>
                                                <th className="p-2 text-right">Backword Qty</th>
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

                                      {/* Defect Points & Inspection Logs (Collapsed by default, arrow on left) */}
                                      {hasDefects && (
                                        <div className={`p-3 bg-slate-50/70 ${hasHolds ? 'border-t border-slate-200' : ''}`}>
                                          <div className="rounded-lg border border-slate-200 overflow-hidden shadow-2xs bg-white">
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSubSection(`defect_${ticket.TicketID}`);
                                              }}
                                              className={`w-full bg-[#fed7aa]/25 hover:bg-[#fed7aa]/45 px-3.5 py-2 flex items-center justify-between transition-colors text-left ${
                                                isDefectOpen ? 'border-b border-orange-200' : ''
                                              }`}
                                            >
                                              <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded bg-white/90 border border-orange-200 inline-flex items-center justify-center text-slate-600 shrink-0">
                                                  {isDefectOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                </span>
                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                <span className="text-xs font-black text-slate-800">Defect Points & Inspection Logs</span>
                                              </div>
                                              <span className="text-[11px] text-slate-600 font-semibold bg-white/90 px-2 py-0.5 rounded border border-orange-200">
                                                {ticket.engineHold.defectDetails.length} Defect Points
                                              </span>
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
                                                      <th className="p-2">DateTime</th>
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
                                        </div>
                                      )}
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
