import React, { useState } from 'react';
import { Layers, Activity, Zap, Shield, Search, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';

interface InterpretationTabProps {
  multiminInp: any;
  setMultiminInp: (v: any) => void;
  // Add other props as needed
}

export const InterpretationTab: React.FC<InterpretationTabProps> = ({ multiminInp, setMultiminInp }) => {
  const [activeLogic, setActiveLogic] = useState<'matrix' | 'facies' | 'probabilistic'>('matrix');

  // Matrix Inversion Logic (Demo)
  const calculateMultimineral = (rhob: number, nphi: number, pef: number) => {
    // Mineral properties (Standardized)
    const sand = { rho: 2.65, nphi: -0.03, u: 4.8 }; 
    const lime = { rho: 2.71, nphi: 0.00, u: 13.8 };
    const dolo = { rho: 2.87, nphi: 0.04, u: 9.0 };
    
    // Normalized distance based solver for demonstration
    const dSand = Math.sqrt(Math.pow(rhob - sand.rho, 2) + Math.pow(nphi - sand.nphi, 2) + Math.pow(pef - 1.81, 2));
    const dLime = Math.sqrt(Math.pow(rhob - lime.rho, 2) + Math.pow(nphi - lime.nphi, 2) + Math.pow(pef - 5.08, 2));
    const dDolo = Math.sqrt(Math.pow(rhob - dolo.rho, 2) + Math.pow(nphi - dolo.nphi, 2) + Math.pow(pef - 3.14, 2));
    
    const invSand = 1 / Math.max(0.001, dSand);
    const invLime = 1 / Math.max(0.001, dLime);
    const invDolo = 1 / Math.max(0.001, dDolo);
    
    const totalInv = invSand + invLime + invDolo;
    
    const bulkMatrixRho = (invSand * sand.rho + invLime * lime.rho + invDolo * dolo.rho) / totalInv;
    const phi = Math.max(0, (bulkMatrixRho - rhob) / (bulkMatrixRho - 1.0));
    const matrixFrac = 1 - phi;
    
    return {
      sand: (invSand / totalInv) * matrixFrac,
      lime: (invLime / totalInv) * matrixFrac,
      dolo: (invDolo / totalInv) * matrixFrac,
      phi: phi
    };
  };

  const results = calculateMultimineral(multiminInp.rhob, multiminInp.nphi, multiminInp.pef);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">Interpretation Engine</h3>
          <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-widest">Matrix Inversion & Facies Classification</p>
        </div>
        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
          {[
            { id: 'matrix', label: 'Matrix Solver', icon: Layers },
            { id: 'facies', label: 'E-Facies', icon: Activity },
            { id: 'probabilistic', label: 'Probabilistic', icon: Zap }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveLogic(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                activeLogic === tab.id ? "bg-emerald-500 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeLogic === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-3xl p-8 bg-black/40 border-white/5">
              <h4 className="text-xs font-black text-white uppercase italic tracking-widest mb-8 border-b border-white/5 pb-4">Log Inputs</h4>
              <div className="space-y-6">
                <InputWithSlider label="Bulk Density (Rhob)" value={multiminInp.rhob} min={1.9} max={3.0} step={0.01} unit="g/cc" onChange={(v: number) => setMultiminInp({...multiminInp, rhob: v})} />
                <InputWithSlider label="Neutron Phi (Nphi)" value={multiminInp.nphi} min={0} max={0.45} step={0.01} unit="v/v" onChange={(v: number) => setMultiminInp({...multiminInp, nphi: v})} />
                <InputWithSlider label="Photoelectric (Pef)" value={multiminInp.pef} min={1} max={10} step={0.1} unit="b/e" onChange={(v: number) => setMultiminInp({...multiminInp, pef: v})} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="glass-card rounded-3xl p-10 bg-[#05070a] border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_50%)]"></div>
              <h4 className="text-xs font-black text-white uppercase italic tracking-widest mb-10 relative z-10">Matrix Inversion Results</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 relative z-10">
                {[
                  { label: 'Sand Volume', val: results.sand, color: 'text-amber-400' },
                  { label: 'Lime Volume', val: results.lime, color: 'text-indigo-400' },
                  { label: 'Dolo Volume', val: results.dolo, color: 'text-emerald-400' },
                  { label: 'Porosity (φ)', val: results.phi, color: 'text-white' }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{item.label}</p>
                    <p className={cn("text-2xl font-black italic", item.color)}>{(item.val * 100).toFixed(1)}%</p>
                  </div>
                ))}
              </div>

              <div className="h-12 w-full bg-white/5 rounded-full overflow-hidden flex relative z-10 border border-white/5">
                <div className="h-full bg-amber-500" style={{ width: `${results.sand * 100}%` }} title="Sand" />
                <div className="h-full bg-indigo-500" style={{ width: `${results.lime * 100}%` }} title="Limestone" />
                <div className="h-full bg-emerald-500" style={{ width: `${results.dolo * 100}%` }} title="Dolomite" />
                <div className="h-full bg-white/20" style={{ width: `${results.phi * 100}%` }} title="Porosity" />
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest px-2">
                <span>0.0</span>
                <span>Cumulative Mineral Fraction / Pore Volume</span>
                <span>1.0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeLogic === 'facies' && (
        <div className="glass-card rounded-3xl p-10 bg-black/40 border-white/5">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-xl font-black text-white italic tracking-tight uppercase">Automated Rock Typing</h4>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase rounded-full">Electrochemical Logic</span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[11px] font-black uppercase rounded-full">Neural Cluster (Sim)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <h5 className="text-[10px] font-black text-white uppercase mb-4">Input Signatures</h5>
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">M-Slope</span>
                    <span className="text-emerald-400 font-mono">0.654</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">N-Intercept</span>
                    <span className="text-blue-400 font-mono">1.240</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Separation Δ</span>
                    <span className="text-rose-400 font-mono">-0.05</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'Clean Sand Facies', probability: 85, color: 'emerald' },
                  { name: 'Shaly Sand Facies', probability: 12, color: 'amber' },
                  { name: 'Tight Carbonate', probability: 2, color: 'slate' },
                  { name: 'Organic Shale', probability: 1, color: 'rose' }
                ].map(facies => (
                  <div key={facies.name} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-white uppercase">{facies.name}</span>
                      <span className={`text-xl font-black text-${facies.color}-400 italic`}>{facies.probability}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full">
                      <div className={`h-full bg-${facies.color}-500`} style={{ width: `${facies.probability}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeLogic === 'probabilistic' && (
        <div className="glass-card rounded-3xl p-10 bg-black/40 border-white/5 relative overflow-hidden">
          <div className="max-w-2xl">
            <h4 className="text-xl font-black text-white italic tracking-tight uppercase mb-6">Probabilistic Interpretation Overview</h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-8">
              Moving beyond deterministic (single-log) models, the probabilistic approach uses error-minimizing solvers 
              (similar to Techlog Quanti.Elan) to find the most likely combination of minerals and fluids that fits 
              the entire log suite simultaneously.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Cost Function Optimization</h5>
                <p className="text-[10px] text-slate-500 font-mono italic">Minimizing residuals between theoretical and measured curves.</p>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Multi-Tool Synergy</h5>
                <p className="text-[10px] text-slate-500 font-mono italic">Leveraging GR, Res, Den, Neu, Sonic, and NMR in concert.</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Zap size={200} />
          </div>
        </div>
      )}
    </div>
  );
};
