import React from 'react';
import { motion } from 'motion/react';
import { Droplets, Info } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartTooltip, 
  Area 
} from 'recharts';
import { eatonPorePressure, eatonFractureGradient, calculateDExponent, calculateDc } from '../../lib/drilling';

interface FluidsTabProps {
  ppInp: any;
  setPpInp: (val: any) => void;
  dExpInp: any;
  setDExpInp: (val: any) => void;
  pressureProfile: any[];
}

export const FluidsTab: React.FC<FluidsTabProps> = ({ 
  ppInp, 
  setPpInp,
  dExpInp,
  setDExpInp,
  pressureProfile
}) => {
  const finalPP = eatonPorePressure(ppInp.overburden, ppInp.normalPP, ppInp.dtNormal, ppInp.dtObs);
  const finalFG = eatonFractureGradient(ppInp.overburden, finalPP, ppInp.poisson);
  const dexp = calculateDExponent(dExpInp.rop, dExpInp.rpm, dExpInp.wob, dExpInp.bitDiam);
  const dc = calculateDc(dexp, dExpInp.normalMW, dExpInp.currentMW);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-8 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex justify-between items-start mb-8">
              <div>
                 <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest mb-1">Module 2 / Phase 2</p>
                 <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">Pressure Profile & Predictors</h3>
              </div>
              <div className="bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20">
                 <Droplets className="text-indigo-400" />
              </div>
           </div>

           <div className="h-64 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={pressureProfile} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis type="number" domain={[8, 18]} hide />
                    <YAxis reversed dataKey="depth" type="number" fontSize={10} stroke="#475569" tickFormatter={(v) => `${v}ft`} />
                    <RechartTooltip 
                       contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px'}}
                       itemStyle={{color: '#fff'}}
                    />
                    <Area type="monotone" dataKey="pp" stroke="#6366f1" fill="url(#colorPP)" strokeWidth={2} name="Pore Pressure" />
                    <Area type="monotone" dataKey="fg" stroke="#f43f5e" fill="url(#colorFG)" strokeWidth={2} name="Frac Gradient" />
                    <defs>
                       <linearGradient id="colorPP" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorFG" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                 </AreaChart>
              </ResponsiveContainer>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2">Eaton's PP Predictor</h4>
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[11px] text-slate-500 uppercase">dt Normal (μs/ft)</label>
                          <input type="number" value={ppInp.dtNormal} onChange={e => setPpInp({...ppInp, dtNormal: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[11px] text-slate-500 uppercase">dt Observed (μs/ft)</label>
                          <input type="number" value={ppInp.dtObs} onChange={e => setPpInp({...ppInp, dtObs: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" />
                       </div>
                    </div>
                    <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] text-indigo-400 font-bold uppercase">Estimated Pore Pressure</span>
                          <span className="text-xl font-black text-white italic">{finalPP.toFixed(3)} PSI/FT</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2">d-exponent Analysis</h4>
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[11px] text-slate-500 uppercase">ROP (ft/hr)</label>
                          <input type="number" value={dExpInp.rop} onChange={e => setDExpInp({...dExpInp, rop: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[11px] text-slate-500 uppercase">WOB (klb)</label>
                          <input type="number" value={dExpInp.wob} onChange={e => setDExpInp({...dExpInp, wob: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" />
                       </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 uppercase">Corrected d-exp (dc)</span>
                          <span className="text-white font-mono font-bold">{dc.toFixed(2)}</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40">
           <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Fracture Gradient (Eaton)</h4>
           <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                 <label className="text-[11px] text-slate-500 uppercase">Overburden (psi/ft): {ppInp.overburden}</label>
                 <input type="range" min="0.8" max="1.1" step="0.01" value={ppInp.overburden} onChange={e => setPpInp({...ppInp, overburden: Number(e.target.value)})} className="w-full" />
              </div>
              <div className="space-y-1">
                 <label className="text-[11px] text-slate-500 uppercase">Poisson's Ratio: {ppInp.poisson}</label>
                 <input type="range" min="0.2" max="0.45" step="0.01" value={ppInp.poisson} onChange={e => setPpInp({...ppInp, poisson: Number(e.target.value)})} className="w-full" />
              </div>
              <div className="mt-4 p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center relative overflow-hidden">
                 <div className="absolute top-2 right-2 opacity-20">
                    <Droplets size={48} className="text-rose-400" />
                 </div>
                 <div className="text-[11px] text-rose-400 font-bold uppercase mb-1">Eaton Fracture Grad</div>
                 <div className="text-3xl font-black text-white italic">{finalFG.toFixed(3)}</div>
                 <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mt-1">PSI / FT</div>
              </div>
           </div>
        </div>

        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4">
           <div className="p-2 bg-indigo-500/20 rounded-xl">
              <Info className="w-4 h-4 text-indigo-400" />
           </div>
           <div>
              <h5 className="text-[10px] font-bold text-white uppercase mb-1">Physical Interpretation</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed italic uppercase tracking-tighter">dc decrease detected at 5,450ft suggests entry into transitional overpressure zone. Recommend mud weight increase of 0.2 PPG.</p>
           </div>
        </div>
      </div>
    </div>
  );
};
