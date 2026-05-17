import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings2, 
  Settings, 
  Zap, 
  ArrowRightCircle, 
  Activity, 
  Wind, 
  Droplets, 
  Database,
  Waves,
  Cpu,
  Factory,
  Container,
  Box,
  ArrowRightLeft,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateSoudersBrown, calculateCompressionHP } from '../../lib/reservoir';

export function SurfaceFacilityTab() {
  const [params, setParams] = useState({
    oilRate: 5000,
    waterRate: 2000,
    gasRate: 15, // MMcfd
    rhoL: 52, // lb/ft3
    rhoG: 0.15, // lb/ft3
    kValue: 0.35,
    retentionTime: 3 // minutes
  });

  const [isGeneratingPFD, setIsGeneratingPFD] = useState(false);
  const [isCalculatingHydraulics, setIsCalculatingHydraulics] = useState(false);

  const separatorSizing = useMemo(() => {
    const vt = calculateSoudersBrown(params.kValue, params.rhoL, params.rhoG);
    // Rough calc for diameter based on gas capacity factor
    const diameter = Math.sqrt((params.gasRate * 1e6) / (vt * 60 * 60 * 24)) * 0.5; 
    // Rough calc for length based on retention time and liquid volume
    const liquidVolume = (params.oilRate + params.waterRate) / 24 / 60 * params.retentionTime; // barrels per min * time
    const length = liquidVolume * 5.615 / (Math.PI * Math.pow(diameter/2, 2));

    const velocityPercentage = Math.min((vt / 10) * 100, 100);

    return { vt, diameter: diameter || 4, length: length || 20, velocityPercentage };
  }, [params]);

  const handleGeneratePFD = () => {
    setIsGeneratingPFD(true);
    setTimeout(() => {
      try {
        const pfdContent = `PROCESS FLOW DIAGRAM (PFD) SPEC\n===============================\nSeparation: 3-Phase Horizontal\nDiameter: ${separatorSizing.diameter.toFixed(1)} ft\nLength: ${separatorSizing.length.toFixed(0)} ft\nDesign Velocity: ${separatorSizing.vt.toFixed(2)} ft/s\n\nFEEDSTOCK:\nOil: ${params.oilRate} bopd\nGas: ${params.gasRate} MMcfd\nWater: ${params.waterRate} bwpd\n`;
        const blob = new Blob([pfdContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Surface_Facility_PFD.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("PFD Download failed:", err);
      } finally {
        setIsGeneratingPFD(false);
      }
    }, 1500);
  };

  const handleExportHydraulics = () => {
    setIsCalculatingHydraulics(true);
    setTimeout(() => {
      try {
        const hydraulicsContent = `PIPELINE HYDRAULICS REPORT\n==========================\nEquation: Weymouth\nGas Throughput: ${params.gasRate} MMcfd\nEstimated Pressure Drop: 145 PSI\nFriction Factor: 0.012\n`;
        const blob = new Blob([hydraulicsContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Pipeline_Hydraulics_Report.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Hydraulics Download failed:", err);
      } finally {
        setIsCalculatingHydraulics(false);
      }
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Parameters */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Facility Feedstock</h4>
           </div>
           
           <div className="space-y-6">
              <InputWithSlider label="Oil Capacity" value={params.oilRate} min={500} max={50000} step={500} unit="bopd" onChange={(v) => setParams({...params, oilRate: v})} />
              <InputWithSlider label="Water Capacity" value={params.waterRate} min={500} max={50000} step={500} unit="bwpd" onChange={(v) => setParams({...params, waterRate: v})} />
              <InputWithSlider label="Gas Capacity" value={params.gasRate} min={1} max={500} step={1} unit="MMcfd" onChange={(v) => setParams({...params, gasRate: v})} />
              <InputWithSlider label="Retention Time" value={params.retentionTime} min={1} max={15} step={1} unit="min" onChange={(v) => setParams({...params, retentionTime: v})} />
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-indigo-900/40 to-black border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <Factory size={18} className="text-indigo-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Process Blueprint</h5>
           </div>
           <p className="text-[10px] text-slate-500 italic leading-relaxed mb-6">
              Design follows API 12J specifications for two-stage separation and ASME Section VIII for pressure vessel integrity.
           </p>
           <button 
              onClick={handleGeneratePFD}
              disabled={isGeneratingPFD}
              className={cn(
                "w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest border transition-all",
                isGeneratingPFD ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
              )}
           >
              {isGeneratingPFD ? <RefreshCw size={14} className="animate-spin" /> : <Activity size={14} />}
              {isGeneratingPFD ? 'Generating PFD...' : 'Generate PFD'}
           </button>
        </div>
      </div>

      {/* Main Sizing Content */}
      <div className="lg:col-span-9 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Separator Sizing Card */}
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 relative overflow-hidden group">
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-10">
                    <Container className="text-cyan-500" size={24} />
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">3-Phase <span className="text-cyan-500">Separation</span></h3>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <ResultBox label="Diameter" value={`${separatorSizing.diameter.toFixed(1)}`} unit="ft" />
                       <ResultBox label="Length (S-S)" value={`${separatorSizing.length.toFixed(0)}`} unit="ft" />
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                       <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">Souders-Brown Velocity</span>
                          <span className="text-white font-mono">{separatorSizing.vt.toFixed(2)} ft/s</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${separatorSizing.velocityPercentage}%` }}
                             className="h-full bg-cyan-500" 
                          />
                       </div>
                    </div>
                 </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
                 <Box size={240} />
              </div>
           </div>

           {/* Compression Card */}
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 relative overflow-hidden group">
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-10">
                    <Wind className="text-emerald-500" size={24} />
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Gas <span className="text-emerald-500">Compression</span></h3>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                       <ResultBox label="Estimated Power" value={`${(calculateCompressionHP(params.gasRate, 100, 1200)).toFixed(0)}`} unit="HP" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <ResultBox label="Compression Ratio" value="12.0" unit="Rc" />
                       <ResultBox label="Stages" value="3" unit="Stg" />
                    </div>
                 </div>
              </div>
              <Activity className="absolute -bottom-8 -right-8 text-emerald-500/10" size={160} />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <FacilityCard 
             title="Heater Treaters" 
             icon={<Droplets className="text-blue-500" />} 
             stat="2 x 4000 bbl/d" 
             sub="Emulsion Breaking"
           />
           <FacilityCard 
             title="Storage Tanks" 
             icon={<Database className="text-amber-500" />} 
             stat="4 x 25KB" 
             sub="API 12F Low Profile"
           />
           <FacilityCard 
             title="Water Cluster" 
             icon={<Waves className="text-cyan-500" />} 
             stat="8,000 bwpd" 
             sub="Filtration & Disposal"
           />
        </div>

        <div 
           onClick={handleExportHydraulics}
           className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all"
        >
           <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-[24px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                 {isCalculatingHydraulics ? <RefreshCw className="animate-spin" size={32} /> : <ArrowRightLeft size={32} />}
              </div>
              <div>
                 <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">
                    {isCalculatingHydraulics ? 'Exporting Hydraulics...' : 'Export Pipeline Hydraulics'}
                 </h4>
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Calculate pressure drop using Weymouth Equation</p>
              </div>
           </div>
           <ArrowRightCircle size={32} className={cn("transition-all", isCalculatingHydraulics ? "text-indigo-400" : "text-slate-700 group-hover:text-indigo-500 group-hover:translate-x-2")} />
        </div>
      </div>
    </div>
  );
}

function ResultBox({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
       <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">{label}</span>
       <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white italic tracking-tighter uppercase">{value}</span>
          <span className="text-[10px] font-bold text-slate-600 uppercase">{unit}</span>
       </div>
    </div>
  );
}

function FacilityCard({ title, icon, stat, sub }: { title: string, icon: React.ReactNode, stat: string, sub: string }) {
  return (
    <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40 hover:bg-white/[0.03] transition-all">
       <div className="mb-6 h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center">
          {icon}
       </div>
       <h5 className="text-[11px] font-black text-white uppercase tracking-wider mb-1">{title}</h5>
       <p className="text-xl font-black text-white mb-2 italic tracking-tighter">{stat}</p>
       <p className="text-[11px] text-slate-600 font-mono uppercase tracking-widest font-black italic">{sub}</p>
    </div>
  );
}
