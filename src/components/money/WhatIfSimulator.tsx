import React from 'react';
import { ArrowDownRight, ArrowUpRight, RotateCcw, Sliders, TrendingUp } from 'lucide-react';
import { CurrencyCode, MoneyCalculations, MoneyInputs, MoneyWhatIfState } from '../../types/money';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Slider } from '../common/Slider';

interface WhatIfSimulatorProps {
  baseInputs: MoneyInputs;
  baseMetrics: MoneyCalculations;
  simulatedInputs: MoneyInputs;
  simulatedMetrics: MoneyCalculations;
  whatIfState: MoneyWhatIfState;
  setWhatIfState: React.Dispatch<React.SetStateAction<MoneyWhatIfState>>;
  resetWhatIf: () => void;
  currency: CurrencyCode;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  baseInputs,
  baseMetrics,
  simulatedInputs,
  simulatedMetrics,
  whatIfState,
  setWhatIfState,
  resetWhatIf,
  currency,
}) => {
  const monthlyDiff = simulatedMetrics.monthlySurplus - baseMetrics.monthlySurplus;
  const annualDiff = monthlyDiff * 12;
  const targetDiff = simulatedMetrics.targetProgress - baseMetrics.targetProgress;

  return (
    <Card className="p-6" glow="indigo">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">What-If Sensitivity Engine</h3>
            <p className="text-xs text-slate-400">
              Stress-test financial decisions and quantify surplus variations
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={resetWhatIf}
          icon={<RotateCcw className="w-3.5 h-3.5" />}
          className="text-xs text-slate-400 hover:text-white"
        >
          Reset Sliders
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sliders Grid */}
        <div className="space-y-5">
          <Slider
            label="Rent / Housing Adjustment"
            min={-40}
            max={50}
            step={5}
            value={whatIfState.rentDeltaPercent}
            onChange={(val) => setWhatIfState((prev) => ({ ...prev, rentDeltaPercent: val }))}
            displayValue={`${whatIfState.rentDeltaPercent > 0 ? '+' : ''}${whatIfState.rentDeltaPercent}% (${formatCurrency(simulatedInputs.rent, currency)})`}
            color="indigo"
          />

          <Slider
            label="Food & Dining Optimization"
            min={-50}
            max={50}
            step={5}
            value={whatIfState.foodDeltaPercent}
            onChange={(val) => setWhatIfState((prev) => ({ ...prev, foodDeltaPercent: val }))}
            displayValue={`${whatIfState.foodDeltaPercent > 0 ? '+' : ''}${whatIfState.foodDeltaPercent}% (${formatCurrency(simulatedInputs.food, currency)})`}
            color="cyan"
          />

          <Slider
            label="Income Adjustment (Raise / Bonus / Cut)"
            min={-30}
            max={50}
            step={5}
            value={whatIfState.incomeDeltaPercent}
            onChange={(val) => setWhatIfState((prev) => ({ ...prev, incomeDeltaPercent: val }))}
            displayValue={`${whatIfState.incomeDeltaPercent > 0 ? '+' : ''}${whatIfState.incomeDeltaPercent}% (${formatCurrency(simulatedInputs.monthlyIncome, currency)})`}
            color="emerald"
          />

          <Slider
            label="Entertainment Spending Shift"
            min={-50}
            max={50}
            step={5}
            value={whatIfState.entertainmentDeltaPercent}
            onChange={(val) => setWhatIfState((prev) => ({ ...prev, entertainmentDeltaPercent: val }))}
            displayValue={`${whatIfState.entertainmentDeltaPercent > 0 ? '+' : ''}${whatIfState.entertainmentDeltaPercent}% (${formatCurrency(simulatedInputs.entertainment, currency)})`}
            color="violet"
          />
        </div>

        {/* Side-by-Side Comparison Box */}
        <div className="flex flex-col justify-between bg-[#121422] border border-white/[0.06] rounded-2xl p-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-4">
              Real-Time Impact Comparison
            </span>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/[0.06]">
              <div>
                <span className="text-[11px] text-slate-400 block">Original Surplus</span>
                <span className="text-lg font-bold font-mono text-slate-200 mt-0.5 block">
                  {formatCurrency(baseMetrics.monthlySurplus, currency)}
                </span>
                <span className="text-[10px] text-slate-400">
                  Rate: {formatPercentage(baseMetrics.savingsRate)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Simulated Surplus</span>
                <span
                  className={`text-lg font-bold font-mono mt-0.5 block ${
                    simulatedMetrics.monthlySurplus >= baseMetrics.monthlySurplus
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {formatCurrency(simulatedMetrics.monthlySurplus, currency)}
                </span>
                <span className="text-[10px] text-slate-400">
                  Rate: {formatPercentage(simulatedMetrics.savingsRate)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <span className="text-[11px] text-slate-400 block">Monthly Variance</span>
                <div className="flex items-center gap-1 mt-1">
                  {monthlyDiff >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-rose-400" />
                  )}
                  <span
                    className={`text-base font-bold font-mono ${
                      monthlyDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {monthlyDiff >= 0 ? '+' : ''}
                    {formatCurrency(monthlyDiff, currency)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Annualized Impact</span>
                <div className="flex items-center gap-1 mt-1">
                  {annualDiff >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-rose-400" />
                  )}
                  <span
                    className={`text-base font-bold font-mono ${
                      annualDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {annualDiff >= 0 ? '+' : ''}
                    {formatCurrency(annualDiff, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-[#191d30] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-300 block">Savings Goal Impact</span>
              <span className="text-[11px] text-slate-400">
                Target: {formatCurrency(baseInputs.savingsTarget, currency)}/mo
              </span>
            </div>
            <div className="text-right">
              <span
                className={`text-sm font-bold font-mono ${
                  targetDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {targetDiff >= 0 ? '+' : ''}
                {formatPercentage(targetDiff, 1)}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {formatPercentage(simulatedMetrics.targetProgress)} achieved
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
