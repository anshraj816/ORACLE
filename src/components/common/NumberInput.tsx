import React, { useEffect, useState } from 'react';

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
  const [localStr, setLocalStr] = useState<string>(() => (value === 0 ? '0' : String(value)));
  const [isFocused, setIsFocused] = useState(false);

  // Synchronize when value changes externally (e.g. preset selection or reset)
  useEffect(() => {
    if (!isFocused) {
      setLocalStr(isNaN(value) ? '' : String(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Allow user to completely backspace/empty the field
    if (raw === '') {
      setLocalStr('');
      onChange(0);
      return;
    }

    // Clean leading zeros (e.g., if user types "2" while "0" is there: "02" -> "2", but preserve "0.5")
    let cleaned = raw;
    if (cleaned.length > 1 && cleaned.startsWith('0') && cleaned[1] !== '.') {
      cleaned = cleaned.replace(/^0+/, '');
      if (cleaned === '') cleaned = '0';
    }

    setLocalStr(cleaned);

    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed)) {
      if (max !== undefined && parsed > max) {
        onChange(max);
      } else {
        onChange(parsed);
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // If current value is 0, clear it on focus so typing starts cleanly without prepending "0"
    if (value === 0 || localStr === '0') {
      setLocalStr('');
    } else {
      e.target.select();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localStr === '' || isNaN(parseFloat(localStr))) {
      const fallback = min !== undefined ? min : 0;
      setLocalStr(String(fallback));
      onChange(fallback);
    } else {
      const parsed = parseFloat(localStr);
      let finalVal = parsed;
      if (min !== undefined && parsed < min) finalVal = min;
      if (max !== undefined && parsed > max) finalVal = max;
      setLocalStr(String(finalVal));
      onChange(finalVal);
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
          inputMode="decimal"
          value={localStr}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          placeholder="0"
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
