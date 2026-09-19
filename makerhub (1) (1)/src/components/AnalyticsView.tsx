import React from 'react';
import {
  BarChart3,
  TrendingUp,
  FolderKanban,
  CheckSquare,
  Cpu,
  Printer,
  DollarSign,
  AlertCircle,
  Clock,
  PieChart
} from 'lucide-react';
import { AnalyticsData } from '../types';
import { EmptyState } from './EmptyState';

interface AnalyticsViewProps {
  analytics: AnalyticsData | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics }) => {
  if (!analytics || !analytics.hasData || analytics.totalRecords === 0) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Workshop Analytics & Insights
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Computed exclusively from your real workshop activity and inventory.
          </p>
        </div>

        <EmptyState
          icon={BarChart3}
          title="Not enough data yet."
          description="Your workshop data will appear here as you create real projects, log components with purchase costs, complete tasks, and record 3D print results."
          accentColor="neutral"
          badge="Zero Fabricated Metrics"
        />
      </div>
    );
  }

  // Real calculations
  const totalProjects = analytics.projects.total;
  const finishedProjects = analytics.projects.byStatus['finished'] || 0;
  const projectCompletionRate =
    totalProjects > 0 ? Math.round((finishedProjects / totalProjects) * 100) : 0;

  const totalTasks = analytics.tasks.total;
  const completedTasks = analytics.tasks.completed;
  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalPrints = analytics.prints.total;
  const successfulPrints = analytics.prints.byStatus['completed'] || 0;
  const failedPrints = analytics.prints.byStatus['failed'] || 0;
  const printSuccessRate =
    totalPrints > 0 ? Math.round((successfulPrints / totalPrints) * 100) : 0;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
          Workshop Analytics & Insights
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500">
          Real metrics computed directly from {analytics.totalRecords} records in your workshop database.
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Project Rate */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Project Completion</span>
            <FolderKanban className="w-4 h-4 text-[#fe5029]" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {projectCompletionRate}%
          </div>
          <p className="text-[11px] text-neutral-400">
            {finishedProjects} of {totalProjects} projects marked 'finished'
          </p>
        </div>

        {/* Task Throughput */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Task Throughput</span>
            <CheckSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {taskCompletionRate}%
          </div>
          <p className="text-[11px] text-neutral-400">
            {completedTasks} completed out of {totalTasks} total tasks
          </p>
        </div>

        {/* Inventory Value */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Logged Inventory Value</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            ${analytics.inventory.totalInventoryCost.toFixed(2)}
          </div>
          <p className="text-[11px] text-neutral-400">
            From {analytics.inventory.inventoryWithCostCount} components with entered costs
          </p>
        </div>

        {/* 3D Print Reliability */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">3D Print Success Rate</span>
            <Printer className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {totalPrints > 0 ? `${printSuccessRate}%` : 'No prints'}
          </div>
          <p className="text-[11px] text-neutral-400">
            {successfulPrints} succeeded, {failedPrints} failed
          </p>
        </div>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900">Project Status Distribution</h3>
          {totalProjects === 0 ? (
            <p className="text-xs text-neutral-400">No projects to break down.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(analytics.projects.byStatus).map(([status, count]) => {
                const pct = Math.round((count / totalProjects) * 100);
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="capitalize text-neutral-700">{status}</span>
                      <span className="text-neutral-500">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#fe5029] h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3D Printing & Filament Metrics */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900">Manufacturing & 3D Print Metrics</h3>
          {totalPrints === 0 ? (
            <p className="text-xs text-neutral-400">No print jobs logged yet.</p>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Total Filament Consumed</span>
                <span className="font-bold text-neutral-900">
                  {analytics.prints.totalFilamentGrams} grams
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-500">Total Machine Print Time</span>
                <span className="font-bold text-neutral-900">
                  {(analytics.prints.totalDurationMinutes / 60).toFixed(1)} hours ({analytics.prints.totalDurationMinutes} mins)
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-500">Active / Queued Jobs</span>
                <span className="font-bold text-neutral-900">
                  {(analytics.prints.byStatus['printing'] || 0) + (analytics.prints.byStatus['queued'] || 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
