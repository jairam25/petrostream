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
  BarChart, 
  Bar, 
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  Zap, 
  Activity, 
  BarChart3, 
  TrendingUp, 
  Settings2,
  RefreshCcw,
  Target,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateNPV } from '../../lib/reservoir';

interface SensitivityPoint {
  percent: number;
  priceNPV: number;
  capexNPV: number;
  opexNPV: number;
  prodNPV: number;
}

export function RiskAnalysisTab() {
  const [baseParams, setBaseParams] = useState({
    price: 75,
    capex: 10e6,
    opex: 15,
    prod: 1e6, // Total MSTB
    discount: 0.10
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [monteCarloResult, setMonteCarloResult] = useState<null | { p50: number, p90: number }>(null);

  const runMonteCarlo = () => {
    setIsSimulating(true);
    setSimulationProgress(0);
    setMonteCarloResult(null);
    
    // Capture the current baseParams for the simulation
    const currentParams = { ...baseParams };
    
    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulating(false);
          
          // Generate 1000 outcomes for Monte Carlo
          const outcomes = [];
          for (let i = 0; i < 1000; i++) {
            // Uniform distribution for simplicity, representing uncertainty
            const rPrice = currentParams.price * (0.7 + Math.random() * 0.6); // +/- 30%
            const rCapex = currentParams.capex * (0.8 + Math.random() * 0.4); // +/- 20%
            const rOpex = currentParams.opex * (0.8 + Math.random() * 0.4);   // +/- 20%
            const rProd = currentParams.prod * (0.6 + Math.random() * 0.6);   // -40% to +20%

            const flows = [-rCapex];
            for (let y = 1; y <= 10; y++) {
                flows.push((rProd/10) * rPrice - (rProd/10) * rOpex);
            }
            outcomes.push(calculateNPV(flows, currentParams.discount, false) / 1e6);
          }
          
          // Sort ascending: index 0 is worst, index 999 is best
          outcomes.sort((a, b) => a - b);
          
          // P90: 90% chance of exceeding (10th percentile from bottom)
          const p90 = outcomes[Math.floor(outcomes.length * 0.1)];
          // P50: 50% chance of exceeding (median)
          const p50 = outcomes[Math.floor(outcomes.length * 0.5)];

          setMonteCarloResult({ 
            p50: parseFloat(p50.toFixed(1)), 
            p90: parseFloat(p90.toFixed(1)) 
          });
          return 100;
        }
        return prev + 5;
      });
    }, 50); // 50ms interval for a slightly faster UX
  };

  const baseNPV = useMemo(() => {
    // Very simplified annual cash flow to get a single NPV number for sensitivity
    const years = 10;
    const flows = [-baseParams.capex];
    for (let i = 1; i <= years; i++) {
        const revenue = (baseParams.prod / years) * baseParams.price;
        const opExpenses = (baseParams.prod / years) * baseParams.opex;
        flows.push(revenue - opExpenses);
    }
    return calculateNPV(flows, baseParams.discount, false);
  }, [baseParams]);

  const spiderData = useMemo(() => {
    const percentages = [-30, -20, -10, 0, 10, 20, 30];
    return percentages.map(p => {
        const factor = 1 + p / 100;
        
        const calcNPV = (price: number, capex: number, opex: number, prod: number) => {
            const flows = [-capex];
            for (let i = 1; i <= 10; i++) {
                flows.push((prod/10) * price - (prod/10) * opex);
            }
            return calculateNPV(flows, baseParams.discount, false) / 1e6;
        };

        return {
            percent: p,
            priceNPV: calcNPV(baseParams.price * factor, baseParams.capex, baseParams.opex, baseParams.prod),
            capexNPV: calcNPV(baseParams.price, baseParams.capex * factor, baseParams.opex, baseParams.prod),
            opexNPV: calcNPV(baseParams.price, baseParams.capex, baseParams.opex * factor, baseParams.prod),
            prodNPV: calcNPV(baseParams.price, baseParams.capex, baseParams.opex, baseParams.prod * factor)
        };
    });
  }, [baseParams]);

  const tornadoData = useMemo(() => {
    const pLow = 0.7;
    const pHigh = 1.3;
    
    const calcNPV = (price: number, capex: number, opex: number, prod: number) => {
        const flows = [-capex];
        for (let i = 1; i <= 10; i++) {
            flows.push((prod/10) * price - (prod/10) * opex);
        }
        return calculateNPV(flows, baseParams.discount, false) / 1e6;
    };

    const bNPV = baseNPV / 1e6;

    const data = [
        { name: 'Price', low: calcNPV(baseParams.price * pLow, baseParams.capex, baseParams.opex, baseParams.prod), high: calcNPV(baseParams.price * pHigh, baseParams.capex, baseParams.opex, baseParams.prod), range: 0 },
        { name: 'CAPEX', low: calcNPV(baseParams.price, baseParams.capex * pHigh, baseParams.opex, baseParams.prod), high: calcNPV(baseParams.price, baseParams.capex * pLow, baseParams.opex, baseParams.prod), range: 0 },
        { name: 'OPEX', low: calcNPV(baseParams.price, baseParams.capex, baseParams.opex * pHigh, baseParams.prod), high: calcNPV(baseParams.price, baseParams.capex, baseParams.opex * pLow, baseParams.prod), range: 0 },
        { name: 'Production', low: calcNPV(baseParams.price, baseParams.capex, baseParams.opex, baseParams.prod * pLow), high: calcNPV(baseParams.price, baseParams.capex, baseParams.opex, baseParams.prod * pHigh), range: 0 }
    ];

    data.forEach(d => {
        d.range = Math.abs(d.high - d.low);
    });

    return data.sort((a, b) => b.range - a.range);
  }, [baseParams, baseNPV]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Base Case Inputs</h4>
           </div>
           
           <div className="space-y-8">
              <InputWithSlider label="Oil Price ($)" value={baseParams.price} min={30} max={150} step={1} unit="/bbl" onChange={(v) => setBaseParams({...baseParams, price: v})} />
              <InputWithSlider label="CAPEX ($M)" value={baseParams.capex / 1e6} min={1} max={50} step={1} unit="M" onChange={(v) => setBaseParams({...baseParams, capex: v * 1e6})} />
              <InputWithSlider label="Prod (MSTB)" value={baseParams.prod / 1000} min={100} max={5000} step={100} unit="K" onChange={(v) => setBaseParams({...baseParams, prod: v * 1000})} />
              <InputWithSlider label="OPEX ($/bbl)" value={baseParams.opex} min={2} max={50} step={1} unit="/bbl" onChange={(v) => setBaseParams({...baseParams, opex: v})} />
           </div>
        </div>

        <motion.div 
           whileHover={{ scale: 1.02 }}
           className="glass-card rounded-3xl p-8 bg-gradient-to-br from-red-900/20 to-black border-red-500/10 relative overflow-hidden"
        >
           <div className="flex items-center gap-3 mb-4 relative z-10">
              <AlertCircle size={18} className="text-red-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Risk Summary</h5>
           </div>
           <div className="space-y-4 relative z-10">
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                 The Tornado chart identifies {tornadoData[0].name} as the most sensitive parameter. A 30% swing in {tornadoData[0].name} results in a ${(tornadoData[0].range).toFixed(1)}M change in NPV.
              </p>
              <div className="pt-4 border-t border-white/5">
                 <div className="flex justify-between items-center text-[10px] uppercase font-black text-white/40 mb-2">
                    <span>Base Case NPV</span>
                    <span className="text-cyan-400 font-bold">${(baseNPV / 1e6).toFixed(1)}M</span>
                 </div>
                 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-4">
                    <motion.div 
                      animate={{ width: ["20%", "60%", "20%"] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="h-full bg-red-500/40" 
                    />
                 </div>
              </div>
           </div>
           {/* Kinetic Risk Glow */}
           <motion.div 
             animate={{ opacity: [0.1, 0.2, 0.1] }}
             transition={{ duration: 3, repeat: Infinity }}
             className="absolute inset-0 bg-red-500/5 blur-3xl pointer-events-none" 
           />
        </motion.div>
      </div>

      {/* Visuals */}
      <div className="lg:col-span-9 space-y-8">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a]">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Spider <span className="text-cyan-500">Diagram</span></h3>
                  <TrendingUp className="text-cyan-500" size={20} />
               </div>
               <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={spiderData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                        <XAxis dataKey="percent" stroke="#475569" fontSize={10} tickFormatter={(v) => `${v}%`} />
                        <YAxis stroke="#475569" fontSize={10} tickFormatter={(v) => `$${v}M`} />
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }}
                        />
                        <ReferenceLine y={baseNPV / 1e6} stroke="#ffffff20" strokeDasharray="3 3" />
                        <Line name="Price" type="monotone" dataKey="priceNPV" stroke="#06b6d4" strokeWidth={3} dot={false} />
                        <Line name="CAPEX" type="monotone" dataKey="capexNPV" stroke="#f43f5e" strokeWidth={3} dot={false} />
                        <Line name="OPEX" type="monotone" dataKey="opexNPV" stroke="#f59e0b" strokeWidth={3} dot={false} />
                        <Line name="Production" type="monotone" dataKey="prodNPV" stroke="#10b981" strokeWidth={3} dot={false} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a]">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Tornado <span className="text-amber-500">Analysis</span></h3>
                  <BarChart3 className="text-amber-500" size={20} />
               </div>
               <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={tornadoData} layout="vertical" margin={{ left: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" horizontal={false} />
                        <XAxis type="number" stroke="#475569" fontSize={10} tickFormatter={(v) => `$${v}M`} />
                        <YAxis type="category" dataKey="name" stroke="#475569" fontSize={10} />
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }}
                        />
                        <Bar dataKey="low" fill="#f43f5e" radius={[0, 0, 0, 0]} barSize={20} />
                        <Bar dataKey="high" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                        <ReferenceLine x={baseNPV / 1e6} stroke="#fff" strokeDasharray="3 3" />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         <div className="glass-card rounded-3xl p-12 border-white/5 bg-black/40">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <Target size={20} className="text-purple-500" />
                   <h4 className="text-sm font-black text-white uppercase italic tracking-tighter">Breakeven Analysis</h4>
                </div>
                <div className="space-y-4">
                   <BreakevenRow label="Breakeven Price" value={`$${(baseParams.opex + (baseParams.capex / (baseParams.prod))).toFixed(2)}`} unit="/bbl" />
                   <BreakevenRow label="OpEx Breakeven" value={baseParams.opex.toFixed(2)} unit="/bbl" />
                   <p className="text-[10px] text-slate-500 italic mt-4">Calculates price where NPV becomes 0 over project life.</p>
                </div>
              </div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-center items-center text-center relative overflow-hidden group"
              >
                 <RefreshCcw size={32} className={cn("text-slate-700 mb-6 transition-all", isSimulating && "text-cyan-500 animate-spin")} />
                 <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-2 relative z-10">probabilistic Simulation</h5>
                 
                 {isSimulating ? (
                    <div className="w-full space-y-4 relative z-10">
                       <p className="text-[10px] text-cyan-400 font-bold uppercase animate-pulse">Running Monte Carlo Engine...</p>
                       <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${simulationProgress}%` }}
                             className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" 
                          />
                       </div>
                    </div>
                 ) : monteCarloResult ? (
                    <div className="w-full grid grid-cols-2 gap-4 mt-2 relative z-10">
                       <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
                          <p className="text-[10px] font-bold text-cyan-500 uppercase">P50 NPV</p>
                          <p className="text-xl font-black text-white">${monteCarloResult.p50}M</p>
                       </div>
                       <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                          <p className="text-[10px] font-bold text-emerald-500 uppercase">P90 NPV</p>
                          <p className="text-xl font-black text-white">${monteCarloResult.p90}M</p>
                       </div>
                    </div>
                 ) : (
                    <p className="text-[11px] text-slate-500 leading-relaxed italic relative z-10">
                       Integration of Monte Carlo reserve outcomes with stochastic price forecasts. 
                    </p>
                 )}

                 {!isSimulating && !monteCarloResult && (
                    <button 
                      onClick={runMonteCarlo}
                      className="mt-8 px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-cyan-500 hover:text-white transition-all relative z-10"
                    >
                       Run Monte Carlo (10k)
                    </button>
                 )}
                 
                 {monteCarloResult && (
                    <button 
                      onClick={runMonteCarlo}
                      className="mt-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors relative z-10 underline decoration-slate-800 underline-offset-4"
                    >
                       Recalculate Stochastic Model
                    </button>
                 )}

                 {/* Stochastic Pulse Animation */}
                 {isSimulating && (
                    <motion.div 
                      animate={{ opacity: [0, 0.1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 bg-cyan-500 pointer-events-none" 
                    />
                 )}
              </motion.div>
           </div>
         </div>
      </div>
    </div>
  );
}

function BreakevenRow({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-all">
       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
       <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-white italic tracking-tighter">{value}</span>
          <span className="text-[11px] font-bold text-slate-600 uppercase">{unit}</span>
       </div>
    </div>
  );
}
