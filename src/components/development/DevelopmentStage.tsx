import React, { useState } from 'react';
import { 
  Target, 
  Ruler, 
  CalendarDays, 
  Zap, 
  Factory, 
  ShieldAlert, 
  Waves,
  Library,
  Layers,
  ClipboardList
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { OffshoreConceptTab } from '../fdp/OffshoreConceptTab';
import { ProjectRiskTab } from '../fdp/ProjectRiskTab';
import { FDPReportTab } from '../fdp/FDPReportTab';
import { DevStrategyTab } from '../fdp/DevStrategyTab';
import { WellSpacingTab } from '../fdp/WellSpacingTab';
import { DrillingScheduleTab } from '../fdp/DrillingScheduleTab';
import { ArtificialLiftTab } from '../fdp/ArtificialLiftTab';
import { SurfaceFacilityTab } from '../fdp/SurfaceFacilityTab';
import { FlowAssuranceTab } from '../fdp/FlowAssuranceTab';
import { InjectionDesignTab } from '../fdp/InjectionDesignTab';

export function DevelopmentStage() {
  const [fdpSubTab, setFdpSubTab] = useState<'offshore' | 'risk' | 'report' | 'strategy' | 'spacing' | 'drilling' | 'lift' | 'facilities' | 'flow' | 'injection'>('strategy');

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-4 px-8 py-4 border-b border-white/5 bg-black/20">
        {[
          { id: 'strategy', label: 'Mgmt Strategy', icon: Target },
          { id: 'spacing', label: 'Well Spacing', icon: Ruler },
          { id: 'drilling', label: 'Drilling Schedule', icon: CalendarDays },
          { id: 'lift', label: 'Artificial Lift', icon: Zap },
          { id: 'facilities', label: 'Surface Facilities', icon: Factory },
          { id: 'flow', label: 'Flow Assurance', icon: ShieldAlert },
          { id: 'injection', label: 'Injection Design', icon: Waves },
          { id: 'offshore', label: 'Offshore Concept', icon: Layers },
          { id: 'risk', label: 'Project Risk', icon: ShieldAlert },
          { id: 'report', label: 'FDP Report', icon: ClipboardList }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFdpSubTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
              fdpSubTab === tab.id 
                ? "bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]" 
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {fdpSubTab === 'offshore' && <OffshoreConceptTab />}
        {fdpSubTab === 'risk' && <ProjectRiskTab />}
        {fdpSubTab === 'report' && <FDPReportTab />}
        {fdpSubTab === 'strategy' && <DevStrategyTab />}
        {fdpSubTab === 'spacing' && <WellSpacingTab />}
        {fdpSubTab === 'drilling' && <DrillingScheduleTab />}
        {fdpSubTab === 'lift' && <ArtificialLiftTab />}
        {fdpSubTab === 'facilities' && <SurfaceFacilityTab />}
        {fdpSubTab === 'flow' && <FlowAssuranceTab />}
        {fdpSubTab === 'injection' && <InjectionDesignTab />}
      </div>
    </div>
  );
}
