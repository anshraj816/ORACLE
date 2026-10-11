import React from 'react';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  FileSpreadsheet,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../../types/navigation';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, sidebarCollapsed, setSidebarCollapsed, resetAllDefaults } = useApp();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <Compass className="w-5 h-5" /> },
    { id: 'money', label: 'Money Simulator', icon: <Wallet className="w-5 h-5" />, badge: 'Live' },
    { id: 'time', label: 'Time Simulator', icon: <Clock className="w-5 h-5" /> },
    { id: 'csv', label: 'CSV Intelligence', icon: <FileSpreadsheet className="w-5 h-5" />, badge: 'Pro' },
    { id: 'settings', label: 'Preferences', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#0b0c14]/90 backdrop-blur-xl border-r border-white/[0.08] transition-all duration-300 z-30 select-none ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-4 border-b border-white/[0.06]">
        <button
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-3.5 group cursor-pointer text-left overflow-hidden"
        >
          {/* QUANTRIX Beacon Logo */}
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl overflow-hidden border border-cyan-400/50 shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform shrink-0">
            <img
              src="./assets/quantrix_symbol.jpg"
              alt="QUANTRIX Symbol"
              className="w-full h-full object-cover"
            />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping opacity-75" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full" />
          </div>

          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-widest bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                  QUANTRIX
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate tracking-tight">
                Turn Complexity Into Clarity
              </span>
            </div>
          )}
        </button>

        {!sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 flex flex-col gap-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
              className={`flex items-center gap-3.5 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer relative group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/30 shadow-md shadow-indigo-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              {/* Active left indicator */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-cyan-400 to-indigo-500 rounded-r-full" />
              )}

              <span
                className={`transition-colors ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {item.icon}
              </span>

              {!sidebarCollapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}

              {!sidebarCollapsed && item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    item.badge === 'Live'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Privacy Shield */}
      <div className="p-3 border-t border-white/[0.06] flex flex-col gap-2">
        {!sidebarCollapsed && (
          <div className="p-3 rounded-xl bg-[#121422]/80 border border-white/[0.05] flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold text-slate-300">100% Client-Side</span>
              <span className="text-[10px] text-slate-400 truncate">Zero server tracking</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          {sidebarCollapsed ? (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={resetAllDefaults}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors p-2 rounded-lg hover:bg-white/[0.04] w-full"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset to Defaults</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
