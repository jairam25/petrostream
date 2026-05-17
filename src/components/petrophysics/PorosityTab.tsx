import React from 'react';
import { Layers, Check, Target, Activity, Waves } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { 
  calculateDensityPorosity, 
  calculateSonicPorosityWyllie, 
  calculateNeutronMatrixCorrection, 
  calculateNDCrossplotPorosity, 
  applyShaleCorrection, 
  calculateEffectivePorosity, 
  calculateIGR 
} from '../../lib/petrophysics';

interface PorosityTabProps {
  porosityInp: any;
  setPorosityInp: (v: any) => void;
  vshaleInp: any;
}

export const PorosityTab: React.FC<PorosityTabProps> = ({ porosityInp, setPorosityInp, vshaleInp }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Matrix & Fluid Parameters */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-white italic tracking-tight uppercase">MATRIX SETTINGS</h3>
            <Layers size={20} className="text-emerald-500" />
          </div>
          <div className="space-y-6">
            <div className="flex gap-2">
              {(['sandstone', 'limestone', 'dolomite'] as const).map(lith => (
                <button 
                  key={lith}
                  onClick={() => {
                    let rho = 2.71;
                    let dt = 47.5;
                    if (lith === 'sandstone') { rho = 2.65; dt = 55.5; }
                    if (lith === 'dolomite') { rho = 2.87; dt = 43.5; }
                    setPorosityInp({...porosityInp, lithology: lith, rhoMatrix: rho, dtMatrix: dt});
                  }}
                  className={cn(
                    "flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all",
                    porosityInp.lithology === lith 
                      ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                      : "bg-white/5 border-white/10 text-slate-500 hover:border-white/20"
                  )}
                >{lith}</button>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <InputWithSlider label="Log Bulk Density" value={porosityInp.rhob} min={1.5} max={3.0} step={0.01} unit="g/cc" onChange={(v: number) => setPorosityInp({...porosityInp, rhob: v})} />
              <InputWithSlider label="Neutron Phi" value={porosityInp.nphi} min={0} max={0.6} step={0.01} unit="v/v" onChange={(v: number) => setPorosityInp({...porosityInp, nphi: v})} />
              <InputWithSlider label="Log Delta-T" value={porosityInp.dt} min={40} max={180} step={0.1} unit="μs/ft" onChange={(v: number) => setPorosityInp({...porosityInp, dt: v})} />
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fluid & Shell Params</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 uppercase">Rho Fluid</label>
                  <input type="number" step="0.1" value={porosityInp.rhoFluid} onChange={e => setPorosityInp({...porosityInp, rhoFluid: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 uppercase">Vshale</label>
                  <input type="number" step="0.01" value={porosityInp.vshale} onChange={e => setPorosityInp({...porosityInp, vshale: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none" />
                </div>
              </div>
              <button className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all" onClick={() => setPorosityInp({...porosityInp, applyShaleCorrection: !porosityInp.applyShaleCorrection})}>
                <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-all", porosityInp.applyShaleCorrection ? "bg-emerald-500 border-emerald-400" : "border-white/20")}>
                  {porosityInp.applyShaleCorrection && <Check size={10} className="text-white" />}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Apply Shale Correction (φe)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40">
          <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4 italic">Theory Corner</h4>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            <span className="text-white font-bold">Effective Porosity (φe)</span> represents the interconnected pore space available for fluid flow. In shaly formations, total porosity (φt) overestimates storage capacity because it includes water bound to clay surfaces.
          </p>
        </div>
      </div>

      {/* porosity Results Engine */}
      <div className="lg:col-span-8 space-y-6">
        <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_50%)]"></div>
          
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div>
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest mb-2">Porosity Analysis / Phase 3</p>
              <h3 className="text-3xl font-black text-white italic tracking-tight uppercase">CROSS-CORRELATED POROSITY</h3>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">Matrix Reference</div>
              <div className="text-xs font-black text-white uppercase italic">{porosityInp.lithology}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-12">
            {/* Result Cards */}
            {[
              { 
                label: 'Density Porosity', 
                val: calculateDensityPorosity(porosityInp.rhob, porosityInp.rhoMatrix, porosityInp.rhoFluid),
                corrVal: applyShaleCorrection(calculateDensityPorosity(porosityInp.rhob, porosityInp.rhoMatrix, porosityInp.rhoFluid), porosityInp.vshale, porosityInp.dphiShale),
                unit: 'v/v', color: 'emerald', recommended: true
              },
              { 
                label: 'Sonic Porosity', 
                val: calculateSonicPorosityWyllie(porosityInp.dt, porosityInp.dtMatrix, porosityInp.dtFluid),
                corrVal: applyShaleCorrection(calculateSonicPorosityWyllie(porosityInp.dt, porosityInp.dtMatrix, porosityInp.dtFluid), porosityInp.vshale, (porosityInp.dtShale - porosityInp.dtMatrix)/(porosityInp.dtFluid - porosityInp.dtMatrix)),
                unit: 'v/v', color: 'indigo', recommended: false
              },
              { 
                label: 'Neutron Porosity', 
                val: calculateNeutronMatrixCorrection(porosityInp.nphi, porosityInp.lithology),
                corrVal: applyShaleCorrection(calculateNeutronMatrixCorrection(porosityInp.nphi, porosityInp.lithology), porosityInp.vshale, porosityInp.nphiShale),
                unit: 'v/v', color: 'amber', recommended: false
              }
            ].map((res, i) => {
              const displayVal = porosityInp.applyShaleCorrection ? res.corrVal : res.val;
              return (
                <div key={i} className={cn(
                  "p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-emerald-500/30 transition-all relative overflow-hidden",
                  res.recommended && "bg-emerald-500/[0.03] border-emerald-500/20"
                )}>
                  {res.recommended && (
                    <div className="absolute top-0 right-0 px-2 py-1 bg-emerald-500 rounded-bl-lg text-[10px] font-black text-white uppercase tracking-tighter">Standard</div>
                  )}
                  <p className="text-[11px] font-black text-slate-500 uppercase mb-3 tracking-widest">{res.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={cn("text-4xl font-black italic", 
                      res.color === 'emerald' ? "text-emerald-400" : res.color === 'indigo' ? "text-indigo-400" : "text-amber-400"
                    )}>{(displayVal * 100).toFixed(1)}</span>
                    <span className="text-xs font-bold text-slate-600">%</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 text-[10px] font-bold text-slate-500 uppercase">
                    <div className="flex justify-between items-center">
                      <span>Total (φt)</span>
                      <span className="text-white">{(res.val * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Combination Methods */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-black text-white uppercase italic tracking-widest border-b border-white/10 pb-4 mb-4">Combination Crossplot Methods</h4>
              <div className="space-y-4">
                {[
                  { 
                    name: 'Neutron-Density Porosity', 
                    val: calculateNDCrossplotPorosity(
                      calculateNeutronMatrixCorrection(porosityInp.nphi, porosityInp.lithology),
                      calculateDensityPorosity(porosityInp.rhob, porosityInp.rhoMatrix, porosityInp.rhoFluid)
                    ),
                    desc: 'Standard for clean formations',
                    icon: Target,
                    recommended: true
                  },
                  { 
                    name: 'Sonic-Density Average', 
                    val: (calculateDensityPorosity(porosityInp.rhob, porosityInp.rhoMatrix, porosityInp.rhoFluid) + calculateSonicPorosityWyllie(porosityInp.dt, porosityInp.dtMatrix, porosityInp.dtFluid)) / 2,
                    desc: 'Useful in complex mineralogy',
                    icon: Activity,
                    recommended: false
                  },
                  { 
                    name: 'Neutron-Sonic Average', 
                    val: (calculateNeutronMatrixCorrection(porosityInp.nphi, porosityInp.lithology) + calculateSonicPorosityWyllie(porosityInp.dt, porosityInp.dtMatrix, porosityInp.dtFluid)) / 2,
                    desc: 'Gas/Secondary Porosity check',
                    icon: Waves,
                    recommended: false
                  }
                ].map(comb => (
                  <div key={comb.name} className={cn(
                    "flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-3xl group hover:border-emerald-500/20 transition-all relative overflow-hidden",
                    comb.recommended && "border-emerald-500/30"
                  )}>
                    {comb.recommended && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 rounded-bl-xl text-[10px] font-black text-white uppercase tracking-tighter">Recommended</div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                        <comb.icon size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-white uppercase italic leading-none mb-1">{comb.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">{comb.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-white italic">{(comb.val * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visualization Canvas area */}
            <div className="bg-emerald-500/5 rounded-3xl border border-emerald-500/10 p-8 flex flex-col items-center justify-center text-center relative">
              <div className="absolute top-6 right-6">
                <div className="px-3 py-1 bg-emerald-500 rounded-lg text-[10px] font-black text-white uppercase shadow-lg shadow-emerald-500/20">Active Plot</div>
              </div>
              
              {/* Crossplot Schematic */}
              <div className="w-full aspect-square max-w-[240px] border-l-2 border-b-2 border-slate-700 relative mb-6">
                <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 text-[10px] text-slate-300 font-bold uppercase whitespace-nowrap">Log Density (g/cc)</div>
                <div className="absolute left-[-45px] top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-slate-300 font-bold uppercase whitespace-nowrap">Neutron Porosity (v/v)</div>
                
                {/* Matrix Lines */}
                <svg className="absolute inset-0 w-full h-full overflow-visible">
                  {/* Sandstone Line */}
                  <path d="M 0 240 Q 120 180 240 120" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />
                  {/* Limestone Line */}
                  <path d="M 0 240 Q 120 160 240 80" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />
                  
                  {/* Data Point */}
                  <motion.circle 
                    cx={( (porosityInp.rhob - 2.0) / 1.0 ) * 240} 
                    cy={240 - (porosityInp.nphi * 400)} 
                    r="6" 
                    fill="#10b981" 
                    className="shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                    animate={{ cx: ( (porosityInp.rhob - 2.0) / 1.0 ) * 240, cy: 240 - (porosityInp.nphi * 400) }}
                  />
                </svg>
              </div>
              
              <h5 className="text-[10px] font-black text-white uppercase italic mb-2">Lithology Visualization</h5>
              <p className="text-[11px] text-slate-500 max-w-[200px]">Data point position relative to matrix lines helps confirm grain density and fluid type.</p>
            </div>
          </div>

          <div className="mt-12 p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div className="flex gap-10">
              <div className="space-y-2 flex-1">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Effective Porosity (φe) Result</span>
                <div className="text-4xl font-black text-white italic">
                  {(calculateEffectivePorosity(
                    calculateNDCrossplotPorosity(
                      calculateNeutronMatrixCorrection(porosityInp.nphi, porosityInp.lithology),
                      calculateDensityPorosity(porosityInp.rhob, porosityInp.rhoMatrix, porosityInp.rhoFluid)
                    ),
                    vshaleInp.gr ? calculateIGR(vshaleInp.gr, vshaleInp.grClean, vshaleInp.grShale) : porosityInp.vshale
                  ) * 100).toFixed(2)}%
                </div>
                <p className="text-xs text-emerald-500/80 font-bold uppercase tracking-tighter">Verified formation storage capacity</p>
              </div>
              <div className="w-1/3 bg-black/40 rounded-3xl p-6 border border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Shale Factor</span>
                  <span className="text-[10px] font-black text-white">{(porosityInp.vshale * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500/50" style={{ width: `${porosityInp.vshale * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
