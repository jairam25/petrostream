import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Layers, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CASING_GRADES, calculateTensileLoad, calculateCollapseSafetyFactor, calculateBurstSafetyFactor } from '../../lib/drilling';
import { CASING_API_DATABASE, CASING_GRADES_INFO } from '../../lib/drilling_data';
import { SectionHeader, DataRow } from '../SharedUI';

interface CasingTabProps {
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
  mudInp: any;
}

export const CasingTab: React.FC<CasingTabProps> = ({ 
  casingDepth, 
  setCasingDepth,
  selectedGrade,
  setSelectedGrade,
  selectedWeight,
  setSelectedWeight,
  internalPress,
  setInternalPress,
  externalPress,
  setExternalPress,
  mudInp
}) => {
  const gradeSpecs = CASING_GRADES[selectedGrade] || [];
  const currentCasing = gradeSpecs.find(s => s.weight === selectedWeight) || gradeSpecs[0];
  
  const tensile = currentCasing ? calculateTensileLoad(casingDepth, selectedWeight, mudInp.currentMW) : 0;
  const collapseSF = currentCasing ? calculateCollapseSafetyFactor(casingDepth, mudInp.currentMW, currentCasing.collapseRating) : 0;
  const burstSF = currentCasing ? calculateBurstSafetyFactor(internalPress, externalPress, currentCasing.burstRating) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-8 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex justify-between items-start mb-8">
              <div>
                 <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest mb-1">Module 2 / Phase 3</p>
                 <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">Casing String Design</h3>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                 <ShieldCheck className="text-emerald-400" />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
              <div className="space-y-6">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2">Specification Manager</h4>
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="col-span-2 space-y-1">
                          <label className="text-[11px] text-slate-500 uppercase">Casing Depth (ft)</label>
                          <input type="number" value={casingDepth} onChange={e => setCasingDepth(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[11px] text-slate-500 uppercase">API Grade</label>
                          <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none">
                             {Object.keys(CASING_GRADES).map(g => <option key={g} value={g} className="bg-slate-900">{g}</option>)}
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[11px] text-slate-500 uppercase">Weight (lb/ft)</label>
                          <select value={selectedWeight} onChange={e => setSelectedWeight(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none">
                             {(CASING_GRADES[selectedGrade] || []).map(g => <option key={g.weight} value={g.weight} className="bg-slate-900">{g.weight}</option>)}
                          </select>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[11px] text-slate-500 uppercase">Internal Press (psi)</label>
                          <input type="number" value={internalPress} onChange={e => setInternalPress(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[11px] text-slate-500 uppercase">External Press (psi)</label>
                          <input type="number" value={externalPress} onChange={e => setExternalPress(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2">Material Capacity</h4>
                 <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-[10px]">
                       <span className="text-slate-500 uppercase font-mono tracking-tighter">Burst Rating</span>
                       <span className="text-white font-bold">{currentCasing?.burstRating} psi</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                       <span className="text-slate-500 uppercase font-mono tracking-tighter">Collapse Rating</span>
                       <span className="text-white font-bold">{currentCasing?.collapseRating} psi</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                       <span className="text-slate-500 uppercase font-mono tracking-tighter">Yield Strength</span>
                       <span className="text-white font-bold">{(currentCasing?.yieldStrength || 0).toLocaleString()} psi</span>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                       <div className="text-[10px] text-slate-600 uppercase mb-2">Calculated Load Factors</div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className={cn("p-3 rounded-xl text-center border", burstSF > 1.1 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/30")}>
                             <div className="text-[10px] text-slate-500 uppercase font-black mb-1 tracking-widest">Burst SF</div>
                             <div className="text-lg font-black text-white italic">{burstSF.toFixed(2)}</div>
                          </div>
                          <div className={cn("p-3 rounded-xl text-center border", collapseSF > 1.1 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/30")}>
                             <div className="text-[10px] text-slate-500 uppercase font-black mb-1 tracking-widest">Collapse SF</div>
                             <div className="text-lg font-black text-white italic">{collapseSF.toFixed(2)}</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Shoe Depth Strategy</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                 { stage: 'Surface', depth: '2,500ft', type: '13-3/8"', reason: 'Protect aquifers and provide well control base.' },
                 { stage: 'Intermediate', depth: '8,200ft', type: '9-5/8"', reason: 'Isolate saline zones and low pressure sands.' },
                 { stage: 'Production', depth: 'Target', type: '7"', reason: 'Maximum reservoir isolation for multi-zone frag.' }
              ].map((s, i) => (
                 <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 relative group hover:bg-emerald-500/5 transition-all">
                    <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">{s.stage}</span>
                    <h5 className="text-xl font-black text-white italic uppercase tracking-tighter my-1">{s.depth}</h5>
                    <div className="text-[11px] text-white/40 mb-3 font-mono">{s.type}</div>
                    <p className="text-[11px] text-slate-500 leading-tight italic">"{s.reason}"</p>
                 </div>
              ))}
           </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-6">
              <Layers size={16} className="text-slate-400" />
              <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Run Checklist</h4>
           </div>
           <div className="space-y-3">
              {[
                 'Verify casing drift diameters',
                 'Confirm grade stamped on all joints',
                 'Pressure test cement surface lines',
                 'Rig torque monitored continuously',
                 'Circulate hole clean prior to cement'
              ].map((c, i) => (
                 <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 transition-colors hover:border-emerald-500/30">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    <span className="text-[11px] text-slate-300 font-medium uppercase tracking-tight">{c}</span>
                 </div>
              ))}
           </div>
        </div>

        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-4">
           <div className="p-2 bg-emerald-500/20 rounded-xl">
              <Info className="w-4 h-4 text-emerald-400" />
           </div>
           <div>
              <h5 className="text-[10px] font-bold text-white uppercase mb-1">Tensile Analysis</h5>
              <div className="text-xl font-black text-white italic mb-1">{(tensile/1000).toFixed(0)} <span className="text-[10px] text-slate-500 uppercase">KLB</span></div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic uppercase tracking-tighter">Current hook load estimate for casing string air weight. Buoyancy accounted for: {(tensile * 0.85 / 1000).toFixed(0)} KLB.</p>
           </div>
        </div>
      </div>

      <div className="lg:col-span-12 mt-8">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
          <SectionHeader title="API 5CT Casing & Grade Reference" subtitle="International Standards Library" />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-6">
            <div>
              <h5 className="text-[10px] font-bold text-industry-label uppercase mb-4">Standard Casing Database</h5>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="industry-table min-w-[700px]">
                  <thead>
                    <tr>
                      <th>Size (in)</th>
                      <th>Type</th>
                      <th>Wt (lb/ft)</th>
                      <th>Wall (in)</th>
                      <th>ID (in)</th>
                      <th>Drift (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CASING_API_DATABASE.map((c, i) => (
                      <tr key={i}>
                        <td className="data-mono font-bold text-white">{c.size}"</td>
                        <td className="text-[10px] text-industry-label uppercase">{c.type}</td>
                        <td className="data-mono text-industry-value">{c.weight}</td>
                        <td className="data-mono text-text-tertiary">{c.wall}</td>
                        <td className="data-mono text-text-tertiary">{c.id}</td>
                        <td className="data-mono text-emerald-400">{c.drift}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <h5 className="text-[10px] font-bold text-industry-label uppercase mb-4">Yield Strength & Material Grades</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {CASING_GRADES_INFO.map((g, i) => (
                    <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black italic" style={{ color: g.color }}>{g.grade}</span>
                        {g.ssc && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1 rounded">SSC</span>}
                      </div>
                      <div className="text-[10px] data-mono text-white">{(g.yield/1000).toFixed(0)} KSI</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                <p className="text-[11px] text-blue-400 font-bold uppercase mb-2">Sour Service Compliance</p>
                <p className="text-[10px] text-slate-400 italic">Grades L-80, C-90, and T-95 meet NACE MR0175 requirements (HRC ≤ 22 for L-80) for resistance to Sulfide Stress Cracking (SSC).</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
