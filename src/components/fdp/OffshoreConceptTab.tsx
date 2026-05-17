import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Anchor, 
  Settings2, 
  Ship, 
  Waves, 
  ArrowRightCircle, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Info,
  Maximize2,
  Box,
  Map
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';

interface Concept {
  name: string;
  depthRange: [number, number];
  score: number;
  pros: string[];
  cons: string[];
  suitability: string;
}

export function OffshoreConceptTab() {
  const [params, setParams] = useState({
    waterDepth: 1200,
    topsideWeight: 15000, // tons
    wellCount: 12,
    distToShore: 80, // miles
    metocean: 'Moderate' as 'Calm' | 'Moderate' | 'Severe'
  });

  const concepts: Concept[] = useMemo(() => {
    const depth = params.waterDepth;
    const metoceanMod = params.metocean === 'Severe' ? -20 : params.metocean === 'Moderate' ? -5 : 0;
    const metoceanFPSOMod = params.metocean === 'Severe' ? 10 : params.metocean === 'Calm' ? -5 : 0;

    const list: Concept[] = [
      {
        name: "Fixed Platform (Jacket)",
        depthRange: [0, 500],
        score: Math.max(0, (depth < 500 ? 95 : 10) + metoceanMod),
        pros: ["Low cost < 400ft", "Proven tech", "Simple operations"],
        cons: ["Depth limited", "High steel weight > 400ft"],
        suitability: depth < 500 ? "Ideal for shallow water" : "Inefficient beyond 500ft"
      },
      {
        name: "FPSO",
        depthRange: [200, 10000],
        score: Math.max(0, (params.distToShore > 50 ? 90 : 70) + metoceanFPSOMod),
        pros: ["Storage onboard", "Fast track", "Versatile"],
        cons: ["Complex offloading", "Swivel limitations"],
        suitability: "Best for remote locations without pipeline"
      },
      {
        name: "TLP (Tension Leg)",
        depthRange: [500, 5000],
        score: Math.max(0, (depth > 1000 && depth < 4000 ? 85 : 40) + (params.metocean === 'Severe' ? -10 : 0)),
        pros: ["Dry trees possible", "Stable mooring"],
        cons: ["Payload sensitive", "High tendon cost"],
        suitability: "Deepwater with dry tree completion"
      },
      {
        name: "SPAR",
        depthRange: [2000, 8000],
        score: Math.max(0, (depth > 3000 ? 80 : 30) + (params.metocean === 'Severe' ? 15 : 0)),
        pros: ["High stability", "Low VIV", "Storage potential"],
        cons: ["Complex installation", "Deep draft"],
        suitability: "Ultra-deepwater hubs"
      },
      {
        name: "Subsea Tieback",
        depthRange: [0, 8000],
        score: Math.max(0, (params.wellCount < 4 && params.distToShore < 40 ? 95 : 50) + metoceanMod),
        pros: ["Low CAPEX", "Uses existing host"],
        cons: ["Flow assurance risk", "Host capacity limits"],
        suitability: "Marginal fields near infrastructure"
      }
    ];

    return list.sort((a, b) => b.score - a.score);
  }, [params]);

  const recommended = concepts[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Parameters */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Environment & Scope</h4>
           </div>
           
           <div className="space-y-6">
              <InputWithSlider label="Water Depth" value={params.waterDepth} min={100} max={8000} step={100} unit="ft" onChange={(v) => setParams({...params, waterDepth: v})} />
              <InputWithSlider label="Topside Weight" value={params.topsideWeight} min={1000} max={50000} step={1000} unit="tons" onChange={(v) => setParams({...params, topsideWeight: v})} />
              <InputWithSlider label="Dist. to Shore" value={params.distToShore} min={10} max={500} step={10} unit="miles" onChange={(v) => setParams({...params, distToShore: v})} />
              
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Metocean Conditions</label>
                <div className="grid grid-cols-3 gap-2">
                   {['Calm', 'Moderate', 'Severe'].map(m => (
                      <button 
                        key={m} 
                        onClick={() => setParams({...params, metocean: m as any})}
                        className={cn(
                          "py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                          params.metocean === m ? "bg-cyan-500 text-black border-cyan-500" : "bg-white/5 text-slate-500 border-white/10"
                        )}
                      >
                         {m}
                      </button>
                   ))}
                </div>
              </div>
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-blue-900/40 to-black border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <Map size={18} className="text-blue-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Regional Analogs</h5>
           </div>
           <p className="text-[10px] text-slate-500 italic mb-4">Recommended for Gulf of Mexico, Brazil Pre-salt, or West Africa frontiers.</p>
        </div>
      </div>

      {/* Concept Comparison */}
      <div className="lg:col-span-9 space-y-8">
        <div className="glass-card rounded-3xl p-12 bg-gradient-to-br from-indigo-900/40 to-[#030406] border-white/5 relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-4 max-w-xl">
                 <div className="flex items-center gap-3">
                    <Ship className="text-cyan-400" size={24} />
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Frontier Recommendation</span>
                 </div>
                 <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">{recommended.name}</h2>
                 <p className="text-sm text-slate-400 leading-relaxed italic">{recommended.suitability}</p>
              </div>

              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 text-center min-w-[200px]">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Concept Score</span>
                 <div className="text-4xl font-black text-white tracking-tighter italic mb-2">{recommended.score}%</div>
                 <div className="text-[11px] font-bold text-slate-600 uppercase tracking-widest italic font-black">
                    High Technical Fit
                 </div>
              </div>
           </div>
           <div className="absolute -bottom-24 -right-24 h-64 w-64 bg-blue-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="space-y-6">
           <div className="flex items-center justify-between px-4">
              <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Offshore Concept Matrix</h4>
           </div>

           <div className="grid grid-cols-1 gap-4">
              {concepts.map((c, idx) => (
                 <motion.div 
                    key={c.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card rounded-2xl p-8 border-white/5 bg-black/40 hover:bg-white/[0.03] transition-all flex flex-col md:flex-row items-center justify-between gap-8 group"
                 >
                    <div className="flex-1 space-y-4">
                       <div className="flex items-center gap-4">
                          <h5 className="text-lg font-black text-white uppercase italic tracking-tighter">{c.name}</h5>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{c.depthRange[0]}-{c.depthRange[1]} FT Depth</span>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 size={10} /> Key Advantages
                             </span>
                             <div className="flex flex-wrap gap-2">
                                {c.pros.map(p => <span key={p} className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">{p}</span>)}
                             </div>
                          </div>
                          <div className="space-y-2">
                             <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                                <AlertTriangle size={10} /> Critical Constraints
                             </span>
                             <div className="flex flex-wrap gap-2">
                                {c.cons.map(p => <span key={p} className="px-3 py-1 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest">{p}</span>)}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-6">
                       <div className="text-right">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Selection Score</span>
                          <span className={cn(
                             "text-3xl font-black italic tracking-tighter",
                             c.score > 80 ? "text-cyan-400" : c.score > 50 ? "text-amber-400" : "text-slate-700"
                          )}>{c.score}%</span>
                       </div>
                       <ArrowRightCircle size={32} className="text-slate-800 group-hover:text-cyan-400 transition-all group-hover:translate-x-2" />
                    </div>
                 </motion.div>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 space-y-6">
              <div className="flex items-center gap-3">
                 <Box size={20} className="text-indigo-500" />
                 <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Platform Weight Est.</h4>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jacket Weight</span>
                    <span className="text-xl font-black text-white italic">{(params.waterDepth * 0.12 * params.topsideWeight / 1000).toFixed(0)} Tons</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mooring Complexity</span>
                    <span className="text-xl font-black text-white italic">{params.waterDepth > 4000 ? 'Extreme' : 'Standard'}</span>
                 </div>
              </div>
           </div>

           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 flex items-center gap-6">
              <div className="h-16 w-16 rounded-3xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                 <Zap size={32} />
              </div>
              <div>
                 <h5 className="text-[11px] font-black text-white uppercase tracking-wider mb-1">Concept Pre-Selection</h5>
                 <p className="text-[10px] text-slate-500 italic leading-relaxed">
                    Conceptual weight and cost algorithms provide Class 5 estimates (±40%) for screening purposes. Move to FEED for Class 3 accuracy.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
