import React from 'react';
import { Layout } from './components/layout/Layout';
import { MoneySimulator } from './components/money/MoneySimulator';
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { SettingsView } from './components/settings/SettingsView';
import { TimeSimulator } from './components/time/TimeSimulator';
import { CsvIntelligence } from './components/csv/CsvIntelligence';
import { AppProvider, useApp } from './context/AppContext';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <Layout>
      {activeTab === 'overview' && <OverviewDashboard />}
      {activeTab === 'money' && <MoneySimulator />}
      {activeTab === 'time' && <TimeSimulator />}
      {activeTab === 'csv' && <CsvIntelligence />}
      {activeTab === 'settings' && <SettingsView />}
    </Layout>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
