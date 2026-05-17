import React from 'react';
import { Filter, Activity } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip as RechartTooltip, Legend, Area, Bar } from 'recharts';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateNetPayStats, calculateOOIP } from '../../lib/petrophysics';

interface NetPayTabProps {
  netPayInp: any;
  setNetPayInp: (v: any) => void;
  mockLogData: any[];
}

export const NetPayTab: React.FC<NetPayTabProps> = ({ netPayInp, setNetPayInp, mockLogData }) => {
  const stats = calculateNetPayStats(mockLogData, netPayInp);
  const ooip = calculateOOIP(netPayInp.area, stats.netPayThickness, stats.avgPhi, stats.avgSw, netPayInp.bo);
  
  // Generate sensitivity data
  const sensitivityData = [];
  for (let p = 0.05; p <= 0.25; p += 0.02) {
    const s = calculateNetPayStats(mockLogData, { ...netPayInp, minPhi: p });
    const o = calculateOOIP(netPayInp.area, s.netPayThickness, s.avgPhi, s.avgSw, netPayInp.bo);
    sensitivityData.push({ cutoff: p, netPay: s.netPayThickness, ooip: o / 1e6 });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cutoff Controls */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-white italic tracking-tight uppercase">CUTOFF CONTROL</h3>
            <Filter size={20} className="text-emerald-500" />
          </div>
          <div className="space-y-6">
            <InputWithSlider label="Min Porosity (φ)" value={netPayInp.minPhi} min={0} max={0.4} step={0.01} unit="v/v" onChange={(v: number) => setNetPayInp({...netPayInp, minPhi: v})} />
            <InputWithSlider label="Max Vshale (Vsh)" value={netPayInp.maxVsh} min={0} max={1} step={0.01} unit="v/v" onChange={(v: number) => setNetPayInp({...netPayInp, maxVsh: v})} />
            <InputWithSlider label="Max Saturation (Sw)" value={netPayInp.maxSw} min={0} max={1} step={0.01} unit="v/v" onChange={(v: number) => setNetPayInp({...netPayInp, maxSw: v})} />
            <InputWithSlider label="Min Permeability (k)" value={netPayInp.minK} min={0.1} max={500} step={0.1} unit="md" onChange={(v: number) => setNetPayInp({...netPayInp, minK: v})} />
            
            <div className="space-y-4 pt-6 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Volumetric Parameters</h4>
              <InputWithSlider label="Drainage Area" value={netPayInp.area} min={10} max={10000} step={10} unit="acres" onChange={(v: number) => setNetPayInp({...netPayInp, area: v})} />
              <InputWithSlider label="Oil FVF (Bo)" value={netPayInp.bo} min={1.0} max={2.0} step={0.01} unit="rb/stb" onChange={(v: number) => setNetPayInp({...netPayInp, bo: v})} />
            </div>
          </div>
        </div>
      </div>

      {/* Results & Sensitivity */}
      <div className="lg:col-span-8 space-y-6">
        <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_50%)]"></div>
          
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div>
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest mb-2">Pay Determination / Phase 6</p>
              <h3 className="text-3xl font-black text-white italic tracking-tight uppercase">Net Pay Inventory</h3>
            </div>
            <div className="text-right">
              <div className="px-4 py-2 bg-emerald-500 rounded-xl text-lg font-black text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">NTG: {stats.ntg.toFixed(3)}</div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-2 block">Net-to-Gross Ratio</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10 mb-10">
            {[
              { label: 'Gross', val: stats.grossThickness, unit: 'ft', sub: 'Interval' },
              { label: 'Net Res', val: stats.netReservoirThickness, unit: 'ft', sub: 'φ > ' + netPayInp.minPhi },
              { label: 'Net Pay', val: stats.netPayThickness, unit: 'ft', sub: 'HC Productive', highlight: true },
              { label: 'OOIP', val: (ooip / 1e6).toFixed(1), unit: 'MMstb', sub: 'Current Estimate', color: 'text-amber-400' }
            ].map((card, i) => (
              <div key={i} className={cn("p-4 rounded-2xl border border-white/5 bg-white/5", card.highlight && "bg-emerald-500/10 border-emerald-500/20")}>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{card.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-xl font-black text-white italic", card.color)}>{card.val}</span>
                  <span className="text-[10px] font-bold text-slate-600">{card.unit}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono italic mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6 relative z-10">
            <h4 className="text-[12px] font-black text-white uppercase italic tracking-widest border-b border-white/10 pb-4 mb-4">Averaging Logic (Linear)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-black/40 border border-white/5 rounded-3xl text-center">
                <p className="text-[11px] text-slate-500 uppercase font-black mb-2">Avg Phi (Pay)</p>
                <p className="text-3xl font-black text-emerald-400 italic">{(stats.avgPhi * 100).toFixed(1)}%</p>
              </div>
              <div className="p-6 bg-black/40 border border-white/5 rounded-3xl text-center">
                <p className="text-[11px] text-slate-500 uppercase font-black mb-2">Avg Sw (Pay)</p>
                <p className="text-3xl font-black text-indigo-400 italic">{(stats.avgSw * 100).toFixed(1)}%</p>
              </div>
              <div className="p-6 bg-black/40 border border-white/5 rounded-3xl text-center">
                <p className="text-[11px] text-slate-500 uppercase font-black mb-2">Avg Perm (Pay)</p>
                <p className="text-3xl font-black text-amber-400 italic">{stats.avgK.toFixed(1)} <span className="text-xs font-normal">mD</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Sensitivity Chart */}
        <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 italic">
              <Activity size={16} className="text-emerald-400" />
              Phi Cutoff Sensitivity Analysis
            </h4>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={sensitivityData}>
                <defs>
                  <linearGradient id="ooipGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="cutoff" stroke="#64748b" fontSize={9} tickFormatter={(v) => (v*100).toFixed(0) + '%'} label={{ value: 'Porosity Cutoff (%)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={9} label={{ value: 'Net Pay (ft)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={9} label={{ value: 'OOIP (MMstb)', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 10 }} />
                <RechartTooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                <Area yAxisId="right" type="monotone" dataKey="ooip" fill="url(#ooipGradient)" stroke="#f59e0b" name="OOIP Potential" />
                <Bar yAxisId="left" dataKey="netPay" barSize={30} fill="#10b981" fillOpacity={0.4} name="Net Pay Thickness" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-6 text-center italic">Cross-variable sensitivity: Impact of increasing φ-cutoff on stratigraphic reserves inventory.</p>
        </div>
      </div>
    </div>
  );
};
