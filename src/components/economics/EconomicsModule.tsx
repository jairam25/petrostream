import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  TrendingUp, 
  Zap, 
  Target, 
  BarChart3, 
  Activity,
  Settings,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { 
  calculateNPV, 
  calculateIRR, 
  calculatePayout, 
  calculatePI,
  calculateUTC
} from '../../lib/reservoir';
import { InputWithSlider } from '../SharedUI';

// --- Immersive 3D Visualizer Components ---

const DCFValueStream3D = ({ data }: { data: any[] }) => {
  const maxNCF = Math.max(...data.map(d => Math.abs(d.ncf || 0)), 1);
  const maxCum = Math.max(...data.map(d => Math.abs(d.cumNCF || 0)), 1);
  const minCum = Math.min(...data.map(d => (d.cumNCF || 0)), 0);
  const rangeCum = Math.max(maxCum, Math.abs(minCum)) * 1.2;

  const pathData = useMemo(() => {
    return data.reduce((acc, d, i) => {
      const x = (i / (data.length - 1)) * 800;
      const y = 200 - (d.cumNCF / rangeCum) * 150;
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [data, rangeCum]);

  const payoutYearIndex = data.findIndex(d => d.cumNCF >= 0);
  const payoutYear = payoutYearIndex >= 0 ? data[payoutYearIndex].year : null;
  const payoutX = payoutYearIndex > 0 ? (payoutYearIndex / (data.length - 1)) * 800 : null;

  return (
    <div className="w-full h-full relative group p-6 overflow-hidden">
      <svg viewBox="0 0 800 400" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <filter id="glowPath">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <line x1="0" y1="200" x2="800" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="5 5" />
        <text x="10" y="195" fill="rgba(255,255,255,0.3)" fontSize="10" className="font-black">BREAKEVEN ZERO</text>

        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 800;
          const h = (Math.abs(d.ncf) / maxNCF) * 100;
          const isPos = d.ncf >= 0;
          const baseY = 350;
          return (
            <motion.g key={i}>
              <motion.rect
                x={x - 8} y={isPos ? baseY - h : baseY} width="16" height={h}
                fill={isPos ? "#10b981" : "#ef4444"}
                rx="4"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1, height: h, y: isPos ? baseY - h : baseY }}
                style={{ originY: isPos ? `${baseY}px` : `${baseY}px` }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className={cn(
                  "opacity-60 hover:opacity-100 transition-all cursor-pointer",
                  isPos ? "hover:fill-emerald-400" : "hover:fill-rose-400"
                )}
              />
              <text x={x} y="380" fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="middle" className="font-black italic">Y{d.year}</text>
            </motion.g>
          );
        })}

        <motion.path
          d={pathData + ` L 800 200 L 0 200 Z`}
          fill="url(#areaGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        <motion.path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="4"
          filter="url(#glowPath)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />

        {payoutX !== null && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
            <line x1={payoutX} y1="0" x2={payoutX} y2="400" stroke="#fcd34d" strokeWidth="2" strokeDasharray="5 5" />
            <circle cx={payoutX} cy="200" r="8" fill="#05070a" stroke="#fcd34d" strokeWidth="3" />
            <motion.circle cx={payoutX} cy="200" r="15" fill="none" stroke="#fcd34d" strokeWidth="2" animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <rect x={payoutX + 10} y="175" width="80" height="20" fill="#fcd34d" rx="4" />
            <text x={payoutX + 50} y="188" fill="black" fontSize="9" textAnchor="middle" className="font-black uppercase">PAYOUT YR {payoutYear}</text>
          </motion.g>
        )}
      </svg>
      <div className="absolute top-8 left-8 flex gap-8 backdrop-blur-md bg-black/20 p-4 rounded-2xl border border-white/5">
         <div className="flex items-center gap-3">
            <div className="w-8 h-1 bg-[#3b82f6] rounded-full shadow-[0_0_15px_#3b82f6]" />
            <div>
               <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Cumulative Value</p>
               <p className="text-[10px] text-blue-500/60 font-bold uppercase tracking-widest">Net Project Value Stream</p>
            </div>
         </div>
         <div className="flex items-center gap-3 border-l border-white/10 pl-8">
            <div className="w-2 h-4 bg-[#10b981] rounded-sm shadow-[0_0_10px_#10b981]" />
            <div>
               <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Yearly NCF</p>
               <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest">Cash Flow Volatility</p>
            </div>
         </div>
      </div>
    </div>
  );
};

const IndicatorCompass3D = ({ indicators }: { indicators: any }) => {
  const metrics = [
    { label: 'NPV (MM$)', value: indicators.npv, max: Math.max(2000, indicators.npv * 1.5), color: '#10b981' },
    { label: 'IRR (%)', value: indicators.irr, max: Math.max(100, indicators.irr * 1.5), color: '#fcd34d' },
    { label: 'PI Ratio', value: indicators.pi, max: 5, color: '#3b82f6' },
    { label: 'Payout (Yrs)', value: indicators.payout, max: 15, color: '#ef4444', invert: true }
  ];

  return (
    <div className="w-full h-full p-8 flex items-center justify-center">
      <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
        {metrics.map((m, i) => {
           const percent = Math.min(100, Math.max(0, m.invert ? (1 - m.value / m.max) * 100 : (m.value / m.max) * 100));
           const isWarning = m.invert ? m.value > m.max * 0.7 : m.value < m.max * 0.2;
           return (
             <div key={m.label} className="bg-white/5 p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: `${percent}%` }} 
                 transition={{ duration: 1.5, type: "spring" }}
                 className="absolute top-0 left-0 h-1"
                 style={{ backgroundColor: m.color }}
               />
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{m.label}</h4>
               <div className="flex items-end justify-between">
                 <motion.p 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="text-4xl font-black italic tracking-tighter"
                   style={{ color: m.color }}
                 >
                   {formatNumber(m.value, 1)}
                 </motion.p>
                 <svg width="40" height="40" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <motion.circle 
                      cx="50" cy="50" r="40" fill="none" stroke={m.color} strokeWidth="8"
                      strokeDasharray="251"
                      initial={{ strokeDashoffset: 251 }}
                      animate={{ strokeDashoffset: 251 - (251 * percent) / 100 }}
                      transition={{ duration: 1.5, type: "spring" }}
                      transform="rotate(-90 50 50)"
                    />
                 </svg>
               </div>
               {isWarning && (
                 <div className="absolute top-4 right-4 animate-pulse">
                   <AlertTriangle size={14} className="text-rose-500" />
                 </div>
               )}
             </div>
           );
        })}
      </div>
    </div>
  );
};

const SensitivityTower3D = ({ data }: { data: any[] }) => {
  const baseData = data.find(d => d.variant === '0%');
  const baseNPV = baseData ? baseData.npv : 0;
  
  const maxDiff = Math.max(...data.map(d => Math.abs(d.npv - baseNPV)), 1);

  return (
    <div className="w-full h-full relative p-6 flex items-center justify-center">
      <svg viewBox="0 0 800 600" className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
        <line x1="400" y1="50" x2="400" y2="520" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="10 5" />
        <text x="400" y="30" fill="rgba(255,255,255,0.5)" fontSize="12" textAnchor="middle" className="font-black uppercase tracking-wide">Base NPV: ${formatNumber(baseNPV, 0)}MM</text>

        <g transform="translate(400, 100)">
          {data.map((d, i) => {
            if (d.variant === '0%') return null;
            const diff = d.npv - baseNPV;
            const w = (Math.abs(diff) / maxDiff) * 300;
            const y = i * 60;
            const isPos = diff >= 0;
            
            return (
              <motion.g key={i} transform={`translate(0, ${y})`}>
                {/* Variant Label (Center aligned to the empty side) */}
                <text x={isPos ? -15 : 15} y="22" fill="white" fontSize="11" className="font-black uppercase tracking-widest opacity-60" textAnchor={isPos ? "end" : "start"}>
                  {d.variant} Price
                </text>
                
                {/* Sensitivity Bar */}
                <motion.rect 
                  x={isPos ? 0 : -w} y="0" width={w} height="36" 
                  fill={isPos ? "#10b981" : "#ef4444"} fillOpacity="0.8" rx="6"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  style={{ originX: isPos ? 0 : 1, originY: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: Math.abs(3 - i) * 0.1 }}
                />
                
                {/* NPV Value Callout */}
                <text x={isPos ? w + 15 : -w - 15} y="22" fill={isPos ? "#10b981" : "#ef4444"} fontSize="12" className="font-black italic" textAnchor={isPos ? "start" : "end"}>
                  ${formatNumber(d.npv, 0)}MM
                </text>
              </motion.g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

const ProjectLifecycle3D = ({ stage, capex, opex, npv }: { stage: number, capex: number, opex: number, npv: number }) => {
  const steps = [
    { label: 'Concept', icon: Target, val: null },
    { label: 'FEED', icon: Settings, val: `CAPEX -$${formatNumber(capex, 0)}M` },
    { label: 'Sanction', icon: ShieldCheck, val: `NPV $${formatNumber(npv, 0)}M` },
    { label: 'Execution', icon: Activity, val: null },
    { label: 'First Oil', icon: Zap, val: `OPEX $${formatNumber(opex, 0)}/bbl` }
  ];

  return (
    <svg viewBox="0 0 800 400" className="w-full h-full">
      <defs>
        <filter id="neonLife">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      
      <motion.path 
        d="M 100 200 L 700 200"
        stroke="rgba(255,255,255,0.05)" strokeWidth="4" strokeDasharray="10 10"
      />
      <motion.path 
        d={`M 100 200 L ${100 + (stage / 4) * 600} 200`}
        stroke="#10b981" strokeWidth="6"
        filter="url(#neonLife)"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ type: "spring", bounce: 0 }}
      />

      {steps.map((s, i) => {
        const x = 100 + (i / 4) * 600;
        const isActive = i <= stage;
        const Icon = s.icon;
        
        return (
          <g key={i} transform={`translate(${x}, 200)`}>
            <motion.circle 
              r="25" fill={isActive ? "#10b981" : "#0f172a"} 
              stroke={isActive ? "#10b981" : "rgba(255,255,255,0.1)"} strokeWidth="3"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.2 }}
            />
            {isActive && i === stage && (
              <motion.circle 
                r="35" fill="none" stroke="#10b981" strokeOpacity="0.5" strokeWidth="2"
                animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
            <foreignObject x="-12" y="-12" width="24" height="24">
               <Icon className={cn("transition-colors", isActive ? "text-black" : "text-slate-500")} size={24} />
            </foreignObject>
            
            <text y="50" textAnchor="middle" fill={isActive ? "white" : "rgba(255,255,255,0.3)"} fontSize="12" className="font-black uppercase tracking-widest italic">{s.label}</text>
            
            {s.val && isActive && (
               <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                 <rect x="-55" y="65" width="110" height="24" rx="12" fill="rgba(16,185,129,0.1)" stroke="#10b981" strokeWidth="1" />
                 <text y="81" textAnchor="middle" fill="#10b981" fontSize="10" className="font-black uppercase tracking-widest">{s.val}</text>
               </motion.g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// --- Main Module ---

export function EconomicsModule() {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3 | 4>(1);
  const [currentStep, setCurrentStep] = useState(2); // Current Lifecycle Step
  
  // Inputs
  const [capex, setCapex] = useState(500); 
  const [opexBase, setOpexBase] = useState(15);
  const [taxRate, setTaxRate] = useState(25);
  const [royalty, setRoyalty] = useState(12.5);
  const [oilPrice, setOilPrice] = useState(75);
  const [discountRate, setDiscountRate] = useState(10);
  const [abandonment] = useState(50);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationComplete, setOptimizationComplete] = useState(false);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setOptimizationComplete(false);
    setTimeout(() => {
      setIsOptimizing(false);
      setOptimizationComplete(true);
    }, 2000);
  };

  const cashFlowData = useMemo(() => {
    const data = [];
    let cumCashFlow = 0; // Initialize at 0
    const peakProduction = 50000;
    const decline = 0.15;
    
    for (let year = 0; year <= 15; year++) {
      let production = 0;
      let yearlyCapex = 0;
      let yearlyAbandonment = 0;
      
      if (year === 0) {
        yearlyCapex = capex;
      } else {
        production = peakProduction * Math.pow(1 - decline, year - 1) * 365;
        if (year === 15) yearlyAbandonment = abandonment;
      }
      
      const revenue = (production * oilPrice) / 1e6;
      const royalties = revenue * (royalty / 100);
      const opex = (production * opexBase) / 1e6;
      const taxableIncome = Math.max(0, revenue - royalties - opex);
      const taxes = taxableIncome * (taxRate / 100);
      
      const netCashFlow = revenue - royalties - opex - taxes - yearlyCapex - yearlyAbandonment;
      const discountedCF = netCashFlow / Math.pow(1 + discountRate / 100, year);
      
      cumCashFlow += netCashFlow;
      data.push({ year, revenue, ncf: netCashFlow, dcf: discountedCF, cumNCF: cumCashFlow });
    }
    return data;
  }, [capex, opexBase, taxRate, royalty, oilPrice, discountRate, abandonment]);

  const indicators = useMemo(() => {
    const ncfArr = cashFlowData.map(d => d.ncf);
    const npv = calculateNPV(ncfArr, discountRate / 100, false);
    const irr = calculateIRR(ncfArr) * 100;
    const payout = calculatePayout(ncfArr);
    const pi = calculatePI(ncfArr, discountRate / 100);
    const totalProd = cashFlowData.reduce((acc, d) => acc + (d.revenue * 1e6 / oilPrice), 0);
    const utc = calculateUTC(capex, (totalProd * opexBase / 1e6), totalProd / 1e6);

    return { npv, irr, payout, pi, utc };
  }, [cashFlowData, capex, discountRate, oilPrice, opexBase]);

  const sensitivityData = useMemo(() => {
    return [-30, -20, -10, 0, 10, 20, 30].map(v => {
      const p = oilPrice * (1 + v / 100);
      const ncf = cashFlowData.map(d => {
        const prod = d.revenue * 1e6 / oilPrice;
        const rev = (prod * p) / 1e6;
        const roy = rev * (royalty / 100);
        const taxable = Math.max(0, rev - roy - (prod * opexBase / 1e6));
        const taxes = taxable * (taxRate / 100);
        return rev - roy - (prod * opexBase / 1e6) - taxes;
      });
      return { variant: `${v}%`, npv: calculateNPV(ncf, discountRate / 100, false) };
    });
  }, [cashFlowData, oilPrice, royalty, discountRate, opexBase, taxRate]);

  return (
    <div className="flex flex-col h-full bg-[#030406] text-white p-4 gap-4 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center relative z-10 shrink-0">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 leading-none">
            <DollarSign className="text-emerald-500" size={28} />
            Module 13: Economics <span className="text-emerald-500/50">& Fiscal Modeling</span>
          </h2>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-[10px] uppercase font-black text-emerald-500/60 tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
              Value Engineering Terminal
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-xl shrink-0">
          {[
            { id: 1, label: 'Value Stream', icon: Activity },
            { id: 2, label: 'Indicator Grid', icon: Target },
            { id: 3, label: 'Risk Matrix', icon: AlertTriangle },
            { id: 4, label: 'Lifecycle', icon: Zap }
          ].map(phase => (
            <button
              key={phase.id}
              onClick={() => setActivePhase(phase.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all relative overflow-hidden group",
                activePhase === phase.id 
                  ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  : "text-slate-500 hover:text-white"
              )}
            >
              <phase.icon size={12} className={activePhase === phase.id ? "animate-bounce" : ""} />
              {phase.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left: Controls */}
        <div className="lg:col-span-3 glass-card rounded-3xl p-8 border-white/5 flex flex-col gap-6 bg-[#05070a]/80 backdrop-blur-3xl relative overflow-hidden group min-h-0">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-transparent" />
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-3">
            <Settings size={14} className="text-emerald-500" />
            Fiscal Control Unit
          </h3>
          
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
            <InputWithSlider label="Oil Price ($/bbl)" value={oilPrice} onChange={setOilPrice} min={30} max={150} step={1} />
            <InputWithSlider label="CAPEX (MM$)" value={capex} onChange={setCapex} min={100} max={2000} step={50} />
            <InputWithSlider label="OPEX Load ($/bbl)" value={opexBase} onChange={setOpexBase} min={5} max={50} step={1} />
            <InputWithSlider label="Discounting (%)" value={discountRate} onChange={setDiscountRate} min={0} max={25} step={1} />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Royalty</label>
                <input type="number" value={royalty} onChange={e => setRoyalty(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm font-black text-emerald-400 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Taxation</label>
                <input type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm font-black text-emerald-400 outline-none" />
              </div>
            </div>
          </div>

          <div className="mt-auto p-6 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-3xl shrink-0">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic leading-none">Net Present Value</span>
                <Activity size={18} className="text-emerald-500 animate-pulse" />
             </div>
             <p className="text-3xl font-black italic tracking-tighter text-white leading-none">
               {formatNumber(indicators.npv, 0)}<span className="text-xs text-emerald-500/50 ml-2 uppercase font-bold tracking-widest">MM$</span>
             </p>
          </div>
        </div>

        {/* Center: 3D Visualizer */}
        <div className="lg:col-span-6 glass-card rounded-3xl border border-white/5 bg-[#05070a]/40 relative flex flex-col items-center justify-center overflow-hidden min-h-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent)]" />
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhase}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full h-full flex flex-col items-center justify-center p-10"
            >
              {activePhase === 1 && <DCFValueStream3D data={cashFlowData} />}
              {activePhase === 2 && <IndicatorCompass3D indicators={indicators} />}
              {activePhase === 3 && <SensitivityTower3D data={sensitivityData} />}
              {activePhase === 4 && <ProjectLifecycle3D stage={currentStep} capex={capex} opex={opexBase} npv={indicators.npv} />}
            </motion.div>
          </AnimatePresence>

          {activePhase === 4 && (
            <div className="absolute bottom-20 flex gap-4 bg-black/40 p-4 rounded-3xl border border-white/5 backdrop-blur-xl">
               <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 text-emerald-500 transition-all font-black">PREV</button>
               <button onClick={() => setCurrentStep(Math.min(4, currentStep + 1))} className="p-3 bg-emerald-500/20 rounded-xl hover:bg-emerald-500/30 text-emerald-500 transition-all font-black">NEXT STAGE</button>
            </div>
          )}

          <div className="absolute top-10 right-10 flex items-center gap-3 bg-black/20 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
             <span className="text-[11px] font-black uppercase tracking-widest text-emerald-500/80">Live Simulation Active</span>
          </div>
        </div>

        {/* Right: Telemetry */}
        <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
           <div className="glass-card rounded-3xl p-8 bg-[#05070a]/60 border border-white/5 flex-1 overflow-hidden flex flex-col min-h-0">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-6 flex items-center gap-3 shrink-0">
                <BarChart3 size={14} className="text-emerald-500" />
                Performance Telemetry
              </h4>
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                {[
                  { label: 'Internal Rate of Return', val: `${formatNumber(indicators.irr, 1)}%`, color: 'text-emerald-400' },
                  { label: 'Break-even Payout', val: `${formatNumber(indicators.payout, 2)} Yrs`, color: 'text-blue-400' },
                  { label: 'Profitability Index', val: formatNumber(indicators.pi, 2), color: 'text-amber-400' },
                  { label: 'Unit Tech Cost', val: `$${formatNumber(indicators.utc, 2)}`, color: 'text-rose-400' }
                ].map(it => (
                   <div key={it.label} className="p-5 bg-white/5 border border-white/5 rounded-3xl group hover:border-emerald-500/30 transition-all">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{it.label}</p>
                     <p className={cn("text-2xl font-black italic tracking-tighter", it.color)}>{it.val}</p>
                  </div>
                ))}
              </div>
           </div>

           <motion.div 
             onClick={handleOptimize}
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             className={cn(
               "glass-card rounded-3xl p-8 border h-28 flex items-center justify-between cursor-pointer transition-all relative overflow-hidden group shrink-0",
               optimizationComplete ? "bg-emerald-500/20 border-emerald-500/30" : "bg-emerald-500/5 border-emerald-500/10"
             )}
           >
              {isOptimizing && (
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: '100%' }}
                   transition={{ duration: 2 }}
                   className="absolute bottom-0 left-0 h-1 bg-emerald-500 shadow-[0_0_15px_#10b981]" 
                 />
              )}
              <div className="relative z-10">
                <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest italic mb-1">
                  {isOptimizing ? "Computing Ideal Strategy..." : "Compute State"}
                </p>
                <p className="text-sm font-bold text-white uppercase tracking-widest">
                  {isOptimizing ? "SCENARIO OPTIMIZATION" : optimizationComplete ? "ENGINEERING TARGET REACHED" : "OPTIMIZED"}
                </p>
              </div>
              <div className="relative z-10">
                 <Zap className={cn("text-emerald-500", isOptimizing ? "animate-spin" : "animate-pulse")} size={24} />
              </div>
              
              {/* Kinetic Glow Pulse */}
              <motion.div 
                animate={{ opacity: isOptimizing ? [0.1, 0.3, 0.1] : 0 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 bg-emerald-500 pointer-events-none" 
              />
           </motion.div>
        </div>
      </div>
    </div>
  );
}
