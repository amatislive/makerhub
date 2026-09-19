import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: 'primary' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  accentColor?: 'orange' | 'blue' | 'green' | 'yellow' | 'neutral';
  className?: string;
  badge?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  accentColor = 'orange',
  className = '',
  badge,
}) => {
  const getAccentBg = () => {
    switch (accentColor) {
      case 'orange':
        return 'bg-[#fe5029] text-white border-[#111111] shadow-[2px_2px_0px_#111111]';
      case 'blue':
        return 'bg-[#6ebdf7] text-[#111111] border-[#111111] shadow-[2px_2px_0px_#111111]';
      case 'green':
        return 'bg-[#75f76e] text-[#111111] border-[#111111] shadow-[2px_2px_0px_#111111]';
      case 'yellow':
        return 'bg-[#f7e96e] text-[#111111] border-[#111111] shadow-[2px_2px_0px_#111111]';
      default:
        return 'bg-[#eeeeee] text-[#111111] border-[#111111] shadow-[2px_2px_0px_#111111]';
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center border border-[#111111] bg-white shadow-[4px_4px_0px_#111111] circuit-grid ${className}`}
    >
      <div
        className={`w-14 h-14 flex items-center justify-center mb-4 border transition-transform duration-100 hover:scale-105 ${getAccentBg()}`}
      >
        <Icon className="w-7 h-7 stroke-[2]" />
      </div>

      {badge && (
        <span className="inline-flex items-center px-2 py-0.5 font-mono-tech text-[10px] font-bold uppercase bg-[#eeeeee] text-[#111111] mb-3 border border-[#111111]">
          {badge}
        </span>
      )}

      <h3 className="font-display font-extrabold text-xl text-[#111111] tracking-tight uppercase mb-2">
        {title}
      </h3>

      <p className="font-mono-tech text-xs text-[#111111]/70 max-w-md leading-relaxed mb-6 uppercase tracking-wide">
        {description}
      </p>

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryAction && (
            <button
              id={`empty-action-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              type="button"
              onClick={primaryAction.onClick}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-mono-tech text-xs font-bold uppercase bg-[#fe5029] text-white border border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#e4421d] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              {primaryAction.icon && <primaryAction.icon className="w-4 h-4 stroke-[2.5]" />}
              <span>{primaryAction.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-mono-tech text-xs font-bold uppercase text-[#111111] bg-[#eeeeee] hover:bg-[#e0e0e0] border border-[#111111] shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4" />}
              <span>{secondaryAction.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
