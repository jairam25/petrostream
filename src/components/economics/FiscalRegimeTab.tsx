import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend
} from 'recharts';
import { 
  ShieldCheck, 
  Users, 
  Globe, 
  Scale, 
  TrendingUp, 
  Settings2,
  FileText,
  PieChart as PieIcon,
  RefreshCcw,
  Zap,
  ArrowRightCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculatePSCFiscal } from '../../lib/reservoir';

// --- High-Fidelity 3D Visualizers ---

function FiscalValueHub3D({ data, govtPercent }: { data: any[], govtPercent: number }) {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_0_50px_rgba(244,63,94,0.2)]">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g transform="translate(200, 200)">
        {/* Outer Ring */}
        <circle r="140" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="10 5" />
        
        {/* Govt Share Arc (3D-ish) */}
        <motion.path 
          d={`M 0 -110 A 110 110 0 ${govtPercent > 50 ? 1 : 0} 1 ${110 * Math.sin(govtPercent * Math.PI / 50)} ${-110 * Math.cos(govtPercent * Math.PI / 50)}`}
          fill="none"
          stroke="#f43f5e"
          strokeWidth="25"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2 }}
          filter="url(#glow)"
        />
        
        {/* Contractor Share Arc */}
        <circle r="110" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="25" />
        
        {/* Core HUD */}
        <motion.circle 
          r="70" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.05)" strokeWidth="1"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
        />
        <text y="-10" textAnchor="middle" fill="white" fontSize="8" className="font-black uppercase tracking-widest opacity-40">Govt Take</text>
        <text y="15" textAnchor="middle" fill="#f43f5e" fontSize="24" className="font-black italic tracking-tighter">{govtPercent.toFixed(1)}%</text>
      </g>
    </svg>
  );
}

function SensitivityMatrix3D({ params }: { params: any }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full">
      <g transform="translate(100, 300) rotateX(45) rotateZ(-20)">
        {/* Grid Floor */}
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i}>
            <line x1={i * 40} y1="0" x2={i * 40} y2="280" stroke="rgba(255,255,255,0.05)" />
            <line x1="0" y1={i * 40} x2="280" y2={i * 40} stroke="rgba(255,255,255,0.05)" />
          </g>
        ))}
        
        {/* Value Points */}
        {Array.from({ length: 64 }).map((_, i) => {
          const x = i % 8;
          const y = Math.floor(i / 8);
          const h = (x + y) * 2 + (params.royalty * 100);
          return (
            <motion.rect 
              key={i} x={x * 40} y={y * 40} width="35" height="35"
              fill={h > 50 ? "rgba(244,63,94,0.1)" : "rgba(6,182,212,0.1)"}
              stroke={h > 50 ? "#f43f5e" : "#06b6d4"}
              strokeWidth="1"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.01 }}
            />
          );
        })}
      </g>
    </svg>
  );
}

export function FiscalRegimeTab() {
  const [fiscalType, setFiscalType] = useState<'psc' | 'tax_royalty'>('psc');
  const [showReport, setShowReport] = useState(false);
  
  // Fiscal Parameters
  const [params, setParams] = useState({
    royalty: 0.125,
    costLimit: 0.60,
    profitSplit: 0.40, // contractor share
    taxRate: 0.35,
    rFactorBase: 1.5 // for sliding scale display
  });

  // Economic Context
  const [econ, setEcon] = useState({
    grossRevenue: 1000, // $M
    totalCosts: 400 // $M
  });

  const results = useMemo(() => {
    if (fiscalType === 'psc') {
        const opex = econ.totalCosts * 0.4;
        const capex = econ.totalCosts * 0.6;
        
        const psc = calculatePSCFiscal(
            econ.grossRevenue,
            opex,
            capex,
            params.royalty,
            params.costLimit,
            params.profitSplit,
            params.taxRate
        );
        
        return {
            contractorTake: psc.contractorNCF + econ.totalCosts, // include cost recovery for total
            govtTake: psc.govtTake,
            govtTakePercent: (psc.govtTake / (econ.grossRevenue - econ.totalCosts)) * 100
        };
    } else {
        // Tax & Royalty
        const royalty = econ.grossRevenue * params.royalty;
        const taxable = econ.grossRevenue - royalty - econ.totalCosts;
        const tax = Math.max(0, taxable * params.taxRate);
        const contractorNCF = econ.grossRevenue - royalty - econ.totalCosts - tax;
        const govtTake = royalty + tax;
        
        return {
            contractorTake: contractorNCF + econ.totalCosts,
            govtTake,
            govtTakePercent: (govtTake / (econ.grossRevenue - econ.totalCosts)) * 100
        };
    }
  }, [fiscalType, params, econ]);

  const pieData = [
    { name: 'Contractor Share', value: Math.max(0, results.contractorTake), color: '#06b6d4' },
    { name: 'Government Take', value: Math.max(0, results.govtTake), color: '#f43f5e' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#030406] text-white p-6 gap-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
        {/* Left: Controls */}
        <div className="lg:col-span-3 glass-card rounded-3xl p-10 border-white/5 bg-[#05070a]/80 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-transparent" />
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-3 mb-10">
            <Settings2 size={16} className="text-cyan-500" />
            Fiscal Configuration
          </h3>
          
          <div className="flex flex-col gap-3 mb-12 bg-white/5 p-2 rounded-3xl border border-white/5">
            {[
              { id: 'psc', label: 'Production Sharing' },
              { id: 'tax_royalty', label: 'Tax & Royalty' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setFiscalType(t.id as any)}
                className={cn(
                  "w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all px-6 text-center",
                  fiscalType === t.id ? "bg-white text-black shadow-xl" : "text-slate-500 hover:text-white"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-10 flex-grow">
            <InputWithSlider label="Royalty (%)" value={params.royalty * 100} min={0} max={30} step={0.5} unit="%" onChange={(v) => setParams({...params, royalty: v/100})} />
            <InputWithSlider label="Cost Recovery Limit" value={params.costLimit * 100} min={10} max={90} step={1} unit="%" onChange={(v) => setParams({...params, costLimit: v/100})} />
            <InputWithSlider label="Profit Split/CIT" value={params.profitSplit * 100} min={5} max={80} step={1} unit="%" onChange={(v) => setParams({...params, profitSplit: v/100})} />
            <InputWithSlider label="Income Tax Rate" value={params.taxRate * 100} min={0} max={50} step={1} unit="%" onChange={(v) => setParams({...params, taxRate: v/100})} />
          </div>

          <div className="mt-auto p-8 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-3xl">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest italic">Government Take</span>
                <ShieldCheck size={18} className="text-red-500 animate-pulse" />
             </div>
             <p className="text-5xl font-black italic tracking-tighter text-white">
               {results.govtTakePercent.toFixed(1)}<span className="text-lg text-red-500/50 ml-2">%</span>
             </p>
          </div>
        </div>

        {/* Center: 3D Visualizer */}
        <div className="lg:col-span-6 glass-card rounded-3xl border border-white/5 bg-[#05070a]/40 relative flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05),transparent)]" />
          
          <div className="absolute top-10 left-10 flex flex-col gap-1">
             <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">Value <span className="text-cyan-500">Distribution</span></h4>
             <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{showReport ? "Comparative Matrix" : "Real-time Hub"}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={showReport ? 'report' : 'hub'}
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              className="w-full h-full flex items-center justify-center"
            >
              {showReport ? (
                <SensitivityMatrix3D params={params} />
              ) : (
                <FiscalValueHub3D data={pieData} govtPercent={results.govtTakePercent} />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
             <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">AstraCore Fiscal Analytics Engine</span>
          </div>
        </div>

        {/* Right: Telemetry & Report */}
        <div className="lg:col-span-3 flex flex-col gap-6">
           <div className="glass-card rounded-3xl p-8 bg-[#05070a]/60 border border-white/5 flex-grow">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-10 flex items-center gap-3">
                <Scale size={14} className="text-amber-500" />
                Fiscal Components
              </h4>
              <div className="space-y-8">
                 <ComponentBar label="Royalties" value={`$${(econ.grossRevenue * params.royalty).toFixed(1)}M`} color="bg-red-500" percent={(params.royalty * 100)} />
                 <ComponentBar label="Profit Oil" value={`$${(results.govtTake - (econ.grossRevenue * params.royalty)).toFixed(1)}M`} color="bg-amber-500" percent={25} />
                 <ComponentBar label="Cost Recovery" value={`$${(econ.totalCosts).toFixed(1)}M`} color="bg-slate-500" percent={40} />
              </div>

              <div className="mt-12 pt-12 border-t border-white/5">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">R-Factor Diagnostic</span>
                    <span className="text-lg font-black text-cyan-400">{params.rFactorBase.toFixed(2)}</span>
                 </div>
                 <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: '30%' }} />
                    <div className="h-full bg-amber-500" style={{ width: '40%' }} />
                    <div className="h-full bg-red-500" style={{ width: '30%' }} />
                 </div>
              </div>
           </div>

           <button 
             onClick={() => setShowReport(!showReport)}
             className={cn(
               "glass-card rounded-3xl p-8 transition-all relative overflow-hidden group border",
               showReport ? "bg-cyan-500 border-cyan-400" : "bg-white/5 border-white/5 hover:border-cyan-500/30"
             )}
           >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className={cn("text-[11px] font-black uppercase tracking-widest italic mb-1", showReport ? "text-cyan-900" : "text-slate-500")}>
                    {showReport ? "Back to Simulation" : "Comparative Report"}
                  </p>
                  <p className={cn("text-sm font-bold uppercase tracking-tighter", showReport ? "text-white" : "text-white")}>
                    {showReport ? "Real-time Hub View" : "Fiscal Sensitivity Matrix"}
                  </p>
                </div>
                <ArrowRightCircle className={cn(showReport ? "text-white rotate-180" : "text-slate-700 group-hover:text-cyan-500")} size={24} />
              </div>
           </button>
        </div>
      </div>
    </div>
  );
}

function FiscalMetric({ label, value, sub, icon }: { label: string, value: string, sub: string, icon: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40 relative overflow-hidden">
       <div className="flex items-center gap-3 mb-6">
          {icon}
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
       </div>
       <p className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1">{value}</p>
       <p className="text-[11px] text-slate-600 font-mono uppercase tracking-widest">{sub}</p>
    </div>
  );
}

function ComponentBar({ label, value, color, percent }: { label: string, value: string, color: string, percent: number }) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
          <span className="text-slate-500">{label}</span>
          <span className="text-white">{value}</span>
       </div>
       <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className={cn("h-full", color)} style={{ width: `${percent}%` }} />
       </div>
    </div>
  );
}
