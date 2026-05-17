/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, Suspense } from 'react';
import {
  Droplet,
  Calculator,
  Activity,
  Zap,
  Database,
  TrendingDown,
  Shield,
  FlaskConical,
  Waves,
  LineChart,
  BookOpen,
  Layers,
  Cpu,
  Wind, Flame, Microscope, Combine, Eye, DollarSign, Atom, Droplets,
  PieChart, Gavel
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { RockPropertiesTab } from './RockPropertiesTab';
import { PVTAnalysisTab } from './PVTAnalysisTab';
import { PressureAnalysisModule } from './PressureAnalysisModule';
import { FlowPerformanceModule } from './FlowPerformanceModule';
import { MaterialBalanceTab } from './MaterialBalanceTab';
import { DeclineCurveAnalysisModule } from './DeclineCurveAnalysisModule';
import { DriveMechanismTab } from './DriveMechanismTab';
import { EORScreeningModule } from './EORScreeningModule';
import { AquiferModelingTab } from './AquiferModelingTab';
import { WaterfloodingModule } from './WaterfloodingModule';
import { ChemicalEORModule } from './ChemicalEORModule';
import { GasInjectionModule } from './GasInjectionModule';
import { ReferencesTab } from './ReferencesTab';
import { FormationCompletionModule } from './FormationCompletionModule';
import { GeomodelingModule } from './GeomodelingModule';
import { StratigraphicFrameworkModule } from './StratigraphicFrameworkModule';
import { VolumetricsModule } from './VolumetricsModule';
import { AppraisalDecisionModule } from './AppraisalDecisionModule';
import { ReservoirSimulationModule } from './ReservoirSimulationModule';
import { ThermalEORModule } from './ThermalEORModule';
import { MicrobialEORModule } from './MicrobialEORModule';
import { LowSalinityModule } from './LowSalinityModule';
import { NanofluidModule } from './NanofluidModule';
import { HybridEORModule } from './HybridEORModule';
import { MonitoringEORModule } from './MonitoringEORModule';
import { EconomicsEORModule } from './EconomicsEORModule';
import { ReservoirNeuralSimulator } from './ReservoirNeuralSimulator';
import DataFlowIndicator from '../shared/DataFlowIndicator';
import SampleDataLoader from '../shared/SampleDataLoader';
import { getAppraisalSample } from '../../lib/sampleData';

const BuckleyLeverettTab = React.lazy(() => import('./BuckleyLeverettTab').then(m => ({ default: m.BuckleyLeverettTab })));

export function ReservoirStage() {
  const [reservoirSubTab, setReservoirSubTab] = useState<'pvt' | 'properties' | 'welltesting' | 'nodal' | 'matbal' | 'dca' | 'drive' | 'eor' | 'aquifer' | 'waterflood' | 'chemical' | 'gas' | 'thermal' | 'microbial' | 'lsw' | 'nano' | 'hybrid' | 'monitor' | 'econ' | 'references' | 'formation' | 'geomodeling' | 'advanced_sim' | 'stratframework' | 'volumetrics' | 'appraisal' | 'buckley'>('pvt');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <ReservoirNeuralSimulator />

      <div className="flex flex-wrap gap-4 p-4 bg-black/40 border-b border-white/5 sticky top-0 z-20 backdrop-blur-md rounded-2xl">
        {[
          { id: 'pvt', label: 'PVT Analysis', icon: Droplet },
          { id: 'properties', label: 'Rock Properties', icon: Calculator },
          { id: 'welltesting', label: 'Well Testing', icon: Activity },
          { id: 'nodal', label: 'Flow & Perf', icon: Zap },
          { id: 'matbal', label: 'Mat. Balance', icon: Database },
          { id: 'dca', label: 'Decline Analysis', icon: TrendingDown },
          { id: 'drive', label: 'Mechanisms', icon: Shield },
          { id: 'eor', label: 'Phase 1: EOR', icon: FlaskConical },
          { id: 'stratframework', label: 'Strat Framework', icon: Layers },
          { id: 'geomodeling', label: 'Mapping & Geomod', icon: Calculator },
          { id: 'volumetrics', label: 'Volumetrics', icon: PieChart },
          { id: 'appraisal', label: 'Appraisal Gate', icon: Gavel },
          { id: 'aquifer', label: 'Aquifer Modeling', icon: Waves },
          { id: 'formation', label: 'Completion', icon: Layers },
          { id: 'buckley', label: 'BL Displace', icon: Waves },
          { id: 'waterflood', label: 'Phase 2: Waterflood', icon: Waves },
          { id: 'chemical', label: 'Phase 3: Chemical', icon: FlaskConical },
          { id: 'gas', label: 'Phase 4: Gas EOR', icon: Wind },
          { id: 'thermal', label: 'Phase 5: Thermal', icon: Flame },
          { id: 'microbial', label: 'Phase 6: MEOR', icon: Microscope },
          { id: 'lsw', label: 'Phase 7: LSW', icon: Droplets },
          { id: 'nano', label: 'Phase 8: Nano', icon: Atom },
          { id: 'hybrid', label: 'Phase 9: Hybrid', icon: Combine },
          { id: 'monitor', label: 'Phase 10: Surveil', icon: Eye },
          { id: 'econ', label: 'Phase 11: Econ', icon: DollarSign },
          { id: 'advanced_sim', label: 'Res. Simulation', icon: Cpu },
          { id: 'references', label: 'References', icon: BookOpen },
        ].map(tab => (

          <button
            key={tab.id}
            onClick={() => setReservoirSubTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest",
              reservoirSubTab === tab.id
                ? "bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <DataFlowIndicator activeStage="RESERVOIR" />

      <div className="p-4">
        {reservoirSubTab === 'pvt' && <PVTAnalysisTab />}
        {reservoirSubTab === 'properties' && <RockPropertiesTab />}
        {reservoirSubTab === 'welltesting' && <PressureAnalysisModule />}
        {reservoirSubTab === 'nodal' && <FlowPerformanceModule />}
        {reservoirSubTab === 'matbal' && <MaterialBalanceTab />}
        {reservoirSubTab === 'dca' && <DeclineCurveAnalysisModule />}
        {reservoirSubTab === 'drive' && <DriveMechanismTab />}
        {reservoirSubTab === 'eor' && <EORScreeningModule />}
        {reservoirSubTab === 'stratframework' && <StratigraphicFrameworkModule />}
        {reservoirSubTab === 'geomodeling' && <GeomodelingModule />}
        {reservoirSubTab === 'volumetrics' && <VolumetricsModule />}
        {reservoirSubTab === 'appraisal' && <AppraisalDecisionModule />}
        {reservoirSubTab === 'aquifer' && <AquiferModelingTab />}
        {reservoirSubTab === 'waterflood' && <WaterfloodingModule />}
        {reservoirSubTab === 'buckley' && (
          <Suspense fallback={<div className="flex items-center justify-center p-12"><div className="w-6 h-6 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin" /></div>}>
            <BuckleyLeverettTab />
          </Suspense>
        )}
        {reservoirSubTab === 'chemical' && <ChemicalEORModule />}
        {reservoirSubTab === 'gas' && <GasInjectionModule />}
        {reservoirSubTab === 'thermal' && <ThermalEORModule />}
        {reservoirSubTab === 'microbial' && <MicrobialEORModule />}
        {reservoirSubTab === 'lsw' && <LowSalinityModule />}
        {reservoirSubTab === 'nano' && <NanofluidModule />}
        {reservoirSubTab === 'hybrid' && <HybridEORModule />}
        {reservoirSubTab === 'monitor' && <MonitoringEORModule />}
        {reservoirSubTab === 'econ' && <EconomicsEORModule />}
        {reservoirSubTab === 'advanced_sim' && <ReservoirSimulationModule />}
        {reservoirSubTab === 'formation' && <FormationCompletionModule />}
        {reservoirSubTab === 'references' && <ReferencesTab />}
      </div>
    </div>
  );
}