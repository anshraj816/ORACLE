import React, { useState } from 'react';
import {
  AlertCircle,
  Coins,
  DollarSign,
  PieChart as PieChartIcon,
  RotateCcw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MoneyInputs, MoneyWhatIfState } from '../../types/money';
import {
  applyMoneyWhatIf,
  calculateMoneyMetrics,
  generateFinancialInsights,
} from '../../utils/moneyCalculations';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { MONEY_PRESETS } from '../../utils/sampleData';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { NumberInput } from '../common/NumberInput';
import { ExpenseBreakdownChart } from './ExpenseBreakdownChart';
import { FinancialInsightsCard } from './FinancialInsightsCard';
import { SavingsProjectionChart } from './SavingsProjectionChart';
import { WhatIfSimulator } from './WhatIfSimulator';

export const MoneySimulator: React.FC = () => {
  const { moneyInputs, setMoneyInputs, currency, addToast } = useApp();

  // What-If local state
  const [whatIfState, setWhatIfState] = useState<MoneyWhatIfState>({
    incomeDeltaPercent: 0,
    rentDeltaPercent: 0,
    foodDeltaPercent: 0,
    transportDeltaPercent: 0,
    entertainmentDeltaPercent: 0,
    otherDeltaPercent: 0,
  });

  const resetWhatIf = () => {
    setWhatIfState({
      incomeDeltaPercent: 0,
      rentDeltaPercent: 0,
      foodDeltaPercent: 0,
      transportDeltaPercent: 0,
      entertainmentDeltaPercent: 0,
      otherDeltaPercent: 0,
    });
    addToast({
      type: 'info',
      title: 'What-If Sliders Reset',
      message: 'Simulation values returned to base inputs.',
    });
  };

  const handleApplyPreset = (key: keyof typeof MONEY_PRESETS) => {
    const preset = MONEY_PRESETS[key];
    setMoneyInputs(preset.inputs);
    resetWhatIf();
    addToast({
      type: 'success',
      title: `Loaded ${preset.label}`,
      message: preset.description,
    });
  };

  const { simulatedInputs, baseMetrics, simulatedMetrics } = applyMoneyWhatIf(moneyInputs, whatIfState);
  const insights = generateFinancialInsights(moneyInputs, baseMetrics);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Top Bar with Presets & Deficit Warning */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f111a] border border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Quick Presets:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MONEY_PRESETS).map(([k, p]) => (
              <button
                key={k}
                onClick={() => handleApplyPreset(k as any)}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#181b2a] hover:bg-[#23273e] text-slate-200 border border-white/[0.06] transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {baseMetrics.isDeficit && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Deficit Warning: Expenses exceed monthly income</span>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Surplus / Deficit */}
        <Card className="p-5" glow={baseMetrics.isDeficit ? 'none' : 'indigo'}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Monthly Surplus / (Deficit)
            </span>
            {baseMetrics.isDeficit ? (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            ) : (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-2 ${
              baseMetrics.isDeficit ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {formatCurrency(baseMetrics.monthlySurplus, currency)}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Savings Rate:</span>
            <span className="font-semibold text-slate-200">
              {formatPercentage(baseMetrics.savingsRate)}
            </span>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card className="p-5" glow="cyan">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Monthly Outflows
            </span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-2">
            {formatCurrency(baseMetrics.totalExpenses, currency)}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Income Ratio:</span>
            <span className="font-semibold text-slate-200">
              {formatPercentage(
                moneyInputs.monthlyIncome > 0
                  ? (baseMetrics.totalExpenses / moneyInputs.monthlyIncome) * 100
                  : 0
              )}
            </span>
          </div>
        </Card>

        {/* Progress to Goal */}
        <Card className="p-5" glow="violet">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Savings Goal Progress
            </span>
            <Target className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-violet-400 mt-2">
            {formatPercentage(baseMetrics.targetProgress, 0)}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-500 to-indigo-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, baseMetrics.targetProgress))}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-1.5 flex justify-between">
            <span>Target: {formatCurrency(moneyInputs.savingsTarget, currency)}</span>
            <span>{baseMetrics.monthlySurplus >= moneyInputs.savingsTarget ? 'Goal Met' : 'Shortfall'}</span>
          </div>
        </Card>

        {/* 12-Month Projected Growth */}
        <Card className="p-5" glow="indigo">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              12-Month Net Projection
            </span>
            <Coins className="w-4 h-4 text-indigo-400" />
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-2 ${
              baseMetrics.projected12Months < 0 ? 'text-rose-400' : 'text-indigo-400'
            }`}
          >
            {formatCurrency(baseMetrics.projected12Months, currency)}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>6-Month Milestone:</span>
            <span className="font-semibold text-slate-200">
              {formatCurrency(baseMetrics.projected6Months, currency)}
            </span>
          </div>
        </Card>
      </div>

      {/* Main Inputs & Donut Chart Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Section (7 cols) */}
        <Card className="lg:col-span-7 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Monthly Cashflow Inputs</h3>
            </div>
            <span className="text-xs text-slate-400">Currency: {currency}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberInput
              label="Monthly Income / Allowance"
              value={moneyInputs.monthlyIncome}
              onChange={(val) => setMoneyInputs((prev) => ({ ...prev, monthlyIncome: val }))}
              prefix={currency}
              min={0}
              step={500}
              helperText="Gross monthly inflows from all sources"
              className="sm:col-span-2"
            />

            <NumberInput
              label="Rent / Accommodation"
              value={moneyInputs.rent}
              onChange={(val) => setMoneyInputs((prev) => ({ ...prev, rent: val }))}
              prefix={currency}
              min={0}
              step={200}
              helperText="Housing, hostel fees, maintenance"
            />

            <NumberInput
              label="Food & Dining"
              value={moneyInputs.food}
              onChange={(val) => setMoneyInputs((prev) => ({ ...prev, food: val }))}
              prefix={currency}
              min={0}
              step={100}
              helperText="Groceries, mess, restaurants"
            />

            <NumberInput
              label="Transport & Commute"
              value={moneyInputs.transport}
              onChange={(val) => setMoneyInputs((prev) => ({ ...prev, transport: val }))}
              prefix={currency}
              min={0}
              step={50}
              helperText="Fuel, metro pass, public transit"
            />

            <NumberInput
              label="Entertainment & Leisure"
              value={moneyInputs.entertainment}
              onChange={(val) => setMoneyInputs((prev) => ({ ...prev, entertainment: val }))}
              prefix={currency}
              min={0}
              step={50}
              helperText="Subscriptions, movies, outings"
            />

            <NumberInput
              label="Other Expenses"
              value={moneyInputs.other}
              onChange={(val) => setMoneyInputs((prev) => ({ ...prev, other: val }))}
              prefix={currency}
              min={0}
              step={50}
              helperText="Utilities, medical, miscellaneous"
            />

            <NumberInput
              label="Monthly Savings Target"
              value={moneyInputs.savingsTarget}
              onChange={(val) => setMoneyInputs((prev) => ({ ...prev, savingsTarget: val }))}
              prefix={currency}
              min={0}
              step={500}
              helperText="Desired monthly surplus goal"
            />
          </div>
        </Card>

        {/* Right Expense Breakdown Donut & List (5 cols) */}
        <Card className="lg:col-span-5 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.08] mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Expense Distribution</h3>
            </div>

            <ExpenseBreakdownChart
              breakdown={baseMetrics.breakdown}
              totalExpenses={baseMetrics.totalExpenses}
              currency={currency}
            />

            <div className="mt-4 space-y-2">
              {baseMetrics.breakdown.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#121422]/60 border border-white/[0.03]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 font-medium">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-200">
                      {formatCurrency(item.amount, currency)}
                    </span>
                    <span className="text-slate-400 font-mono w-10 text-right">
                      {formatPercentage(item.percentage, 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* What-If Sensitivity Simulator */}
      <WhatIfSimulator
        baseInputs={moneyInputs}
        baseMetrics={baseMetrics}
        simulatedInputs={simulatedInputs}
        simulatedMetrics={simulatedMetrics}
        whatIfState={whatIfState}
        setWhatIfState={setWhatIfState}
        resetWhatIf={resetWhatIf}
        currency={currency}
      />

      {/* 12-Month Accumulation Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
          <div>
            <h3 className="text-base font-bold text-white">12-Month Wealth & Savings Trajectory</h3>
            <p className="text-xs text-slate-400">
              Cumulative reserve projection comparing base plan vs simulated What-If adjustments
            </p>
          </div>
          <Badge variant="indigo">0 - 12 Months</Badge>
        </div>

        <SavingsProjectionChart
          baseMonthlySurplus={baseMetrics.monthlySurplus}
          simulatedMonthlySurplus={simulatedMetrics.monthlySurplus}
          savingsTarget={moneyInputs.savingsTarget}
          currency={currency}
        />
      </Card>

      {/* Rule-Based Financial Insights */}
      <FinancialInsightsCard insights={insights} />
    </div>
  );
};
