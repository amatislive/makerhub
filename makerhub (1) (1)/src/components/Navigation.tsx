import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Cpu,
  Zap,
  FileCode2,
  Printer,
  CheckSquare,
  FileText,
  Lightbulb,
  FolderArchive,
  BarChart3,
  Search,
  Plus,
  LogOut,
  User,
  Wrench,
  ShieldCheck,
  QrCode,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavView =
  | 'dashboard'
  | 'projects'
  | 'inventory'
  | 'circuits'
  | 'coding'
  | 'prints'
  | 'qr'
  | 'units'
  | 'tasks'
  | 'notes'
  | 'ideas'
  | 'files'
  | 'analytics';

interface NavigationProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenCommandPalette: () => void;
  onOpenCreate: (type: 'project' | 'task' | 'inventory' | 'note' | 'print' | 'circuit' | 'code' | 'idea') => void;
  onOpenAuth: () => void;
  lowStockCount: number;
  isMobileDrawer?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onSelectView,
  onOpenCommandPalette,
  onOpenCreate,
  onOpenAuth,
  lowStockCount,
  isMobileDrawer = false,
}) => {
  const { user, logout } = useAuth();

  const navItems: Array<{ id: NavView; label: string; shortLabel: string; icon: React.ElementType; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'OVERVIEW', icon: LayoutDashboard },
    { id: 'circuits', label: 'Circuit Lab', shortLabel: 'CIRCUIT', icon: Zap },
    { id: 'projects', label: 'Projects', shortLabel: 'PROJECTS', icon: FolderKanban },
    { id: 'inventory', label: 'Inventory', shortLabel: 'PARTS', icon: Cpu, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'qr', label: 'QR Maker', shortLabel: 'QR LABELS', icon: QrCode },
    { id: 'units', label: 'Unit Changer', shortLabel: 'CONVERT', icon: ArrowRightLeft },
    { id: 'coding', label: 'AI Studio', shortLabel: 'CODE', icon: FileCode2 },
    { id: 'prints', label: 'Slice Studio', shortLabel: 'SLICE', icon: Printer },
    { id: 'tasks', label: 'Tasks & Kanban', shortLabel: 'TASKS', icon: CheckSquare },
    { id: 'notes', label: 'Lab Notes', shortLabel: 'NOTES', icon: FileText },
    { id: 'ideas', label: 'Ideas Spark', shortLabel: 'SPARK', icon: Lightbulb },
    { id: 'files', label: 'Documentation', shortLabel: 'DOCS', icon: FolderArchive },
    { id: 'analytics', label: 'Analytics', shortLabel: 'STATS', icon: BarChart3 },
  ];

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <aside
      className={`${
        isMobileDrawer ? 'w-64' : 'w-[80px]'
      } bg-white border-r border-[#111111] flex flex-col shrink-0 select-none h-screen sticky top-0 z-40 transition-all`}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-[#111111] flex flex-col items-center justify-center p-2 bg-white">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="w-9 h-9 border border-[#111111] bg-[#fe5029] flex items-center justify-center text-white font-display font-extrabold shadow-[2px_2px_0px_#111111] hover:bg-[#e4421d] cursor-pointer transition-transform active:translate-x-[1px] active:translate-y-[1px]"
          >
            <Zap className="w-5 h-5 fill-white stroke-white stroke-[2]" />
          </button>
          {isMobileDrawer && (
            <div>
              <span className="font-display font-extrabold text-sm text-[#111111] tracking-tight block">
                MAKEO
              </span>
              <span className="font-mono-tech text-[9px] uppercase tracking-wider text-neutral-500 block">
                Digital Workshop
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions: Create & Command Search */}
      <div className="p-2 border-b border-[#eeeeee] flex flex-col items-center gap-1.5 bg-[#ffffff]">
        <button
          id="nav-new-record-btn"
          type="button"
          onClick={() => onOpenCreate('circuit')}
          title="Create New Circuit / Record"
          className="w-10 h-10 border border-[#111111] bg-[#fe5029] text-white flex items-center justify-center shadow-[2px_2px_0px_#111111] hover:bg-[#e4421d] active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <button
          id="nav-search-button"
          type="button"
          onClick={onOpenCommandPalette}
          title="Command Palette (⌘K)"
          className="w-10 h-8 border border-[#eeeeee] hover:border-[#111111] text-[#111111] flex items-center justify-center hover:bg-[#eeeeee]/50 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-2 px-1 overflow-y-auto space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              id={`nav-${item.id}-button`}
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              title={item.label}
              className={`w-full flex flex-col items-center justify-center py-2 px-1 transition-all relative group ${
                isActive
                  ? 'bg-[#111111] text-white border-l-3 border-[#fe5029]'
                  : 'text-[#111111]/70 hover:text-[#111111] hover:bg-[#eeeeee]/60'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#fe5029]' : 'text-[#111111]'
                  }`}
                />
                {item.badge !== undefined && (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-[#f7e96e] border border-[#111111] text-[#111111] font-mono-tech text-[9px] font-bold flex items-center justify-center"
                    title={`${item.badge} low stock`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`font-mono-tech text-[8px] uppercase tracking-tighter mt-1 block truncate max-w-full ${
                  isActive ? 'text-white font-bold' : 'text-[#111111]/80'
                }`}
              >
                {isMobileDrawer ? item.label : item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>

      {/* System Status Indicator */}
      <div className="p-2 border-t border-[#eeeeee] flex flex-col items-center justify-center bg-white">
        <div
          className="w-2.5 h-2.5 rounded-full bg-[#75f76e] border border-[#111111]"
          title="System Online"
        />
      </div>

      {/* Account Footer */}
      <div className="p-2 border-t border-[#111111] flex flex-col items-center justify-center bg-white">
        {user ? (
          <button
            id="user-logout-button"
            type="button"
            onClick={logout}
            title={`Sign Out (${user.name})`}
            className="w-9 h-9 border border-[#111111] bg-[#eeeeee] text-[#111111] flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <button
            id="nav-signin-button"
            type="button"
            onClick={onOpenAuth}
            title="Sign In / Register"
            className="w-9 h-9 border border-[#111111] bg-white hover:bg-[#eeeeee] text-[#111111] flex items-center justify-center transition-colors shadow-[1px_1px_0px_#111111]"
          >
            <User className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};

