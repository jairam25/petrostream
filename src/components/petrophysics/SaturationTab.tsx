import React from 'react';
import { Droplets } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip as RechartTooltip, Scatter } from 'recharts';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { 
  calculateRwFromSalinity, 
  calculateRwa, 
  calculateArchieSw, 
  calculateIndonesianSw, 
  calculateSimandouxSw, 
  calculateDualWaterSw, 
  calculateWaxmanSmitsSw 
} from '../../lib/petrophysics';

interface SaturationTabProps {
  saturationInp: any;
  setSaturationInp: (v: any) => void;
}

export const SaturationTab: React.FC<SaturationTabProps> = ({ saturationInp, setSaturationInp }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Saturation Inputs */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-white italic tracking-tight uppercase">SATURATION ENGINE</h3>
            <Droplets size={20} className="text-cyan-500" />
          </div>
          
          <div className="space-y-8 h-[650px] overflow-y-auto pr-2 custom-scrollbar">
            <section className="space-y-4">
              <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                Electrical Properties
              </h4>
              <div className="space-y-4">
                <InputWithSlider label="Rt (Deep Res)" value={saturationInp.rt} min={0.2} max={2000} step={0.1} unit="Ωm" onChange={(v: number) => setSaturationInp({...saturationInp, rt: v})} />
                <InputWithSlider label="Rw (Water Res)" value={saturationInp.rw} min={0.01} max={1.0} step={0.001} unit="Ωm" onChange={(v: number) => setSaturationInp({...saturationInp, rw: v})} />
                <InputWithSlider label="Porosity (φ)" value={saturationInp.phi} min={0.01} max={0.45} step={0.001} unit="v/v" onChange={(v: number) => setSaturationInp({...saturationInp, phi: v})} />
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Archie Parameters (a, m, n)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">a</label>
                  <input type="number" step="0.01" value={saturationInp.a} onChange={e => setSaturationInp({...saturationInp, a: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">m</label>
                  <input type="number" step="0.01" value={saturationInp.m} onChange={e => setSaturationInp({...saturationInp, m: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">n</label>
                  <input type="number" step="0.1" value={saturationInp.n} onChange={e => setSaturationInp({...saturationInp, n: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none" />
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Shaly Sand Parameters</h4>
              <div className="space-y-4">
                <InputWithSlider label="Vshale" value={saturationInp.vsh} min={0} max={1} step={0.01} unit="v/v" onChange={(v: number) => setSaturationInp({...saturationInp, vsh: v})} />
                <InputWithSlider label="Rsh (Shale Rt)" value={saturationInp.rsh} min={0.5} max={20} step={0.1} unit="Ωm" onChange={(v: number) => setSaturationInp({...saturationInp, rsh: v})} />
                
                {saturationInp.method === 'waxmansmits' && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in duration-300">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase">Qv (CEC)</label>
                      <input type="number" step="0.01" value={saturationInp.qv} onChange={e => setSaturationInp({...saturationInp, qv: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase">B (Mobility)</label>
                      <input type="number" step="0.1" value={saturationInp.b} onChange={e => setSaturationInp({...saturationInp, b: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none" />
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rw Determination (Tools)</h4>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer" onClick={() => setSaturationInp({...saturationInp, rw: calculateRwFromSalinity(saturationInp.salinity, saturationInp.temp)})}>
                  <p className="text-[11px] font-black text-white uppercase italic mb-1">From ppm Salinity</p>
                  <p className="text-[10px] text-slate-500 uppercase">Current: {calculateRwFromSalinity(saturationInp.salinity, saturationInp.temp).toFixed(3)} Ωm</p>
                </button>
                <button className="w-full text-left p-3 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer" onClick={() => setSaturationInp({...saturationInp, rw: calculateRwa(saturationInp.rt, saturationInp.phi, saturationInp.m, saturationInp.a)})}>
                  <p className="text-[11px] font-black text-white uppercase italic mb-1">Apparent Rw (Rwa)</p>
                  <p className="text-[10px] text-slate-500 uppercase">Current: {calculateRwa(saturationInp.rt, saturationInp.phi, saturationInp.m, saturationInp.a).toFixed(3)} Ωm</p>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Calculation Output Column */}
      <div className="lg:col-span-8 space-y-6">
        <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.05),transparent_50%)]"></div>
          
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div>
              <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest mb-2">Saturation Modeling / Phase 4</p>
              <h3 className="text-3xl font-black text-white italic tracking-tight uppercase">WATER SATURATION (Sw)</h3>
            </div>
            <div className="flex gap-2">
              {(['archie', 'indonesian', 'simandoux', 'dualwater', 'waxmansmits'] as const).map(m => (
                <button 
                  key={m}
                  onClick={() => setSaturationInp({...saturationInp, method: m})}
                  className={cn(
                    "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                    saturationInp.method === m ? "bg-cyan-500 border-cyan-400 text-white" : "bg-white/5 border-white/10 text-slate-500"
                  )}
                >{m === 'waxmansmits' ? 'W-S' : m}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            <div className="space-y-8">
              <div className="p-8 bg-cyan-500/5 rounded-3xl border border-cyan-500/10 text-center relative">
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4 italic">Resulting Sw ({saturationInp.method})</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-7xl font-black italic text-white tracking-tighter">
                    {Math.round((
                      saturationInp.method === 'archie' ? calculateArchieSw(saturationInp.a, saturationInp.rw, saturationInp.phi, saturationInp.m, saturationInp.rt, saturationInp.n) :
                      saturationInp.method === 'indonesian' ? calculateIndonesianSw(saturationInp.vsh, saturationInp.rsh, saturationInp.phi, saturationInp.rw, saturationInp.rt, saturationInp.a, saturationInp.m, saturationInp.n) :
                      saturationInp.method === 'simandoux' ? calculateSimandouxSw(saturationInp.vsh, saturationInp.rsh, saturationInp.phi, saturationInp.rw, saturationInp.rt, saturationInp.a, saturationInp.m, saturationInp.n) :
                      saturationInp.method === 'dualwater' ? calculateDualWaterSw(saturationInp.phi, saturationInp.vsh, saturationInp.nphi_sh, saturationInp.rw, saturationInp.rwb, saturationInp.rt, saturationInp.m, saturationInp.n) :
                      calculateWaxmanSmitsSw(saturationInp.phi, saturationInp.rw, saturationInp.rt, saturationInp.m, saturationInp.n, saturationInp.qv, saturationInp.b)
                    ) * 100)}
                  </span>
                  <span className="text-2xl font-black text-slate-600">%</span>
                </div>
                <div className="mt-8 pt-8 border-t border-white/5">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 italic">PORE VOLUME OIL (%)</p>
                  <div className="text-5xl font-black text-white italic tracking-tighter">
                    {Math.round(100 - (
                      saturationInp.method === 'archie' ? calculateArchieSw(saturationInp.a, saturationInp.rw, saturationInp.phi, saturationInp.m, saturationInp.rt, saturationInp.n) :
                      saturationInp.method === 'indonesian' ? calculateIndonesianSw(saturationInp.vsh, saturationInp.rsh, saturationInp.phi, saturationInp.rw, saturationInp.rt, saturationInp.a, saturationInp.m, saturationInp.n) :
                      saturationInp.method === 'simandoux' ? calculateSimandouxSw(saturationInp.vsh, saturationInp.rsh, saturationInp.phi, saturationInp.rw, saturationInp.rt, saturationInp.a, saturationInp.m, saturationInp.n) :
                      saturationInp.method === 'dualwater' ? calculateDualWaterSw(saturationInp.phi, saturationInp.vsh, saturationInp.nphi_sh, saturationInp.rw, saturationInp.rwb, saturationInp.rt, saturationInp.m, saturationInp.n) :
                      calculateWaxmanSmitsSw(saturationInp.phi, saturationInp.rw, saturationInp.rt, saturationInp.m, saturationInp.n, saturationInp.qv, saturationInp.b)
                    ) * 100)}%
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-white uppercase italic tracking-widest border-b border-white/10 pb-4 mb-4">Method Delta Analysis</h4>
                {[
                  { label: 'Archie (Clean)', val: calculateArchieSw(saturationInp.a, saturationInp.rw, saturationInp.phi, saturationInp.m, saturationInp.rt, saturationInp.n) },
                  { label: 'Indonesian', val: calculateIndonesianSw(saturationInp.vsh, saturationInp.rsh, saturationInp.phi, saturationInp.rw, saturationInp.rt, saturationInp.a, saturationInp.m, saturationInp.n) },
                  { label: 'Simandoux', val: calculateSimandouxSw(saturationInp.vsh, saturationInp.rsh, saturationInp.phi, saturationInp.rw, saturationInp.rt, saturationInp.a, saturationInp.m, saturationInp.n) },
                  { label: 'Dual Water', val: calculateDualWaterSw(saturationInp.phi, saturationInp.vsh, saturationInp.nphi_sh, saturationInp.rw, saturationInp.rwb, saturationInp.rt, saturationInp.m, saturationInp.n) },
                  { label: 'Waxman-Smits', val: calculateWaxmanSmitsSw(saturationInp.phi, saturationInp.rw, saturationInp.rt, saturationInp.m, saturationInp.n, saturationInp.qv, saturationInp.b) }
                ].map(m => (
                  <div key={m.label} className="flex justify-between items-center text-[10px] font-bold text-slate-400 p-2 border-b border-white/5">
                    <span>{m.label}</span>
                    <span className={cn("text-white font-mono", m.label.toLowerCase().includes(saturationInp.method) && "text-cyan-400 font-black")}>{(m.val * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-cyan-500/5 rounded-3xl border border-cyan-500/10 p-8 flex flex-col items-center">
                <h5 className="text-[11px] font-black text-white uppercase italic mb-6">Interactive Pickett Plot</h5>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis 
                        type="number" 
                        dataKey="rt" 
                        name="Resistivity" 
                        scale="log" 
                        domain={[0.1, 1000]} 
                        stroke="#94a3b8" 
                        label={{ value: 'Rt (Ωm)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 10 }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="phi" 
                        name="Porosity" 
                        scale="log" 
                        domain={[0.01, 1]} 
                        stroke="#94a3b8"
                        label={{ value: 'Φ', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                      />
                      <RechartTooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="Water Line" data={[
                        { rt: (saturationInp.rw || 0.1) / Math.pow(0.01, saturationInp.m || 2), phi: 0.01 },
                        { rt: (saturationInp.rw || 0.1) / Math.pow(1.0, saturationInp.m || 2), phi: 1.0 }
                      ]} line={{ stroke: '#10b981', strokeWidth: 1 }} shape={() => null} />
                      <Scatter name="Zone" data={[{ rt: saturationInp.rt, phi: saturationInp.phi }]} fill="#06b6d4" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-slate-500 text-center mt-4 italic">
                  Lithology Exponent m={saturationInp.m.toFixed(2)}, Water Res Rw={saturationInp.rw.toFixed(3)}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
