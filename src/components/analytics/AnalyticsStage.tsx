import React, { useState } from 'react';
import {
  Database,
  BarChart3,
  TrendingDown,
  Waves,
  BrainCircuit,
  Radio,
  Activity,
  Cpu,
  FileText,
  Library
} from 'lucide-react';
import { cn } from '../../lib/utils';
import DataFlowIndicator from '../shared/DataFlowIndicator';
import { DataCleaningTab } from './DataCleaningTab';
import { StatisticsTab } from './StatisticsTab';
import { AutomatedDCATab } from './AutomatedDCATab';
import { TypeCurveTab } from './TypeCurveTab';
import { PredictiveModelsTab } from './PredictiveModelsTab';
import { RealtimeMonitoringTab } from './RealtimeMonitoringTab';
import { ReservoirAnalyticsTab } from './ReservoirAnalyticsTab';
import { DigitalTwinTab } from './DigitalTwinTab';
import { AnalyticsReportingTab } from './AnalyticsReportingTab';
import { AnalyticsReferencesTab } from './AnalyticsReferencesTab';

export function AnalyticsStage() {
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'cleaning' | 'statistics' | 'automated-dca' | 'type-curves' | 'machinelearning' | 'realtime' | 'reservoir-surveillance' | 'digital-twin' | 'reporting' | 'references'>('cleaning');

  // Shared Data State
  const [ingestionStatus, setIngestionStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [fileName, setFileName] = useState('');
  const [calculatedAnomalies, setCalculatedAnomalies] = useState<any[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);

  const handleProcessingComplete = (name: string, anomalies: any[], data?: any[]) => {
    setFileName(name);
    setCalculatedAnomalies(anomalies);
    if (data) {
      setParsedData(data);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <DataFlowIndicator activeStage="ANALYTICS" />
      <div className="flex flex-wrap items-center gap-4 px-8 py-4 border-b border-white/5 bg-black/20">
        {[
          { id: 'cleaning', label: 'Data Cleaning', icon: Database },
          { id: 'statistics', label: 'Field Statistics', icon: BarChart3 },
          { id: 'automated-dca', label: 'Auto-DCA', icon: TrendingDown },
          { id: 'type-curves', label: 'Type Curves', icon: Waves },
          { id: 'machinelearning', label: 'Predictive ML', icon: BrainCircuit },
          { id: 'realtime', label: 'RT Monitoring', icon: Radio },
          { id: 'reservoir-surveillance', label: 'Resv Analytics', icon: Activity },
          { id: 'digital-twin', label: 'Digital Twin', icon: Cpu },
          { id: 'reporting', label: 'Automation', icon: FileText },
          { id: 'references', label: 'References', icon: Library },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setAnalyticsSubTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
              analyticsSubTab === tab.id
                ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {analyticsSubTab === 'cleaning' && (
          <DataCleaningTab
            ingestionStatus={ingestionStatus}
            setIngestionStatus={setIngestionStatus}
            fileName={fileName}
            setFileName={setFileName}
            calculatedAnomalies={calculatedAnomalies}
            setCalculatedAnomalies={setCalculatedAnomalies}
            onProcessingComplete={handleProcessingComplete}
          />
        )}
        {analyticsSubTab === 'statistics' && (
          <StatisticsTab
            status={ingestionStatus}
            fileName={fileName}
            data={parsedData}
            onLoadSampleData={() => {
              const sampleData = Array.from({ length: 500 }).map((_, i) => ({
                API_Number: `42-0${Math.floor(Math.random() * 999)}-${Math.floor(Math.random() * 99999)}`,
                Well_Name: `Permian-Hz-${i + 1}`,
                Oil_Prod_BBL: Math.random() * 15000 + 1000,
                Gas_Prod_MCF: Math.random() * 30000 + 5000,
                Water_Prod_BBL: Math.random() * 20000 + 500
              }));
              setFileName('Permian_Basin_Sample.csv');
              setIngestionStatus('success');
              setParsedData(sampleData);
            }}
          />
        )}
        {analyticsSubTab === 'automated-dca' && <AutomatedDCATab />}
        {analyticsSubTab === 'type-curves' && <TypeCurveTab />}
        {analyticsSubTab === 'machinelearning' && <PredictiveModelsTab />}
        {analyticsSubTab === 'realtime' && <RealtimeMonitoringTab />}
        {analyticsSubTab === 'reservoir-surveillance' && <ReservoirAnalyticsTab />}
        {analyticsSubTab === 'digital-twin' && <DigitalTwinTab />}
        {analyticsSubTab === 'reporting' && <AnalyticsReportingTab />}
        {analyticsSubTab === 'references' && <AnalyticsReferencesTab />}
      </div>
    </div>
  );
}
