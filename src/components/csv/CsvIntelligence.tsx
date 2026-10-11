import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Network,
  ShieldAlert,
  Table,
  Wand2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ParsedCsvResult, parseCsvContent } from '../../utils/csvAnalysis';
import { SAMPLE_CSV_CHURN } from '../../utils/sampleData';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { CorrelationHeatmap } from './CorrelationHeatmap';
import { CsvInsightsPanel } from './CsvInsightsPanel';
import { CsvUploader } from './CsvUploader';
import { DataCleaningStudio } from './DataCleaningStudio';
import { DataPreviewTable } from './DataPreviewTable';
import { DataQualityInspector } from './DataQualityInspector';
import { DatasetOverviewCards } from './DatasetOverviewCards';
import { VisualAnalyticsPanel } from './VisualAnalyticsPanel';

type CsvTab = 'overview' | 'preview' | 'visuals' | 'correlations' | 'cleaning';

export const CsvIntelligence: React.FC = () => {
  const { addToast } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  // Default to Customer Churn sample on first load
  const [parsedResult, setParsedResult] = useState<ParsedCsvResult | null>(() => {
    try {
      return parseCsvContent(SAMPLE_CSV_CHURN, 'customer_churn_analytics.csv');
    } catch (e) {
      return null;
    }
  });

  const [activeCsvTab, setActiveCsvTab] = useState<CsvTab>('overview');

  const handleParsed = (result: ParsedCsvResult) => {
    setParsedResult(result);
    addToast({
      type: 'success',
      title: 'Dataset Ingested Successfully',
      message: `${result.overview.totalDataRows} records and ${result.overview.totalColumns} columns profiled.`,
    });
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Upload & Sample Bar */}
      <CsvUploader
        onParsed={handleParsed}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        currentResult={parsedResult}
      />

      {parsedResult && (
        <>
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0f111a] border border-white/[0.08] overflow-x-auto">
            <button
              onClick={() => setActiveCsvTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeCsvTab === 'overview'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Overview & Quality</span>
              {parsedResult.issues.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  {parsedResult.issues.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveCsvTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeCsvTab === 'preview'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Data Grid Preview</span>
            </button>

            <button
              onClick={() => setActiveCsvTab('visuals')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeCsvTab === 'visuals'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Visual Analytics</span>
            </button>

            <button
              onClick={() => setActiveCsvTab('correlations')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeCsvTab === 'correlations'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Correlations & Insights</span>
            </button>

            <button
              onClick={() => setActiveCsvTab('cleaning')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeCsvTab === 'cleaning'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Cleaning Studio</span>
            </button>
          </div>

          {/* Active Tab Views */}
          {activeCsvTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in">
              <DatasetOverviewCards
                overview={parsedResult.overview}
                columnProfiles={parsedResult.columnProfiles}
              />
              <DataQualityInspector
                issues={parsedResult.issues}
                headers={parsedResult.headers}
                rows={parsedResult.rows}
                fileName={parsedResult.fileName}
              />
            </div>
          )}

          {activeCsvTab === 'preview' && (
            <div className="animate-in fade-in">
              <DataPreviewTable
                headers={parsedResult.headers}
                rows={parsedResult.rows}
                columnProfiles={parsedResult.columnProfiles}
              />
            </div>
          )}

          {activeCsvTab === 'visuals' && (
            <div className="animate-in fade-in">
              <VisualAnalyticsPanel
                headers={parsedResult.headers}
                rows={parsedResult.rows}
                columnProfiles={parsedResult.columnProfiles}
              />
            </div>
          )}

          {activeCsvTab === 'correlations' && (
            <div className="space-y-8 animate-in fade-in">
              <CorrelationHeatmap
                correlationPairs={parsedResult.correlationPairs}
                columnProfiles={parsedResult.columnProfiles}
              />
              <CsvInsightsPanel insights={parsedResult.insights} />
            </div>
          )}

          {activeCsvTab === 'cleaning' && (
            <div className="animate-in fade-in">
              <DataCleaningStudio parsedResult={parsedResult} />
            </div>
          )}
        </>
      )}
    </div>
  );
};
