import React from 'react';
import { Zap, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { 
  calculateWinlandR35, 
  calculateTimurPermeability, 
  calculateCoatesPermeability, 
  calculateWyllieRosePermeability, 
  calculateKozenyCarman, 
  calculateTixierPermeability, 
  calculateMorrisBiggsPermeability, 
  fitPermeabilityTransform 
} from '../../lib/petrophysics';

interface PermeabilityTabProps {
  permeabilityInp: any;
  setPermeabilityInp: (v: any) => void;
}

export const PermeabilityTab: React.FC<PermeabilityTabProps> = ({ permeabilityInp, setPermeabilityInp }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Permeability Inputs */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-white italic tracking-tight uppercase">PERMEABILITY ENGINE</h3>
            <Zap size={20} className="text-amber-500" />
          </div>
          
          <div className="space-y-6">
            <InputWithSlider label="Porosity (Φ)" value={permeabilityInp.phi} min={0.01} max={0.45} step={0.001} unit="v/v" onChange={(v: number) => setPermeabilityInp({...permeabilityInp, phi: v})} />
            <InputWithSlider label="Irreducible Sw (Swi)" value={permeabilityInp.swi} min={0.05} max={0.6} step={0.01} unit="v/v" onChange={(v: number) => setPermeabilityInp({...permeabilityInp, swi: v})} />
            
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Zone Type (Wyllie-Rose)</h4>
              <div className="flex gap-2">
                {(['oil', 'gas'] as const).map(t => (
                  <button 
                    key={t}
                    onClick={() => setPermeabilityInp({...permeabilityInp, type: t})}
                    className={cn(
                      "flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all",
                      permeabilityInp.type === t ? "bg-amber-500 border-amber-400 text-white" : "bg-white/5 border-white/10 text-slate-500"
                    )}
                  >{t} Zone</button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <InputWithSlider label="Grain Size" value={permeabilityInp.grainSize} min={0.01} max={1.0} step={0.01} unit="mm" onChange={(v: number) => setPermeabilityInp({...permeabilityInp, grainSize: v})} />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40">
          <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4 italic">Winland R35</h4>
          <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-slate-500 uppercase">Pore Throat Radius</span>
              <span className="text-sm font-black text-white">{calculateWinlandR35(calculateTimurPermeability(permeabilityInp.phi, permeabilityInp.swi), permeabilityInp.phi).toFixed(2)} μm</span>
            </div>
            <div className="text-[10px] text-slate-400 italic">Rock typing based on 35% mercury saturation port size.</div>
          </div>
        </div>
      </div>

      {/* Permeability Results Column */}
      <div className="lg:col-span-8 space-y-6">
        <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.05),transparent_50%)]"></div>
          
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div>
              <p className="text-[10px] text-amber-400 font-mono uppercase tracking-widest mb-2">Permeability Modeling / Phase 5</p>
              <h3 className="text-3xl font-black text-white italic tracking-tight uppercase">ABS PERMEABILITY (k)</h3>
            </div>
            <div className="flex gap-2">
              {(['timur', 'coates', 'wyllie', 'kozeny', 'tixier', 'morrisbiggs'] as const).map(m => (
                <button 
                  key={m}
                  onClick={() => setPermeabilityInp({...permeabilityInp, method: m})}
                  className={cn(
                    "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                    permeabilityInp.method === m ? "bg-amber-500 border-amber-400 text-white" : "bg-white/5 border-white/10 text-slate-500"
                  )}
                >{m === 'morrisbiggs' ? 'M-B' : m}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            <div className="space-y-8">
              <div className="p-8 bg-amber-500/5 rounded-3xl border border-amber-500/10 text-center">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4 italic">Estimated Permeability (mD)</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-7xl font-black italic text-white tracking-tighter">
                    {Math.round(
                      permeabilityInp.method === 'timur' ? calculateTimurPermeability(permeabilityInp.phi, permeabilityInp.swi) :
                      permeabilityInp.method === 'coates' ? calculateCoatesPermeability(permeabilityInp.phi, permeabilityInp.swi) :
                      permeabilityInp.method === 'wyllie' ? calculateWyllieRosePermeability(permeabilityInp.phi, permeabilityInp.swi, permeabilityInp.type) :
                      permeabilityInp.method === 'kozeny' ? calculateKozenyCarman(permeabilityInp.phi, permeabilityInp.grainSize) :
                      permeabilityInp.method === 'tixier' ? calculateTixierPermeability(permeabilityInp.phi, permeabilityInp.swi) :
                      calculateMorrisBiggsPermeability(permeabilityInp.phi, permeabilityInp.swi, permeabilityInp.type)
                    )}
                  </span>
                  <span className="text-2xl font-black text-slate-600">mD</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-white uppercase italic tracking-widest border-b border-white/10 pb-4 mb-4">Correlation Comparison</h4>
                {[
                  { label: 'Timur Equation', val: calculateTimurPermeability(permeabilityInp.phi, permeabilityInp.swi) },
                  { label: 'Coates Equation', val: calculateCoatesPermeability(permeabilityInp.phi, permeabilityInp.swi) },
                  { label: 'Wyllie-Rose', val: calculateWyllieRosePermeability(permeabilityInp.phi, permeabilityInp.swi, permeabilityInp.type) },
                  { label: 'Kozeny-Carman', val: calculateKozenyCarman(permeabilityInp.phi, permeabilityInp.grainSize) },
                  { label: 'Tixier Method', val: calculateTixierPermeability(permeabilityInp.phi, permeabilityInp.swi) },
                  { label: 'Morris-Biggs', val: calculateMorrisBiggsPermeability(permeabilityInp.phi, permeabilityInp.swi, permeabilityInp.type) }
                ].map(m => (
                  <div key={m.label} className="flex justify-between items-center text-[10px] font-bold text-slate-400 p-2 border-b border-white/5">
                    <span>{m.label}</span>
                    <span className={cn("text-white font-mono", m.label.toLowerCase().includes(permeabilityInp.method) && "text-amber-400 font-black")}>{Math.round(m.val)} mD</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              {/* Porosity-Permeability Transform Tool */}
              <div className="bg-amber-500/5 rounded-3xl border border-amber-500/10 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h5 className="text-[11px] font-black text-white uppercase italic">Core Transform Fit</h5>
                  <div className="flex gap-1">
                    <button onClick={() => {
                      const newPoints = [...permeabilityInp.coreData, { phi: 0.2, k: 250 }];
                      setPermeabilityInp({...permeabilityInp, coreData: newPoints});
                    }} className="p-1 hover:bg-white/10 rounded-md text-amber-500 transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="w-full aspect-square max-w-[280px] border-l-2 border-b-2 border-slate-700 relative mx-auto">
                  <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-mono uppercase">Porosity (Φ)</div>
                  <div className="absolute left-[-35px] top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-slate-500 font-mono uppercase">Log k (mD)</div>
                  
                  <svg className="absolute inset-0 w-full h-full overflow-visible">
                    {/* Grid lines */}
                    {[1, 2, 3].map(li => (
                      <line key={li} x1="0" y1={240 - li*60} x2="240" y2={240 - li*60} stroke="white" strokeWidth="1" opacity="0.05" />
                    ))}

                    {/* Regression Line */}
                    {(() => {
                      const fit = fitPermeabilityTransform(permeabilityInp.coreData);
                      const y1 = 240 - (Math.log10(fit.a * Math.pow(10, fit.b * 0)) * 60);
                      const y2 = 240 - (Math.log10(fit.a * Math.pow(10, fit.b * 0.3)) * 60);
                      return <line x1="0" y1={y1} x2="240" y2={y2} stroke="#f59e0b" strokeWidth="2" opacity="0.5" />;
                    })()}
                    
                    {/* Scatter Points */}
                    {permeabilityInp.coreData.map((p: any, idx: number) => (
                      <circle 
                        key={idx} 
                        cx={p.phi * 800} 
                        cy={240 - (Math.log10(p.k) * 60)} 
                        r="3" 
                        fill="#94a3b8" 
                        opacity="0.6" 
                      />
                    ))}

                    {/* Current Estimated Point */}
                    <motion.circle 
                      cx={permeabilityInp.phi * 800} 
                      cy={240 - (Math.log10(calculateTimurPermeability(permeabilityInp.phi, permeabilityInp.swi) || 1) * 60)} 
                      r="5" 
                      fill="#f59e0b" 
                      animate={{ 
                        cx: permeabilityInp.phi * 800,
                        cy: 240 - (Math.log10(calculateTimurPermeability(permeabilityInp.phi, permeabilityInp.swi) || 1) * 60) 
                      }}
                    />
                  </svg>
                </div>

                <div className="mt-8 space-y-4">
                  {(() => {
                    const fit = fitPermeabilityTransform(permeabilityInp.coreData);
                    return (
                      <>
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/10">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Empirical Transform</p>
                            <p className="text-[11px] text-amber-500 font-black">R² = {fit.r2.toFixed(3)}</p>
                          </div>
                          <p className="text-[11px] font-mono text-amber-400">log(k) = {Math.log10(fit.a).toFixed(3)} + {fit.b.toFixed(2)}·Φ</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-white/5 rounded-xl border border-white/5 text-center">
                            <p className="text-[10px] text-slate-500 uppercase mb-1">Scale Factor (a)</p>
                            <p className="text-[10px] font-bold text-white">{fit.a.toFixed(2)}</p>
                          </div>
                          <div className="p-2 bg-white/5 rounded-xl border border-white/5 text-center">
                            <p className="text-[10px] text-slate-500 uppercase mb-1">Slope (b)</p>
                            <p className="text-[10px] font-bold text-white">{fit.b.toFixed(2)}</p>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
