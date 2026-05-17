import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Target, 
  BarChart3, 
  TrendingDown, 
  Calendar, 
  Wallet, 
  AlertCircle, 
  Globe, 
  ClipboardList, 
  BookOpen,
  Calculator
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ReserveClassificationTab } from '../economics/ReserveClassificationTab';
import { VolumetricEstimationTab } from '../economics/VolumetricEstimationTab';
import { GasMatBalTab } from '../economics/GasMatBalTab';
import { DeclineReservesTab } from '../economics/DeclineReservesTab';
import { ProductionForecastingTab } from '../economics/ProductionForecastingTab';
import { EconomicAnalysisTab } from '../economics/EconomicAnalysisTab';
import { RiskAnalysisTab } from '../economics/RiskAnalysisTab';
import { FiscalRegimeTab } from '../economics/FiscalRegimeTab';
import { ReservesReportingTab } from '../economics/ReservesReportingTab';
import { EconomicsReferencesTab } from '../economics/EconomicsReferencesTab';
import { VolumetricEstimationModule } from './VolumetricEstimationModule';
import { EconomicReferenceTab } from '../economics/EconomicReferenceTab';

export function ReservesStage() {
  const [reservesSubTab, setReservesSubTab] = useState<'classification' | 'volumetrics' | 'matbal' | 'decline' | 'forecasting' | 'economics' | 'risk' | 'fiscal' | 'reporting' | 'references' | 'market-data' | 'engine'>('engine');

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-wrap gap-4 p-4 bg-black/40 border-b border-white/5 sticky top-0 z-20 backdrop-blur-md">
        {[
          { id: 'engine', label: 'Volumetrics Engine', icon: Calculator },
          { id: 'classification', label: 'Classification', icon: ShieldCheck },
          { id: 'volumetrics', label: 'Volumetrics', icon: Target },
          { id: 'matbal', label: 'Gas Mat Bal', icon: BarChart3 },
          { id: 'decline', label: 'Decline Analysis', icon: TrendingDown },
          { id: 'forecasting', label: 'Forecasting', icon: Calendar },
          { id: 'economics', label: 'Economics', icon: Wallet },
          { id: 'risk', label: 'Risk & Sensitivity', icon: AlertCircle },
          { id: 'fiscal', label: 'Fiscal Regime', icon: Globe },
          { id: 'market-data', label: 'Market Data', icon: Wallet },
          { id: 'reporting', label: 'Reporting', icon: ClipboardList },
          { id: 'references', label: 'References', icon: BookOpen }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setReservesSubTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest",
              reservesSubTab === tab.id 
                ? "bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]" 
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {reservesSubTab === 'engine' && <VolumetricEstimationModule />}
        {reservesSubTab === 'classification' && <ReserveClassificationTab />}
        {reservesSubTab === 'volumetrics' && <VolumetricEstimationTab />}
        {reservesSubTab === 'matbal' && <GasMatBalTab />}
        {reservesSubTab === 'decline' && <DeclineReservesTab />}
        {reservesSubTab === 'forecasting' && <ProductionForecastingTab />}
        {reservesSubTab === 'economics' && <EconomicAnalysisTab />}
        {reservesSubTab === 'risk' && <RiskAnalysisTab />}
        {reservesSubTab === 'fiscal' && <FiscalRegimeTab />}
        {reservesSubTab === 'market-data' && <EconomicReferenceTab />}
        {reservesSubTab === 'reporting' && <ReservesReportingTab />}
        {reservesSubTab === 'references' && <EconomicsReferencesTab />}
      </div>
    </div>
  );
}
