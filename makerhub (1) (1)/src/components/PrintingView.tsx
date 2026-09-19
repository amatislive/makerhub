import React, { useState } from 'react';
import {
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  AlertTriangle,
  Scale,
  Calendar,
  Filter
} from 'lucide-react';
import { PrintRecord, Project, PrintStatus } from '../types';
import { EmptyState } from './EmptyState';

interface PrintingViewProps {
  prints: PrintRecord[];
  projects: Project[];
  onOpenCreatePrint: () => void;
  onUpdatePrint: (id: string, data: Partial<PrintRecord>) => void;
  onDeletePrint: (id: string) => void;
}

export const PrintingView: React.FC<PrintingViewProps> = ({
  prints,
  projects,
  onOpenCreatePrint,
  onUpdatePrint,
  onDeletePrint,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPrints = prints.filter((p) => {
    return statusFilter === 'all' || p.status === statusFilter;
  });

  const getStatusBadge = (status: PrintStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      case 'printing':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 animate-pulse">
            <Clock className="w-3 h-3" />
            <span>Printing</span>
          </span>
        );
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <span>Queued</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
            <span>Cancelled</span>
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            3D Printing Tracker
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Track actual print jobs, materials, slicer settings, filament grams, and print failures.
          </p>
        </div>

        <button
          id="prints-add-btn"
          type="button"
          onClick={onOpenCreatePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#fe5029] text-white hover:bg-[#e4421d] transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Print Record</span>
        </button>
      </div>

      {prints.length === 0 ? (
        <EmptyState
          icon={Printer}
          title="No print records yet."
          description="Track your actual print jobs, materials, settings, and results as you manufacture physical parts."
          primaryAction={{
            label: 'Add Print Record',
            onClick: onOpenCreatePrint,
            icon: Plus,
          }}
          accentColor="yellow"
        />
      ) : (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-neutral-200 shadow-2xs w-fit">
            <span className="text-xs font-medium text-neutral-500 pl-1">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-neutral-200 rounded-lg px-2.5 py-1 bg-white text-neutral-700"
            >
              <option value="all">All Jobs ({prints.length})</option>
              <option value="completed">Completed</option>
              <option value="printing">Printing</option>
              <option value="queued">Queued</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPrints.map((print) => {
              const proj = projects.find((p) => p.id === print.projectId);
              return (
                <div
                  key={print.id}
                  className="bg-white rounded-xl border border-neutral-200 shadow-2xs p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                          {proj ? proj.name : 'Workshop Print'}
                        </span>
                        <h4 className="text-base font-bold text-neutral-900 mt-0.5">
                          {print.modelName}
                        </h4>
                      </div>
                      {getStatusBadge(print.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-neutral-100">
                      <div>
                        <span className="text-neutral-400 block text-[11px]">Printer</span>
                        <span className="font-semibold text-neutral-800">{print.printer || 'Standard FDM'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[11px]">Material</span>
                        <span className="font-semibold text-neutral-800">{print.material || 'PLA'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[11px]">Filament</span>
                        <span className="font-semibold text-neutral-800">
                          {print.filamentUsageGrams ? `${print.filamentUsageGrams}g` : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[11px]">Print Time</span>
                        <span className="font-semibold text-neutral-800">
                          {print.printDurationMinutes ? `${print.printDurationMinutes} mins` : '—'}
                        </span>
                      </div>
                    </div>

                    {print.failureReason && print.status === 'failed' && (
                      <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                        <span className="font-semibold block">Failure Cause:</span>
                        <span>{print.failureReason}</span>
                      </div>
                    )}

                    {print.notes && (
                      <p className="text-xs text-neutral-500 line-clamp-2 bg-neutral-50 p-2 rounded-lg">
                        {print.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-neutral-400 text-[11px]">
                      {new Date(print.createdAt).toLocaleDateString()}
                    </span>

                    <button
                      type="button"
                      onClick={() => onDeletePrint(print.id)}
                      className="p-1 text-neutral-400 hover:text-red-600 rounded-sm"
                      title="Delete print job"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
