import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FlaskConical, 
  FlaskRound, 
  ShieldAlert, 
  Calculator, 
  TrendingDown, 
  CircleDollarSign,
  Droplets,
  Thermometer,
  Activity,
  History,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { calculateLSI, calculateSqueezeVolume } from '../../lib/reservoir';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export function ChemicalTreatment() {
  const [ph, setPh] = useState(7.2);
  const [ca, setCa] = useState(450);
  const [alk, setAlk] = useState(250);
  const [tds, setTds] = useState(15000);
  
  const [formationRad, setFormationRad] = useState(4.0);
  const [netPay, setNetPay] = useState(50.0);
  const [porosity, setPorosity] = useState(22.0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);

  const lsi = calculateLSI(ph, 150, ca, alk, tds);
  // Volume calculation: V = pi * r^2 * h * phi * 7.48
  // Use calculateSqueezeVolume which expects phi as fraction
  const squeezeVol = calculateSqueezeVolume(formationRad, netPay, porosity / 100);

  // Dynamic Squeeze Life Tracker data
  const tHalf = Math.max(10, 40 + (squeezeVol / 5000) - (Math.max(0, lsi) * 20));
  const squeezeData = Array.from({ length: 10 }, (_, i) => {
     const day = i * 20;
     const res = 100 * Math.exp(-0.693 * day / tHalf);
     return { day, res: parseFloat(res.toFixed(1)) };
  });
  const tLife = Math.round(tHalf * 4); // roughly when it hits ~5%

  const handleGeneratePlan = async () => {
     setIsGenerating(true);
     
     await new Promise(resolve => setTimeout(resolve, 500));
     
     try {
       const doc = new jsPDF();
       
       // Header
       doc.setFillColor(15, 23, 42);
       doc.rect(0, 0, 210, 40, 'F');
       
       doc.setTextColor(255, 255, 255);
       doc.setFontSize(24);
       doc.setFont('helvetica', 'bolditalic');
       doc.text('AstroCore / PetroStream', 14, 20);
       
       doc.setFontSize(10);
       doc.setFont('helvetica', 'normal');
       doc.setTextColor(16, 185, 129); // emerald-500
       doc.text('CHEMICAL TREATMENT & SCALE SQUEEZE DESIGN', 14, 30);
       
       doc.setTextColor(0, 0, 0);
       doc.setFontSize(12);
       doc.setFont('helvetica', 'bold');
       doc.text('Brine Analysis & Scaling Risk', 14, 50);
       
       const lsiStatus = lsi > 0.5 ? "SEVERE SCALING" : lsi > 0 ? "SLIGHT SCALING" : "STABLE / CORROSIVE";
       
       autoTable(doc, {
         startY: 55,
         theme: 'grid',
         headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
         head: [['pH Level', 'Calcium (mg/L)', 'Alkalinity (mg/L)', 'TDS (mg/L)', 'LSI', 'Risk']],
         body: [[
           ph.toFixed(1), 
           ca.toString(), 
           alk.toString(), 
           tds.toString(), 
           lsi.toFixed(2), 
           lsiStatus
         ]],
       });
       
       const currentY = (doc as any).lastAutoTable.finalY + 15;
       
       doc.setFontSize(12);
       doc.setFont('helvetica', 'bold');
       doc.text('Treatment Design Parameters', 14, currentY);
       
       autoTable(doc, {
         startY: currentY + 5,
         theme: 'grid',
         headStyles: { fillColor: [6, 182, 212], textColor: [255, 255, 255] },
         head: [['Parameter', 'Value', 'Unit']],
         body: [
           ['Target Formation Radius', formationRad.toFixed(1), 'FT'],
           ['Net Pay Thickness', netPay.toFixed(1), 'FT'],
           ['Formation Porosity', porosity.toFixed(1), '%'],
           ['Total Calculated Fluid', Math.round(squeezeVol).toString(), 'GAL'],
           ['Estimated Squeeze Life', tLife.toString(), 'Days']
         ],
       });
       
       const finalY = (doc as any).lastAutoTable.finalY + 15;
       
       doc.setFontSize(12);
       doc.setFont('helvetica', 'bold');
       doc.text('Pumping Schedule (Volume Allocation)', 14, finalY);
       
       autoTable(doc, {
         startY: finalY + 5,
         theme: 'striped',
         headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
         head: [['Stage', 'Fluid Type', 'Volume Fraction', 'Volume (GAL)']],
         body: [
           ['Stage 1', 'Pre-Flush (Brine/Surfactant)', '10%', Math.round(squeezeVol * 0.1).toString()],
           ['Stage 2', 'Main Pill (PPh-42 Inhibitor)', '30%', Math.round(squeezeVol * 0.3).toString()],
           ['Stage 3', 'Over-Flush (Displacement)', '60%', Math.round(squeezeVol * 0.6).toString()]
         ],
       });
       
       doc.save('AstroCore_Chemical_Treatment_Plan.pdf');
       setPlanGenerated(true);
     } catch (err) {
       console.error(err);
     } finally {
       setIsGenerating(false);
     }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
      {/* Sidebar - Parameter Input */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Activity size={16} className="text-emerald-400" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Brine Analysis</h4>
           </div>
           
           <div className="space-y-6">
              <InputSlide label="pH Level" val={ph} setVal={setPh} min={4} max={10} step={0.1} />
              <InputSlide label="Calcium (mg/l)" val={ca} setVal={setCa} min={0} max={2000} />
              <InputSlide label="Alkalinity (mg/l)" val={alk} setVal={setAlk} min={0} max={1000} />
              <InputSlide label="TDS (mg/l)" val={tds} setVal={setTds} min={0} max={100000} step={500} />
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-red-900/40 to-black border-red-500/10">
           <div className="flex items-center gap-3 mb-6">
              <ShieldAlert size={18} className="text-red-500" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Scaling Risk</h5>
           </div>
           <div className="text-center">
              <span className={cn(
                "text-4xl font-black italic tracking-tighter",
                lsi > 0.5 ? "text-red-500" : lsi > 0 ? "text-amber-500" : "text-emerald-500"
              )}>{formatNumber(lsi, 2)}</span>
              <p className="text-[11px] text-slate-500 uppercase mt-2 tracking-widest font-bold">
                {lsi > 0.5 ? "SEVERE SCALING" : lsi > 0 ? "SLIGHT SCALING" : "STABLE / CORROSIVE"}
              </p>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-9 space-y-8">
        <div className="flex items-center justify-between">
           <div>
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Scale & <span className="text-emerald-500">Chem. Treatment</span></h3>
              <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Saturation Index Prediction & Squeeze Design</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Inhibitor Residual Return */}
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a]">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <History className="text-emerald-500" size={20} />
                    <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Squeeze Life Tracker</h4>
                 </div>
                 <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <span className="text-[11px] font-black text-emerald-400">T_life: {tLife} Days</span>
                 </div>
              </div>
              <div className="h-[250px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={squeezeData}>
                       <defs>
                          <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                       <XAxis dataKey="day" stroke="#475569" fontSize={10} label={{ value: 'Days Post Squeeze', position: 'insideBottom', offset: -5, fontSize: 8, fill: '#475569' }} />
                       <YAxis stroke="#475569" fontSize={10} label={{ value: 'PPM', angle: -90, position: 'insideLeft', fontSize: 8, fill: '#475569' }} />
                       <Tooltip />
                       <Area type="monotone" dataKey="res" stroke="#10b981" fill="url(#colorRes)" strokeWidth={3} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Cost Optimizer */}
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a]">
              <div className="flex items-center gap-3 mb-8">
                 <CircleDollarSign className="text-amber-500" size={20} />
                 <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Capex vs Opex Path</h4>
              </div>
              <div className="space-y-4">
                 <TreatmentOption label="Squeeze Treatment" cost="$45,000 / event" frequency="Every 6 Mo" active />
                 <TreatmentOption label="Continuous Injection" cost="$12,500 / month" frequency="Daily Inline" />
                 <TreatmentOption label="Batch Circulation" cost="$8,200 / batch" frequency="Monthly" />
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-400" size={14} />
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Recommended Strategy</span>
                 </div>
                 <span className="text-[10px] font-black text-white uppercase italic">Squeeze Program</span>
              </div>
           </div>
        </div>

        {/* Squeeze Design Calculator */}
        <div className="glass-card rounded-3xl p-12 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-10">
              <Calculator className="text-cyan-500" size={20} />
              <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Squeeze Volume Designer</h4>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <InputSlide label="Target Form. Radius (ft)" val={formationRad} setVal={setFormationRad} min={1} max={15} step={0.5} />
                 <InputSlide label="Net Pay (ft)" val={netPay} setVal={setNetPay} min={10} max={200} step={5} />
                 <InputSlide label="Porosity (%)" val={porosity} setVal={setPorosity} min={5} max={35} step={1} />
                 
                 <div className="p-8 bg-white/5 rounded-2xl border border-white/5 flex flex-col justify-center mt-8">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Calculated Fluid</span>
                    <span className="text-4xl font-black text-white italic tracking-tighter">{formatNumber(squeezeVol, 0)} <span className="text-sm font-normal text-slate-500">GAL</span></span>
                 </div>
              </div>
              
              <div className="glass-card rounded-2xl p-8 border-white/5 bg-[#05070a]">
                 <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Kinetic Squeeze Injection Simulator</h4>
                 <div className="h-[250px] flex items-center justify-center">
                    <SqueezeSimulator3D targetRadius={formationRad} volume={squeezeVol} />
                 </div>
              </div>
           </div>

           <div className="mt-10 p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-3xl flex flex-col gap-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <FlaskRound className="text-cyan-400" size={22} />
                    <div>
                       <span className="text-[10px] font-black text-white uppercase tracking-widest block">Inhibitor Blend</span>
                       <span className="text-[11px] text-slate-500 uppercase">PPh-42 Base (Polyphosphonate)</span>
                    </div>
                 </div>
                 {!planGenerated ? (
                    <button 
                       onClick={handleGeneratePlan}
                       disabled={isGenerating}
                       className="px-8 py-3 bg-cyan-500 rounded-2xl text-[10px] font-black text-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50"
                    >
                       {isGenerating ? "Processing..." : "Generate Treatment Plan"}
                    </button>
                 ) : (
                    <div className="px-6 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-xl flex items-center gap-2">
                       <CheckCircle2 size={14} className="text-emerald-400" />
                       <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Plan Ready</span>
                    </div>
                 )}
              </div>
              
              <AnimatePresence>
                 {planGenerated && (
                    <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className="pt-6 border-t border-cyan-500/20 grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                       <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recommended Pre-Flush</span>
                          <span className="block text-[11px] font-black text-white">{formatNumber(squeezeVol * 0.1, 0)} GAL (10% Vol)</span>
                       </div>
                       <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Pill (Inhibitor)</span>
                          <span className="block text-[11px] font-black text-white">{formatNumber(squeezeVol * 0.3, 0)} GAL (30% Vol)</span>
                       </div>
                       <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Over-Flush (Displacement)</span>
                          <span className="block text-[11px] font-black text-white">{formatNumber(squeezeVol * 0.6, 0)} GAL (60% Vol)</span>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}

function SqueezeSimulator3D({ targetRadius, volume }: { targetRadius: number, volume: number }) {
  // Map radius (1-15) to visual radius (20-100)
  const visualRad = Math.max(20, Math.min(100, (targetRadius / 15) * 100));
  // Pumping speed based on volume (larger volume = longer animation cycle)
  const cycleSpeed = Math.max(2, 6 - (volume / 50000));

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full max-w-[250px]">
       <rect x="0" y="0" width="300" height="300" fill="#0f172a" rx="20" />
       
       {/* Background Matrix */}
       <defs>
          <pattern id="matrix" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
             <circle cx="2" cy="2" r="1" fill="#334155" opacity="0.3" />
          </pattern>
          <radialGradient id="squeezeGrad" cx="50%" cy="50%" r="50%">
             <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
             <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.2" />
             <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
       </defs>
       <rect x="0" y="0" width="300" height="300" fill="url(#matrix)" />

       {/* Squeeze Fluid Propagation */}
       <motion.circle 
          cx="150" cy="150" 
          fill="url(#squeezeGrad)"
          initial={{ r: 10, opacity: 0 }}
          animate={{ r: visualRad, opacity: [0.2, 0.8, 0.2] }}
          transition={{ repeat: Infinity, duration: cycleSpeed, ease: "easeInOut" }}
       />
       <motion.circle 
          cx="150" cy="150" 
          stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 4" fill="none"
          initial={{ r: 10, opacity: 0 }}
          animate={{ r: visualRad, opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: cycleSpeed, ease: "easeOut" }}
       />

       {/* Central Wellbore */}
       <circle cx="150" cy="150" r="12" fill="#1e293b" stroke="#475569" strokeWidth="3" />
       <circle cx="150" cy="150" r="6" fill="#06b6d4" />
       
       {/* Fluid flow arrows exiting wellbore */}
       {[0, 90, 180, 270].map((angle, i) => (
          <motion.path key={i}
             d="M 150 140 L 150 120 M 145 125 L 150 120 L 155 125"
             stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
             style={{ transformOrigin: "150px 150px", rotate: angle }}
             initial={{ opacity: 0, y: 0 }}
             animate={{ opacity: [0, 1, 0], y: -10 }}
             transition={{ repeat: Infinity, duration: cycleSpeed/2, delay: i * 0.2 }}
          />
       ))}
    </svg>
  );
}

function InputSlide({ label, val, setVal, min, max, step = 1 }: { label: string, val: number, setVal: (v: number) => void, min: number, max: number, step?: number }) {
  return (
    <div className="space-y-4">
       <div className="flex justify-between items-baseline">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
          <span className="text-[11px] font-black text-white font-mono">{val}</span>
       </div>
       <input 
          type="range" min={min} max={max} step={step} value={val} 
          onChange={(e) => setVal(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
       />
    </div>
  );
}

function TreatmentOption({ label, cost, frequency, active }: { label: string, cost: string, frequency: string, active?: boolean }) {
  return (
    <div className={cn(
       "p-5 rounded-2xl border transition-all cursor-pointer",
       active ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20" : "bg-white/5 border-white/5 hover:bg-white/[0.08]"
    )}>
       <div className="flex justify-between items-start mb-1">
          <span className={cn("text-[10px] font-black uppercase tracking-widest", active ? "text-emerald-400" : "text-white")}>{label}</span>
          {active && <Zap size={10} className="text-emerald-400" />}
       </div>
       <div className="flex justify-between items-baseline">
          <span className="text-xs font-black text-white italic">{cost}</span>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{frequency}</span>
       </div>
    </div>
  );
}

function DesignMetric({ label, val, unit }: { label: string, val: string, unit: string }) {
  return (
    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 block">{label}</span>
       <div className="flex items-baseline gap-2">
          <span className="text-lg font-black text-slate-400 italic">{val}</span>
          <span className="text-[10px] text-slate-700 font-bold uppercase">{unit}</span>
       </div>
    </div>
  );
}
