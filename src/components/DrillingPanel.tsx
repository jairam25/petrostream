import React from 'react';
import { cn } from '../lib/utils';
import { WellControlTab } from './drilling/WellControlTab';
import { HydraulicsTab } from './drilling/HydraulicsTab';
import { DrillingPlanningTab } from './drilling/DrillingPlanningTab';
import { FluidsTab } from './drilling/FluidsTab';
import { CasingTab } from './drilling/CasingTab';
import { MudTab } from './drilling/MudTab';
import { BitSelectionTab } from './drilling/BitSelectionTab';
import { BHATab } from './drilling/BHATab';
import { RigSelectionTab } from './drilling/RigSelectionTab';
import { DirectionalTab } from './drilling/DirectionalTab';
import CementingTab from './drilling/CementingTab';
import { ResearchPapersTab } from './drilling/ResearchPapersTab';
import { OffshoreOnshoreTab } from './drilling/OffshoreOnshoreTab';
import { WellheadTab } from './drilling/WellheadTab';
import { EngineeringReferenceHub } from './shared/EngineeringReferenceHub';

interface DrillingPanelProps {
  drillingSubTab: string;
  setDrillingSubTab: (tab: any) => void;
  wellControlInp: any;
  setWellControlInp: (val: any) => void;
  mudInp: any;
  setMudInp: (val: any) => void;
  hydraulicsInp: any;
  setHydraulicsInp: (val: any) => void;
  targetParams: any;
  setTargetParams: (val: any) => void;
  surveyS1: any;
  setSurveyS1: (val: any) => void;
  surveyS2: any;
  setSurveyS2: (val: any) => void;
  plannedTrajectories: any[];
  ppInp: any;
  setPpInp: (val: any) => void;
  dExpInp: any;
  setDExpInp: (val: any) => void;
  pressureProfile: any[];
  casingDepth: number;
  setCasingDepth: (val: number) => void;
  selectedGrade: string;
  setSelectedGrade: (val: string) => void;
  selectedWeight: number;
  setSelectedWeight: (val: number) => void;
  internalPress: number;
  setInternalPress: (val: number) => void;
  externalPress: number;
  setExternalPress: (val: number) => void;
  bitInp: any;
  setBitInp: (val: any) => void;
  directionalInp: any;
  setDirectionalInp: (val: any) => void;
  cementingInp: any;
  setCementingInp: (val: any) => void;
  paperTopicFilter: string;
  setPaperTopicFilter: (val: string) => void;
  paperSearchTerm: string;
  setPaperSearchTerm: (val: string) => void;
}

export const DrillingPanel: React.FC<DrillingPanelProps> = (props) => {
  const { drillingSubTab, setDrillingSubTab } = props;

  const tabs = [
    { id: 'planning', label: 'Well Planning' },
    { id: 'fluids', label: 'Pore Pressure' },
    { id: 'casing', label: 'Casing Design' },
    { id: 'mud', label: 'Mud Engineering' },
    { id: 'hydraulics', label: 'Hydraulics' },
    { id: 'bitSelection', label: 'Bit Selection' },
    { id: 'bha', label: 'BHA Design (3.1.5)' },
    { id: 'rigselection', label: 'Rig Selection (3.1.6)' },
    { id: 'wellControl', label: 'Well Control' },
    { id: 'directional', label: 'Directional' },
    { id: 'cementing', label: 'Cementing' },
    { id: 'wellhead', label: 'Wellhead & Tree' },
    { id: 'offshore', label: 'Onshore vs Offshore' },
    { id: 'papers', label: 'Research Papers' },
    { id: 'refs', label: 'Engineering Refs' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 bg-slate-900/50 border-b border-white/5 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDrillingSubTab(tab.id)}
              className={cn(
                "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                drillingSubTab === tab.id
                  ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grow overflow-y-auto p-4 custom-scrollbar">
        {drillingSubTab === 'wellControl' && <WellControlTab {...props} />}
        {drillingSubTab === 'hydraulics' && <HydraulicsTab {...props} />}
        {drillingSubTab === 'planning' && <DrillingPlanningTab {...props} />}
        {drillingSubTab === 'fluids' && <FluidsTab {...props} />}
        {drillingSubTab === 'casing' && <CasingTab {...props} />}
        {drillingSubTab === 'mud' && <MudTab {...props} />}
        {drillingSubTab === 'bitSelection' && <BitSelectionTab {...props} />}
        {drillingSubTab === 'bha' && <BHATab {...props} />}
        {drillingSubTab === 'rigselection' && <RigSelectionTab {...props} />}
        {drillingSubTab === 'directional' && <DirectionalTab {...props} />}
        {drillingSubTab === 'cementing' && <CementingTab />}
        {drillingSubTab === 'wellhead' && <WellheadTab />}
        {drillingSubTab === 'offshore' && <OffshoreOnshoreTab />}
        {drillingSubTab === 'papers' && <ResearchPapersTab {...props} />}
        {drillingSubTab === 'refs' && <EngineeringReferenceHub />}
      </div>
    </div>
  );
};
