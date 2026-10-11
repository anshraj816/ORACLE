import React from 'react';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min = 0,
  max,
  step = 1,
  helperText,
  error,
  disabled = false,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(0);
      return;
    }
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      if (min !== undefined && parsed < min) {
        onChange(min);
      } else if (max !== undefined && parsed > max) {
        onChange(max);
      } else {
        onChange(parsed);
      }
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <div
        className={`relative flex items-center bg-[#090a12] border rounded-xl transition-all duration-200 focus-within:ring-2 ${
          error
            ? 'border-rose-500/50 focus-within:ring-rose-500/20'
            : 'border-white/[0.08] focus-within:border-indigo-500/50 focus-within:ring-indigo-500/20'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {prefix && (
          <span className="pl-3.5 pr-1 text-sm font-medium text-slate-400 select-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={isNaN(value) ? '' : value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="w-full bg-transparent px-3 py-2.5 text-sm font-semibold text-slate-100 placeholder-slate-600 focus:outline-none"
        />
        {suffix && (
          <span className="pr-3.5 pl-1 text-xs font-medium text-slate-400 select-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}
      {!error && helperText && (
        <span className="text-xs text-slate-400">{helperText}</span>
      )}
    </div>
  );
};
