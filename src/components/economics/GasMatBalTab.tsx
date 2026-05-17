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
  ScatterChart,
  Scatter,
  ReferenceLine,
  ZAxis
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Settings2, 
  RefreshCcw,
  Zap,
  Activity,
  Box,
  AreaChart
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { linearRegression } from '../../lib/reservoir';

interface PzData {
  gp: number;
  p: number;
  z: number;
  pz: number;
}

export function GasMatBalTab() {
  const [activeTab, setActiveTab] = useState<'pz' | 'campbell' | 'havlena'>('pz');
  
  // Input Data for p/Z
  const [inputDataString, setInputDataString] = useState(
    "0, 4500, 0.95\n5.2, 4200, 0.92\n12.5, 3800, 0.89\n22.1, 3300, 0.86\n31.8, 2800, 0.84"
  );
  
  const [compVal, setCompVal] = useState(3e-6); // Rock compressibility

  const pzResults = useMemo(() => {
    const lines = inputDataString.split('\n').filter(l => l.trim());
    const data: PzData[] = lines.map(line => {
      const [gp, p, z] = line.split(',').map(v => parseFloat(v.trim()));
      return { gp, p, z, pz: p / z };
    }).filter(d => !isNaN(d.gp) && !isNaN(d.pz));

    if (data.length < 2) return { data, ogip: 0, r2: 0, regressionLine: [] };

    // Linear Regression p/Z vs Gp
    const x = data.map(d => d.gp);
    const y = data.map(d => d.pz);
    const { slope, intercept, r2 } = linearRegression(x, y);

    // OGIP is x-intercept: p/Z = 0 => Gp = -intercept / slope
    const ogip = -intercept / slope;

    // Build line for chart
    const regressionLine = [
        { gp: 0, pz: intercept },
        { gp: ogip, pz: 0 }
    ];

    return { data, ogip, r2, regressionLine };
  }, [inputDataString]);

  // Campbell Plot Data (F/Et vs F)
  // Simplified for demo: assume volumetric for base
  const campbellData = useMemo(() => {
    return pzResults.data.map(d => ({
        f: d.gp,
        et: d.pz,
        ratio: d.pz / d.gp // Very simplified diagnostic
    })).filter(d => d.f > 0);
  }, [pzResults]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Parameters Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Analysis Inputs</h4>
           </div>
           
           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Gas Production Data</label>
                <p className="text-[10px] text-slate-600 mb-2 italic">Format: Gp (BCF), Pressure (PSI), Z-factor</p>
                <textarea 
                  value={inputDataString}
                  onChange={(e) => setInputDataString(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[10px] text-white font-mono h-40 focus:ring-1 focus:ring-cyan-500 outline-none"
                />
              </div>

              <InputWithSlider 
                label="Rock Compressibility (cr)" 
                value={compVal * 1e6} min={1} max={10} step={0.1} unit="x10^-6" 
                onChange={(v) => setCompVal(v/1e6)} 
              />
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-blue-900/40 to-black border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <BarChart3 size={18} className="text-blue-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Diagnostic Tools</h5>
           </div>
           <div className="flex flex-col gap-2">
              {[
                { id: 'pz', label: 'p/Z vs Gp' },
                { id: 'campbell', label: 'Campbell Plot' },
                { id: 'havlena', label: 'Havlena-Odeh' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={cn(
                    "w-full py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all text-left px-6",
                    activeTab === t.id ? "bg-white text-black" : "bg-white/5 text-slate-500 hover:text-white"
                  )}
                >
                  {t.label}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Main Analysis Area */}
      <div className="lg:col-span-9 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <MetricBox label="Estimated OGIP" value={`${pzResults.ogip.toFixed(1)} BCF`} icon={<Target className="text-cyan-500" />} />
           <MetricBox label="Intercept (Pi/Zi)" value={pzResults.regressionLine[0]?.pz.toFixed(0) || "0"} icon={<Activity className="text-emerald-500" />} />
           <MetricBox label="Fit Confidence (R²)" value={`${(pzResults.r2 * 100).toFixed(1)}%`} icon={<Zap className="text-amber-500" />} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden"
          >
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative z-10">
                <div>
                   <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                     {activeTab === 'pz' ? 'p/Z Analysis' : activeTab === 'campbell' ? 'Campbell Plot' : 'Havlena-Odeh Method'}
                   </h3>
                   <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic">
                     {activeTab === 'pz' ? 'VOLUMETRIC DEPLETION STRAIGHT LINE' : 'AQUIFER INFLUX DIAGNOSTIC'}
                   </p>
                </div>
                <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[11px] font-black text-white/50 tracking-widest uppercase">
                  Analytical Solution
                </div>
             </div>

             <div className="h-[500px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                   <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                      <XAxis 
                        type="number" 
                        dataKey="gp" 
                        name="Cumulative Production" 
                        stroke="#475569" 
                        fontSize={10} 
                        label={{ value: 'Gp (BCF)', position: 'insideBottom', offset: -20, fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                        domain={[0, 'auto']}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="pz" 
                        name="p/Z" 
                        stroke="#475569" 
                        fontSize={10} 
                        label={{ value: 'p/Z (PSI)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                        domain={[0, 'auto']}
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }}
                      />
                      <Scatter name="Actual Data" data={pzResults.data} fill="#06b6d4" />
                      <Line 
                        name="Regression" 
                        type="monotone" 
                        data={pzResults.regressionLine} 
                        dataKey="pz" 
                        stroke="#f43f5e" 
                        strokeWidth={2} 
                        strokeDasharray="5 5" 
                        dot={false} 
                      />
                   </ScatterChart>
                </ResponsiveContainer>
             </div>

             {/* Background Gradient */}
             <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </AnimatePresence>

        <div className="glass-card rounded-3xl p-12 border-white/5 bg-black/40">
           <div className="flex items-center gap-4 mb-8">
              <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                <Box size={20} />
              </div>
              <h4 className="text-xs font-black text-white italic uppercase tracking-widest">Reserves Interpretation</h4>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                A straight-line p/Z plot indicates volumetric depletion. Downward curvature suggests aquifer influx (water drive), while upward curvature may indicate abnormally pressured reservoirs or rock compressibility dominance.
              </p>
              <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Current Recov. %</span>
                    <span className="text-sm font-black text-white">{(pzResults.data[pzResults.data.length-1]?.gp / pzResults.ogip * 100).toFixed(1)}%</span>
                 </div>
                 <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000"
                      style={{ width: `${(pzResults.data[pzResults.data.length-1]?.gp / pzResults.ogip * 100) || 0}%` }}
                    />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40 relative overflow-hidden group">
       <div className="flex items-center gap-3 mb-6">
          {icon}
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
       </div>
       <p className="text-3xl font-black text-white italic tracking-tighter uppercase relative z-10">{value}</p>
       <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
         {icon}
       </div>
    </div>
  );
}
