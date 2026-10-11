import React from 'react';
import {
  Coins,
  Database,
  Globe,
  HardDrive,
  Info,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CurrencyCode } from '../../types/money';
import { CURRENCY_CONFIGS } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

export const SettingsView: React.FC = () => {
  const { currency, setCurrency, resetAllDefaults, addToast } = useApp();

  const handleClearCache = () => {
    localStorage.clear();
    resetAllDefaults();
    addToast({
      type: 'info',
      title: 'Local Storage Purged',
      message: 'All cached scenarios and uploaded sessions have been removed.',
    });
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-white">System Preferences & Storage</h2>
        <p className="text-xs text-slate-400">
          Configure default currencies, manage local browser storage, and audit client-side policies.
        </p>
      </div>

      {/* Currency Preference */}
      <Card className="p-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.08] mb-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Base Accounting Currency</h3>
            <p className="text-xs text-slate-400">Default denomination across financial inputs and charts</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.values(CURRENCY_CONFIGS).map((c) => {
            const isSelected = currency === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/25 border-indigo-500/60 text-white shadow-md'
                    : 'bg-[#121422] border-white/[0.06] text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{c.code}</span>
                  <span className="text-xs font-mono text-indigo-300">{c.symbol}</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1 truncate">{c.name}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Storage & Privacy Audit */}
      <Card className="p-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.08] mb-5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Zero Cloud Ingestion & Local Privacy</h3>
            <p className="text-xs text-slate-400">Security architecture and client isolation</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-[#121526] border border-white/[0.04] space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Air-Gapped Client Execution</span>
            </div>
            <p className="text-slate-400">
              ORACLE processes calculations, What-If forecasts, and CSV files in your browser's
              memory sandbox. No network payloads containing your financial numbers or dataset
              records are ever dispatched to external servers or commercial AI providers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#121526] border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-semibold text-slate-200 block">Reset Application State</span>
              <span className="text-slate-400 text-[11px] block mt-0.5">
                Restores default values for Money, Time, and clears active CSV caches.
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={resetAllDefaults}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset All Defaults
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-semibold text-rose-300 block">Purge Local Storage</span>
              <span className="text-rose-300/70 text-[11px] block mt-0.5">
                Permanently wipes all saved browser localStorage entries.
              </span>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearCache}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Purge All Data
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
