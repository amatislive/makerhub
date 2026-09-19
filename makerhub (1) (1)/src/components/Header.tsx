import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Menu,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  Cpu,
  CheckSquare,
  FileCode2,
  Printer,
  FileText,
  Lightbulb,
  X,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NavView } from './Navigation';

interface HeaderProps {
  currentView: NavView;
  onOpenCommandPalette: () => void;
  onOpenCreate: (type: 'project' | 'task' | 'inventory' | 'note' | 'print' | 'circuit' | 'code' | 'idea') => void;
  onOpenAuth: () => void;
  onToggleMobileMenu: () => void;
  onOpenOnboarding?: () => void;
  lowStockItems: Array<{ id: string; name: string; quantity: number; unit: string; minStockLevel: number }>;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenCommandPalette,
  onOpenCreate,
  onOpenAuth,
  onToggleMobileMenu,
  onOpenOnboarding,
  lowStockItems,
}) => {
  const { user } = useAuth();
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const viewTitles: Record<NavView, string> = {
    dashboard: 'Workshop Overview',
    projects: 'Project Management',
    inventory: 'Components & Materials',
    circuits: 'Circuit Lab // Workbench & SPICE',
    qr: 'QR Code Maker & Bin Labels',
    units: 'Unit Changer & Engineering Calculator',
    coding: 'AI Coding Workspace',
    prints: '3D Printing Tracker',
    tasks: 'Tasks & Kanban',
    notes: 'Notes & Experiments',
    ideas: 'Ideas Spark',
    files: 'Documentation & Files',
    analytics: 'Workshop Analytics',
  };

  return (
    <header className="h-16 bg-white border-b border-[#111111] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Menu & Current Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-[#111111] border border-[#111111] hover:bg-[#eeeeee]"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-lg sm:text-xl text-[#111111] tracking-tight leading-none">
              {viewTitles[currentView]}
            </h1>
          </div>
          <p className="font-mono-tech text-[10px] uppercase text-[#111111]/60 tracking-wider hidden sm:block mt-0.5">
            {user ? `${user.workspaceName || 'WORKSHOP'} // WORKBENCH` : 'WORKSPACE // PRODUCTION'}
          </p>
        </div>
      </div>

      {/* Right: Search, Create Quick Menu, Notification, User */}
      <div className="flex items-center gap-2.5">
        {/* Search Bar */}
        <button
          id="header-search-bar"
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-[#111111] bg-white text-[#111111] hover:bg-[#eeeeee] text-xs font-mono-tech transition-colors shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px]"
        >
          <Search className="w-3.5 h-3.5 text-[#fe5029]" />
          <span>SEARCH_CMD</span>
          <kbd className="px-1 text-[9px] bg-[#111111] text-white font-mono-tech">
            ⌘K
          </kbd>
        </button>

        {/* Onboarding Tour Button */}
        {onOpenOnboarding && (
          <button
            id="header-guide-button"
            type="button"
            onClick={onOpenOnboarding}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 border border-[#111111] bg-white hover:bg-[#f7e96e] text-xs font-mono-tech font-bold text-[#111111] shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Open Workshop Tour & Feature Guide"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#fe5029]" />
            <span>TOUR</span>
          </button>
        )}

        {/* Create Dropdown */}
        <div className="relative">
          <button
            id="header-create-menu-button"
            type="button"
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-tech font-bold uppercase bg-[#fe5029] text-white border border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#e4421d] active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">NEW RECORD</span>
          </button>

          {showCreateMenu && (
            <div
              className="absolute right-0 mt-2 w-60 bg-white border border-[#111111] shadow-[4px_4px_0px_#111111] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setShowCreateMenu(false)}
            >
              <div className="px-2.5 py-1 text-[9px] font-mono-tech uppercase font-bold text-[#111111]/60 border-b border-[#eeeeee] mb-1">
                // SELECT RECORD TYPE
              </div>
              <button
                type="button"
                onClick={() => onOpenCreate('circuit')}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono-tech text-[#111111] hover:bg-[#eeeeee] text-left"
              >
                <Cpu className="w-4 h-4 text-[#fe5029]" />
                <span className="font-bold">Circuit Pinout</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenCreate('project')}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono-tech text-[#111111] hover:bg-[#eeeeee] text-left"
              >
                <FolderKanban className="w-4 h-4 text-[#111111]" />
                <span>Project Workshop</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenCreate('inventory')}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono-tech text-[#111111] hover:bg-[#eeeeee] text-left"
              >
                <Cpu className="w-4 h-4 text-[#75f76e]" />
                <span>Component / Part</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenCreate('task')}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono-tech text-[#111111] hover:bg-[#eeeeee] text-left"
              >
                <CheckSquare className="w-4 h-4 text-[#6ebdf7]" />
                <span>Kanban Task</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenCreate('code')}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono-tech text-[#111111] hover:bg-[#eeeeee] text-left"
              >
                <FileCode2 className="w-4 h-4 text-[#fe5029]" />
                <span>Microcontroller Code</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenCreate('print')}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono-tech text-[#111111] hover:bg-[#eeeeee] text-left"
              >
                <Printer className="w-4 h-4 text-[#111111]" />
                <span>3D Print Job</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenCreate('note')}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono-tech text-[#111111] hover:bg-[#eeeeee] text-left"
              >
                <FileText className="w-4 h-4 text-[#111111]" />
                <span>Lab Note & Log</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenCreate('idea')}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono-tech text-[#111111] hover:bg-[#eeeeee] text-left"
              >
                <Lightbulb className="w-4 h-4 text-[#f7e96e]" />
                <span>Idea Spark</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications (strictly real data!) */}
        <div className="relative">
          <button
            id="header-notifications-button"
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 border border-[#111111] bg-white text-[#111111] hover:bg-[#eeeeee] relative transition-colors shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px]"
            title="Workshop Alerts"
          >
            <Bell className="w-4 h-4" />
            {lowStockItems.length > 0 && (
              <span className="w-2 h-2 bg-[#fe5029] border border-[#111111] absolute -top-1 -right-1" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#111111] shadow-[4px_4px_0px_#111111] p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#111111] mb-2 font-mono-tech">
                <span className="text-xs font-bold text-[#111111] uppercase">// SYSTEM NOTIFICATIONS</span>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-[#111111] hover:text-[#fe5029]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {lowStockItems.length === 0 ? (
                <div className="py-6 text-center text-xs font-mono-tech text-[#111111]/70">
                  <CheckCircle2 className="w-6 h-6 text-[#75f76e] mx-auto mb-1.5 stroke-[2]" />
                  <p className="font-bold text-[#111111]">ALL SYSTEMS NOMINAL</p>
                  <p className="text-[10px] text-[#111111]/50 mt-0.5">
                    Zero component shortages reported in current workshop.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <div className="text-[10px] font-mono-tech font-bold uppercase text-[#111111] bg-[#f7e96e] px-2 py-1 border border-[#111111] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>LOW STOCK ALERTS ({lowStockItems.length})</span>
                  </div>
                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 border border-[#111111] bg-[#eeeeee]/40 text-xs font-mono-tech"
                    >
                      <span className="font-bold text-[#111111] block">{item.name}</span>
                      <span className="text-[10px] text-red-600 block mt-0.5">
                        QTY: {item.quantity} {item.unit} (MIN: {item.minStockLevel})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Workspace Profile Button */}
        {user ? (
          <button
            id="header-user-profile-button"
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-2 py-1 border border-[#111111] hover:bg-[#eeeeee] transition-colors shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <div className="w-5 h-5 bg-[#fe5029] text-white flex items-center justify-center text-[10px] font-mono-tech font-bold uppercase">
              {user.name.slice(0, 1) || 'M'}
            </div>
            <span className="text-xs font-mono-tech font-bold text-[#111111] hidden sm:inline max-w-[90px] truncate">
              {user.name}
            </span>
          </button>
        ) : (
          <button
            id="header-signin-button"
            type="button"
            onClick={onOpenAuth}
            className="text-xs font-mono-tech font-bold uppercase px-3 py-1.5 border border-[#111111] text-[#111111] hover:bg-[#eeeeee] shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px]"
          >
            AUTH // LOGIN
          </button>
        )}
      </div>
    </header>
  );
};
