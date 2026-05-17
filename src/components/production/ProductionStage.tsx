import React, { useState } from 'react';
import {
  LayoutDashboard, Stethoscope, Zap, Target, FlaskConical, Network,
  ShieldAlert, Library, Activity, ArrowUpCircle, GitMerge, GitCommit,
  Layers, Flame, Snowflake, Factory, Eye, ShieldCheck, BrainCircuit,
  ClipboardCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ProductionDashboard } from './ProductionDashboard';
import { WellDiagnostics } from './WellDiagnostics';
import { LiftOptimization } from './LiftOptimization';
import { InterventionPlanning } from './InterventionPlanning';
import { ChemicalTreatment } from './ChemicalTreatment';
import { NetworkOptimization } from './NetworkOptimization';
import { HSEIntegrityTab } from './HSEIntegrityTab';
import { ProductionReferencesTab } from './ProductionReferencesTab';
import { FacilitiesTab } from './FacilitiesTab';
import { ProductionEngineeringModule } from './ProductionEngineeringModule';
import { IPRModule } from './IPRModule';
import { VLPModule } from './VLPModule';
import { NodalAnalysisModule } from './NodalAnalysisModule';
import { ChokePerformanceModule } from './ChokePerformanceModule';
import { ArtificialLiftModule } from './ArtificialLiftModule';
import { WellCompletionModule } from './WellCompletionModule';
import { WellStimulationModule } from './WellStimulationModule';
import { FlowAssuranceModule } from './FlowAssuranceModule';
import { SurfaceProcessingModule } from './SurfaceProcessingModule';
import { ProductionSurveillanceModule } from './ProductionSurveillanceModule';
import { WellIntegrityModule } from './WellIntegrityModule';
import { DigitalOilfieldModule } from './DigitalOilfieldModule';
import { WellHandoverModule } from './WellHandoverModule';
import DataFlowIndicator from '../shared/DataFlowIndicator';
import SampleDataLoader from '../shared/SampleDataLoader';
import { getProductionSample } from '../../lib/sampleData';

type ProdTab =
  | 'ipr' | 'vlp' | 'nodal' | 'choke' | 'artificial-lift' | 'completion'
  | 'stimulation' | 'flow-assurance' | 'surface' | 'surveillance-pe'
  | 'integrity' | 'digital'
  | 'surveillance' | 'diagnostics' | 'lift' | 'intervention' | 'chemical'
  | 'network' | 'engineering' | 'facilities' | 'hse' | 'references'
  | 'handover';

export default function ProductionStage() {
  const [productionSubTab, setProductionSubTab] = useState<ProdTab>('ipr');
  const [sampleLoaded, setSampleLoaded] = useState(false);

  const handleLoadProductionSample = () => {
    getProductionSample();
    setSampleLoaded(true);
  };

  const tabs: { id: ProdTab; label: string; icon: any; group: 'pe' | 'ops' }[] = [
    // Production Engineering (PE) phases
    { id: 'ipr', label: 'Ph.1: IPR', icon: Target, group: 'pe' },
    { id: 'vlp', label: 'Ph.2: VLP', icon: ArrowUpCircle, group: 'pe' },
    { id: 'nodal', label: 'Ph.3: Nodal', icon: GitMerge, group: 'pe' },
    { id: 'choke', label: 'Ph.4: Choke', icon: GitCommit, group: 'pe' },
    { id: 'artificial-lift', label: 'Ph.5: Artificial Lift', icon: Zap, group: 'pe' },
    { id: 'completion', label: 'Ph.6: Completion', icon: Layers, group: 'pe' },
    { id: 'stimulation', label: 'Ph.7: Stimulation', icon: Flame, group: 'pe' },
    { id: 'flow-assurance', label: 'Ph.8: Flow Assurance', icon: Snowflake, group: 'pe' },
    { id: 'surface', label: 'Ph.9: Surface Processing', icon: Factory, group: 'pe' },
    { id: 'surveillance-pe', label: 'Ph.10: Surveillance', icon: Eye, group: 'pe' },
    { id: 'integrity', label: 'Ph.11: Integrity', icon: ShieldCheck, group: 'pe' },
    { id: 'digital', label: 'Ph.12: Digital Field', icon: BrainCircuit, group: 'pe' },
    { id: 'handover', label: 'Ph.13: Handover', icon: ClipboardCheck, group: 'pe' },
    // Legacy Production Operations tabs
    { id: 'surveillance', label: 'Field Dashboard', icon: LayoutDashboard, group: 'ops' },
    { id: 'diagnostics', label: 'Well Diagnostics', icon: Stethoscope, group: 'ops' },
    { id: 'lift', label: 'Lift Optimization', icon: Zap, group: 'ops' },
    { id: 'intervention', label: 'Intervention', icon: Target, group: 'ops' },
    { id: 'chemical', label: 'Chemical Tmt.', icon: FlaskConical, group: 'ops' },
    { id: 'network', label: 'Network Opt.', icon: Network, group: 'ops' },
    { id: 'engineering', label: 'Prod. Engineering', icon: Activity, group: 'ops' },
    { id: 'facilities', label: 'Facilities', icon: Library, group: 'ops' },
    { id: 'hse', label: 'HSE & Integrity', icon: ShieldAlert, group: 'ops' },
    { id: 'references', label: 'References', icon: Library, group: 'ops' },
  ];

  const peTabs = tabs.filter(t => t.group === 'pe');
  const opsTabs = tabs.filter(t => t.group === 'ops');

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-white/5 bg-black/20">
        <div className="flex items-center justify-end px-6 py-2">
          <SampleDataLoader
            stageName="Production"
            loadSample={handleLoadProductionSample}
            hasData={sampleLoaded}
          />
        </div>
        {/* PE Phases Row */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-white/5">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mr-2 shrink-0">Production Engineering →</span>
          {peTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setProductionSubTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                productionSubTab === tab.id
                  ? "bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  : "text-slate-600 hover:text-slate-300 hover:bg-white/5"
              )}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
        {/* Operations Row */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-3">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mr-2 shrink-0">Operations →</span>
          {opsTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setProductionSubTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                productionSubTab === tab.id
                  ? "bg-slate-600 text-white"
                  : "text-slate-600 hover:text-slate-400 hover:bg-white/5"
              )}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <DataFlowIndicator activeStage="PRODUCTION" />

      <div className="flex-1 overflow-y-auto p-8">
        {productionSubTab === 'ipr' && <IPRModule />}
        {productionSubTab === 'vlp' && <VLPModule />}
        {productionSubTab === 'nodal' && <NodalAnalysisModule />}
        {productionSubTab === 'choke' && <ChokePerformanceModule />}
        {productionSubTab === 'artificial-lift' && <ArtificialLiftModule />}
        {productionSubTab === 'completion' && <WellCompletionModule />}
        {productionSubTab === 'stimulation' && <WellStimulationModule />}
        {productionSubTab === 'flow-assurance' && <FlowAssuranceModule />}
        {productionSubTab === 'surface' && <SurfaceProcessingModule />}
        {productionSubTab === 'surveillance-pe' && <ProductionSurveillanceModule />}
        {productionSubTab === 'integrity' && <WellIntegrityModule />}
        {productionSubTab === 'digital' && <DigitalOilfieldModule />}
        {productionSubTab === 'handover' && <WellHandoverModule />}
        {productionSubTab === 'surveillance' && <ProductionDashboard />}
        {productionSubTab === 'diagnostics' && <WellDiagnostics />}
        {productionSubTab === 'lift' && <LiftOptimization />}
        {productionSubTab === 'intervention' && <InterventionPlanning />}
        {productionSubTab === 'chemical' && <ChemicalTreatment />}
        {productionSubTab === 'network' && <NetworkOptimization />}
        {productionSubTab === 'engineering' && <ProductionEngineeringModule />}
        {productionSubTab === 'facilities' && <FacilitiesTab />}
        {productionSubTab === 'hse' && <HSEIntegrityTab />}
        {productionSubTab === 'references' && <ProductionReferencesTab />}
      </div>
    </div>
  );
}
