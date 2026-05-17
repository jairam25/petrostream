import React from 'react';
import { FileText, Download, Waves } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ReportingTabProps {
  // Add props if needed for dynamic reporting
}

export const ReportingTab: React.FC<ReportingTabProps> = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Summation Table */}
      <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <FileText size={120} className="text-emerald-500" />
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest mb-2">Well: AIS-EXPLORER-01 / Summation</p>
              <h3 className="text-3xl font-black text-white italic tracking-tight uppercase">Net Pay & Volumetric Summary</h3>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-bold text-emerald-400 uppercase tracking-widest hover:bg-emerald-500/20 transition-all">
              <Download size={14} /> Export LAS/CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Formation Zone</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Top (ft)</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Base (ft)</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Gross (ft)</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Net Pay (ft)</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">NTG (%)</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Avg φ (%)</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Avg Sw (%)</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">HPT (ft)</th>
                </tr>
              </thead>
              <tbody className="bg-white/[0.02]">
                {[
                  { zone: 'Lower Miocene', top: 4500, base: 4580, gross: 80, net: 42, ntg: 52.5, phi: 18.2, sw: 28.4, hpt: 5.4 },
                  { zone: 'Oligocene Upper', top: 4820, base: 4950, gross: 130, net: 88, ntg: 67.7, phi: 22.5, sw: 15.2, hpt: 16.8 },
                  { zone: 'Oligocene Lower', top: 5100, base: 5180, gross: 80, net: 15, ntg: 18.8, phi: 12.4, sw: 45.1, hpt: 1.0 },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-emerald-500/50 rounded-full"></div>
                        <span className="text-xs font-bold text-white">{row.zone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-xs text-slate-400">{row.top}</td>
                    <td className="py-4 px-4 text-center font-mono text-xs text-slate-400">{row.base}</td>
                    <td className="py-4 px-4 text-center font-mono text-xs text-slate-400">{row.gross}</td>
                    <td className="py-4 px-4 text-center font-mono text-xs text-emerald-400 font-bold">{row.net}</td>
                    <td className="py-4 px-4 text-center font-mono text-xs text-cyan-400">{row.ntg}</td>
                    <td className="py-4 px-4 text-center font-mono text-xs text-white">{row.phi}</td>
                    <td className="py-4 px-4 text-center font-mono text-xs text-rose-400">{row.sw}</td>
                    <td className="py-4 px-4 text-center font-mono text-xs text-amber-500 font-black">{row.hpt}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-emerald-500/5">
                  <td className="py-4 px-4 text-[10px] font-black text-emerald-500 uppercase italic">Field Totals</td>
                  <td colSpan={2}></td>
                  <td className="py-4 px-4 text-center font-mono text-xs font-black text-slate-400">290</td>
                  <td className="py-4 px-4 text-center font-mono text-xs font-black text-emerald-400">145</td>
                  <td className="py-4 px-4 text-center font-mono text-xs font-black text-cyan-400">50.0</td>
                  <td colSpan={2}></td>
                  <td className="py-4 px-4 text-center font-mono text-xs font-black text-amber-500">23.2</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Petrophysical Log Plot Display */}
      <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#0a0c10] relative min-h-[600px]">
        <div className="flex justify-between items-center mb-10">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-3">
            <Waves size={16} /> Composite Petrophysical Display
          </h4>
          <div className="flex gap-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Scale: 1:200</span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest underline cursor-pointer">Edit Headers</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1 border border-white/10 rounded-2xl overflow-hidden h-[500px]">
          {/* Track 1: Correlation */}
          <div className="border-r border-white/10 bg-black/40 flex flex-col">
            <div className="p-3 border-b border-white/10 text-center">
              <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">Track 1</p>
              <p className="text-[10px] font-black text-emerald-400">GR (gAPI)</p>
              <div className="flex justify-between text-[10px] text-slate-600 mt-2">
                <span>0</span><span>150</span>
              </div>
            </div>
            <div className="flex-1 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30">
              <svg className="absolute inset-0 w-full h-full">
                <path d="M 20 0 Q 60 50, 30 100 T 50 200 T 20 300 T 70 400 T 40 500" stroke="#10b981" fill="none" strokeWidth="1" />
              </svg>
            </div>
          </div>

          {/* Track 2: Depth */}
          <div className="w-16 border-r border-white/10 flex flex-col">
            <div className="p-3 border-b border-white/10 text-center bg-white/5">
              <p className="text-[11px] font-bold text-slate-500 uppercase">DEPTH</p>
            </div>
            <div className="flex-1 flex flex-col justify-between items-center py-10 font-mono text-[11px] text-slate-500">
              {[4500, 4600, 4700, 4800, 4900, 5000].map(d => <span key={d}>{d}</span>)}
            </div>
          </div>

          {/* Track 3: Resistivity */}
          <div className="border-r border-white/10 bg-black/40 flex flex-col">
            <div className="p-3 border-b border-white/10 text-center">
              <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">Track 2</p>
              <p className="text-[10px] font-black text-rose-400">RT (ohm.m)</p>
              <div className="flex justify-between text-[10px] text-slate-600 mt-2">
                <span>0.2</span><span>2000</span>
              </div>
            </div>
            <div className="flex-1 relative overflow-hidden">
              <svg className="absolute inset-0 w-full h-full">
                <path d="M 10 0 L 10 150 L 80 180 L 90 220 L 15 250 L 10 500" stroke="#fb7185" fill="none" strokeWidth="1" />
              </svg>
            </div>
          </div>

          {/* Track 4: Porosity */}
          <div className="border-r border-white/10 bg-black/40 flex flex-col">
            <div className="p-3 border-b border-white/10 text-center">
              <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">Track 3</p>
              <p className="text-[10px] font-black text-cyan-400">φ / Sw</p>
              <div className="flex justify-between text-[10px] text-slate-600 mt-2">
                <span>60</span><span>0</span>
              </div>
            </div>
            <div className="flex-1 relative overflow-hidden">
              <svg className="absolute inset-0 w-full h-full">
                <path d="M 50 0 C 70 50, 40 100, 60 150 C 80 200, 10 250, 50 500" stroke="#22d3ee" fill="none" strokeWidth="1" />
                <path d="M 10 0 C 30 50, 60 100, 20 150 C 40 200, 80 250, 10 500" stroke="#f43f5e" fill="none" strokeWidth="1" strokeDasharray="4 2" />
              </svg>
            </div>
          </div>

          {/* Track 5: Pay Flag */}
          <div className="bg-black/40 flex flex-col">
            <div className="p-3 border-b border-white/10 text-center">
              <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">Track 4</p>
              <p className="text-[10px] font-black text-amber-400">NET PAY</p>
            </div>
            <div className="flex-1 relative py-4">
              <div className="absolute top-[150px] h-[70px] w-full bg-emerald-500/30 border-y border-emerald-500/50 flex items-center justify-center">
                <span className="text-[10px] rotate-90 font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">PAY ZONE A</span>
              </div>
              <div className="absolute top-[280px] h-[120px] w-full bg-emerald-500/30 border-y border-emerald-500/50 flex items-center justify-center">
                <span className="text-[10px] rotate-90 font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">PAY ZONE B</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex gap-6 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500/50 border border-emerald-500/50"></div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Hydrocarbon Pay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white/5 border border-white/10"></div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Non-Reservoir / Wet</span>
          </div>
        </div>
      </div>
    </div>
  );
};
