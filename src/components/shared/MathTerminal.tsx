import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, X, Search, ChevronRight, Zap, Database, Activity, Sigma } from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';

export function MathTerminal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [query, setQuery] = useState('');
  
  const mathModels = [
    { id: 'ooip', name: 'OOIP Volumetric', category: 'Reservoir', formula: '7758 * A * h * phi * (1-Sw) / Bo' },
    { id: 'darcy', name: 'Darcy Radial Flow', category: 'Production', formula: '0.00708 * k * h * (Pr - Pwf) / (mu * Bo * ln(re/rw))' },
    { id: 'vogel', name: 'Vogel IPR', category: 'Production', formula: 'q/qmax = 1 - 0.2(Pwf/Pr) - 0.8(Pwf/Pr)^2' },
    { id: 'stokes', name: 'Stokes Settling', category: 'Drilling', formula: 'v = d^2 * g * (rho_s - rho_f) / (18 * mu)' },
    { id: 'boyle', name: 'Boyle\'s Law', category: 'PVT', formula: 'P1V1 = P2V2' },
    { id: 'eaton', name: 'Eaton Pore Pressure', category: 'Drilling', formula: 'Pp = S - (S - Pn) * (dt_n / dt_obs)^3' },
    { id: 'wey-mouth', name: 'Weymouth Equation', category: 'Midstream', formula: 'Q = 433.5 * (T_s/P_s) * d^2.667 * [(P1^2 - P2^2)/(G * T * L * f)]^0.5' },
    { id: 'reynolds', name: 'Reynolds Number', category: 'Fluid Mech', formula: 'Re = rho * v * D / mu' },
    { id: 'fanning', name: 'Fanning Friction', category: 'Production', formula: 'f = 0.046 / Re^0.2' },
    { id: 'gas-deviation', name: 'Z-Factor (Gas)', category: 'PVT', formula: 'PV = nZRT' },
    { id: 'real-gas', name: 'Real Gas Potential', category: 'Reservoir', formula: 'm(p) = 2 * integral(p/muZ dp)' },
    { id: 'material-balance', name: 'Havlena-Odeh', category: 'Reservoir', formula: 'F = N * (E_o + m*E_g + E_fw) + W_e' },
    { id: 'dca-arps', name: 'Arps Decline', category: 'Economics', formula: 'q = q_i / (1 + b*d_i*t)^(1/b)' },
    { id: 'productivity-index', name: 'PI (J)', category: 'Production', formula: 'J = q / (Pr - Pwf)' },
    { id: 'equivalent-mud-weight', name: 'EMW', category: 'Drilling', formula: 'EMW = MW + P_ann / (0.052 * TVD)' },
    { id: 'hydrostatic', name: 'Hydrostatic Pressure', category: 'Drilling', formula: 'P = 0.052 * MW * TVD' },
    { id: 'buoyancy', name: 'Buoyancy Factor', category: 'Drilling', formula: 'BF = (65.5 - MW) / 65.5' },
    { id: 'turner-critical', name: 'Turner Velocity', category: 'Production', formula: 'v_c = 1.35 * [(sigma * (rho_l - rho_g)) / rho_g^2]^0.25' },
    { id: 'gosline', name: 'Gosline Correlation', category: 'Artificial Lift', formula: 'GLR_opt = f(GOR, WaterCut, Depth)' },
    { id: 'gardner', name: 'Gardner Relation', category: 'Geophysics', formula: 'rho = 0.31 * V_p^0.25' },
    { id: 'zoeppritz', name: 'Zoeppritz Eq', category: 'Geophysics', formula: 'R(theta) = A + B*sin^2(theta) + C*sin^2(theta)*tan^2(theta)' },
    { id: 'peng-robinson', name: 'Peng-Robinson EOS', category: 'PVT', formula: 'P = RT/(V-b) - a(T)/[V(V+b) + b(V-b)]' }
  ];

  const filtered = mathModels.filter(m => 
    m.name.toLowerCase().includes(query.toLowerCase()) || 
    m.category.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-3xl bg-[#05070a] border border-white/10 rounded-3xl shadow-[0_0_100px_rgba(99,102,241,0.2)] overflow-hidden"
      >
        <div className="p-10 border-b border-white/5 bg-gradient-to-b from-indigo-500/5 to-transparent">
           <div className="flex items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 focus-within:border-brand-primary/50 transition-all">
              <Search className="text-brand-primary" size={24} />
              <input 
                autoFocus
                placeholder="Query Unified Petroleum Mathematics Library..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-xl w-full font-black italic uppercase tracking-tighter"
              />
              <div className="flex gap-2">
                 <span className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-[11px] text-slate-500 font-black uppercase">F1_HELP</span>
                 <span className="px-3 py-1.5 bg-brand-primary/20 border border-brand-primary/20 rounded-xl text-[11px] text-brand-primary font-black uppercase">ENTER_SOLVE</span>
              </div>
           </div>
        </div>

        <div className="p-6 max-h-[500px] overflow-y-auto custom-scrollbar bg-black/20">
           <div className="grid grid-cols-1 gap-4">
              {filtered.map((m, i) => (
                 <div 
                   key={m.id}
                   className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-all group cursor-pointer"
                 >
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                          <Sigma size={24} />
                       </div>
                       <div>
                          <div className="flex items-center gap-3">
                             <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">{m.name}</h4>
                             <span className="text-[10px] font-black bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-full uppercase tracking-widest">{m.category}</span>
                          </div>
                          <p className="text-xs text-slate-500 font-mono mt-1 opacity-70 group-hover:opacity-100 transition-opacity">{m.formula}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="text-right hidden sm:block">
                          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Complexity</p>
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter italic">Optimized</p>
                       </div>
                       <ChevronRight size={20} className="text-slate-700 group-hover:text-brand-primary transition-colors translate-x-0 group-hover:translate-x-1" />
                    </div>
                 </div>
              ))}
           </div>
           {filtered.length === 0 && (
              <div className="p-24 text-center">
                 <Zap size={64} className="text-slate-800 mx-auto mb-6 animate-pulse" />
                 <p className="text-slate-500 text-sm font-black uppercase tracking-widest italic">No mathematical vectors matched your query</p>
              </div>
           )}
        </div>

        <div className="p-8 bg-[#05070a] border-t border-white/5 flex justify-between items-center">
           <div className="flex gap-8">
              <div className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master Solver v4.2.0</span>
              </div>
              <div className="flex items-center gap-3">
                 <Activity size={14} className="text-brand-primary" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">1,280 Neural Connections Established</span>
              </div>
           </div>
           <button onClick={onClose} className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all">Close Terminal</button>
        </div>
      </motion.div>
    </div>
  );
}
