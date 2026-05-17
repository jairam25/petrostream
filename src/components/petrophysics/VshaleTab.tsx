import React from 'react';
import { Activity, Filter, Waves, Mountain, Zap, Radio, Target, Droplets, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { 
  calculateIGR, 
  calculateVshLarionovTertiary, 
  calculateVshLarionovOlder, 
  calculateVshSteiber, 
  calculateVshClavier, 
  calculateVshSP, 
  calculateVshNeutronDensity, 
  calculateVshResistivity 
} from '../../lib/petrophysics';

interface VshaleTabProps {
  vshaleInp: any;
  setVshaleInp: (v: any) => void;
}

export const VshaleTab: React.FC<VshaleTabProps> = ({ vshaleInp, setVshaleInp }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Parameter Input Column */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-white italic tracking-tight uppercase">SHALE PARAMETERS</h3>
            <Activity size={20} className="text-emerald-500" />
          </div>

          <div className="space-y-8 h-[650px] overflow-y-auto pr-2 custom-scrollbar">
            {/* GR Parameters */}
            <section className="space-y-4">
              <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                Gamma Ray Baseline
              </h4>
              <div className="space-y-4">
                <InputWithSlider label="GR Log" value={vshaleInp.gr} min={0} max={200} step={1} unit="API" onChange={(v: number) => setVshaleInp({...vshaleInp, gr: v})} />
                <InputWithSlider label="GR Clean" value={vshaleInp.grClean} min={0} max={100} step={1} unit="API" onChange={(v: number) => setVshaleInp({...vshaleInp, grClean: v})} />
                <InputWithSlider label="GR Shale" value={vshaleInp.grShale} min={50} max={250} step={1} unit="API" onChange={(v: number) => setVshaleInp({...vshaleInp, grShale: v})} />
              </div>
            </section>

            {/* SP Parameters */}
            <section className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                SP Deflection
              </h4>
              <div className="space-y-4">
                <InputWithSlider label="SP Log" value={vshaleInp.sp} min={-100} max={50} step={1} unit="mV" onChange={(v: number) => setVshaleInp({...vshaleInp, sp: v})} />
                <InputWithSlider label="SP Shale Base" value={vshaleInp.spBase} min={-50} max={50} step={1} unit="mV" onChange={(v: number) => setVshaleInp({...vshaleInp, spBase: v})} />
                <InputWithSlider label="SP Max Defl" value={vshaleInp.spMax} min={-150} max={0} step={1} unit="mV" onChange={(v: number) => setVshaleInp({...vshaleInp, spMax: v})} />
              </div>
            </section>

            {/* Porosity Comparison */}
            <section className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-1 bg-rose-500 rounded-full"></div>
                Neutron-Density Cross
              </h4>
              <div className="space-y-4">
                <InputWithSlider label="Neutron Phi" value={vshaleInp.nphi} min={0} max={0.6} step={0.01} unit="v/v" onChange={(v: number) => setVshaleInp({...vshaleInp, nphi: v})} />
                <InputWithSlider label="Density Phi" value={vshaleInp.dphi} min={0} max={0.6} step={0.01} unit="v/v" onChange={(v: number) => setVshaleInp({...vshaleInp, dphi: v})} />
                <InputWithSlider label="NPHI Shale" value={vshaleInp.nphiSh} min={0.2} max={0.6} step={0.01} unit="v/v" onChange={(v: number) => setVshaleInp({...vshaleInp, nphiSh: v})} />
                <InputWithSlider label="DPHI Shale" value={vshaleInp.dphiSh} min={-0.05} max={0.15} step={0.01} unit="v/v" onChange={(v: number) => setVshaleInp({...vshaleInp, dphiSh: v})} />
              </div>
            </section>

            {/* Resistivity Parameters */}
            <section className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                Induction / Laterolog
              </h4>
              <div className="space-y-4">
                <InputWithSlider label="Rt Log" value={vshaleInp.rt} min={0.1} max={2000} step={1} unit="Ωm" onChange={(v: number) => setVshaleInp({...vshaleInp, rt: v})} />
                <InputWithSlider label="Clean Sand" value={vshaleInp.rClean} min={10} max={5000} step={1} unit="Ωm" onChange={(v: number) => setVshaleInp({...vshaleInp, rClean: v})} />
                <InputWithSlider label="Shale Rt" value={vshaleInp.rShale} min={0.5} max={20} step={0.1} unit="Ωm" onChange={(v: number) => setVshaleInp({...vshaleInp, rShale: v})} />
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Comparison Engine */}
      <div className="lg:col-span-8 space-y-6">
        <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_50%)]"></div>
          
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div>
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest mb-2">Vshale Engine / Phase 2</p>
              <h3 className="text-3xl font-black text-white italic tracking-tight uppercase">METHOD COMPARISON MATRIX</h3>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="px-4 py-1.5 bg-emerald-500 rounded-xl text-[10px] font-black text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">IGR = {calculateIGR(vshaleInp.gr, vshaleInp.grClean, vshaleInp.grShale).toFixed(3)}</div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Shale Index (Linear)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-6">
              <h4 className="text-[12px] font-black text-white uppercase italic tracking-widest border-b border-white/10 pb-4 mb-4">Gamma Ray Non-Linear Curves</h4>
              <div className="space-y-4">
                {[
                  { label: 'Linear Method', method: 'Linear', value: calculateIGR(vshaleInp.gr, vshaleInp.grClean, vshaleInp.grShale), icon: Filter, color: 'emerald' },
                  { label: 'Larionov Tertiary', method: 'Cenozoic', value: calculateVshLarionovTertiary(calculateIGR(vshaleInp.gr, vshaleInp.grClean, vshaleInp.grShale)), icon: Waves, color: 'emerald' },
                  { label: 'Larionov Older', method: 'Paleozoic', value: calculateVshLarionovOlder(calculateIGR(vshaleInp.gr, vshaleInp.grClean, vshaleInp.grShale)), icon: Mountain, color: 'cyan' },
                  { label: 'Steiber Method', method: 'Empirical', value: calculateVshSteiber(calculateIGR(vshaleInp.gr, vshaleInp.grClean, vshaleInp.grShale)), icon: Zap, color: 'indigo' },
                  { label: 'Clavier Method', method: 'Combined', value: calculateVshClavier(calculateIGR(vshaleInp.gr, vshaleInp.grClean, vshaleInp.grShale)), icon: Radio, color: 'indigo' },
                ].map(m => (
                  <div key={m.label} className="group p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl", 
                          m.color === 'emerald' ? "bg-emerald-500/10" : 
                          m.color === 'cyan' ? "bg-cyan-500/10" : "bg-indigo-500/10"
                        )}>
                          <m.icon size={14} className={cn(
                            m.color === 'emerald' ? "text-emerald-400" : 
                            m.color === 'cyan' ? "text-cyan-400" : "text-indigo-400"
                          )} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white uppercase italic leading-none">{m.label}</p>
                          <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">{m.method} Correlation</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white italic">{(m.value * 100).toFixed(1)}%</p>
                        <p className="text-[10px] text-slate-600 font-mono">Vshale</p>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${m.value * 100}%` }}
                        className={cn("h-full transition-all", 
                          m.color === 'emerald' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : 
                          m.color === 'cyan' ? "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]" : 
                          "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[12px] font-black text-white uppercase italic tracking-widest border-b border-white/10 pb-4 mb-4">Multi-Tool Crossplot results</h4>
              <div className="space-y-4">
                {[
                  { label: 'SP Deflection', method: 'Electrical', value: calculateVshSP(vshaleInp.sp, vshaleInp.spBase, vshaleInp.spMax), icon: Activity, color: 'text-amber-400', bgColor: 'bg-amber-500/10', barColor: 'bg-amber-500/80', best: false },
                  { label: 'Neutron-Density', method: 'Nuclear', value: calculateVshNeutronDensity(vshaleInp.nphi, vshaleInp.dphi, vshaleInp.nphiSh, vshaleInp.dphiSh), icon: Target, color: 'text-rose-400', bgColor: 'bg-rose-500/10', barColor: 'bg-rose-500/80', best: true },
                  { label: 'Resistivity (Rsh/Rt)', method: 'Inversion', value: calculateVshResistivity(vshaleInp.rt, vshaleInp.rClean, vshaleInp.rShale), icon: Droplets, color: 'text-orange-400', bgColor: 'bg-orange-500/10', barColor: 'bg-orange-500/80', best: false },
                ].map(m => (
                  <div key={m.label} className={cn(
                    "group p-5 bg-black/40 border border-white/5 rounded-3xl hover:border-white/20 transition-all relative overflow-hidden",
                    m.best && "border-emerald-500/30 bg-emerald-500/[0.02]"
                  )}>
                    {m.best && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 rounded-bl-xl text-[10px] font-black text-white uppercase tracking-tighter z-20">Recommended</div>
                    )}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-xl shadow-inner", m.bgColor)}>
                          <m.icon size={16} className={m.color} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-white uppercase italic">{m.label}</p>
                          <p className="text-[10px] text-slate-500 font-mono uppercase">{m.method} Analysis</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-xl font-black italic", m.color)}>{(m.value * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden p-[1px]">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${m.value * 100}%` }}
                          className={cn("h-full rounded-full", m.barColor)}
                        />
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] text-slate-700 font-black uppercase">0%</span>
                        <span className="text-[10px] text-slate-700 font-black uppercase">100%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 mt-10">
                <h5 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2 italic">
                  <ShieldCheck size={14} /> 
                  Expert Recommendation
                </h5>
                <div className="text-[11px] text-slate-300 leading-relaxed italic">
                  In this formation, the <span className="text-white font-black underline decoration-emerald-500/50 underline-offset-4">Steiber Method</span> or <span className="text-white font-black underline decoration-rose-500/50 underline-offset-4">Neutron-Density</span> separation provides the most rigorous shale volume estimation. The Linear GR method is currently over-estimating Vshale by approximately <span className="text-2xl font-black text-emerald-400 block mt-2 shadow-emerald-500/20 drop-shadow-sm">{( (calculateIGR(vshaleInp.gr, vshaleInp.grClean, vshaleInp.grShale) - calculateVshSteiber(calculateIGR(vshaleInp.gr, vshaleInp.grClean, vshaleInp.grShale))) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
