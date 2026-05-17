import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FlaskConical, 
  Settings2, 
  TrendingUp, 
  Activity, 
  ChevronRight,
  Target,
  Zap,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  ArrowRightCircle,
  BarChart3
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { calculateFCD, calculateInterventionNPV } from '../../lib/reservoir';

export function InterventionPlanning() {
  const [activeJob, setActiveJob] = useState<'frac' | 'acid' | 'workover'>('frac');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
       {/* Sidebar Control */}
       <div className="lg:col-span-3 space-y-4">
          {[
            { id: 'frac', label: 'Hydraulic Fracture', desc: 'Frac-half length & Conductivity', icon: Zap },
            { id: 'acid', label: 'Matrix Stimulation', icon: FlaskConical, desc: 'Acid volume & Skin reduction' },
            { id: 'workover', label: 'Workover Economics', icon: Calculator, desc: 'NPV & Payout of intervention' }
          ].map(job => (
             <motion.div 
                key={job.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveJob(job.id as any)}
                className={cn(
                  "glass-card rounded-2xl p-6 border-white/5 transition-all cursor-pointer",
                  activeJob === job.id ? "bg-cyan-500/10 ring-1 ring-cyan-500/50" : "bg-black/40 hover:bg-white/[0.02]"
                )}
             >
                <div className="flex items-center gap-4">
                   <div className={cn("p-3 rounded-2xl", activeJob === job.id ? "bg-cyan-500 text-black" : "bg-white/5 text-slate-500")}>
                      <job.icon size={18} />
                   </div>
                   <div>
                      <h4 className={cn("text-xs font-black uppercase italic tracking-wider", activeJob === job.id ? "text-cyan-400" : "text-white")}>{job.label}</h4>
                      <p className="text-[11px] text-slate-600 italic mt-0.5">{job.desc}</p>
                   </div>
                </div>
             </motion.div>
          ))}

          <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-indigo-900/40 to-black border-white/5 mt-8">
             <div className="flex items-center gap-3 mb-6">
                <ShieldCheck size={18} className="text-cyan-400" />
                <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Job Readiness</h5>
             </div>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                   <span className="text-[11px] text-slate-400 uppercase font-black uppercase tracking-widest">HSE Permit - APPROVED</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                   <span className="text-[11px] text-slate-400 uppercase font-black uppercase tracking-widest">Well Isolation - READY</span>
                </div>
                <div className="flex items-center gap-3 text-amber-500">
                   <AlertTriangle size={10} />
                   <span className="text-[11px] uppercase font-black tracking-widest">Waiting on Logistics</span>
                </div>
             </div>
          </div>
       </div>

       {/* Simulation Area */}
       <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
             {activeJob === 'frac' && <FracPlanning key="frac" />}
             {activeJob === 'acid' && <AcidPlanning key="acid" />}
             {activeJob === 'workover' && <WorkoverEconomics key="workover" />}
          </AnimatePresence>
       </div>
    </div>
  );
}

function FracPlanning() {
  const [kf, setKf] = useState(50000); // md
  const [w, setW] = useState(0.01); // ft
  const [k, setK] = useState(0.5); // md
  const [xf, setXf] = useState(250); // ft

  const fcd = calculateFCD(kf, w, k, xf);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a]"
    >
       <div className="flex items-center justify-between mb-12">
          <div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Frac <span className="text-cyan-500">Design Estimator</span></h3>
             <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Simple PKN/KGD Geometric & Conductivity Model</p>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center px-10">
             <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest block mb-1">Dimensionless FCD</span>
             <span className={cn("text-3xl font-black italic", fcd > 10 ? "text-emerald-400" : "text-white")}>{formatNumber(fcd, 2)}</span>
             <p className="text-[10px] text-slate-700 uppercase mt-1">High conductivity {">"} 10</p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
             <InputGroup label="Proppant Perm (kf)" unit="MD" value={kf} onChange={setKf} step={1000} />
             <InputGroup label="Fracture Width (w)" unit="FT" value={w} onChange={setW} step={0.001} min={0.005} max={0.1} />
             <InputGroup label="Formation Perm (k)" unit="MD" value={k} onChange={setK} step={0.1} min={0.1} max={50} />
             <InputGroup label="Half Length (xf)" unit="FT" value={xf} onChange={setXf} step={10} min={50} max={1000} />
          </div>

          <div className="flex flex-col justify-center">
             <div className="glass-card rounded-3xl p-6 border-white/5 bg-black/40">
                 <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6">3D Fracture Propagation</h4>
                 <div className="h-[300px] flex items-center justify-center relative">
                    <FractureSimulator3D xf={xf} w={w} fcd={fcd} />
                 </div>
                 <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Proppant Flow</span>
                    <span>Est. Reach: {xf} FT</span>
                 </div>
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function FractureSimulator3D({ xf, w, fcd }: { xf: number, w: number, fcd: number }) {
  // Map xf (50-1000) to visual length (20-180)
  const visualLength = Math.max(20, Math.min(180, (xf / 1000) * 180));
  // Map width (0.005-0.1) to visual width (2-30)
  const visualWidth = Math.max(2, Math.min(30, (w / 0.1) * 30));
  
  // High FCD -> fast flow, Low FCD -> slow flow
  const flowSpeed = Math.max(0.2, 3 / Math.max(0.1, fcd));
  
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full max-w-[300px]">
       <rect x="0" y="0" width="200" height="200" fill="#0f172a" rx="20" />
       
       {/* Stress field gradient */}
       <defs>
          <radialGradient id="stress" cx="50%" cy="50%" r="50%">
             <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
             <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
       </defs>
       <rect x="0" y="0" width="200" height="200" fill="url(#stress)" />

       {/* Wellbore */}
       <rect x="96" y="0" width="8" height="200" fill="#334155" stroke="#1e293b" />
       
       {/* Fracture Body */}
       <motion.rect 
          x={100 - visualLength/2}
          y={100 - visualWidth/2} 
          width={visualLength}
          height={visualWidth} 
          fill="#0ea5e9"
          rx={visualWidth/4}
          animate={{ 
             opacity: [0.6, 0.9, 0.6],
             height: [visualWidth * 0.9, visualWidth * 1.1, visualWidth * 0.9]
          }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{ transformOrigin: "center" }}
       />
       
       {/* Proppant Flow Particles */}
       {[...Array(30)].map((_, i) => {
          const isRight = Math.random() > 0.5;
          const targetX = 100 + (isRight ? 1 : -1) * (Math.random() * (visualLength/2));
          const targetY = 100 + (Math.random() - 0.5) * visualWidth;
          
          return (
             <motion.circle key={i} r="1.5" fill="#fff"
                initial={{ cx: 100, cy: 100 }}
                animate={{ 
                   cx: targetX,
                   cy: targetY,
                   opacity: [0, 1, 0]
                }}
                transition={{ repeat: Infinity, duration: flowSpeed, delay: Math.random() * flowSpeed }}
             />
          );
       })}
    </svg>
  );
}

function AcidPlanning() {
  const [acidType, setAcidType] = useState('HCl 15% (Standard Carbonate)');
  const [formationType, setFormationType] = useState('Carbonate');
  const [thickness, setThickness] = useState(50);
  const [initialSkin, setInitialSkin] = useState(8.5);

  const galPerFt = formationType === 'Carbonate' ? (acidType.includes('15%') ? 150 : 200) : 100;
  const volume = thickness * galPerFt;
  
  const skinReduction = initialSkin * 0.7 + (volume / 5000);
  const finalSkin = Math.max(-4.5, initialSkin - skinReduction);
  
  const lnReRw = Math.log(1000 / 0.328); // typical Re/Rw
  const initialPI = 1 / (lnReRw + initialSkin);
  const finalPI = 1 / (lnReRw + finalSkin);
  const piIncreaseFactor = finalPI / initialPI;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a]"
    >
       <div className="mb-12">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Acid <span className="text-emerald-500">Stimulation Matrix</span></h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">HCl/Mud Acid Volume & Concentration Design</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Formation Litology</label>
                <div className="grid grid-cols-2 gap-4">
                   {['Carbonate', 'Sandstone'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setFormationType(t)}
                        className={cn(
                          "p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all",
                          formationType === t ? "bg-emerald-500 text-black border-emerald-500" : "bg-white/5 text-slate-500 border-white/5"
                        )}
                      >
                         {t}
                      </button>
                   ))}
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Acid Formulation</label>
                <select value={acidType} onChange={(e) => setAcidType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] text-white outline-none focus:ring-1 focus:ring-emerald-500">
                   <option>HCl 15% (Standard Carbonate)</option>
                   <option>HCl/HF 12:3 (Mud Acid)</option>
                   <option>HAc 10% (Organic Acid)</option>
                </select>
             </div>
             
             <InputGroup label="Pay Thickness (h)" unit="FT" value={thickness} onChange={setThickness} min={10} max={500} step={10} />
             <InputGroup label="Initial Skin (S)" unit="DIM" value={initialSkin} onChange={setInitialSkin} min={0} max={50} step={0.5} />
          </div>

          <div className="space-y-8">
             <div className="grid grid-cols-2 gap-6">
                 <div className="p-8 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <span className="text-[10px] text-slate-400 uppercase font-bold mb-2 block">Final Skin</span>
                    <span className="text-4xl font-black text-white italic tracking-tighter">{finalSkin.toFixed(1)}</span>
                 </div>
                 <div className="p-8 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <span className="text-[10px] text-slate-400 uppercase font-bold mb-2 block">PI Increase Factor</span>
                    <span className="text-4xl font-black text-emerald-400 italic tracking-tighter">{piIncreaseFactor.toFixed(1)}x</span>
                 </div>
             </div>

             <div className="p-8 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                   <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Volume Recommendation</h5>
                   <p className="text-[11px] text-slate-600 italic uppercase tracking-widest font-bold">Based on {galPerFt} gal/ft rule</p>
                </div>
                <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-black text-white">{formatNumber(volume, 0)}</span>
                   <span className="text-xs font-bold text-slate-500 uppercase">Gal</span>
                </div>
             </div>
             
             <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4">3D Matrix Dissolution (Wormholing)</h4>
                <div className="h-[200px] flex items-center justify-center">
                   <MatrixStimulationSimulator3D volume={volume} />
                </div>
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function MatrixStimulationSimulator3D({ volume }: { volume: number }) {
  const intensity = Math.min(40, Math.floor(volume / 500));
  const speed = Math.max(1, 5 - (volume / 5000));
  
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full max-w-[300px]">
       <rect x="0" y="0" width="300" height="200" fill="#1e293b" rx="20" />
       
       <defs>
          <radialGradient id="acidGrad" cx="50%" cy="50%" r="50%">
             <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
             <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
          </radialGradient>
       </defs>
       
       {/* Dissolution area growing */}
       <motion.rect x="0" y="0" width="300" height="200" fill="url(#acidGrad)"
          initial={{ opacity: 0.2, scale: 0.8 }}
          animate={{ opacity: 0.8, scale: 1.2 }}
          transition={{ repeat: Infinity, duration: speed * 2, ease: "easeInOut" }}
          style={{ transformOrigin: "center" }}
       />

       {/* Wellbore */}
       <rect x="140" y="0" width="20" height="200" fill="#334155" stroke="#0f172a" />
       
       {/* Perforations & Wormholes */}
       {[30, 70, 110, 150].map(y => (
          <g key={y}>
            <rect x="135" y={y} width="30" height="6" fill="#000" />
            
            {/* Wormholes propagating outwards */}
            {[...Array(Math.floor(intensity / 4))].map((_, i) => {
               const length = 20 + Math.random() * 60;
               const duration = speed * (0.8 + Math.random() * 0.4);
               return (
                 <React.Fragment key={i}>
                    {/* Left side */}
                    <motion.path 
                       d={`M 140 ${y+3} Q ${140 - length/2} ${y+3 + (Math.random()-0.5)*20} ${140 - length} ${y+3 + (Math.random()-0.5)*40}`}
                       stroke="#10b981" fill="none" strokeWidth={1 + Math.random() * 2} strokeLinecap="round"
                       initial={{ pathLength: 0, opacity: 0.8 }}
                       animate={{ pathLength: 1, opacity: [0.2, 1, 0.2] }}
                       transition={{ repeat: Infinity, duration: duration, ease: "easeOut" }}
                    />
                    {/* Right side */}
                    <motion.path 
                       d={`M 160 ${y+3} Q ${160 + length/2} ${y+3 + (Math.random()-0.5)*20} ${160 + length} ${y+3 + (Math.random()-0.5)*40}`}
                       stroke="#10b981" fill="none" strokeWidth={1 + Math.random() * 2} strokeLinecap="round"
                       initial={{ pathLength: 0, opacity: 0.8 }}
                       animate={{ pathLength: 1, opacity: [0.2, 1, 0.2] }}
                       transition={{ repeat: Infinity, duration: duration, ease: "easeOut" }}
                    />
                 </React.Fragment>
               );
            })}
          </g>
       ))}
    </svg>
  );
}

function WorkoverEconomics() {
  const [cost, setCost] = useState(350000);
  const [incOil, setIncOil] = useState(150);
  const [oilPrice, setOilPrice] = useState(75);
  const [discountRate, setDiscountRate] = useState(10); // %

  const monthlyRev = incOil * oilPrice * 30 * 0.8; // 80% net revenue
  const payoutMonths = cost / monthlyRev;
  
  // Calculate 12-month NPV
  let npv = -cost;
  for (let m = 1; m <= 12; m++) {
     npv += monthlyRev / Math.pow(1 + (discountRate/100)/12, m);
  }
  
  const roi = (npv / cost) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a]"
    >
       <div className="mb-12">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Workover <span className="text-indigo-400">Financials</span></h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Capital Efficiency & Payout Assessment</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
             <InputGroup label="Workover Cost" unit="USD" value={cost} onChange={setCost} step={5000} min={10000} max={5000000} />
             <InputGroup label="Incremental Production" unit="STB/D" value={incOil} onChange={setIncOil} min={10} max={5000} />
             <InputGroup label="Price Deck" unit="$/BBL" value={oilPrice} onChange={setOilPrice} min={20} max={150} />
             <InputGroup label="Discount Rate" unit="%" value={discountRate} onChange={setDiscountRate} min={0} max={30} step={1} />
          </div>

          <div className="space-y-8 flex flex-col justify-center">
             <div className="grid grid-cols-2 gap-6">
                <div className="p-8 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Est. Payout</span>
                   <span className="text-4xl font-black text-white italic tracking-tighter">{formatNumber(payoutMonths, 1)} <span className="text-sm font-normal text-slate-500">MO</span></span>
                </div>
                <div className="p-8 bg-white/5 border border-white/5 rounded-2xl">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">12-Mo NPV</span>
                   <span className={cn("text-3xl font-black italic tracking-tighter", npv > 0 ? "text-emerald-400" : "text-red-400")}>${formatNumber(npv, 0)}</span>
                </div>
             </div>
             
             <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4">Cumulative Cash Flow (12 Months)</h4>
                <div className="h-[250px]">
                   <PayoutSimulator3D cost={cost} monthlyRev={monthlyRev} discount={discountRate} />
                </div>
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function PayoutSimulator3D({ cost, monthlyRev, discount }: { cost: number, monthlyRev: number, discount: number }) {
   const months = 12;
   const data = [];
   let cumCash = -cost;
   for (let m = 0; m <= months; m++) {
      if (m > 0) {
         cumCash += monthlyRev / Math.pow(1 + (discount/100)/12, m);
      }
      data.push({ month: m, cash: cumCash });
   }

   // We want to draw a dynamic area chart representing the cumulative cash flow filling up
   const minCash = Math.min(...data.map(d => d.cash));
   const maxCash = Math.max(...data.map(d => d.cash));
   const range = maxCash - minCash;
   
   return (
      <svg viewBox="0 0 300 200" className="w-full h-full max-w-[400px] mx-auto">
         {/* Zero line */}
         <line x1="30" y1={200 - ((0 - minCash) / range) * 180 - 10} x2="280" y2={200 - ((0 - minCash) / range) * 180 - 10} stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />
         
         {/* Area path built manually for animation */}
         <defs>
            <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
               <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
            </linearGradient>
            <clipPath id="wipeClip">
               <motion.rect x="30" y="0" width="250" height="200"
                  initial={{ width: 0 }}
                  animate={{ width: 250 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
               />
            </clipPath>
         </defs>
         
         <g clipPath="url(#wipeClip)">
            {data.map((d, i) => {
               if (i === 0) return null;
               const prev = data[i-1];
               const x1 = 30 + ((i-1) / months) * 250;
               const y1 = 200 - ((prev.cash - minCash) / range) * 180 - 10;
               const x2 = 30 + (i / months) * 250;
               const y2 = 200 - ((d.cash - minCash) / range) * 180 - 10;
               const zeroY = 200 - ((0 - minCash) / range) * 180 - 10;
               
               // Draw the segment
               return (
                  <path key={i} d={`M ${x1} ${zeroY} L ${x1} ${y1} L ${x2} ${y2} L ${x2} ${zeroY} Z`} fill="url(#cashGrad)" stroke="#1e293b" strokeWidth="1" />
               );
            })}
            
            {/* Draw line */}
            <path d={`M ${data.map((d, i) => `${30 + (i / months) * 250} ${200 - ((d.cash - minCash) / range) * 180 - 10}`).join(' L ')}`} fill="none" stroke="#fff" strokeWidth="2" />
         </g>
         
         {/* Axis labels */}
         <text x="15" y="20" fill="#94a3b8" fontSize="8" className="uppercase font-bold tracking-widest">+CASH</text>
         <text x="15" y="190" fill="#94a3b8" fontSize="8" className="uppercase font-bold tracking-widest">-COST</text>
         <text x="260" y="195" fill="#94a3b8" fontSize="8" className="uppercase font-bold tracking-widest">12 MO</text>
      </svg>
   );
}

function InputGroup({ label, unit, value, onChange, min, max, step = 1 }: { label: string, unit: string, value: number, onChange: (v: number) => void, min?: number, max?: number, step?: number }) {
  return (
    <div className="space-y-3">
       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
       <div className="relative group">
          <input 
             type="number" 
             value={value}
             min={min}
             max={max}
             step={step}
             onChange={(e) => onChange(parseFloat(e.target.value))}
             className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-black text-white italic focus:ring-1 focus:ring-cyan-500 outline-none" 
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-700 italic uppercase">{unit}</span>
       </div>
    </div>
  );
}
