import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Combine, Beaker, FlaskConical, Wind, Flame, Zap, ArrowDownUp, RefreshCw
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function HybridEORModule() {
  const [activePhase, setActivePhase] = useState<'9A' | '9B' | '9C'>('9A');
  
  const phases = [
    { id: '9A', name: 'Chemical Hybrids', icon: FlaskConical },
    { id: '9B', name: 'Thermal Hybrids', icon: Flame },
    { id: '9C', name: 'Gas/Misc Hybrids', icon: Wind }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Combine className="text-fuchsia-500" size={32} />
            Phase 9: Hybrid EOR <span className="text-fuchsia-500/50">Synergy Matrix</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Compounding Recovery Mechanisms</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit mt-4 flex-wrap gap-1">
          {phases.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
                activePhase === p.id 
                  ? "bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20" 
                  : "text-slate-500 hover:text-white"
              )}
            >
              <p.icon size={14} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <AnimatePresence mode="wait">
             <motion.div
               key={activePhase}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="h-full"
             >
                {/* --- 9A: Chemical Hybrids --- */}
                {activePhase === '9A' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <HybridCard 
                         title="Alkaline-Cosolvent-Polymer (ACP)"
                         icon={Beaker}
                         desc="Replaces expensive surfactant with a cheaper cosolvent (like alcohol) to reduce IFT and prevent macroemulsion formation. Lowers total chemical OPEX."
                         tags={['Cost Reduction', 'Microemulsion', 'Mobility Control']}
                      />
                      <HybridCard 
                         title="Surfactant-Polymer (SP)"
                         icon={FlaskConical}
                         desc="Used in reservoirs with very low acid numbers where alkaline is ineffective (cannot generate in-situ soap). Strictly relies on injected surfactant for IFT reduction."
                         tags={['Low Acid Number', 'Ultra-low IFT', 'No Scaling']}
                      />
                      <HybridCard 
                         title="Water-Alternating-Chemical (WAC)"
                         icon={RefreshCw}
                         desc="Similar to WAG, but alternates water with chemical slugs (e.g., surfactant). Maximizes sweep efficiency while minimizing total chemical volume injected."
                         tags={['Conformance', 'Volume Optimization']}
                      />
                   </div>
                )}

                {/* --- 9B: Thermal Hybrids --- */}
                {activePhase === '9B' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <HybridCard 
                         title="ES-SAGD"
                         icon={Flame}
                         desc="Expanding Solvent SAGD. Co-injecting steam with light solvents (hexane, butane). The solvent diffuses into the cold oil ahead of the steam chamber, providing additional viscosity reduction and significantly lowering the Steam-Oil Ratio (SOR)."
                         tags={['Lower SOR', 'Solvent Diffusion', 'Heavy Oil']}
                      />
                      <HybridCard 
                         title="LASER"
                         icon={ArrowDownUp}
                         desc="Liquid Addition to Steam for Enhanced Recovery. Similar to ES-SAGD but specifically tailored for cyclic steam stimulation or specific continuous steam floods."
                         tags={['Liquid Solvents', 'CSS Variant']}
                      />
                      <HybridCard 
                         title="EM + Solvent"
                         icon={Zap}
                         desc="Electromagnetic heating combined with solvent injection. Useful in thin formations where heat losses make steam unviable, or where water usage is restricted."
                         tags={['No Water Used', 'Thin Pay Zones', 'Ohmic/RF Heating']}
                      />
                   </div>
                )}

                {/* --- 9C: Gas/Misc Hybrids --- */}
                {activePhase === '9C' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <HybridCard 
                         title="Low-Tension Gas (LTG)"
                         icon={Wind}
                         desc="Co-injection of surfactant and gas. The surfactant reduces IFT to mobilize residual oil, while the gas forms a foam in situ. The foam provides the critical mobility control that gas normally lacks."
                         tags={['Mobility Control', 'Ultra-low IFT', 'Gas Sweep']}
                      />
                      <HybridCard 
                         title="CO₂-Foam-Surfactant"
                         icon={Combine}
                         desc="A highly specialized LTG process utilizing supercritical CO₂. The foam drastically reduces the mobility of the CO₂, preventing gravity override and viscous fingering, leading to vastly improved volumetric sweep."
                         tags={['CCUS Integration', 'Prevent Fingering', 'Supercritical CO₂']}
                      />
                   </div>
                )}
             </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function HybridCard({ title, icon: Icon, desc, tags }: { title: string, icon: any, desc: string, tags: string[] }) {
  return (
    <div className="glass-card p-10 rounded-3xl border-white/5 bg-[#05070a] group hover:border-fuchsia-500/30 transition-all flex flex-col h-full">
       <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-fuchsia-500/10 text-fuchsia-500 rounded-2xl">
             <Icon size={24} />
          </div>
          <h3 className="text-xl font-black text-white italic">{title}</h3>
       </div>
       <p className="text-[11px] text-slate-400 leading-relaxed mb-8 flex-1">{desc}</p>
       <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
             <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold text-slate-300 tracking-widest uppercase">
                {tag}
             </span>
          ))}
       </div>
    </div>
  );
}
