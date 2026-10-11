import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  displayValue?: string;
  color?: 'indigo' | 'cyan' | 'violet' | 'emerald';
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  displayValue,
  color = 'indigo',
  className = '',
}) => {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const trackGradients = {
    indigo: 'from-indigo-600 to-indigo-400',
    cyan: 'from-cyan-600 to-cyan-400',
    violet: 'from-violet-600 to-violet-400',
    emerald: 'from-emerald-600 to-emerald-400',
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300">{label}</label>
        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-[#161928] text-indigo-300 border border-white/[0.06]">
          {displayValue !== undefined ? displayValue : `${value}${unit}`}
        </span>
      </div>

      <div className="relative flex items-center h-5">
        {/* Track background */}
        <div className="absolute w-full h-1.5 rounded-full bg-slate-800" />
        {/* Active track */}
        <div
          className={`absolute h-1.5 rounded-full bg-gradient-to-r ${trackGradients[color]}`}
          style={{ width: `${percentage}%` }}
        />
        {/* Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="relative w-full h-5 opacity-0 cursor-pointer z-10"
        />
        {/* Styled thumb visual */}
        <div
          className="absolute w-4 h-4 rounded-full bg-white shadow-lg pointer-events-none transform -translate-x-1/2 border-2 border-indigo-600"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
