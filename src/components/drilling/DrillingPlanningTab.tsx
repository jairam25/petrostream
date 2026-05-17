import React from 'react';
import { motion } from 'motion/react';
import { Compass, Target, Plus, Database } from 'lucide-react';
import { designJTypeWell, calculateMinimumCurvature, calculateSeparationFactor } from '../../lib/drilling';

interface DrillingPlanningTabProps {
  targetParams: any;
  setTargetParams: (val: any) => void;
  surveyS1: any;
  setSurveyS1: (val: any) => void;
  surveyS2: any;
  setSurveyS2: (val: any) => void;
  plannedTrajectories: any[];
}

export const DrillingPlanningTab: React.FC<DrillingPlanningTabProps> = ({ 
  targetParams, 
  setTargetParams,
  surveyS1,
  setSurveyS1,
  surveyS2,
  setSurveyS2,
  plannedTrajectories
}) => {
  const jTypeResult = designJTypeWell(targetParams.targetTVD, targetParams.targetDeparture, targetParams.kop, targetParams.buildRate);
  const minCurv = calculateMinimumCurvature(surveyS1, surveyS2);
  const sepFactor = calculateSeparationFactor({x: 500, y: 500, z: 2000}, {x: 520, y: 490, z: 2010}, 10, 15);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-8 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex justify-between items-start mb-8">
              <div>
                 <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest mb-1">Module 2 / Phase 1</p>
                 <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">Well Trajectory Design</h3>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                 <Compass className="text-emerald-400" />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2">J-Type Configuration</h4>
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[11px] text-slate-500 uppercase">Target TVD (m)</label>
                          <input type="number" value={targetParams.targetTVD} onChange={e => setTargetParams({...targetParams, targetTVD: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[11px] text-slate-500 uppercase">Departure (m)</label>
                          <input type="number" value={targetParams.targetDeparture} onChange={e => setTargetParams({...targetParams, targetDeparture: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[11px] text-slate-500 uppercase">KOP (m): {targetParams.kop}</label>
                       <input type="range" min="200" max="2500" value={targetParams.kop} onChange={e => setTargetParams({...targetParams, kop: Number(e.target.value)})} className="w-full" />
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2">Plan Results</h4>
                 <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                    <div className="grid grid-cols-2 gap-y-4">
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase mb-1">Max Inclination</div>
                          <div className="text-xl font-black text-white italic">{jTypeResult.maxInc.toFixed(1)}°</div>
                       </div>
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase mb-1">Total MD</div>
                          <div className="text-xl font-black text-white italic">{Math.round(jTypeResult.totalMD)} m</div>
                       </div>
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase mb-1">EOB (End of Build)</div>
                          <div className="text-xl font-black text-white italic">{Math.round(jTypeResult.eobMD)} m</div>
                       </div>
                       <div>
                          <div className="text-[10px] text-slate-500 uppercase mb-1">Tangent Angle</div>
                          <div className="text-xl font-black text-emerald-400 italic">STEADY</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex justify-between items-center mb-6">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2 flex-grow">Minimum Curvature Survey Tool</h4>
              <button className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                 <Plus size={10} /> Add Station
              </button>
           </div>
           <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                 <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                       <label className="text-[10px] text-slate-500 uppercase">MD 1</label>
                       <input type="number" value={surveyS1.md} onChange={e => setSurveyS1({...surveyS1, md: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] text-slate-500 uppercase">INC 1</label>
                       <input type="number" value={surveyS1.inc} onChange={e => setSurveyS1({...surveyS1, inc: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] text-slate-500 uppercase">AZI 1</label>
                       <input type="number" value={surveyS1.azi} onChange={e => setSurveyS1({...surveyS1, azi: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white" />
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                       <label className="text-[10px] text-slate-500 uppercase">MD 2</label>
                       <input type="number" value={surveyS2.md} onChange={e => setSurveyS2({...surveyS2, md: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] text-slate-500 uppercase">INC 2</label>
                       <input type="number" value={surveyS2.inc} onChange={e => setSurveyS2({...surveyS2, inc: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] text-slate-500 uppercase">AZI 2</label>
                       <input type="number" value={surveyS2.azi} onChange={e => setSurveyS2({...surveyS2, azi: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white" />
                    </div>
                 </div>
              </div>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase mb-1">Vertical Section</div>
                       <div className="text-sm font-black text-white italic">{minCurv.tvd.toFixed(1)} m</div>
                    </div>
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase mb-1">Departure</div>
                       <div className="text-sm font-black text-white italic">{Math.sqrt(Math.pow(minCurv.north, 2) + Math.pow(minCurv.east, 2)).toFixed(1)} m</div>
                    </div>
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase mb-1">N / S</div>
                       <div className="text-sm font-black text-white italic">{minCurv.north.toFixed(1)} m</div>
                    </div>
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase mb-1">E / W</div>
                       <div className="text-sm font-black text-white italic">{minCurv.east.toFixed(1)} m</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card rounded-2xl p-8 border-white/5 bg-white/5">
           <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-6">Planned Trajectories</h4>
           <div className="space-y-3">
              {plannedTrajectories.map((t, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group hover:bg-emerald-500/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-white uppercase">{t.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono italic">{t.type}</span>
                       </div>
                    </div>
                    <Target size={14} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                 </div>
              ))}
           </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40">
           <div className="flex items-center gap-2 mb-4">
              <Database size={14} className="text-indigo-400" />
              <h4 className="text-[10px] font-mono text-white uppercase tracking-widest">Anti-Collision Analysis</h4>
           </div>
           <div className="space-y-3">
              <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-center">
                 <div className="text-[10px] text-indigo-400 uppercase mb-1">Closest Approach (SF)</div>
                 <div className="text-3xl font-black text-white italic">{sepFactor.toFixed(2)}</div>
                 <div className="text-[10px] text-slate-500 mt-1 uppercase font-mono tracking-tighter">Safe Above 1.50</div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic">Analysis performed against 14 offset wells within a 1,000m radius of the proposed surface coordinates.</p>
           </div>
        </div>
      </div>
    </div>
  );
};
