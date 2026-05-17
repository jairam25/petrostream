import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  Droplets,
  Zap, 
  Database, 
  Settings2,
  Waves,
  Activity,
  Maximize2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { 
  calculateFetkovichInflux,
  calculateCarterTracyInflux
} from '../../lib/reservoir';

export function AquiferModelingTab() {
  const [pi, setPi] = useState(4500); // Initial pressure PSI
  const [wei, setWei] = useState(100); // Initial aquifer volume MM STB
  const [aqJ, setAqJ] = useState(10); // Productivity index bbl/d/psi
  const [model, setModel] = useState<'fetkovich' | 'carter-tracy'>('fetkovich');
  
  // Aquifer Props (for Carter-Tracy)
  const [phi, setPhi] = useState(0.2);
  const [rw, setRw] = useState(10000); // Radius reservoir ft
  const [h, setH] = useState(100); // Thickness ft
  const [ct, setCt] = useState(10e-6); // Total compressibility
  const [k, setK] = useState(50); // Permeability md
  const [mu, setMu] = useState(0.5); // Water viscosity cp

  // Pressure history (Simulated reservoir pressure decline)
  const [history] = useState([
    { t: 0, p: 4500 }, { t: 30, p: 4450 }, { t: 60, p: 4410 }, { t: 90, p: 4360 },
    { t: 120, p: 4320 }, { t: 150, p: 4280 }, { t: 180, p: 4250 }, { t: 210, p: 4220 },
    { t: 240, p: 4190 }, { t: 270, p: 4170 }, { t: 300, p: 4150 }, { t: 330, p: 4130 }
  ]);

  const results = useMemo(() => {
    let we = 0;
    const data = [];
    
    for (let i = 0; i < history.length; i++) {
      const step = history[i];
      const p_prev = i === 0 ? pi : history[i-1].p;
      
      if (model === 'fetkovich') {
        we = calculateFetkovichInflux(pi, p_prev, step.p, wei * 1e6, aqJ, 30, we);
      } else {
        // Simple radial aquifer approx
        const dp = pi - step.p;
        we = calculateCarterTracyInflux(step.t, 30, dp, phi, rw, h, ct, k, mu, 360, we);
      }
      
      data.push({
        t: step.t,
        p: step.p,
        we: we / 1e6, // MM STB
      });
    }

    return data;
  }, [pi, wei, aqJ, model, phi, rw, h, ct, k, mu, history]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Sidebar Controls */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Aquifer Type</h4>
           </div>
           
           <div className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-8">
              <button 
                onClick={() => setModel('fetkovich')}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl text-[11px] font-black uppercase transition-all tracking-widest",
                  model === 'fetkovich' ? "bg-cyan-500 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                )}
              >Fetkovich (PSS)</button>
              <button 
                onClick={() => setModel('carter-tracy')}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl text-[11px] font-black uppercase transition-all tracking-widest",
                  model === 'carter-tracy' ? "bg-cyan-500 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                )}
              >Carter-Tracy (Unsteady)</button>
           </div>
           
           <div className="space-y-8">
              {model === 'fetkovich' ? (
                <>
                  <InputWithSlider label="Init Pressure" value={pi} min={1000} max={10000} step={100} unit="psi" onChange={setPi} />
                  <InputWithSlider label="Aquifer Vol (Wei)" value={wei} min={50} max={1000} step={10} unit="MM STB" onChange={setWei} />
                  <InputWithSlider label="Productivity (J)" value={aqJ} min={0.1} max={50} step={0.5} unit="bbl/d/psi" onChange={setAqJ} />
                </>
              ) : (
                <>
                  <InputWithSlider label="Permeability (kw)" value={k} min={1} max={500} step={1} unit="md" onChange={setK} />
                  <InputWithSlider label="Viscosity (muw)" value={mu} min={0.2} max={2} step={0.05} unit="cp" onChange={setMu} />
                  <InputWithSlider label="Thickness (h)" value={h} min={10} max={500} step={1} unit="ft" onChange={setH} />
                  <InputWithSlider label="Res. Radius (rw)" value={rw} min={1000} max={20000} step={100} unit="ft" onChange={setRw} />
                  <InputWithSlider label="Compressibility" value={ct * 1e6} min={1} max={50} step={1} unit="e-6 psi-1" onChange={(v) => setCt(v/1e6)} />
                </>
              )}
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-indigo-900/40 to-black border-white/5">
           <div className="flex justify-between items-center mb-6">
              <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Current Influx</p>
              <Waves size={16} className="text-cyan-500" />
           </div>
           <div className="space-y-2">
              <p className="text-4xl font-black text-white italic tracking-tighter">
                {results[results.length - 1].we.toFixed(2)}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">MM STB Cum. Water Influx (We)</p>
           </div>
        </div>
      </div>

      {/* Main Plot Area */}
      <div className="lg:col-span-8 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden"
        >
           <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={results} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorWe" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                    <XAxis dataKey="t" stroke="#475569" fontSize={10} label={{ value: 'Time (Days)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                    <YAxis yAxisId="left" stroke="#475569" fontSize={10} label={{ value: 'Pressure (PSI)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10, fontWeight: 700 }} domain={['auto', 'auto']} />
                    <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={10} label={{ value: 'Influx We (MM STB)', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }} />
                    <Line yAxisId="left" name="Reservoir Pressure" type="monotone" dataKey="p" stroke="#f43f5e" strokeWidth={3} dot={true} />
                    <Area yAxisId="right" name="Water Influx (We)" type="monotone" dataKey="we" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorWe)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </motion.div>

        {/* Reference Module */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-8">
                 <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500">
                   <Activity size={20} />
                 </div>
                 <h4 className="text-xs font-black text-white italic uppercase tracking-widest">Van Everdingen-Hurst</h4>
              </div>
              <p className="text-[10px] text-slate-400 italic mb-6">
                The exact solution for unsteady state water influx from a radial aquifer. Uses dimensionless time (tD) and pressure (PD) tables.
              </p>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[11px] font-mono border-b border-white/5 pb-2">
                    <span className="text-slate-500">RADIUS RATIO (ra/re)</span>
                    <span className="text-white">5.0</span>
                 </div>
                 <div className="flex justify-between items-center text-[11px] font-mono border-b border-white/5 pb-2">
                    <span className="text-slate-500">GEOMETRY</span>
                    <span className="text-white">RADIAL INFINITE</span>
                 </div>
              </div>
           </div>

           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-8">
                 <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                   <Droplets size={20} />
                 </div>
                 <h4 className="text-xs font-black text-white italic uppercase tracking-widest">Material Balance Link</h4>
              </div>
              <p className="text-[10px] text-slate-400 italic mb-6">
                This water influx (We) is a core component of the MBE: 
                F = N(Eo + mEg + Efw) + We
              </p>
              <button 
                className="w-full py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all"
              >
                Sync with Material Balance
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
