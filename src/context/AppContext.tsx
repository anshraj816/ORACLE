import React, { createContext, useContext, useEffect, useState } from 'react';
import { CurrencyCode, MoneyInputs } from '../types/money';
import { NavTab, ToastMessage } from '../types/navigation';
import { TimeInputs } from '../types/time';
import { MONEY_PRESETS, SAMPLE_CSV_CHURN, TIME_PRESETS } from '../utils/sampleData';
import { ParsedCsvResult, parseCsvContent } from '../utils/csvAnalysis';

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  moneyInputs: MoneyInputs;
  setMoneyInputs: React.Dispatch<React.SetStateAction<MoneyInputs>>;
  timeInputs: TimeInputs;
  setTimeInputs: React.Dispatch<React.SetStateAction<TimeInputs>>;
  parsedCsv: ParsedCsvResult | null;
  setParsedCsv: (result: ParsedCsvResult | null) => void;
  resetAllDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_MONEY = 'quantrix_money_inputs_v1';
const LOCAL_STORAGE_KEY_TIME = 'quantrix_time_inputs_v1';
const LOCAL_STORAGE_KEY_CURRENCY = 'quantrix_currency_v1';

// Legacy fallbacks for seamless upgrade
const LEGACY_STORAGE_KEY_MONEY = 'oracle_money_inputs_v1';
const LEGACY_STORAGE_KEY_TIME = 'oracle_time_inputs_v1';
const LEGACY_STORAGE_KEY_CURRENCY = 'oracle_currency_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Currency
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENCY) || localStorage.getItem(LEGACY_STORAGE_KEY_CURRENCY);
    return (saved as CurrencyCode) || 'INR';
  });

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem(LOCAL_STORAGE_KEY_CURRENCY, c);
    setMoneyInputs((prev) => ({ ...prev, currency: c }));
  };

  // Money Inputs
  const [moneyInputs, setMoneyInputs] = useState<MoneyInputs>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_MONEY) || localStorage.getItem(LEGACY_STORAGE_KEY_MONEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Ignore fallback
    }
    return MONEY_PRESETS.student.inputs;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_MONEY, JSON.stringify(moneyInputs));
    } catch (e) {}
  }, [moneyInputs]);

  // Time Inputs
  const [timeInputs, setTimeInputs] = useState<TimeInputs>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TIME) || localStorage.getItem(LEGACY_STORAGE_KEY_TIME);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return TIME_PRESETS.balanced.inputs;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TIME, JSON.stringify(timeInputs));
    } catch (e) {}
  }, [timeInputs]);

  // CSV Ingestion State (accessible across entire platform and AI Chatbot)
  const [parsedCsv, setParsedCsv] = useState<ParsedCsvResult | null>(() => {
    try {
      return parseCsvContent(SAMPLE_CSV_CHURN, 'customer_churn_analytics.csv');
    } catch (e) {
      return null;
    }
  });

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.durationMs || 4000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const resetAllDefaults = () => {
    setMoneyInputs(MONEY_PRESETS.student.inputs);
    setTimeInputs(TIME_PRESETS.balanced.inputs);
    setCurrency('INR');
    addToast({
      type: 'info',
      title: 'Defaults Restored',
      message: 'All parameters across modules have been reset to initial baseline values.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currency,
        setCurrency,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        toasts,
        addToast,
        removeToast,
        moneyInputs,
        setMoneyInputs,
        timeInputs,
        setTimeInputs,
        parsedCsv,
        setParsedCsv,
        resetAllDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
