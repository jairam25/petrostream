import React, { useState } from 'react';
import { EconomicsModule } from './EconomicsModule';
import { FiscalRegimeTab } from './FiscalRegimeTab';
import { RiskAnalysisTab } from './RiskAnalysisTab';
import { EconomicsReferencesTab } from './EconomicsReferencesTab';
import { cn } from '../../lib/utils';
import { DollarSign, Scale, AlertOctagon, BookOpen, Layers } from 'lucide-react';

export default function EconomicsStage() {
  const [subTab, setSubTab] = useState<'modeling' | 'fiscal' | 'risk' | 'references'>('modeling');

  return (
    <div className="flex flex-col h-screen bg-[#030406]">
      {/* Sub-Navigation */}
      <div className="flex border-b border-white/5 bg-[#05070a] px-8 shrink-0">
        {[
          { id: 'modeling', label: 'Economic Simulator', icon: DollarSign },
          { id: 'fiscal', label: 'Fiscal Regimes', icon: Scale },
          { id: 'risk', label: 'Risk & Strategy', icon: AlertOctagon },
          { id: 'references', label: 'References', icon: BookOpen }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={cn(
              "flex items-center gap-3 px-8 py-5 text-[10px] font-bold uppercase tracking-widest transition-all relative",
              subTab === tab.id ? "text-emerald-500" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
            {subTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500 shadow-[0_0_10px_#10b981]" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {subTab === 'modeling' && <EconomicsModule />}
        {subTab === 'fiscal' && <FiscalRegimeTab />}
        {subTab === 'risk' && <RiskAnalysisTab />}
        {subTab === 'references' && <EconomicsReferencesTab />}
      </div>
    </div>
  );
}
