import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Drill, Gauge, Layers, Box, Activity, Target, Zap, RefreshCcw, ChevronDown,
  Plus, Trash2, MoveVertical, ShieldCheck, Download, Hammer, Triangle, Hexagon, Cpu
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  BHAComponent, BHA_LIBRARY, BIT_DATABASE_V2,
  calculateBHAMechanics, calculateBitHydraulicsV2, recommendBitForSectionV2,
  layoutBHA, analyzeStabilizerPlacement, calculateDullGradeV2,
  PRESET_BHA_DESIGNS
} from '../../lib/bha_engineering';
import { InputWithSlider } from '../SharedUI';

const COMPONENT_COLORS: Record<string, string> = {
  bit: '#f59e0b', bitSub: '#d97706', nearBitStab: '#06b6d4', stringStab: '#0891b2',
  mwd: '#8b5cf6', lwd: '#7c3aed', pdmMotor: '#ec4899', rss: '#f43f5e',
  shockSub: '#10b981', dc: '#64748b', nmdc: '#6366f1', hwdp: '#84cc16',
  jar: '#ef4444', circulationSub: '#14b8a6', reamer: '#f97316', crossover: '#78716c', drillPipe: '#94a3b8',
};

const COMPONENT_ICONS: Record<string, any> = {
  bit: Drill, bitSub: Box, nearBitStab: Hexagon, stringStab: Hexagon,
  mwd: Cpu, lwd: Activity, pdmMotor: Gauge, rss: Target, shockSub: Zap,
  dc: Box, nmdc: ShieldCheck, hwdp: Layers, jar: Hammer,
  circulationSub: RefreshCcw, reamer: Triangle, crossover: MoveVertical, drillPipe: Box,
};

interface BHATabProps {
  hydraulicsInp: any; setHydraulicsInp: (v: any) => void;
  mudInp: any; bitInp: any; setBitInp: (v: any) => void;
}

export const BHATab: React.FC<BHATabProps> = ({ hydraulicsInp, setHydraulicsInp, mudInp, bitInp, setBitInp }) => {
  const [activeView, setActiveView] = useState<'designer' | 'bitselect' | 'hydraulics' | 'mechanics' | 'presets' | 'wear'>('designer');
  const [bhaComponents, setBHAComponents] = useState<string[]>(() => [...PRESET_BHA_DESIGNS.intermediate.recommendedComponents]);
  const [holeSection, setHoleSection] = useState<'surface' | 'intermediate' | 'production'>('intermediate');
  const [formationType, setFormationType] = useState('Shale');
  const [isDirectional, setIsDirectional] = useState(false);
  const [depthFt, setDepthFt] = useState(8000);
  const [wobKlb, setWobKlb] = useState(25);
  const [rpm, setRpm] = useState(120);
  const [bitFootage, setBitFootage] = useState(2500);
  const [bitHours, setBitHours] = useState(120);

  const activeComponents = useMemo(() => bhaComponents.map(id => BHA_LIBRARY.find(c => c.id === id)).filter(Boolean) as BHAComponent[], [bhaComponents]);
  const holeSize = useMemo(() => (PRESET_BHA_DESIGNS as any)[holeSection]?.holeSize ?? 12.25, [holeSection]);
  const mechanics = useMemo(() => calculateBHAMechanics(activeComponents, wobKlb, rpm, holeSize, mudInp.currentMW), [activeComponents, wobKlb, rpm, holeSize, mudInp.currentMW]);
  const layout = useMemo(() => layoutBHA(activeComponents), [activeComponents]);
  const stabAnalysis = useMemo(() => analyzeStabilizerPlacement(activeComponents, holeSize), [activeComponents, holeSize]);
  const bitRec = useMemo(() => recommendBitForSectionV2(holeSize, formationType, depthFt, isDirectional), [holeSize, formationType, depthFt, isDirectional]);
  const bitHyd = useMemo(() => calculateBitHydraulicsV2(mudInp.currentMW, hydraulicsInp.pumpRate, hydraulicsInp.nozzleSizes, holeSize), [mudInp.currentMW, hydraulicsInp.pumpRate, hydraulicsInp.nozzleSizes, holeSize]);
  const dullGrade = useMemo(() => calculateDullGradeV2(bitRec.primary.type, bitFootage, bitHours, bitRec.primary.formationHardness), [bitRec, bitFootage, bitHours]);
  const bhaCost = useMemo(() => activeComponents.reduce((s, c) => s + (c.cost ?? 0), 0), [activeComponents]);

  const addComponent = useCallback((id: string) => setBHAComponents(p => [...p, id]), []);
  const removeComponent = useCallback((idx: number) => setBHAComponents(p => p.filter((_, i) => i !== idx)), []);
  const moveComponent = useCallback((idx: number, dir: 'up' | 'down') => { setBHAComponents(p => { const n = [...p]; const t = dir === 'up' ? idx-1 : idx+1; if (t<0 || t>=n.length) return p; [n[idx], n[t]] = [n[t], n[idx]]; return n; }); }, []);
  const applyPreset = useCallback((pk: string) => { const pr = (PRESET_BHA_DESIGNS as any)[pk]; if (pr) { setBHAComponents([...pr.recommendedComponents]); setHoleSection(pr.section); } }, []);

  const availableComponents = useMemo(() => BHA_LIBRARY.filter(c => c.od <= holeSize + 0.5), [holeSize]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-4"><Hammer className="text-cyan-500" size={36} />BHA <span className="text-cyan-500/50">&amp; Bit Design Terminal</span></h2>
          <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-widest italic">Bottom Hole Assembly &amp; Bit Optimization Engine</p>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit backdrop-blur-md flex-wrap gap-1">
          {[
            { id: 'designer', name: 'BHA Designer', icon: Layers },
            { id: 'bitselect', name: 'Bit Selection', icon: Drill },
            { id: 'hydraulics', name: 'Bit Hydraulics', icon: Zap },
            { id: 'mechanics', name: 'BHA Mechanics', icon: Activity },
            { id: 'presets', name: 'Presets', icon: Download },
            { id: 'wear', name: 'Wear Analysis', icon: ShieldCheck },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveView(t.id as any)}
              className={cn("px-4 py-2 rounded-[14px] flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest", activeView === t.id ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-white hover:bg-white/5")}>
              <t.icon size={14} />{t.name}
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait"><motion.div key={activeView} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
        {activeView === 'designer' && <BHA_DesignerView {...{holeSection,setHoleSection,availableComponents,addComponent,activeComponents,bhaComponents,layout,removeComponent,moveComponent,mechanics,bhaCost,stabAnalysis,applyPreset,holeSize}} />}
        {activeView === 'bitselect' && <BHA_BitSelectView {...{holeSection,setHoleSection,formationType,setFormationType,isDirectional,setIsDirectional,depthFt,setDepthFt,bitRec,holeSize}} />}
        {activeView === 'hydraulics' && <BHA_HydraulicsView {...{hydraulicsInp,setHydraulicsInp,holeSize,bitHyd}} />}
        {activeView === 'mechanics' && <BHA_MechanicsView {...{wobKlb,setWobKlb,rpm,setRpm,mechanics}} />}
        {activeView === 'presets' && <BHA_PresetsView {...{applyPreset}} />}
        {activeView === 'wear' && <BHA_WearView {...{bitFootage,setBitFootage,bitHours,setBitHours,bitRec,dullGrade}} />}
      </motion.div></AnimatePresence>
    </div>
  );
};

// ─── Sub-views ────────────────────────────────────────────────────────

function BHA_DesignerView(p: any) {
  const { holeSection, setHoleSection, availableComponents, addComponent, activeComponents, bhaComponents, layout, removeComponent, moveComponent, mechanics, bhaCost, stabAnalysis, applyPreset, holeSize } = p;
  return (<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <div className="lg:col-span-4 glass-card rounded-2xl p-6 border-white/5 bg-black/40 max-h-[700px] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-6"><h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest italic">Component Library</h4><select value={holeSection} onChange={e => setHoleSection(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-[11px] text-white font-bold uppercase outline-none"><option value="surface">Surface (17.5in)</option><option value="intermediate">Int. (12.25in)</option><option value="production">Prod. (8.5in)</option></select></div>
      <div className="space-y-2">{availableComponents.map((c: BHAComponent) => (<button key={c.id} onClick={() => addComponent(c.id)} className="w-full p-3 rounded-xl border border-white/5 bg-white/5 hover:border-cyan-500/30 hover:bg-white/10 transition-all group text-left flex items-start gap-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: COMPONENT_COLORS[c.type] + '20', color: COMPONENT_COLORS[c.type] }}>{React.createElement(COMPONENT_ICONS[c.type] || Box, { size: 14 })}</div><div className="min-w-0 flex-1"><p className="text-[10px] font-black text-white uppercase group-hover:text-cyan-400 transition-colors truncate">{c.name}</p><p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{c.type} | {c.od}" OD | {c.weight}lb/ft</p></div><Plus size={12} className="text-slate-600 group-hover:text-cyan-400 shrink-0 mt-1 transition-colors" /></button>))}</div>
    </div>
    <div className="lg:col-span-5 glass-card rounded-2xl p-6 border-white/5 bg-[#05070a] overflow-hidden relative min-h-[700px]">
      <div className="flex items-center justify-between mb-6"><h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">BHA Assembly ({bhaComponents.length})</h4><span className="text-[11px] text-cyan-400 font-mono font-bold">Total: ${bhaCost.toLocaleString()}</span></div>
      <div className="flex flex-col items-center gap-0.5 overflow-y-auto max-h-[600px] custom-scrollbar px-4">
        <div className="w-full flex items-center justify-center py-2 border border-dashed border-white/10 rounded-lg mb-1"><span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Drill Pipe (5in S-135)</span></div>
        {activeComponents.slice().reverse().map((c: BHAComponent, revIdx: number) => { const idx = activeComponents.length - 1 - revIdx; const color = COMPONENT_COLORS[c.type] || '#475569'; const Icon = COMPONENT_ICONS[c.type] || Box; const slen = layout.find((l: any) => l.component.id === c.id)?.scaledLength ?? 5; return (<div key={`${c.id}-${idx}`} className="w-full flex items-center gap-2 group relative"><div className="flex flex-col items-center gap-1 shrink-0 w-10"><button onClick={() => moveComponent(idx, 'down')} disabled={idx >= activeComponents.length - 1} className="text-slate-600 hover:text-white disabled:opacity-20 transition-colors"><ChevronDown size={10} /></button><span className="text-[10px] text-slate-600 font-mono">{idx + 1}</span><button onClick={() => moveComponent(idx, 'up')} disabled={idx === 0} className="text-slate-600 hover:text-white disabled:opacity-20 transition-colors"><ChevronDown size={10} className="rotate-180" /></button></div><motion.div layout className="flex-1 rounded-xl border flex items-center gap-3 px-4 cursor-pointer hover:border-white/20 transition-all relative overflow-hidden" style={{ borderColor: color + '40', backgroundColor: color + '10', minHeight: Math.max(28, slen * 0.8) }}><div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: color + '30', color }}><Icon size={12} /></div><div className="min-w-0 flex-1"><p className="text-[10px] font-black text-white uppercase truncate">{c.name}</p><p className="text-[10px] text-slate-500 font-bold uppercase">{c.od}" OD | {c.length}ft | {c.weight}lb/ft</p></div><button onClick={(e) => { e.stopPropagation(); removeComponent(idx); }} className="text-slate-600 hover:text-rose-400 transition-colors shrink-0 p-1"><Trash2 size={12} /></button></motion.div></div>); })}
        <div className="w-full flex items-center justify-center py-3 mt-1 rounded-lg" style={{ backgroundColor: COMPONENT_COLORS.bit + '15', borderColor: COMPONENT_COLORS.bit + '40' }}><div className="flex items-center gap-2"><Drill size={16} style={{ color: COMPONENT_COLORS.bit }} /><span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Bit ({holeSize}")</span></div></div>
        {activeComponents.length === 0 && <div className="text-center py-20"><Box size={40} className="text-slate-700 mx-auto mb-4" /><p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Add components from the library</p></div>}
      </div>
    </div>
    <div className="lg:col-span-3 space-y-4">
      <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40"><h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 italic">Quick Summary</h4><div className="space-y-3"><InfoRow label="Components" value={String(activeComponents.length)} /><InfoRow label="Total Length" value={`${activeComponents.reduce((s:number,c:any)=>s+c.length,0)}ft`} /><InfoRow label="Buoyed Weight" value={`${mechanics.totalBHAWeight_lbf.toLocaleString()}lb`} /><InfoRow label="BHA Cost" value={`$${bhaCost.toLocaleString()}`} /><InfoRow label="Stabilizers" value={`${stabAnalysis.stiffnessRatio}x`} /></div></div>
      <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40"><h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4 italic">Stabilizer Analysis</h4><div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl"><p className="text-[11px] text-slate-400 italic">{stabAnalysis.recommendation}</p></div><div className="mt-3 flex justify-between text-[10px]"><span className="text-slate-500">Bending -{stabAnalysis.bendingMomentReduction_pct}%</span><span className="text-cyan-400 font-bold">{stabAnalysis.stiffnessRatio}x</span></div></div>
      <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40"><h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3 italic">Quick Preset</h4><div className="space-y-2">{Object.entries(PRESET_BHA_DESIGNS).map(([k,v]:any)=>(<button key={k} onClick={()=>applyPreset(k)} className="w-full p-2 rounded-lg border border-white/5 bg-white/5 text-left hover:border-amber-500/30 transition-all group"><p className="text-[11px] font-black text-white group-hover:text-amber-400">{v.name}</p><p className="text-[10px] text-slate-500">{v.recommendedComponents.length} comps | {v.holeSize}"</p></button>))}</div></div>
    </div>
  </div>);
}

function BHA_BitSelectView(p: any) {
  const { holeSection, setHoleSection, formationType, setFormationType, isDirectional, setIsDirectional, depthFt, setDepthFt, bitRec, holeSize } = p;
  return (<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <div className="lg:col-span-4 space-y-4">
      <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40"><h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-6 italic">Selection Criteria</h4><div className="space-y-5"><div><label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Hole Section</label><select value={holeSection} onChange={e => setHoleSection(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white font-bold outline-none"><option value="surface">Surface (17.5in)</option><option value="intermediate">Intermediate (12.25in)</option><option value="production">Production (8.5in)</option></select></div><div><label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Formation Type</label><select value={formationType} onChange={e => setFormationType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white font-bold outline-none">{['Shale','Sandstone','Limestone','Dolomite','Quartzite','Chert','Granite','Mixed'].map((f:string)=><option key={f} value={f}>{f}</option>)}</select></div><div className="flex items-center justify-between"><span className="text-[11px] text-slate-500 uppercase font-bold">Directional</span><button onClick={()=>setIsDirectional(!isDirectional)} className={cn("px-3 py-1 rounded-lg text-[11px] font-bold transition-all",isDirectional?"bg-cyan-600 text-white":"bg-white/5 text-slate-500")}>{isDirectional?'YES':'NO'}</button></div><InputWithSlider label="Depth" value={depthFt} min={500} max={25000} step={500} unit="ft" onChange={setDepthFt} /></div></div>
      <div className="glass-card rounded-2xl p-6 border border-amber-500/20 bg-amber-500/5"><h4 className="text-[11px] font-black text-amber-400 uppercase tracking-widest mb-3 italic">Recommendation</h4><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><Drill size={18} className="text-amber-400" /></div><div><p className="text-[11px] font-black text-white">{bitRec.primary.name}</p><p className="text-[10px] text-amber-400 uppercase font-bold">{bitRec.primary.iadcCode} - {bitRec.primary.type}</p></div></div><p className="text-[10px] text-slate-400 italic">{bitRec.primary.description}</p></div>
    </div>
    <div className="lg:col-span-8"><div className="glass-card rounded-2xl p-8 border-white/5 bg-[#05070a] min-h-[550px]"><div className="flex justify-between items-center mb-8"><h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest italic">Bit Database</h4><span className="text-[11px] text-slate-500 font-mono">{BIT_DATABASE_V2.length} bits</span></div><div className="overflow-x-auto custom-scrollbar"><table className="w-full text-left border-collapse"><thead><tr className="border-b border-white/10"><th className="pb-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">Name</th><th className="pb-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">IADC</th><th className="pb-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">Formations</th><th className="pb-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">WOB</th><th className="pb-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">Cost</th><th className="pb-3 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Fit</th></tr></thead><tbody>{BIT_DATABASE_V2.filter((b:any)=>holeSize>=b.sizeRange[0]&&holeSize<=b.sizeRange[1]).map((bit:any,i:number)=>{const isRec=bit.name===bitRec.primary.name;return(<tr key={i} className={cn("border-b border-white/5 hover:bg-white/5 transition-colors",isRec&&"bg-amber-500/5")}><td className="py-4 text-[10px] font-black text-white uppercase">{bit.name}{isRec&&<span className="ml-2 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded-full font-bold uppercase">BEST</span>}</td><td className="py-4 text-[11px] text-cyan-400 font-mono font-bold">{bit.iadcCode}</td><td className="py-4 text-[11px] text-slate-400">{bit.recommendedFormations.slice(0,2).join(', ')}</td><td className="py-4 text-[11px] text-slate-400">{bit.maxWob_klb}klb</td><td className="py-4 text-[11px] text-slate-400">${bit.cost.toLocaleString()}</td><td className="py-4 text-right">{isRec?<Target size={14} className="text-amber-400 inline" />:<span className="text-[10px] text-slate-600">{bit.durability}</span>}</td></tr>);})}</tbody></table></div></div></div>
  </div>);
}

function BHA_HydraulicsView(p: any) {
  const { hydraulicsInp, setHydraulicsInp, holeSize, bitHyd } = p;
  return (<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <div className="lg:col-span-4 space-y-4"><div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40"><h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-6 italic">Hydraulic Parameters</h4><div className="space-y-5"><InputWithSlider label="Flow Rate" value={hydraulicsInp.pumpRate} min={100} max={1200} step={10} unit="GPM" onChange={(v:number)=>setHydraulicsInp({...hydraulicsInp,pumpRate:v})} /><div><label className="text-[10px] text-slate-500 uppercase font-bold block mb-2">Nozzle Sizes (1/32in)</label><div className="grid grid-cols-3 gap-2">{hydraulicsInp.nozzleSizes.map((n:number,i:number)=>(<input key={i} type="number" value={n} onChange={e=>{const ns=[...hydraulicsInp.nozzleSizes];ns[i]=Number(e.target.value);setHydraulicsInp({...hydraulicsInp,nozzleSizes:ns});}} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white font-bold text-center outline-none" />))}</div></div><InputWithSlider label="Bit Diameter" value={holeSize} min={4.5} max={26} step={0.125} unit="in" onChange={()=>{}} disabled /></div></div></div>
    <div className="lg:col-span-8"><div className="glass-card rounded-2xl p-8 border-white/5 bg-[#05070a] min-h-[550px]"><h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-8 italic">Bit Hydraulics Output</h4><div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10"><HydCard label="TFA" value={bitHyd.tfa_sqin.toFixed(3)} unit="sq in" /><HydCard label="Jet Velocity" value={String(bitHyd.jetVelocity_ftPerSec)} unit="ft/sec" /><HydCard label="HHP at Bit" value={String(bitHyd.hhp)} unit="hp" /><HydCard label="HSI" value={bitHyd.hsi.toFixed(1)} unit="hhp/sq in" /></div><div className="grid grid-cols-2 md:grid-cols-4 gap-6"><HydCard label="Impact Force" value={bitHyd.impactForce_lbf.toLocaleString()} unit="lbf" /><HydCard label="Annular Vel." value={String(bitHyd.annularVelocity_fpm)} unit="ft/min" /><HydCard label="Re Number" value={bitHyd.bitReynoldsNumber.toLocaleString()} unit="" /><HydCard label="Pressure Loss" value={String(bitHyd.bitPressureLoss_psi)} unit="psi" /></div><div className="mt-12 p-6 glass-card rounded-[24px] border-white/5 bg-black/40"><div className="flex justify-between items-center mb-4"><span className="text-[11px] text-slate-500 uppercase font-bold">HSI Optimization Gauge</span><span className={cn("text-[10px] font-bold uppercase",bitHyd.hsi>=2.0?"text-emerald-400":bitHyd.hsi>=1.0?"text-amber-400":"text-rose-400")}>{bitHyd.hsi>=2.0?'Optimal':bitHyd.hsi>=1.0?'Adequate':'Insufficient'}</span></div><div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10"><motion.div initial={{width:0}} animate={{width:`${Math.min(100,(bitHyd.hsi/3)*100)}%`}} className={cn("h-full rounded-full",bitHyd.hsi>=2.0?"bg-emerald-500":bitHyd.hsi>=1.0?"bg-amber-500":"bg-rose-500")} /></div><div className="flex justify-between text-[10px] text-slate-600 mt-2"><span>0</span><span>1.0</span><span>2.0 (Target)</span><span>3.0+</span></div></div></div></div>
  </div>);
}

function BHA_MechanicsView(p: any) {
  const { wobKlb, setWobKlb, rpm, setRpm, mechanics } = p;
  return (<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <div className="lg:col-span-4 space-y-4"><div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40"><h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-6 italic">Operating Parameters</h4><div className="space-y-5"><InputWithSlider label="Weight on Bit" value={wobKlb} min={1} max={80} step={1} unit="klb" onChange={setWobKlb} /><InputWithSlider label="Rotary RPM" value={rpm} min={20} max={500} step={5} unit="rpm" onChange={setRpm} /></div></div><div className="p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl"><h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest mb-2 italic">Von Mises Stress</h4><p className="text-3xl font-black text-white">{mechanics.vonMisesStress_psi.toLocaleString()} <span className="text-xs text-slate-500">psi</span></p></div></div>
    <div className="lg:col-span-8"><div className="glass-card rounded-2xl p-8 border-white/5 bg-[#05070a] min-h-[550px]"><h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-8 italic">BHA Mechanics Analysis</h4><div className="grid grid-cols-2 gap-6"><MechCard label="Neutral Point" value={`${mechanics.neutralPoint_ft}ft`} sub="From Bit" warn={mechanics.neutralPoint_ft<50?'Close to bit - add DC weight':'Satisfactory'} warnOk={mechanics.neutralPoint_ft>=50} /><MechCard label="Critical RPM" value={`${mechanics.criticalRotarySpeed_rpm}rpm`} sub="Resonance" warn={rpm>mechanics.criticalRotarySpeed_rpm*0.8?'WARNING: Near critical':'Operating OK'} warnOk={rpm<=mechanics.criticalRotarySpeed_rpm*0.8} /><MechCard label="Max Bending Stress" value={`${mechanics.maxBendingStress_psi.toLocaleString()}psi`} sub="At stabilizer" warn={mechanics.maxBendingStress_psi>50000?'High - add stabilizer':'Acceptable'} warnOk={mechanics.maxBendingStress_psi<=50000} /><MechCard label="WOB Transfer" value={`${mechanics.wobTransferEfficiency_pct}%`} sub="Efficiency" warn={mechanics.wobTransferEfficiency_pct<70?'Low':'Good'} warnOk={mechanics.wobTransferEfficiency_pct>=70} /><MechCard label="EI Stiffness" value={`${(mechanics.stringStiffness_EI/1e6).toFixed(0)}M lb-in2`} sub="Rigidity" warn="" warnOk={true} /><MechCard label="Lateral Disp." value={`${mechanics.lateralDisplacement_in}in`} sub="Mid-span" warn="" warnOk={true} /></div></div></div>
  </div>);
}

function BHA_PresetsView(p: any) {
  const { applyPreset } = p;
  return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Object.entries(PRESET_BHA_DESIGNS).map(([k,preset]:any)=>{const comps=preset.recommendedComponents.map((id:string)=>BHA_LIBRARY.find(c=>c.id===id)).filter(Boolean);const cost=comps.reduce((s:number,c:any)=>s+(c.cost??0),0);const len=comps.reduce((s:number,c:any)=>s+c.length,0);return(<motion.div key={k} whileHover={{scale:1.02}} className="glass-card rounded-2xl p-6 border-white/5 bg-black/40 cursor-pointer hover:border-cyan-500/30 transition-all" onClick={()=>applyPreset(k)}><div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center"><Layers size={18} className="text-cyan-400" /></div><div><p className="text-[11px] font-black text-white">{preset.name}</p><p className="text-[10px] text-slate-500 uppercase font-bold">{preset.section} | {preset.holeSize}"</p></div></div><div className="space-y-1 mb-4">{comps.slice(0,5).map((c:any,i:number)=>(<div key={i} className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor:COMPONENT_COLORS[c.type]||'#475569'}}/><span className="text-[10px] text-slate-400 truncate">{c.name}</span></div>))}{comps.length>5&&<p className="text-[10px] text-slate-600 pl-4">+{comps.length-5} more</p>}</div><div className="flex justify-between text-[10px] border-t border-white/5 pt-3"><span className="text-slate-500">{comps.length} comps</span><span className="text-slate-500">{len}ft</span><span className="text-cyan-400 font-bold">${cost.toLocaleString()}</span></div></motion.div>);})}</div>);
}

function BHA_WearView(p: any) {
  const { bitFootage, setBitFootage, bitHours, setBitHours, bitRec, dullGrade } = p;
  return (<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <div className="lg:col-span-4 space-y-4"><div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40"><h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-6 italic">Wear Parameters</h4><div className="space-y-5"><InputWithSlider label="Footage" value={bitFootage} min={0} max={12000} step={100} unit="ft" onChange={setBitFootage} /><InputWithSlider label="Hours" value={bitHours} min={0} max={500} step={1} unit="hrs" onChange={setBitHours} /><div><label className="text-[10px] text-slate-500 uppercase font-bold">Current Bit</label><p className="text-[11px] text-white font-bold">{bitRec.primary.name}</p></div></div></div></div>
    <div className="lg:col-span-8"><div className="glass-card rounded-2xl p-8 border-white/5 bg-[#05070a] min-h-[550px]"><h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-8 italic">IADC Dull Grade Report</h4><div className="flex items-center justify-center gap-6 mb-12">{[{label:'Inner CS',value:dullGrade.innerCS},{label:'Outer CS',value:dullGrade.outerCS},{label:'Dull Char.',value:dullGrade.dullChar},{label:'Location',value:dullGrade.location},{label:'Bearing',value:dullGrade.bearingSeals},{label:'Gauge',value:dullGrade.gauge},{label:'Other',value:dullGrade.otherDull},{label:'Reason',value:dullGrade.reasonPulled}].map((item:any,i:number)=>(<div key={i} className="text-center"><div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center border-2 mb-2",typeof item.value==='number'&&item.value>4?"border-rose-500/50 bg-rose-500/10":"border-cyan-500/30 bg-cyan-500/10")}><span className="text-2xl font-black text-white">{item.value}</span></div><span className="text-[10px] text-slate-500 uppercase font-bold block">{item.label}</span></div>))}</div><div className="grid grid-cols-3 gap-6 mt-8"><WearBar label="Inner Cutters" value={dullGrade.innerCS} max={8} /><WearBar label="Outer Cutters" value={dullGrade.outerCS} max={8} /><WearBar label="Gauge" value={dullGrade.gauge} max={8} /></div></div></div>
  </div>);
}

// ─── Atom Components ────────────────────────────────────────────────────

function InfoRow({label,value}:{label:string;value:string}){return(<div className="flex justify-between items-center py-2 border-b border-white/5"><span className="text-[11px] text-slate-500 uppercase font-bold">{label}</span><span className="text-[10px] text-white font-black">{value}</span></div>);}
function HydCard({label,value,unit}:{label:string;value:string;unit:string}){return(<div className="p-5 rounded-2xl border border-white/5 bg-white/5 text-center hover:border-cyan-500/20 transition-all"><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{label}</p><p className="text-xl font-black text-white italic">{value} <span className="text-[11px] text-slate-600 not-italic">{unit}</span></p></div>);}
function MechCard({label,value,sub,warn,warnOk}:{label:string;value:string;sub:string;warn:string;warnOk:boolean}){return(<div className="p-6 rounded-2xl border border-white/5 bg-white/5 hover:border-cyan-500/20 transition-all"><p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mb-2">{label}</p><p className="text-2xl font-black text-white">{value}</p><p className="text-[10px] text-slate-600 mt-1">{sub}</p>{warn&&<p className={cn("text-[10px] font-bold mt-2 uppercase",warnOk?"text-emerald-400":"text-amber-400")}>{warn}</p>}</div>);}
function WearBar({label,value,max}:{label:string;value:number;max:number}){const pct=(value/max)*100;const color=pct>75?'bg-rose-500':pct>50?'bg-amber-500':pct>25?'bg-cyan-500':'bg-emerald-500';return(<div className="text-center"><p className="text-[10px] text-slate-500 uppercase font-bold mb-3">{label}</p><div className="h-24 w-6 mx-auto bg-white/5 rounded-full overflow-hidden border border-white/10 relative"><motion.div initial={{height:0}} animate={{height:`${pct}%`}} className={cn("absolute bottom-0 w-full rounded-full",color)}/></div><p className="text-sm font-black text-white mt-2">{value}<span className="text-[11px] text-slate-600">/{max}</span></p></div>);}
