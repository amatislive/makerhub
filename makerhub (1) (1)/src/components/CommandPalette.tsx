import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  FolderKanban,
  CheckSquare,
  Cpu,
  FileCode2,
  Printer,
  FileText,
  Lightbulb,
  Plus,
  X,
  ArrowRight,
  Loader2,
  QrCode,
  ArrowRightLeft,
} from 'lucide-react';
import { api } from '../api';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  link: string;
  matchDetail?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, detailId?: string) => void;
  onOpenCreate: (type: 'project' | 'task' | 'inventory' | 'note' | 'print' | 'circuit' | 'code' | 'idea') => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenCreate,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search.query(query);
        setResults(res.results || []);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { label: 'Create New Project', type: 'project' as const, icon: FolderKanban, color: 'text-[#fe5029]' },
    { label: 'Add Inventory Component', type: 'inventory' as const, icon: Cpu, color: 'text-emerald-600' },
    { label: 'Create Task', type: 'task' as const, icon: CheckSquare, color: 'text-blue-600' },
    { label: 'Record 3D Print Job', type: 'print' as const, icon: Printer, color: 'text-purple-600' },
    { label: 'Write Workshop Note', type: 'note' as const, icon: FileText, color: 'text-amber-600' },
    { label: 'Capture Project Idea', type: 'idea' as const, icon: Lightbulb, color: 'text-yellow-600' },
    { label: 'Document Circuit & Pinout', type: 'circuit' as const, icon: Cpu, color: 'text-sky-600' },
    { label: 'Open AI Coding', type: 'code' as const, icon: FileCode2, color: 'text-indigo-600' },
  ];

  const handleResultClick = (res: SearchResult) => {
    onClose();
    if (res.type === 'Project') {
      onNavigate('projects', res.id);
    } else if (res.type === 'Task') {
      onNavigate('tasks');
    } else if (res.type === 'Inventory') {
      onNavigate('inventory');
    } else if (res.type === 'Circuit') {
      onNavigate('circuits');
    } else if (res.type === 'Code') {
      onNavigate('coding');
    } else if (res.type === 'Note') {
      onNavigate('notes');
    } else if (res.type === '3D Print') {
      onNavigate('prints');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Project': return FolderKanban;
      case 'Task': return CheckSquare;
      case 'Inventory': return Cpu;
      case 'Circuit': return Cpu;
      case 'Code': return FileCode2;
      case '3D Print': return Printer;
      default: return FileText;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#111111]/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div
        className="w-full max-w-2xl bg-white border border-[#111111] shadow-[6px_6px_0px_#111111] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#111111] gap-3 bg-white">
          <Search className="w-5 h-5 text-[#fe5029] shrink-0 stroke-[2.5]" />
          <input
            id="command-palette-search-input"
            ref={inputRef}
            type="text"
            placeholder="SEARCH WORKSHOP: PROJECTS, CIRCUITS, PINS, INVENTORY, CODE..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 font-mono-tech text-xs sm:text-sm outline-none text-[#111111] placeholder:text-[#111111]/40 uppercase tracking-wide"
          />
          {loading && <Loader2 className="w-4 h-4 text-[#fe5029] animate-spin shrink-0" />}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-[#111111] hover:text-[#fe5029] p-1 border border-[#111111]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-white bg-[#111111] font-mono-tech uppercase">
            ESC
          </kbd>
        </div>

        {/* Results / Quick Actions */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.trim() ? (
            <div>
              <div className="px-1 py-1 font-mono-tech text-[10px] font-bold text-[#111111]/60 uppercase tracking-wider border-b border-[#eeeeee] mb-2">
                // MATCHED WORKSHOP ENTITIES ({results.length})
              </div>

              {results.length === 0 && !loading ? (
                <div className="py-8 text-center font-mono-tech text-xs text-[#111111]/70 uppercase">
                  <p className="font-bold text-[#111111]">ZERO RECORDS FOUND</p>
                  <p className="text-[10px] text-[#111111]/50 mt-1">NO DATABASE ITEMS MATCHED "{query}".</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {results.map((res) => {
                    const IconComponent = getTypeIcon(res.type);
                    return (
                      <button
                        key={`${res.type}-${res.id}`}
                        type="button"
                        onClick={() => handleResultClick(res)}
                        className="w-full flex items-center justify-between p-2.5 border border-[#eeeeee] hover:border-[#111111] hover:bg-[#eeeeee]/40 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 border border-[#111111] bg-white flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#111111]">
                            <IconComponent className="w-3.5 h-3.5 text-[#fe5029]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono-tech font-bold text-xs text-[#111111] truncate">{res.title}</span>
                              <span className="font-mono-tech text-[9px] font-bold uppercase px-1 py-0.2 bg-[#f7e96e] text-[#111111] border border-[#111111]">
                                {res.type}
                              </span>
                            </div>
                            <p className="font-mono-tech text-[10px] text-[#111111]/60 truncate">{res.subtitle}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="px-1 py-1 font-mono-tech text-[10px] font-bold text-[#111111]/60 uppercase tracking-wider mb-2 border-b border-[#eeeeee]">
                // WORKSHOP RAPID ACTIONS & MAKER UTILITIES
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('qr');
                  }}
                  className="flex items-center gap-3 p-2.5 border border-[#111111] bg-[#fdfdfd] hover:bg-[#eeeeee] text-left transition-all group shadow-[1px_1px_0px_#111111]"
                >
                  <div className="w-7 h-7 border border-[#111111] bg-[#111111] text-white flex items-center justify-center shrink-0">
                    <QrCode className="w-3.5 h-3.5 text-[#fe5029]" />
                  </div>
                  <div>
                    <span className="font-mono-tech text-xs font-black uppercase text-[#111111] block">
                      QR MAKER & BIN LABELS
                    </span>
                    <span className="font-mono-tech text-[9px] text-[#111111]/60 block">
                      Inventory stickers & Wi-Fi codes
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('units');
                  }}
                  className="flex items-center gap-3 p-2.5 border border-[#111111] bg-[#fdfdfd] hover:bg-[#eeeeee] text-left transition-all group shadow-[1px_1px_0px_#111111]"
                >
                  <div className="w-7 h-7 border border-[#111111] bg-[#111111] text-white flex items-center justify-center shrink-0">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-[#75f76e]" />
                  </div>
                  <div>
                    <span className="font-mono-tech text-xs font-black uppercase text-[#111111] block">
                      UNIT CHANGER / CONVERTER
                    </span>
                    <span className="font-mono-tech text-[9px] text-[#111111]/60 block">
                      Resistors, AWG, flow & torque
                    </span>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.type}
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCreate(action.type);
                    }}
                    className="flex items-center gap-3 p-2.5 border border-[#eeeeee] hover:border-[#111111] hover:bg-[#eeeeee]/50 text-left transition-all group"
                  >
                    <div className="w-7 h-7 border border-[#111111] bg-white flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#111111]">
                      <action.icon className="w-3.5 h-3.5 text-[#fe5029]" />
                    </div>
                    <span className="font-mono-tech text-xs font-bold uppercase text-[#111111]">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#eeeeee]/60 border-t border-[#111111] flex items-center justify-between font-mono-tech text-[10px] uppercase text-[#111111]/70">
          <span>REAL DATA ENGINE // SEARCH OVER WORKSHOP ENTITIES</span>
          <span>ESC TO CLOSE</span>
        </div>
      </div>
    </div>
  );
};
