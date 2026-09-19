import React from 'react';
import {
  COMPONENT_CATALOG,
  CatalogItem,
} from '../../utils/breadboardModel';
import {
  Activity,
  Sliders,
  Zap,
  ArrowRight,
  Sun,
  CircleDot,
  BatteryCharging,
  Battery,
  Anchor,
  Cpu,
  Search,
  Plus,
  ChevronLeft,
  X
} from 'lucide-react';

interface ComponentPaletteProps {
  onAddComponent: (item: CatalogItem) => void;
  onClose?: () => void;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  onAddComponent,
  onClose,
}) => {
  const [filter, setFilter] = React.useState<string>('all');
  const [search, setSearch] = React.useState<string>('');

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity': return <Activity className="w-3.5 h-3.5" />;
      case 'Sliders': return <Sliders className="w-3.5 h-3.5" />;
      case 'Zap': return <Zap className="w-3.5 h-3.5" />;
      case 'ArrowRight': return <ArrowRight className="w-3.5 h-3.5" />;
      case 'Sun': return <Sun className="w-3.5 h-3.5 text-[#fe5029]" />;
      case 'CircleDot': return <CircleDot className="w-3.5 h-3.5" />;
      case 'BatteryCharging': return <BatteryCharging className="w-3.5 h-3.5 text-[#fe5029]" />;
      case 'Battery': return <Battery className="w-3.5 h-3.5" />;
      case 'Anchor': return <Anchor className="w-3.5 h-3.5 text-blue-600" />;
      case 'Cpu': return <Cpu className="w-3.5 h-3.5 text-purple-600" />;
      default: return <Zap className="w-3.5 h-3.5" />;
    }
  };

  const categories = [
    { id: 'all', label: 'ALL (200+)' },
    { id: 'boards', label: 'BOARDS' },
    { id: 'basic', label: 'PASSIVES' },
    { id: 'power', label: 'POWER' },
    { id: 'output', label: 'LEDS/OUT' },
    { id: 'sensors', label: 'SENSORS' },
    { id: 'ics', label: 'ICS' },
    { id: 'modules', label: 'COMM/DISP' },
    { id: 'electromechanical', label: 'MOTORS/RELAY' }
  ];

  const filtered = COMPONENT_CATALOG.filter(c => {
    const matchCat = filter === 'all' || c.category === filter;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="w-full flex flex-col h-full bg-white border-r border-[#111111]">
      {/* Header */}
      <div className="p-3 border-b border-[#111111] bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="font-mono-tech text-[11px] font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#fe5029] border border-[#111111]"></span>
            <span>PART_BIN</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono-tech text-[9px] px-1.5 py-0.5 bg-[#eeeeee] border border-[#111111] text-[#111111]/70">
              {filtered.length} AVAILABLE
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Slide Left / Close Part Bin"
                className="p-1 hover:bg-[#fe5029] hover:text-white text-[#111111] border border-[#111111] transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="w-3 h-3 absolute left-2 top-2 text-[#111111]/50" />
          <input
            type="text"
            placeholder="FILTER 200+ COMPONENTS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-6 pr-2 py-1 text-[11px] font-mono-tech border border-[#111111] bg-[#ffffff] text-[#111111] placeholder-[#111111]/40 focus:outline-none focus:ring-1 focus:ring-[#fe5029]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-thin">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter(cat.id)}
              className={`px-2 py-0.5 text-[9px] font-mono-tech font-bold uppercase whitespace-nowrap border transition-all ${
                filter === cat.id
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white text-[#111111]/70 border-[#eeeeee] hover:border-[#111111]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
        {filtered.map(item => (
          <div
            key={item.type + item.name}
            className="p-2 border border-[#111111] bg-white hover:bg-[#eeeeee]/40 transition-all flex flex-col gap-1 group shadow-[1px_1px_0px_#111111]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="p-1 border border-[#111111] bg-white">
                  {renderIcon(item.iconName)}
                </div>
                <div>
                  <div className="font-mono-tech text-[11px] font-bold text-[#111111] leading-tight">
                    {item.name}
                  </div>
                  <div className="font-mono-tech text-[9px] text-[#111111]/60">
                    DEF: {item.defaultVal} {item.unit}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onAddComponent(item)}
                title={`Add ${item.name} to Workbench`}
                className="px-2 py-1 bg-white hover:bg-[#fe5029] hover:text-white text-[#111111] border border-[#111111] font-mono-tech text-[10px] font-bold flex items-center gap-1 transition-colors shadow-[1px_1px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px]"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>PLACE</span>
              </button>
            </div>

            <p className="text-[10px] text-[#111111]/70 line-clamp-1">
              {item.description}
            </p>

            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[8px] font-mono-tech px-1 border bg-[#eeeeee] text-[#111111] border-[#111111]/30">
                {item.spiceSupported ? 'SIMULATED' : 'LOGIC'}
              </span>
              <span className="text-[8px] font-mono-tech text-[#111111]/50">
                • {item.pinCount} PINS
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-4 text-center font-mono-tech text-[11px] text-[#111111]/50 border border-dashed border-[#111111]/30">
            NO MATCHING PARTS FOUND
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2 border-t border-[#111111] bg-[#eeeeee]/50 text-[9px] font-mono-tech text-[#111111]/70 flex items-center justify-between">
        <span>CLICK PLACE TO ADD TO MAT</span>
        <span className="font-bold text-[#fe5029]">MAKEO LAB</span>
      </div>
    </div>
  );
};
