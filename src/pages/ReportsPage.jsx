import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import { formatDate } from '../utils/helpers';

export const ReportsPage = () => {
  const { currentWorkspace } = useAuth();
  const toast = useToast();

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!currentWorkspace) return;
      try {
        setLoading(true);
        const { data } = await api.get('/reports/workspace');
        if (data.success) {
          setReportData(data.report);
        }
      } catch (err) {
        toast.error('Failed to generate report data.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [currentWorkspace]);

  // Generate and Download PDF Report
  const handleDownloadPDF = () => {
    if (!reportData) return;

    try {
      setExporting(true);
      const doc = new jsPDF();

      // Brand Header Banner (#18181B)
      doc.setFillColor(24, 24, 27);
      doc.rect(0, 0, 210, 36, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('TaskFlow AI — Workspace Status Report', 14, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()} | Workspace: ${currentWorkspace?.name || 'Workspace'}`, 14, 28);

      // Workspace Overview Section
      doc.setTextColor(24, 24, 27);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Workspace: ${reportData.workspace?.name || currentWorkspace?.name || 'Workspace'}`, 14, 48);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(113, 113, 122);
      doc.text(reportData.workspace?.description || 'Active workspace status report and deliverable tracking.', 14, 54, { maxWidth: 180 });

      // Summary Statistics Box
      doc.setDrawColor(228, 228, 231);
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(14, 64, 182, 28, 3, 3, 'FD');

      doc.setTextColor(24, 24, 27);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', 20, 72);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Total Tasks: ${reportData.summary.totalTasks}  |  Completed: ${reportData.summary.completedCount} (${reportData.summary.completionRate}%)  |  In Progress: ${reportData.summary.inProgressCount}  |  Overdue: ${reportData.summary.overdueCount}`,
        20,
        82
      );

      // Tasks Table
      const tableRows = (reportData.tasks || []).map((t) => [
        t.title,
        t.status.toUpperCase().replace('_', ' '),
        t.priority.toUpperCase(),
        t.assignee,
        t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A',
      ]);

      autoTable(doc, {
        startY: 100,
        head: [['Task Title', 'Status', 'Priority', 'Assignee', 'Due Date']],
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: [24, 24, 27],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [24, 24, 27],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { left: 14, right: 14 },
      });

      // Save PDF file
      const filename = `${(currentWorkspace?.name || 'workspace').toLowerCase().replace(/[^a-z0-9]/g, '_')}_report.pdf`;
      doc.save(filename);
      toast.success('PDF Report exported successfully!');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Failed to generate PDF export.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Workspace Reports & PDF Export</h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate executive printable PDF deliverables and status audits in {currentWorkspace?.name}.
          </p>
        </div>

        {reportData && (
          <button
            onClick={handleDownloadPDF}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-98 self-start sm:self-auto disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
        )}
      </div>

      {/* Report Preview */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200 animate-pulse">
          Synthesizing real-time workspace metrics...
        </div>
      ) : !reportData ? (
        <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
          No workspace data available.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive Overview Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{reportData.workspace?.name || currentWorkspace?.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit of workspace tasks and velocity.</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <span className="block font-semibold text-slate-800">Owner: {reportData.workspace?.owner || 'Workspace Admin'}</span>
                <span>Active Deliverables</span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                <span className="text-2xl font-bold text-slate-900 block">{reportData.summary.totalTasks}</span>
                <span className="text-[11px] text-slate-400 font-medium">Total Tasks</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-100 border border-zinc-200 text-center">
                <span className="text-2xl font-bold text-zinc-900 block">{reportData.summary.completionRate}%</span>
                <span className="text-[11px] text-zinc-600 font-medium">
                  {reportData.summary.completedCount} Completed
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-center">
                <span className="text-2xl font-bold text-amber-700 block">{reportData.summary.inProgressCount}</span>
                <span className="text-[11px] text-amber-600 font-medium">In Progress</span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/70 text-center">
                <span className="text-2xl font-bold text-rose-700 block">{reportData.summary.overdueCount}</span>
                <span className="text-[11px] text-rose-600 font-medium">Overdue</span>
              </div>
            </div>

            {/* Team Allocation in Report */}
            {reportData.memberWorkload?.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-zinc-900" /> Member Assignment Summary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {reportData.memberWorkload.map((m, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{m.name}</span>
                      <span className="text-slate-500 font-medium">{m.completed}/{m.total} done</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Tasks Audit Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Full Task Breakdown ({reportData.tasks?.length || 0})
              </h4>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.tasks?.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{t.title}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={t.status} size="xs" />
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={t.priority} size="xs" showIcon={false} />
                    </td>
                    <td className="py-3 px-4 text-slate-700">{t.assignee}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {t.dueDate ? formatDate(t.dueDate) : 'No due date'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
