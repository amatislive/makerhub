import React from 'react';
import { PlacedComponent, PinDefinition } from '../../types/circuit';
import { Trash2, RotateCw, Settings2, Sliders, Hash } from 'lucide-react';

interface ComponentPropertiesProps {
  component: PlacedComponent | null;
  onUpdateComponent: (updated: PlacedComponent) => void;
  onDeleteComponent: (id: string) => void;
  onRotateComponent: (id: string) => void;
}

export const ComponentProperties: React.FC<ComponentPropertiesProps> = ({
  component,
  onUpdateComponent,
  onDeleteComponent,
  onRotateComponent,
}) => {
  if (!component) {
    return (
      <div className="p-4 text-center font-mono-tech text-[10px] text-[#111111]/50 border border-dashed border-[#111111]/30">
        NO COMPONENT SELECTED
      </div>
    );
  }

  return (
    <div className="p-3 border border-[#111111] bg-white shadow-[2px_2px_0px_#111111] space-y-3 font-mono-tech text-xs">
      {/* Title & Actions */}
      <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
        <div className="flex items-center gap-1.5 font-bold uppercase text-[#111111]">
          <Settings2 className="w-3.5 h-3.5 text-[#fe5029]" />
          <span>{component.name} ({component.type})</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onRotateComponent(component.id)}
            title="Rotate 90 degrees"
            className="p-1 border border-[#111111] bg-white hover:bg-[#eeeeee] transition-colors"
          >
            <RotateCw className="w-3 h-3 text-[#111111]" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteComponent(component.id)}
            title="Delete component"
            className="p-1 border border-[#111111] bg-white hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Field: Designator Name */}
      <div className="space-y-1">
        <label className="text-[9px] font-bold text-[#111111]/70 uppercase">
          DESIGNATOR (LABEL)
        </label>
        <input
          type="text"
          value={component.name}
          onChange={(e) => onUpdateComponent({ ...component, name: e.target.value })}
          className="w-full p-1.5 border border-[#111111] text-xs font-mono-tech bg-white focus:outline-none focus:ring-1 focus:ring-[#fe5029]"
        />
      </div>

      {/* Field: Electrical Value */}
      <div className="space-y-1">
        <label className="text-[9px] font-bold text-[#111111]/70 uppercase flex items-center justify-between">
          <span>ELECTRICAL VALUE</span>
          <span className="text-[#fe5029] font-normal">{component.unit || ''}</span>
        </label>
        <div className="flex gap-1">
          <input
            type="text"
            value={component.value}
            onChange={(e) => onUpdateComponent({ ...component, value: e.target.value })}
            placeholder="e.g. 220, 10k, 5, 10u"
            className="flex-1 p-1.5 border border-[#111111] text-xs font-mono-tech bg-white focus:outline-none focus:ring-1 focus:ring-[#fe5029]"
          />
          {component.unit && (
            <span className="px-2 py-1.5 border border-[#111111] bg-[#eeeeee] text-xs font-bold flex items-center">
              {component.unit}
            </span>
          )}
        </div>
      </div>

      {/* Pins Status */}
      <div className="space-y-1 pt-1 border-t border-[#eeeeee]">
        <div className="text-[9px] font-bold text-[#111111]/70 uppercase">
          TERMINAL PINS ({component.pins.length})
        </div>
        <div className="space-y-1 max-h-28 overflow-y-auto scrollbar-thin">
          {component.pins.map((p) => (
            <div
              key={p.id}
              className="p-1 border border-[#eeeeee] bg-[#eeeeee]/30 text-[9px] flex items-center justify-between"
            >
              <span className="font-bold">{p.name} [{p.label}]</span>
              <span className="text-[#fe5029] font-mono-tech">
                {p.connectedHoleId ? `Hole ${p.connectedHoleId}` : 'Wire/Free'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
