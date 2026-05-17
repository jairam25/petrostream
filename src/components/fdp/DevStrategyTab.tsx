import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Target, 
  Activity, 
  Settings2, 
  ShieldCheck, 
  Zap,
  ArrowRightCircle,
  HelpCircle,
  BarChart3,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { estimateRecoveryFactor } from '../../lib/reservoir';

export function DevStrategyTab() {
  const [params, setParams] = useState({
    depth: 8500,
    permeability: 150,
    viscosity: 1.2,
    apiGravity: 35,
    driveMechanism: 'Solution Gas',
    fluidType: 'Light Oil'
  });

  const [currentPhase, setCurrentPhase] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      // Create a blob and trigger a real download
      const reportContent = `FIELD DEVELOPMENT PLAN REPORT\n==============================\nConcept: ${recommendation.concept}\nExpected RF: ${(recommendation.rf.avg * 100).toFixed(0)}%\nFluid Type: ${params.fluidType}\nDepth: ${params.depth} ft\n\nPHASES:\n${recommendation.phases.map((p, i) => `${i+1}. ${p.name} (${p.duration}): ${p.tech}`).join('\n')}\n`;
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FDP_Strategy_Report_${params.fluidType.replace(' ', '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsDownloading(false);
    }, 2000);
  };

  const recommendation = useMemo(() => {
    if (params.fluidType === 'Heavy Oil' || params.viscosity > 50) {
      return {
        concept: "Thermal EOR (SAGD / Steam Flood)",
        desc: "High viscosity requires thermal energy to mobilize oil through steam-assisted gravity drainage or cyclic steam stimulation.",
        phases: [
          { name: "Appraisal", duration: "12m", tech: "Core analysis & Pilot" },
          { name: "Expansion", duration: "24m", tech: "Central Facility buildup" },
          { name: "Full Field", duration: "15y+", tech: "Continuous drilling" }
        ],
        rf: estimateRecoveryFactor(params.driveMechanism, 'Heavy Oil')
      };
    }
    
    if (params.permeability < 1) {
      return {
        concept: "Horizontal + Multi-stage Frac",
        desc: "Tight reservoir rock requires massive contact area via long laterals and intensive stimulation for commercial deliverability.",
        phases: [
          { name: "Delineation", duration: "18m", tech: "Micro-seismic monitoring" },
          { name: "Pad Development", duration: "36m", tech: "Batch drilling operations" },
          { name: "Refracturing", duration: "10y", tech: "Secondary stimulation" }
        ],
        rf: { min: 0.05, max: 0.15, avg: 0.10 }
      };
    }

    if (params.depth > 15000) {
        return {
          concept: "Deepwater Tieback",
          desc: "Extreme depth and likely high pressure require robust subsea architecture tying back to existing host facilities.",
          phases: [
            { name: "SURE", duration: "24m", tech: "Subsea Umbilicals" },
            { name: "First Oil", duration: "48m", tech: "FPSO Interconnect" }
          ],
          rf: estimateRecoveryFactor(params.driveMechanism, 'Light Oil')
        };
    }

    return {
      concept: "Conventional Waterflood",
      desc: "Good permeability and API gravity support early pressure maintenance via peripheral or pattern water injection.",
      phases: [
        { name: "Primary", duration: "24m", tech: "Natural depletion" },
        { name: "Secondary", duration: "60m", tech: "Water injection startup" },
        { name: "Tertiary", duration: "10y", tech: "Chemical / Polymer EOR" }
      ],
      rf: estimateRecoveryFactor(params.driveMechanism, 'Light Oil')
    };
  }, [params]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Sidebar Inputs */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Reservoir Character</h4>
           </div>
           
           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Fluid Type</label>
                <select 
                  value={params.fluidType}
                  onChange={(e) => setParams({...params, fluidType: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-[10px] text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                >
                  <option value="Light Oil">Light Oil</option>
                  <option value="Medium Oil">Medium Oil</option>
                  <option value="Heavy Oil">Heavy Oil</option>
                  <option value="Dry Gas">Dry Gas</option>
                  <option value="Condensate">Condensate</option>
                </select>
              </div>

              <InputWithSlider label="Permeability (k)" value={params.permeability} min={0.1} max={500} step={0.1} unit="md" onChange={(v) => setParams({...params, permeability: v})} />
              <InputWithSlider label="Viscosity (μ)" value={params.viscosity} min={0.1} max={500} step={0.1} unit="cp" onChange={(v) => setParams({...params, viscosity: v})} />
              <InputWithSlider label="Depth" value={params.depth} min={2000} max={25000} step={100} unit="ft" onChange={(v) => setParams({...params, depth: v})} />
              
              <div className="space-y-2 pt-4 border-t border-white/5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Drive Mechanism</label>
                <select 
                  value={params.driveMechanism}
                  onChange={(e) => setParams({...params, driveMechanism: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-[10px] text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                >
                  <option value="Solution Gas">Solution Gas</option>
                  <option value="Gas Cap">Gas Cap</option>
                  <option value="Water Drive (Strong)">Strong Water Drive</option>
                  <option value="Gravity Drainage">Gravity Drainage</option>
                </select>
              </div>
           </div>
        </div>
      </div>

      {/* Recommended Strategy */}
      <div className="lg:col-span-9 space-y-8">
        <div className="glass-card rounded-3xl p-12 bg-gradient-to-br from-indigo-900/40 to-[#030406] border-white/5 relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-4 max-w-xl">
                 <div className="flex items-center gap-3">
                    <Rocket className="text-cyan-400" size={24} />
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Recommended Concept</span>
                 </div>
                 <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">{recommendation.concept}</h2>
                 <p className="text-sm text-slate-400 leading-relaxed italic">{recommendation.desc}</p>
              </div>

              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 text-center min-w-[200px]">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Expected RF</span>
                 <div className="text-4xl font-black text-white tracking-tighter italic mb-2">{(recommendation.rf.avg * 100).toFixed(0)}%</div>
                 <div className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                    Range: {(recommendation.rf.min * 100).toFixed(0)} - {(recommendation.rf.max * 100).toFixed(0)}%
                 </div>
              </div>
           </div>

           <div className="absolute -bottom-24 -right-24 h-64 w-64 bg-cyan-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 space-y-8">
              <div className="flex items-center gap-3">
                 <Activity size={20} className="text-emerald-500" />
                 <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Lifecycle Phasing</h4>
              </div>
              <div className="space-y-8">
                 {recommendation.phases.map((p, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setCurrentPhase(idx)}
                      className="flex gap-6 items-start relative group cursor-pointer"
                    >
                       <div className="flex flex-col items-center">
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center text-[10px] font-black transition-all border",
                            currentPhase === idx ? "bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "bg-white/5 border-transparent text-slate-500 group-hover:bg-white/10"
                          )}>
                            {idx + 1}
                          </div>
                          {idx < recommendation.phases.length - 1 && <div className="w-px h-12 bg-white/10 mt-2" />}
                       </div>
                       <div className="flex-1 pt-1">
                          <div className="flex justify-between items-center mb-1">
                             <h5 className={cn("text-[11px] font-black uppercase tracking-wider transition-colors", currentPhase === idx ? "text-white" : "text-slate-500")}>{p.name}</h5>
                             <span className="text-[11px] font-bold text-slate-500 font-mono tracking-widest">{p.duration}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 italic">{p.tech}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 space-y-8">
              <div className="flex items-center gap-3">
                 <BarChart3 size={20} className="text-indigo-500" />
                 <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Analog Verification</h4>
              </div>
              <div className="space-y-6">
                 <AnalogRow label="Permeability Match" value="Excellent" status="positive" />
                 <AnalogRow label="Viscosity Mobility" value="Marginal" status="neutral" />
                 <AnalogRow label="Depth Feasibility" value="High Risk" status="negative" />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                 Strategy selection is based on the top 12 global field analogs matching your reservoir type ({params.fluidType}) and drive mechanism.
              </p>
              <button 
                 onClick={handleDownload}
                 disabled={isDownloading}
                 className={cn(
                   "w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                   isDownloading ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/5 border-white/5 text-white hover:bg-white/10 active:scale-95"
                 )}
              >
                 {isDownloading ? (
                   <>
                     <RefreshCw size={14} className="animate-spin" />
                     Generating Report...
                   </>
                 ) : (
                   'Download Full FDP Report'
                 )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function AnalogRow({ label, value, status }: { label: string, value: string, status: 'positive' | 'neutral' | 'negative' }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
       <div className="flex items-center gap-2">
          <div className={cn(
            "h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]",
            status === 'positive' ? "text-emerald-500 bg-emerald-500" : 
            status === 'neutral' ? "text-amber-500 bg-amber-500" : "text-red-500 bg-red-500"
          )} />
          <span className="text-[10px] font-black text-white uppercase">{value}</span>
       </div>
    </div>
  );
}
