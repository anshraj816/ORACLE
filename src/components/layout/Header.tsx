import React, { useState } from 'react';
import {
  Coins,
  Globe,
  HelpCircle,
  Menu,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CurrencyCode } from '../../types/money';
import { CURRENCY_CONFIGS } from '../../utils/formatters';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const { activeTab, currency, setCurrency, setMobileMenuOpen } = useApp();
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  const titles: Record<string, { title: string; subtitle: string }> = {
    overview: {
      title: 'Intelligence Center',
      subtitle: 'Understand your data. Optimize your life.',
    },
    money: {
      title: 'Money Simulator',
      subtitle: 'Deterministic cashflow modeling, what-if forecasts, and savings intelligence.',
    },
    time: {
      title: 'Time Simulator',
      subtitle: '24-hour routine balancing, cognitive break pacing, and semester projections.',
    },
    csv: {
      title: 'CSV Data Intelligence',
      subtitle: 'Local-first browser profiling, automated data quality auditor, and cleaning studio.',
    },
    settings: {
      title: 'Preferences & Storage',
      subtitle: 'Manage local caching, currencies, and display configurations.',
    },
  };

  const current = titles[activeTab] || titles.overview;

  return (
    <>
      <header className="h-16 sm:h-20 px-3 sm:px-6 border-b border-white/[0.08] bg-[#090a10]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1 mr-2">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0 truncate">
            <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2 truncate">
              {current.title}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block truncate">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Python Backend Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#121422] border border-white/[0.08] text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Python 3.14:</span>
            <span className="text-emerald-400 font-semibold">Pandas Connected</span>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center bg-[#121422] border border-white/[0.08] rounded-xl px-2.5 py-1.5 gap-2 shadow-sm">
            <Coins className="w-4 h-4 text-indigo-400 shrink-0" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              aria-label="Currency Selection"
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              {Object.values(CURRENCY_CONFIGS).map((c) => (
                <option key={c.code} value={c.code} className="bg-[#121422] text-slate-200">
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Help Guide Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelpModal(true)}
            className="text-slate-400 hover:text-white p-2"
            title="System documentation & quick guide"
            aria-label="Open Documentation & Quick Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Quick Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-[#0f111a] border border-white/[0.1] rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">ORACLE Intelligence Architecture</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <h4 className="font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" /> Zero-API & Client-Side Privacy
                </h4>
                <p className="text-xs text-indigo-200/80">
                  All calculations and CSV parsing run deterministically inside your browser via WebAssembly & V8. No sensitive financial budgets or datasets are ever uploaded to external cloud servers.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-100">1. Money Simulator</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust monthly inflows and categorized outflows. The What-If engine computes instant sensitivity curves and provides arithmetic explanations for savings opportunities.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-100">2. Time Simulator</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Enforces strict 24-hour balance checks. The Timetable Generator constructs collision-free schedules respecting fixed commitments, sleep hygiene, and cognitive rest intervals.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-100">3. CSV Data Intelligence</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Drop in any CSV file to inspect data completeness, detect IQR outliers, review Pearson correlation coefficients, and sanitize rows non-destructively in the Cleaning Studio.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.08] flex justify-end">
              <Button size="sm" onClick={() => setShowHelpModal(false)}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
