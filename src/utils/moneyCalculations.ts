import {
  FinancialInsight,
  MoneyCalculations,
  MoneyInputs,
  MoneyWhatIfState,
} from '../types/money';
import { formatCurrency, formatPercentage } from './formatters';

export const EXPENSE_COLORS: Record<string, string> = {
  rent: '#818cf8', // Indigo
  food: '#38bdf8', // Cyan
  transport: '#a78bfa', // Purple / Violet
  entertainment: '#f472b6', // Pink
  other: '#94a3b8', // Slate
};

export function calculateMoneyMetrics(inputs: MoneyInputs): MoneyCalculations {
  // Validate and sanitize (protect against negative inputs)
  const income = Math.max(0, inputs.monthlyIncome || 0);
  const food = Math.max(0, inputs.food || 0);
  const transport = Math.max(0, inputs.transport || 0);
  const rent = Math.max(0, inputs.rent || 0);
  const entertainment = Math.max(0, inputs.entertainment || 0);
  const other = Math.max(0, inputs.other || 0);
  const target = Math.max(0, inputs.savingsTarget || 0);

  const totalExpenses = food + transport + rent + entertainment + other;
  const monthlySurplus = income - totalExpenses;
  const isDeficit = monthlySurplus < 0;

  const savingsRate = income > 0 ? Math.max(0, (monthlySurplus / income) * 100) : 0;
  const targetProgress = target > 0 ? Math.max(0, (monthlySurplus / target) * 100) : 100;

  // Breakdown percentages relative to total expenses
  const breakdown = [
    { category: 'Rent & Living', amount: rent, percentage: totalExpenses > 0 ? (rent / totalExpenses) * 100 : 0, color: EXPENSE_COLORS.rent },
    { category: 'Food & Dining', amount: food, percentage: totalExpenses > 0 ? (food / totalExpenses) * 100 : 0, color: EXPENSE_COLORS.food },
    { category: 'Transport', amount: transport, percentage: totalExpenses > 0 ? (transport / totalExpenses) * 100 : 0, color: EXPENSE_COLORS.transport },
    { category: 'Entertainment', amount: entertainment, percentage: totalExpenses > 0 ? (entertainment / totalExpenses) * 100 : 0, color: EXPENSE_COLORS.entertainment },
    { category: 'Other Expenses', amount: other, percentage: totalExpenses > 0 ? (other / totalExpenses) * 100 : 0, color: EXPENSE_COLORS.other },
  ];

  // Projections (6 and 12 months)
  const projected6Months = monthlySurplus * 6;
  const projected12Months = monthlySurplus * 12;

  // Emergency fund runway: how many months of total expenses can 1 month surplus cover (ratio) or target fund
  const emergencyFundRunwayMonths = totalExpenses > 0 ? Number((monthlySurplus / totalExpenses).toFixed(2)) : 0;

  // 50/30/20 breakdown
  const needsTotal = rent + food + transport;
  const wantsTotal = entertainment + other;
  const needsRatio = income > 0 ? (needsTotal / income) * 100 : 0;
  const wantsRatio = income > 0 ? (wantsTotal / income) * 100 : 0;
  const savingsRatio = income > 0 ? (monthlySurplus / income) * 100 : 0;

  return {
    totalExpenses,
    monthlySurplus,
    savingsRate,
    targetProgress,
    isDeficit,
    projected6Months,
    projected12Months,
    breakdown,
    emergencyFundRunwayMonths,
    needsVsWantsRatio: {
      needs: needsRatio,
      wants: wantsRatio,
      savings: savingsRatio,
    },
  };
}

export function applyMoneyWhatIf(
  baseInputs: MoneyInputs,
  whatIf: MoneyWhatIfState
): { simulatedInputs: MoneyInputs; baseMetrics: MoneyCalculations; simulatedMetrics: MoneyCalculations } {
  const simulatedInputs: MoneyInputs = {
    ...baseInputs,
    monthlyIncome: Math.round(baseInputs.monthlyIncome * (1 + whatIf.incomeDeltaPercent / 100)),
    rent: Math.round(baseInputs.rent * (1 + whatIf.rentDeltaPercent / 100)),
    food: Math.round(baseInputs.food * (1 + whatIf.foodDeltaPercent / 100)),
    transport: Math.round(baseInputs.transport * (1 + whatIf.transportDeltaPercent / 100)),
    entertainment: Math.round(baseInputs.entertainment * (1 + whatIf.entertainmentDeltaPercent / 100)),
    other: Math.round(baseInputs.other * (1 + whatIf.otherDeltaPercent / 100)),
  };

  const baseMetrics = calculateMoneyMetrics(baseInputs);
  const simulatedMetrics = calculateMoneyMetrics(simulatedInputs);

  return { simulatedInputs, baseMetrics, simulatedMetrics };
}

export function generateFinancialInsights(inputs: MoneyInputs, metrics: MoneyCalculations): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const cur = inputs.currency;

  // 1. Deficit alert or surplus confirmation
  if (metrics.isDeficit) {
    const deficitAmount = Math.abs(metrics.monthlySurplus);
    insights.push({
      id: 'deficit-alert',
      type: 'critical',
      title: 'Monthly Cash Flow Deficit Detected',
      description: `Your monthly expenses (${formatCurrency(metrics.totalExpenses, cur)}) exceed income (${formatCurrency(inputs.monthlyIncome, cur)}) by ${formatCurrency(deficitAmount, cur)}. This draws down reserves or accumulates debt.`,
      calculationExplanation: `Calculation: Income (${formatCurrency(inputs.monthlyIncome, cur)}) - Total Expenses (${formatCurrency(metrics.totalExpenses, cur)}) = -${formatCurrency(deficitAmount, cur)}. Annualized cash drain: -${formatCurrency(deficitAmount * 12, cur)}.`,
      impactMonthly: -deficitAmount,
      impactAnnual: -deficitAmount * 12,
    });
  } else {
    insights.push({
      id: 'surplus-positive',
      type: 'positive',
      title: `Consistent Monthly Surplus of ${formatCurrency(metrics.monthlySurplus, cur)}`,
      description: `You are saving ${formatPercentage(metrics.savingsRate)} of your income. Maintaining this surplus accumulates ${formatCurrency(metrics.projected12Months, cur)} in 12 months without interest.`,
      calculationExplanation: `Calculation: Monthly Surplus (${formatCurrency(metrics.monthlySurplus, cur)}) × 12 months = ${formatCurrency(metrics.projected12Months, cur)}.`,
      impactMonthly: metrics.monthlySurplus,
      impactAnnual: metrics.projected12Months,
    });
  }

  // 2. Identify largest expense category
  const sortedExpenses = [...metrics.breakdown].sort((a, b) => b.amount - a.amount);
  const largest = sortedExpenses[0];
  if (largest && largest.amount > 0 && metrics.totalExpenses > 0) {
    const potentialReduction = Math.round(largest.amount * 0.15);
    insights.push({
      id: 'largest-expense-optimizer',
      type: 'opportunity',
      title: `Optimize Largest Outflow: ${largest.category}`,
      description: `${largest.category} represents ${formatPercentage(largest.percentage)} of your total outflows (${formatCurrency(largest.amount, cur)}). A 15% optimization here frees up ${formatCurrency(potentialReduction, cur)} monthly.`,
      calculationExplanation: `Calculation: ${formatCurrency(largest.amount, cur)} × 15% = ${formatCurrency(potentialReduction, cur)}/mo. Over one year: ${formatCurrency(potentialReduction * 12, cur)}.`,
      impactMonthly: potentialReduction,
      impactAnnual: potentialReduction * 12,
    });
  }

  // 3. Savings target shortfall analysis
  if (inputs.savingsTarget > 0) {
    if (metrics.monthlySurplus < inputs.savingsTarget) {
      const shortfall = inputs.savingsTarget - Math.max(0, metrics.monthlySurplus);
      const entertainmentCut = Math.min(shortfall, inputs.entertainment * 0.4);
      insights.push({
        id: 'savings-shortfall',
        type: 'warning',
        title: `Savings Goal Shortfall: ${formatCurrency(shortfall, cur)}/mo`,
        description: `Your target is ${formatCurrency(inputs.savingsTarget, cur)}/mo, but current surplus is ${formatCurrency(metrics.monthlySurplus, cur)} (${formatPercentage(metrics.targetProgress)} achieved).`,
        calculationExplanation: `Calculation: Target (${formatCurrency(inputs.savingsTarget, cur)}) - Current Surplus (${formatCurrency(metrics.monthlySurplus, cur)}) = Shortfall (${formatCurrency(shortfall, cur)}). Trimming 40% of entertainment (${formatCurrency(entertainmentCut, cur)}) would bridge ${formatPercentage((entertainmentCut / shortfall) * 100)} of this gap.`,
        impactMonthly: -shortfall,
        impactAnnual: -shortfall * 12,
      });
    } else {
      const surplusExcess = metrics.monthlySurplus - inputs.savingsTarget;
      insights.push({
        id: 'target-exceeded',
        type: 'positive',
        title: 'Savings Goal Fully Funded',
        description: `You are beating your monthly savings goal by ${formatCurrency(surplusExcess, cur)}/month (${formatPercentage(metrics.targetProgress)} of target).`,
        calculationExplanation: `Calculation: Monthly Surplus (${formatCurrency(metrics.monthlySurplus, cur)}) - Goal (${formatCurrency(inputs.savingsTarget, cur)}) = +${formatCurrency(surplusExcess, cur)}. Annual cushion: ${formatCurrency(surplusExcess * 12, cur)}.`,
        impactMonthly: surplusExcess,
        impactAnnual: surplusExcess * 12,
      });
    }
  }

  // 4. 50/30/20 Budget rule evaluation
  const needs = metrics.needsVsWantsRatio.needs;
  if (needs > 65) {
    insights.push({
      id: 'high-needs-ratio',
      type: 'warning',
      title: 'High Fixed Necessities Load (50/30/20 Rule)',
      description: `Essential living costs (Rent, Food, Transport) consume ${formatPercentage(needs)} of your income (standard benchmark is ≤50%). This leaves little margin for economic shocks.`,
      calculationExplanation: `Calculation: (Rent ${formatCurrency(inputs.rent, cur)} + Food ${formatCurrency(inputs.food, cur)} + Transport ${formatCurrency(inputs.transport, cur)}) / Income ${formatCurrency(inputs.monthlyIncome, cur)} = ${formatPercentage(needs)}.`,
      impactMonthly: 0,
      impactAnnual: 0,
    });
  }

  return insights;
}
