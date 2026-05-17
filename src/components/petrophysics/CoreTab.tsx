import React from 'react';
import { Database, Waves, Activity, MoveHorizontal, BarChart } from 'lucide-react';
import { ResponsiveContainer, LineChart as RechartLine, XAxis, YAxis, Tooltip as RechartTooltip, Legend, Line } from 'recharts';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateFormationFactor, calculateLeverettJ } from '../../lib/petrophysics';

interface CoreTabProps {
  coreInp: any;
  setCoreInp: (v: any) => void;
}

export const CoreTab: React.FC<CoreTabProps> = ({ coreInp, setCoreInp }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Core Inputs */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Laboratory Inputs</h3>
            <Database size={20} className="text-emerald-500" />
          </div>
          <div className="space-y-6">
            <section className="space-y-4">
              <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                Core Properties (φ & k)
              </h4>
              <InputWithSlider label="Core Porosity (φ)" value={coreInp.phi_core} min={0.01} max={0.45} step={0.001} unit="v/v" onChange={(v: number) => setCoreInp({...coreInp, phi_core: v})} />
              <InputWithSlider label="Core Perm (k)" value={coreInp.k_core} min={0.1} max={5000} step={1} unit="mD" onChange={(v: number) => setCoreInp({...coreInp, k_core: v})} />
              
              <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2 pt-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                Archie Parameters
              </h4>
              <InputWithSlider label="Tortuosity (a)" value={coreInp.a} min={0.5} max={1.5} step={0.01} unit="-" onChange={(v: number) => setCoreInp({...coreInp, a: v})} />
              <InputWithSlider label="Cementation (m)" value={coreInp.m} min={1.5} max={3.0} step={0.01} unit="-" onChange={(v: number) => setCoreInp({...coreInp, m: v})} />
              <InputWithSlider label="Depth Shift" value={coreInp.depthShift} min={-15} max={15} step={0.1} unit="ft" onChange={(v: number) => setCoreInp({...coreInp, depthShift: v})} />
            </section>

            <section className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                SCAL Flow Props
              </h4>
              <InputWithSlider label="Interf. Tension" value={coreInp.sigma} min={10} max={100} step={1} unit="dyn/cm" onChange={(v: number) => setCoreInp({...coreInp, sigma: v})} />
              <InputWithSlider label="Contact Angle" value={coreInp.theta} min={0} max={90} step={1} unit="deg" onChange={(v: number) => setCoreInp({...coreInp, theta: v})} />
              <InputWithSlider label="Meas. Cap P" value={coreInp.pc} min={0} max={100} step={0.5} unit="psi" onChange={(v: number) => setCoreInp({...coreInp, pc: v})} />
            </section>
          </div>
        </div>
      </div>

      {/* Integration Panel */}
      <div className="lg:col-span-8 space-y-6">
        <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_50%)]"></div>
          
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div>
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest mb-2">Core Integration / Phase 7</p>
              <h3 className="text-3xl font-black text-white italic tracking-tight uppercase">Laboratory Scale Analysis</h3>
            </div>
            <div className="text-right">
              <div className="px-4 py-2 bg-emerald-500 rounded-xl text-xs font-black text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">F = {calculateFormationFactor(coreInp.phi_core, coreInp.a, coreInp.m).toFixed(2)}</div>
              <span className="text-[10px] text-slate-500 font-mono uppercase mt-2 block tracking-tighter">Formation Factor (F)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 relative z-10">
            {/* J-Function Section */}
            <div className="p-8 bg-black/40 border border-white/5 rounded-3xl group hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic flex items-center gap-2">
                  <Waves size={14} className="text-emerald-500" />
                  Leverett J-Function
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">NORMALIZED PC</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2 py-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">Normalized J(S<sub>w</sub>)</span>
                  <span className="text-xl font-black text-emerald-500 italic">{calculateLeverettJ(coreInp.pc, coreInp.k_core, coreInp.phi_core, coreInp.sigma, coreInp.theta).toFixed(3)}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                  The Leverett J-function scales Pc data by √(k/φ) and interfacial tension (σ cos θ) for reservoir-wide normalization.
                </p>
              </div>
            </div>

            {/* Depth Shifting */}
            <div className="p-8 bg-black/40 border border-white/5 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity size={80} />
              </div>
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 italic">Depth Shift Engine</h4>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-[11px] text-slate-500 uppercase font-black tracking-widest">Alignment Offset</span>
                  <span className={cn("text-sm font-black italic", coreInp.depthShift > 0 ? "text-rose-400" : "text-emerald-400")}>
                    {coreInp.depthShift > 0 ? '+' : ''}{coreInp.depthShift} ft
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                    <span className="text-rose-500">Logger's Depth (MD)</span>
                    <span className="text-slate-600 px-2 py-0.5 rounded border border-white/5 text-center">Correlation</span>
                    <span className="text-emerald-500">Core Depth (TVD)</span>
                  </div>
                  <div className="h-14 w-full bg-slate-900/80 rounded-xl flex items-center justify-center gap-12 border border-white/5 group-hover:border-emerald-500/10 transition-all">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-white">5280.0</p>
                      <p className="text-[10px] text-slate-500 font-mono tracking-widest">FT</p>
                    </div>
                    <div className="relative">
                      <MoveHorizontal size={16} className="text-slate-700 animate-pulse" />
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-emerald-500/50 uppercase">Shift</div>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-emerald-400">{(5280.0 - coreInp.depthShift).toFixed(1)}</p>
                      <p className="text-[10px] text-slate-500 font-mono tracking-widest">CORRECTED</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h4 className="text-xs font-black text-white uppercase italic tracking-widest border-b border-white/5 pb-2 mb-6">Relative Permeability & Wettability Matrix</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 relative z-10">
            {[
              { label: 'Steady State', val: 'Direct Measurement', desc: 'Simultaneous injection of fluids.' },
              { label: 'JBN Method', val: 'Unsteady State', desc: 'Derived from displacement history.' },
              { label: 'USBM Index', val: 'Wettability', desc: 'Area ratio under Pc curves.' }
            ].map((item, i) => (
              <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-xs font-black text-white italic mb-2 uppercase">{item.val}</p>
                <p className="text-[10px] text-slate-600 font-mono leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SCAL Plot */}
        <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 shadow-2xl relative overflow-hidden">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 italic mb-8">
            <BarChart size={16} className="text-emerald-400" />
            Relative Permeability (Core Derived)
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartLine data={[
                { sw: 0.20, krw: 0.00, kro: 1.00 },
                { sw: 0.30, krw: 0.02, kro: 0.65 },
                { sw: 0.40, krw: 0.06, kro: 0.38 },
                { sw: 0.50, krw: 0.15, kro: 0.20 },
                { sw: 0.60, krw: 0.30, kro: 0.08 },
                { sw: 0.70, krw: 0.55, kro: 0.02 },
                { sw: 0.80, krw: 0.80, kro: 0.00 }
              ]}>
                <XAxis dataKey="sw" stroke="#64748b" fontSize={9} label={{ value: 'Water Saturation (Sw)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                <YAxis stroke="#64748b" fontSize={9} label={{ value: 'Relative Permeability (kr)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                <RechartTooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="krw" stroke="#3b82f6" strokeWidth={3} dot={true} name="krw (Gas/Water)" />
                <Line type="monotone" dataKey="kro" stroke="#f59e0b" strokeWidth={3} dot={true} name="kro (Oil)" />
              </RechartLine>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-6 text-center italic uppercase leading-none">Brooks-Corey derived relative permeability curves from SCAL laboratory data.</p>
        </div>
      </div>
    </div>
  );
};
