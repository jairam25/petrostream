import React from 'react';
import { Waves } from 'lucide-react';
import { ResponsiveContainer, LineChart as RechartLine, XAxis, YAxis, Tooltip as RechartTooltip, Legend, Line, CartesianGrid } from 'recharts';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateGradientIntersection, calculateOWCFromFWL } from '../../lib/petrophysics';

interface ContactsTabProps {
  contactInp: any;
  setContactInp: (v: any) => void;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({ contactInp, setContactInp }) => {
  const goc = calculateGradientIntersection(contactInp.gasGrad, contactInp.gasPAtRef, contactInp.refDepth, contactInp.oilGrad, contactInp.oilPAtRef, contactInp.refDepth);
  const owc_intersect = calculateGradientIntersection(contactInp.oilGrad, contactInp.oilPAtRef, contactInp.refDepth, contactInp.waterGrad, contactInp.waterPAtRef, contactInp.refDepth);
  const owc_pc = calculateOWCFromFWL(contactInp.fwl, contactInp.pcEntry, contactInp.waterGrad, contactInp.oilGrad);

  // Data for Chart
  const chartData = [];
  for (let d = contactInp.refDepth - 200; d <= contactInp.refDepth + 300; d += 10) {
    chartData.push({
      depth: d,
      gas: contactInp.gasPAtRef + contactInp.gasGrad * (d - contactInp.refDepth),
      oil: contactInp.oilPAtRef + contactInp.oilGrad * (d - contactInp.refDepth),
      water: contactInp.waterPAtRef + contactInp.waterGrad * (d - contactInp.refDepth)
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Gradient Inputs */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-white italic tracking-tight uppercase">GRADIENT DYNAMICS</h3>
            <Waves size={20} className="text-cyan-500" />
          </div>
          <div className="space-y-6 h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            <section className="space-y-4">
              <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                Fluid Gradients
              </h4>
              <InputWithSlider label="Gas Gradient" value={contactInp.gasGrad} min={0.01} max={0.15} step={0.01} unit="psi/ft" onChange={(v: number) => setContactInp({...contactInp, gasGrad: v})} />
              <InputWithSlider label="Oil Gradient" value={contactInp.oilGrad} min={0.25} max={0.4} step={0.01} unit="psi/ft" onChange={(v: number) => setContactInp({...contactInp, oilGrad: v})} />
              <InputWithSlider label="Water Gradient" value={contactInp.waterGrad} min={0.4} max={0.55} step={0.01} unit="psi/ft" onChange={(v: number) => setContactInp({...contactInp, waterGrad: v})} />
            </section>

            <section className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                Reference Pressures
              </h4>
              <InputWithSlider label="Ref Depth" value={contactInp.refDepth} min={0} max={10000} step={10} unit="ft" onChange={(v: number) => setContactInp({...contactInp, refDepth: v})} />
              <InputWithSlider label="Gas P @ Ref" value={contactInp.gasPAtRef} min={1000} max={5000} step={10} unit="psi" onChange={(v: number) => setContactInp({...contactInp, gasPAtRef: v})} />
              <InputWithSlider label="Oil P @ Ref" value={contactInp.oilPAtRef} min={1000} max={5000} step={10} unit="psi" onChange={(v: number) => setContactInp({...contactInp, oilPAtRef: v})} />
              <InputWithSlider label="Water P @ Ref" value={contactInp.waterPAtRef} min={1000} max={5000} step={10} unit="psi" onChange={(v: number) => setContactInp({...contactInp, waterPAtRef: v})} />
            </section>

            <section className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-1 bg-rose-500 rounded-full"></div>
                Capillary Corections
              </h4>
              <InputWithSlider label="Free Water Level" value={contactInp.fwl} min={0} max={15000} step={10} unit="ft TVD" onChange={(v: number) => setContactInp({...contactInp, fwl: v})} />
              <InputWithSlider label="Entry Pc" value={contactInp.pcEntry} min={0} max={50} step={0.5} unit="psi" onChange={(v: number) => setContactInp({...contactInp, pcEntry: v})} />
            </section>
          </div>
        </div>
      </div>

      {/* Analysis Column */}
      <div className="lg:col-span-8 space-y-6">
        <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.05),transparent_50%)]"></div>
          
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div>
              <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest mb-2">Gradient Analysis / Phase 8</p>
              <h3 className="text-3xl font-black text-white italic tracking-tight uppercase">Fluid Contact Mapping</h3>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">Intersection GOC</p>
                <p className="text-xl font-black text-white italic">{goc ? goc.toFixed(1) : 'N/A'} <span className="text-xs font-normal text-slate-500">ft</span></p>
              </div>
              <div className="text-right border-l border-white/10 pl-4">
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">Intersection OWC</p>
                <p className="text-xl font-black text-white italic">{owc_intersect ? owc_intersect.toFixed(1) : 'N/A'} <span className="text-xs font-normal text-slate-500">ft</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 relative z-10">
            <div className="p-8 bg-black/40 border border-white/5 rounded-3xl group hover:border-cyan-500/30 transition-all">
              <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Capillary Transition Analysis</h4>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-mono">Free Water Level (FWL)</span>
                  <span className="text-sm font-black text-white">{contactInp.fwl.toFixed(0)} ft</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-mono">Entry Capillary Pressure</span>
                  <span className="text-sm font-black text-white">{contactInp.pcEntry.toFixed(1)} psi</span>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] text-rose-400 font-black uppercase italic tracking-wider">Calculated OWC</span>
                  <span className="text-2xl font-black text-white italic">{owc_pc.toFixed(1)} ft</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono italic leading-relaxed">OWC is shallow of FWL by {Math.abs(contactInp.fwl - owc_pc).toFixed(1)} ft due to entry pressure threshold.</p>
              </div>
            </div>

            <div className="p-8 bg-black/40 border border-white/5 rounded-3xl">
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Fluid Sampling Reference</h4>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {[
                  { tool: 'MDT / RCI', desc: 'Modular formation dynamic testing. Real-time pressure gradients and fluid contamination monitoring.' },
                  { tool: 'RFT', desc: 'Repeat Formation Tester. Traditional first-generation discrete point pressure measurement.' },
                  { tool: 'DST', desc: 'Drill Stem Test. Direct flow measurement for productivity index, skin factor, and reservoir boundaries.' },
                  { tool: 'Gradient Mapping', desc: 'Gas (0.01-0.1 psi/ft), Light Oil (0.25-0.35 psi/ft), Water (0.43-0.5 psi/ft).' }
                ].map((r, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[11px] font-black text-white italic uppercase tracking-tighter">{r.tool}</p>
                    <p className="text-[10px] text-slate-500 font-mono leading-relaxed">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-96 w-full relative z-10 bg-black/20 rounded-3xl p-6 border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <RechartLine data={chartData} layout="vertical" margin={{ left: 40, right: 30, top: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis type="number" orientation="top" stroke="#64748b" fontSize={9} label={{ value: 'Pressure (psi)', position: 'insideTop', offset: -10, fill: '#64748b', fontSize: 10 }} />
                <YAxis type="number" dataKey="depth" reversed tickFormatter={(v) => v.toFixed(0)} stroke="#64748b" fontSize={9} label={{ value: 'Depth (ft TVD)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                <RechartTooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="gas" stroke="#06b6d4" strokeWidth={2} dot={false} name="Gas Gradient" />
                <Line type="monotone" dataKey="oil" stroke="#f59e0b" strokeWidth={2} dot={false} name="Oil Gradient" />
                <Line type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={2} dot={false} name="Water Gradient" />
              </RechartLine>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
