import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import {
   Zap,
   Activity,
   ShieldCheck,
   TrendingUp,
   Search,
   ChevronRight,
   Database,
   Radio,
   Eye,
   EyeOff,
   Target
} from 'lucide-react';
import {
   Radar,
   RadarChart,
   PolarGrid,
   PolarAngleAxis,
   PolarRadiusAxis,
   ResponsiveContainer,
   AreaChart,
   Area,
   XAxis,
   YAxis
} from 'recharts';
import { cn, formatNumber } from '../../lib/utils';
import { useExploration } from '../../store/hooks';
import SampleDataLoader from '../shared/SampleDataLoader';
import { getExplorationSample } from '../../lib/sampleData';

export function ProspectNeuralSimulator() {
   const { data, update } = useExploration();
   const cos = data.prospect.cos;
   const [showRiskPanel, setShowRiskPanel] = useState(true);
   const [optimized, setOptimized] = useState(false);

   const factors = { source: cos.source, reservoir: cos.reservoir, trap: cos.trap, seal: cos.seal, migration: cos.migration };

   const setFactor = useCallback((key: keyof typeof factors, value: number) => {
      const newCos = { ...cos, [key]: value, pg: 1 };
      // recompute pg from all 5 factors
      const allFactors = { source: cos.source, reservoir: cos.reservoir, trap: cos.trap, seal: cos.seal, migration: cos.migration };
      allFactors[key] = value;
      newCos.pg = Object.values(allFactors).reduce((acc, v) => acc * v, 1);
      update({ prospect: { ...data.prospect, cos: newCos } });
   }, [cos, update, data.prospect]);

   const pg = useMemo(() => {
      return Object.values(factors).reduce((acc, val) => acc * val, 1);
   }, [factors]);

   const radarData = [
      { subject: 'Source', A: factors.source * 100, fullMark: 100 },
      { subject: 'Reservoir', A: factors.reservoir * 100, fullMark: 100 },
      { subject: 'Trap', A: factors.trap * 100, fullMark: 100 },
      { subject: 'Seal', A: factors.seal * 100, fullMark: 100 },
      { subject: 'Migration', A: factors.migration * 100, fullMark: 100 },
   ];

   const distribution = useMemo(() => {
      return Array.from({ length: 20 }, (_, i) => ({
         x: i,
         y: Math.exp(-Math.pow(i - 10, 2) / 10) * 100
      }));
   }, []);

   const handleLoadSample = useCallback(() => {
      const s = getExplorationSample();
      const pg = s.riskSource * s.riskReservoir * s.riskSeal * s.riskTrap * s.riskMigration * s.riskTiming;
      const stoiip = (s.areaAcres * s.grossIntervalFt * s.netToGross * s.porosity * (1 - s.waterSaturation)) / (s.formationVolumeFactor * 7758);
      const stoiipMMstb = stoiip / 1e6;
      setOptimized(false);
      update({
         prospect: {
            name: s.prospectName,
            location: { lat: -2.5, lon: 34.8 },
            trapType: 'structural_anticline' as any,
            cos: {
               source: s.riskSource,
               reservoir: s.riskReservoir,
               seal: s.riskSeal,
               trap: s.riskTrap,
               migration: s.riskMigration,
               timing: s.riskTiming,
               pg,
            },
            grv: { p10: stoiipMMstb * 0.7 * s.recoveryFactor, p50: stoiipMMstb * s.recoveryFactor, p90: stoiipMMstb * 1.3 * s.recoveryFactor },
            stoiip: { p10: stoiipMMstb * 0.7, p50: stoiipMMstb, p90: stoiipMMstb * 1.3 },
            giip: { p10: 0, p50: 0, p90: 0 },
            emv: stoiipMMstb * s.recoveryFactor * 18,
            riskedVolume: stoiipMMstb * s.recoveryFactor * pg,
         },
      });
   }, [update]);

   const handleOptimize = useCallback(() => {
      // Set all risk factors to their optimal values (1.0 = maximum confidence)
      const optimalCos = {
         source: 1.0,
         reservoir: 1.0,
         trap: 1.0,
         seal: 1.0,
         migration: 1.0,
         timing: cos.timing,
         pg: 1.0,
      };
      update({ prospect: { ...data.prospect, cos: optimalCos } });
      setOptimized(true);
   }, [cos.timing, update, data.prospect]);

   return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-8 bg-panel-bg border border-border-subtle rounded-3xl shadow-2xl relative overflow-hidden group mb-8">
         <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

         {/* Control Panel */}
         <div className="lg:col-span-3 space-y-6 relative z-10">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                  <Search size={20} className="animate-pulse" />
               </div>
               <div className="flex-1">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Prospect-AI Terminal</h3>
                  <p className="text-[11px] text-slate-500 font-mono uppercase tracking-widest">Risk De-Risking System</p>
               </div>
               <button
                  onClick={() => setShowRiskPanel(v => !v)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  title={showRiskPanel ? "Hide Risk Panel" : "Show Risk Panel"}
               >
                  {showRiskPanel ? <EyeOff size={14} className="text-slate-400" /> : <Eye size={14} className="text-brand-primary" />}
               </button>
            </div>

            {showRiskPanel && (
               <>
                  <SampleDataLoader loadSample={handleLoadSample} label="Load Sample Prospect" stageName="Exploration" />

                  <div className="space-y-4">
                     <RiskInput label="Source Presence" value={factors.source} onChange={v => setFactor('source', v)} />
                     <RiskInput label="Reservoir Quality" value={factors.reservoir} onChange={v => setFactor('reservoir', v)} />
                     <RiskInput label="Trap Geometry" value={factors.trap} onChange={v => setFactor('trap', v)} />
                     <RiskInput label="Seal Integrity" value={factors.seal} onChange={v => setFactor('seal', v)} />
                     <RiskInput label="Migration Timing" value={factors.migration} onChange={v => setFactor('migration', v)} />
                  </div>
               </>
            )}
         </div>

         {/* Main Display */}
         <div className="lg:col-span-6 flex flex-col gap-6 relative z-10">
            <div className="grid grid-cols-2 gap-6 flex-1">
               <div className="p-8 bg-black/40 border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Probability of Success (Pg)</p>
                  <h4 className={cn(
                     "text-6xl font-black italic tracking-tighter transition-colors",
                     pg > 0.3 ? "text-emerald-400" : pg > 0.15 ? "text-amber-400" : "text-rose-400"
                  )}>
                     {(pg * 100).toFixed(1)}
                     <span className="text-xs text-slate-500 not-italic ml-2">%</span>
                  </h4>
                  <div className="mt-6 flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 rounded-full border border-brand-primary/20">
                     <Activity size={12} className="text-brand-primary" />
                     <span className="text-[11px] font-black text-brand-primary uppercase italic">Confidence: 94.2%</span>
                  </div>
               </div>

               <div className="p-8 bg-black/40 border border-white/5 rounded-3xl flex flex-col overflow-hidden">
                  <div className="flex justify-between items-center mb-2">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Profile</p>
                     <ShieldCheck size={14} className="text-brand-primary" />
                  </div>
                  <div className="flex-1 min-h-[140px] -mt-4 scale-110">
                     <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                           <PolarGrid stroke="#ffffff10" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 8, fontWeight: 'bold' }} />
                           <Radar
                              name="Risk"
                              dataKey="A"
                              stroke="#0ea5e9"
                              fill="#0ea5e9"
                              fillOpacity={0.3}
                           />
                        </RadarChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-black/40 border border-white/5 rounded-3xl h-44 flex flex-col relative overflow-hidden">
               <div className="absolute top-6 left-8 z-10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Seismic Interpreter</p>
                  <h5 className="text-[11px] font-black text-brand-primary uppercase italic">AVO Anomaly & Stratigraphy</h5>
               </div>
               <div className="flex-1">
                  <SeismicCanvas pg={pg} />
               </div>
            </div>
         </div>

         {/* Analytics */}
         <div className="lg:col-span-3 space-y-6 relative z-10">
            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl h-full flex flex-col">
               <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 italic">Strategic Insight</h4>
               <div className="space-y-6 flex-1">
                  <MetricRow label="Play Fairway" value="High Graded" status="good" />
                  <MetricRow label="DHI Anomaly" value="Bright Spot" status="info" />
                  <MetricRow label="Seal Risk" value="Caprock Failure" status="warning" />
               </div>

               <button
                  onClick={handleOptimize}
                  className={cn(
                     "w-full mt-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:scale-[0.98] transition-all flex items-center justify-center gap-2 italic shadow-lg",
                     optimized
                        ? "bg-emerald-600 text-white shadow-emerald-600/20"
                        : "bg-brand-primary text-white shadow-brand-primary/20"
                  )}
               >
                  {optimized ? (
                     <>Target Optimized <Target size={14} /></>
                  ) : (
                     <>Optimize Drilling Target <ChevronRight size={14} /></>
                  )}
               </button>
            </div>
         </div>
      </div>
   );
}

function RiskInput({ label, value, onChange }: any) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</label>
            <span className="text-[10px] font-mono text-white bg-white/5 px-2 py-0.5 rounded-md">{(value * 100).toFixed(0)}%</span>
         </div>
         <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full appearance-none accent-brand-primary cursor-pointer"
         />
      </div>
   );
}

function MetricRow({ label, value, status }: any) {
   const colors: any = {
      good: "bg-emerald-500",
      warning: "bg-amber-500",
      info: "bg-cyan-500"
   };
   return (
      <div className="flex items-center justify-between group">
         <div className="flex items-center gap-3">
            <div className={cn("w-1.5 h-1.5 rounded-full", colors[status])} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</span>
         </div>
         <span className="text-[10px] font-mono text-white font-black">{value}</span>
      </div>
   );
}

function SeismicCanvas({ pg }: any) {
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrameId: number;
      let time = 0;

      const render = () => {
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         const w = canvas.width;
         const h = canvas.height;
         time += 0.02;

         ctx.lineWidth = 1;
         for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = i === 2 ? 'rgba(14, 165, 233, ' + (0.2 + pg * 0.8) + ')' : '#ffffff05';
            ctx.beginPath();
            ctx.moveTo(0, h * (0.2 + i * 0.15));
            for (let x = 0; x < w; x += 5) {
               const y = h * (0.2 + i * 0.15) + Math.sin(x * 0.01 + time + i) * (5 + pg * 10);
               ctx.lineTo(x, y);
            }
            ctx.stroke();
         }

         ctx.strokeStyle = '#ffffff03';
         for (let x = 0; x < w; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            for (let y = 0; y < h; y += 5) {
               const dx = Math.sin(y * 0.1 + time) * 2;
               ctx.lineTo(x + dx, y);
            }
            ctx.stroke();
         }

         animationFrameId = requestAnimationFrame(render);
      };
      render();
      return () => cancelAnimationFrame(animationFrameId);
   }, [pg]);

   return <canvas ref={canvasRef} width={600} height={200} className='w-full h-full opacity-60' />;
}