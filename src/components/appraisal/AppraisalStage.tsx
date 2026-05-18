import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { LoggingTab } from '../petrophysics/LoggingTab';
import { PorosityTab } from '../petrophysics/PorosityTab';
import { VshaleTab } from '../petrophysics/VshaleTab';
import { SaturationTab } from '../petrophysics/SaturationTab';
import { PermeabilityTab } from '../petrophysics/PermeabilityTab';
import { InterpretationTab } from '../petrophysics/InterpretationTab';
import { NetPayTab } from '../petrophysics/NetPayTab';
import { CoreTab } from '../petrophysics/CoreTab';
import { ContactsTab } from '../petrophysics/ContactsTab';
import { ReportingTab } from '../petrophysics/ReportingTab';
import { ReferenceTab } from '../petrophysics/ReferenceTab';
import { WellLogAnalysisModule } from '../petrophysics/WellLogAnalysisModule';
import { GeomodelingModule } from '../reservoir/GeomodelingModule';

export function AppraisalStage() {
  const [petrophysicsSubTab, setPetrophysicsSubTab] = useState('engine');
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [selectedLoggingTool, setSelectedLoggingTool] = useState<any>(null);
  const [porosityInp, setPorosityInp] = useState<any>({
    rhob: 2.15, nphi: 0.35, dt: 85, porosityType: 'density',
    lithology: 'sandstone',
    rhoMatrix: 2.65, dtMatrix: 55.5,
    rhoFluid: 1.0, dtFluid: 189,
    vshale: 0.1, dtShale: 100, dphiShale: 0.15, nphiShale: 0.3,
    applyShaleCorrection: false
  });
  const [vshaleInp, setVshaleInp] = useState<any>({ gr: 85, grClean: 20, grShale: 120, method: 'larionov_tertiary' });
  const [saturationInp, setSaturationInp] = useState<any>({ rt: 2.5, phi: 0.18, rw: 0.05, a: 1, m: 2, n: 2, method: 'archie', vsh: 0.2, rsh: 5.0, nphi_sh: 0.35, rwb: 0.3, qv: 0.5, b: 2.0, salinity: 100000, temp: 200 });
  const [permeabilityInp, setPermeabilityInp] = useState<any>({ phi: 0.18, swir: 0.2, c: 0.1, method: 'tixier' });
  const [multiminInp, setMultiminInp] = useState<any>({ rhob: 2.45, nphi: 0.15, pef: 3.2, rhoFluid: 1.0, hiFluid: 1.0 });
  const [netPayInp, setNetPayInp] = useState<any>({ minPhi: 0.1, maxVsh: 0.4, maxSw: 0.6, minK: 1.0, area: 1200, bo: 1.25 });
  const [coreInp, setCoreInp] = useState<any>({ phi_core: 0.18, k_core: 150, a: 1, m: 2, depthShift: 0, sigma: 30, theta: 25, pc: 10 });
  const [contactInp, setContactInp] = useState<any>({ gasGrad: 0.08, oilGrad: 0.32, waterGrad: 0.45, refDepth: 5500, gasPAtRef: 2400, oilPAtRef: 2450, waterPAtRef: 2600, fwl: 6200, pcEntry: 5 });
  const [refSearchTerm, setRefSearchTerm] = useState('');

  const mockLogData = useMemo(() => Array.from({ length: 100 }).map((_, i) => ({
    depth: 5000 + i,
    phi: 0.1 + Math.random() * 0.2,
    vsh: Math.random() * 0.5,
    sw: 0.2 + Math.random() * 0.6,
    k: 1 + Math.random() * 100
  })), []);

  return (
    <div className="space-y-6">
      {/* Petrophysics Header Nav */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
        {[
          { id: 'engine', label: 'Petrophysics Engine' },
          { id: 'logging', label: 'Logging Tools' },
          { id: 'porosity', label: 'Porosity & Lithology' },
          { id: 'vshale', label: 'Shale Volume' },
          { id: 'saturation', label: 'Water Saturation' },
          { id: 'permeability', label: 'Permeability' },
          { id: 'interpretation', label: 'Interpretation Engine' },
          { id: 'netpay', label: 'Phase 6: Net Pay' },
          { id: 'core', label: 'Phase 7: Core' },
          { id: 'contacts', label: 'Phase 8: Contacts' },
          { id: 'multimineral', label: 'Phase 9: Multimineral' },
          { id: 'reporting', label: 'Phase 10: Reporting' },
          { id: 'reference', label: 'Phase 11: Reference' },
          { id: 'geomodeling', label: 'Module 10: Geomodeling' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setPetrophysicsSubTab(tab.id)}
            className={cn(
              "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
              petrophysicsSubTab === tab.id ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "text-slate-500 hover:text-slate-300"
            )}
          >{tab.label}</button>
        ))}
      </div>

      <div className="mt-6">
        {petrophysicsSubTab === 'engine' && <WellLogAnalysisModule />}
        {petrophysicsSubTab === 'logging' && <LoggingTab logSearchTerm={logSearchTerm} setLogSearchTerm={setLogSearchTerm} selectedLoggingTool={selectedLoggingTool} setSelectedLoggingTool={setSelectedLoggingTool} />}
        {petrophysicsSubTab === 'porosity' && <PorosityTab porosityInp={porosityInp} setPorosityInp={setPorosityInp} vshaleInp={vshaleInp} />}
        {petrophysicsSubTab === 'vshale' && <VshaleTab vshaleInp={vshaleInp} setVshaleInp={setVshaleInp} />}
        {petrophysicsSubTab === 'saturation' && <SaturationTab saturationInp={saturationInp} setSaturationInp={setSaturationInp} />}
        {petrophysicsSubTab === 'permeability' && <PermeabilityTab permeabilityInp={permeabilityInp} setPermeabilityInp={setPermeabilityInp} />}
        {petrophysicsSubTab === 'interpretation' && <InterpretationTab multiminInp={multiminInp} setMultiminInp={setMultiminInp} />}
        {petrophysicsSubTab === 'netpay' && <NetPayTab netPayInp={netPayInp} setNetPayInp={setNetPayInp} mockLogData={mockLogData} />}
        {petrophysicsSubTab === 'core' && <CoreTab coreInp={coreInp} setCoreInp={setCoreInp} />}
        {petrophysicsSubTab === 'contacts' && <ContactsTab contactInp={contactInp} setContactInp={setContactInp} />}
        {petrophysicsSubTab === 'multimineral' && <InterpretationTab multiminInp={multiminInp} setMultiminInp={setMultiminInp} />}
        {petrophysicsSubTab === 'reporting' && <ReportingTab />}
        {petrophysicsSubTab === 'reference' && <ReferenceTab refSearchTerm={refSearchTerm} setRefSearchTerm={setRefSearchTerm} />}
        {petrophysicsSubTab === 'geomodeling' && <GeomodelingModule />}
      </div>
    </div>
  );
}
