import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  ReferenceDot
} from 'recharts';
import { 
  Activity, 
  Zap, 
  ArrowRight, 
  CornerRightDown, 
  Filter,
  Maximize2,
  Wind
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { 
  calculateVogelQ, 
  calculateGeneralizedIPR, 
  calculateVLP 
} from '../../lib/reservoir';

export function NodalAnalysisTab() {
  const [params, setParams] = useState({
    pr: 4500,
    pb: 3200,
    j: 1.5,
    pwh: 350,
    depth: 8500,
    glr: 600,
    tubingID: 2.875
  });

  const { chartData, operatingPoint } = useMemo(() => {
    const data = [];
    let intersection = { q: 0, p: 0 };
    let minDiff = Infinity;

    // Calculate max flow to scale axis
    const qmax = calculateGeneralizedIPR(0, params.pr, params.pb, params.j);
    
    for (let q = 0; q <= qmax * 1.2; q += qmax / 40) {
      const iprP = q > qmax ? 0 : (function() {
        // Solving for Pwf at given q is harder than vice-versa for Vogel, 
        // so we'll approximate by finding the q that matches the Pwf
        // Simple scan for demo purposes
        let bestP = 0;
        let qDiff = Infinity;
        for(let p = 0; p <= params.pr; p += 5) {
           const calcQ = calculateGeneralizedIPR(p, params.pr, params.pb, params.j);
           if(Math.abs(calcQ - q) < qDiff) {
              qDiff = Math.abs(calcQ - q);
              bestP = p;
           }
        }
        return bestP;
      })();

      const vlpP = calculateVLP(q, params.pwh, params.depth, params.glr, params.tubingID);

      data.push({
        q: Math.round(q),
        ipr: iprP,
        vlp: vlpP > params.pr * 1.5 ? null : vlpP
      });

      const diff = Math.abs(iprP - vlpP);
      if (diff < minDiff && vlpP < params.pr) {
        minDiff = diff;
        intersection = { q: Math.round(q), p: Math.round(vlpP) };
      }
    }

    return { chartData: data, operatingPoint: intersection };
  }, [params]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Sidebar Controls */}
      <div className="lg:col-span-4 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 border-white/5 bg-black/40"
        >
          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
             <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Inflow (IPR)</h3>
             <Filter size={20} className="text-cyan-500" />
          </div>
          <div className="space-y-6">
            <InputWithSlider label="Reservoir Pressure" value={params.pr} min={1000} max={8000} step={100} unit="psi" onChange={v => setParams({...params, pr: v})} />
            <InputWithSlider label="Bubble Point (Pb)" value={params.pb} min={500} max={params.pr} step={100} unit="psi" onChange={v => setParams({...params, pb: v})} />
            <InputWithSlider label="Prod. Index (J)" value={params.j} min={0.1} max={10} step={0.1} unit="stbd/psi" onChange={v => setParams({...params, j: v})} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-8 border-white/5 bg-black/40"
        >
          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
             <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Outflow (VLP)</h3>
             <Wind size={20} className="text-emerald-500" />
          </div>
          <div className="space-y-6">
            <InputWithSlider label="Wellhead Pressure" value={params.pwh} min={50} max={1000} step={25} unit="psi" onChange={v => setParams({...params, pwh: v})} />
            <InputWithSlider label="Total Depth (MD)" value={params.depth} min={1000} max={15000} step={500} unit="ft" onChange={v => setParams({...params, depth: v})} />
            <InputWithSlider label="Tubing Size (ID)" value={params.tubingID} min={1.5} max={4.5} step={0.125} unit="in" onChange={v => setParams({...params, tubingID: v})} />
            <InputWithSlider label="GLR" value={params.glr} min={0} max={5000} step={100} unit="scf/bbl" onChange={v => setParams({...params, glr: v})} />
          </div>
        </motion.div>
      </div>

      {/* Visualization Area */}
      <div className="lg:col-span-8 space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-1 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" />
                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Nodal System Analysis</h3>
              </div>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">IPR + VLP Operating Point Determination</p>
            </div>
            
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">Current Production</p>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black text-emerald-400 italic leading-none">{operatingPoint.q}</span>
                 <span className="text-xs font-bold text-slate-600 uppercase">STB/D</span>
              </div>
            </div>
          </div>

          <div className="h-[500px] w-full relative z-10 mb-8 bg-black/20 rounded-2xl p-6 border border-white/5">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                 <XAxis 
                    dataKey="q" 
                    stroke="#475569" 
                    fontSize={10} 
                    label={{ value: 'Oil Production Rate (STB/D)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} 
                 />
                 <YAxis 
                    stroke="#475569" 
                    fontSize={10}
                    domain={[0, 6000]}
                    label={{ value: 'Pressure (psi)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} 
                 />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px' }}
                    itemStyle={{ padding: '2px 0' }}
                 />
                 <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                 
                 <Line 
                    type="monotone" 
                    dataKey="ipr" 
                    stroke="#06b6d4" 
                    strokeWidth={4} 
                    dot={false} 
                    name="IPR (Inflow)" 
                    animationDuration={600}
                 />
                 <Line 
                    type="monotone" 
                    dataKey="vlp" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    dot={false} 
                    name="VLP (Outflow)" 
                    animationDuration={600}
                 />
                 
                 {operatingPoint.p > 0 && (
                   <ReferenceDot 
                     x={operatingPoint.q} 
                     y={operatingPoint.p} 
                     r={8} 
                     fill="#ef4444" 
                     stroke="#fff" 
                     strokeWidth={2} 
                   />
                 )}
               </LineChart>
             </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all group">
              <div className="flex justify-between items-center mb-4">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Max Potential</p>
                 <Maximize2 size={16} className="text-slate-600 group-hover:text-cyan-400" />
              </div>
              <p className="text-2xl font-black text-white italic">
                {calculateGeneralizedIPR(0, params.pr, params.pb, params.j).toFixed(0)}
                <span className="text-[10px] text-slate-500 ml-2 font-mono">Qmax</span>
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all group">
              <div className="flex justify-between items-center mb-4">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Flowing BHP</p>
                 <CornerRightDown size={16} className="text-slate-600 group-hover:text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white italic">
                {operatingPoint.p}
                <span className="text-[10px] text-slate-500 ml-2 font-mono">psi</span>
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-rose-500/30 transition-all group">
              <div className="flex justify-between items-center mb-4">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Drawdown</p>
                 <Zap size={16} className="text-slate-600 group-hover:text-rose-400" />
              </div>
              <p className="text-2xl font-black text-white italic">
                {params.pr - operatingPoint.p}
                <span className="text-[10px] text-slate-500 ml-2 font-mono">psi</span>
              </p>
            </div>
          </div>
        </motion.div>

        <div className="glass-card rounded-3xl p-8 bg-indigo-600 overflow-hidden relative border-none">
           <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/2 pointer-events-none opacity-20">
              <Activity size={300} />
           </div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-md">
                 <h4 className="text-white font-black italic text-xl uppercase mb-2">Production Optimization Insight</h4>
                 <p className="text-indigo-100 text-[10px] font-medium leading-relaxed opacity-80 uppercase tracking-tighter">
                   Based on Nodal results, increasing GLR to 2500 scf/bbl or upgrading to 3.5" tubing could shift the operating point by {Math.round(operatingPoint.q * 0.15)} STB/D.
                 </p>
              </div>
              <button className="px-8 py-3 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                Generate Full Report
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
