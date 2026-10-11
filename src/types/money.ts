export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToInr: number; // approximate reference for conversion
}

export interface MoneyInputs {
  monthlyIncome: number;
  food: number;
  transport: number;
  rent: number;
  entertainment: number;
  other: number;
  savingsTarget: number;
  currency: CurrencyCode;
}

export interface ExpenseBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MoneyCalculations {
  totalExpenses: number;
  monthlySurplus: number;
  savingsRate: number; // percentage (0 - 100)
  targetProgress: number; // percentage (0 - 100+)
  isDeficit: boolean;
  projected6Months: number;
  projected12Months: number;
  breakdown: ExpenseBreakdown[];
  emergencyFundRunwayMonths: number;
  needsVsWantsRatio: {
    needs: number; // food + rent + transport
    wants: number; // entertainment + other
    savings: number;
  };
}

export interface MoneyWhatIfState {
  incomeDeltaPercent: number; // -50% to +50%
  rentDeltaPercent: number; // -50% to +50%
  foodDeltaPercent: number; // -50% to +50%
  transportDeltaPercent: number;
  entertainmentDeltaPercent: number;
  otherDeltaPercent: number;
}

export interface FinancialInsight {
  id: string;
  type: 'critical' | 'warning' | 'positive' | 'opportunity';
  title: string;
  description: string;
  calculationExplanation: string;
  impactMonthly: number;
  impactAnnual: number;
}
