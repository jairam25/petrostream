import React from 'react';
import { Search, Download, Waves, Database } from 'lucide-react';
import { motion } from 'motion/react';

interface ReferenceTabProps {
  refSearchTerm: string;
  setRefSearchTerm: (v: string) => void;
}

export const ReferenceTab: React.FC<ReferenceTabProps> = ({ refSearchTerm, setRefSearchTerm }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Classic Papers Database */}
        <div className="lg:col-span-12">
          <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Foundational Petrophysics Library</h3>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search methodology..." 
                    className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-[10px] text-white outline-none focus:border-emerald-500/50 w-48"
                    value={refSearchTerm}
                    onChange={(e) => setRefSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Archie (1942)", desc: "The electrical resistivity log as an aid in determining some reservoir characteristics.", tag: "Resistivity", color: "emerald", url: "https://doi.org/10.2118/942054-G" },
                { title: "Schlumberger (2023)", desc: "Log Interpretation Charts. The industry standard for environmental corrections and matrix properties.", tag: "General", color: "blue", url: "https://www.slb.com/resource-library/slb-log-interpretation-charts" },
                { title: "Poupon-Leveaux (1971)", desc: "Evaluation of Water Saturation in Shaly Formations. The Indonesian Equation.", tag: "Shaly Sand", color: "cyan", url: "https://onepetro.org/SPWLA/proceedings/SPWLA-1971-O" },
                { title: "Simandoux (1963)", desc: "Dielectric constants and conductivities of shaly sands. Foundational resistivity theory.", tag: "Resistivity", color: "indigo", url: "https://onepetro.org/journal-paper/SPE-511-PA" },
                { title: "Waxman-Smits (1968)", desc: "Electrical conductivities in oil-bearing shaly sands based on CEC.", tag: "CEC/Shaly", color: "rose", url: "https://doi.org/10.2118/1863-A" },
                { title: "Timur (1968)", desc: "An investigation of permeability, porosity, and residual water saturation relationships.", tag: "Permeability", color: "amber", url: "https://onepetro.org/journal-paper/SPE-1974-PA" },
                { title: "Leverett J-Function", desc: "Capillary pressure properties in heterogeneous systems.", tag: "Capillary", color: "sky", url: "https://doi.org/10.2118/941161-G" },
                { title: "Winland R35", desc: "Pore throat size distribution for rock typing and permeability modeling.", tag: "Rock Typing", color: "violet", url: "https://onepetro.org/conference-paper/SPE-8949-MS" }
              ].filter(p => p.title.toLowerCase().includes(refSearchTerm.toLowerCase()) || p.desc.toLowerCase().includes(refSearchTerm.toLowerCase())).map((paper, i) => (
                <div 
                  key={i} 
                  onClick={() => window.open(paper.url, '_blank')}
                  className="group p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                       <span className={`text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-slate-400 font-bold uppercase`}>{paper.tag}</span>
                       <Download size={14} className="text-slate-500 group-hover:text-emerald-400 transition-all" />
                    </div>
                    <h4 className="text-xs font-black text-white mb-2 group-hover:text-emerald-300 transition-colors uppercase tracking-tight">{paper.title}</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{paper.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Digital Interpretative Charts */}
        <div className="lg:col-span-8">
          <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40 h-full">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Interactive Chartbook</h3>
                <Waves size={20} className="text-cyan-500" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rotate-45"></div>
                      RhoB-NPHI Lithology Plot
                   </h4>
                   <div className="aspect-square bg-black border border-white/10 rounded-2xl relative overflow-hidden flex items-center justify-center group">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                      <svg className="w-full h-full p-4 overflow-visible">
                        <path d="M 20 40 L 300 180" stroke="#facc15" strokeWidth="2" strokeDasharray="5 5" opacity="0.5" />
                        <text x="200" y="110" fill="#facc15" fontSize="8" className="select-none font-black italic">SANDSTONE</text>
                        <path d="M 20 60 L 300 200" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5 5" opacity="0.5" />
                        <text x="200" y="130" fill="#3b82f6" fontSize="8" className="select-none font-black italic">LIMESTONE</text>
                        <path d="M 20 80 L 300 220" stroke="#10b981" strokeWidth="2" strokeDasharray="5 5" opacity="0.5" />
                        <text x="200" y="150" fill="#10b981" fontSize="8" className="select-none font-black italic">DOLOMITE</text>
                        <circle cx="150" cy="140" r="4" fill="white" className="animate-pulse shadow-[0_0_10px_white]" />
                      </svg>
                      <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] text-emerald-400 font-mono">
                         Auto-Detect: Mixed Carbonate
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-rose-500 rotate-45"></div>
                      Pickett Plot Utility
                   </h4>
                   <div className="aspect-square bg-black border border-white/10 rounded-2xl relative overflow-hidden flex items-center justify-center group">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
                      <svg className="w-full h-full p-4 overflow-visible">
                         <path d="M 0 300 Q 150 150, 300 20" stroke="#fb7185" strokeWidth="1" fill="none" />
                         <path d="M 0 300 Q 150 170, 300 40" stroke="#fb7185" strokeWidth="1" fill="none" opacity="0.5" />
                         <path d="M 0 300 Q 150 190, 300 60" stroke="#fb7185" strokeWidth="1" fill="none" opacity="0.3" />
                         <text x="20" y="280" fill="#fb7185" fontSize="8" className="select-none font-bold">100% Sw</text>
                         <text x="20" y="100" fill="#64748b" fontSize="7" rotate="-45">Rw = 0.045</text>
                         {[...Array(20)].map((_, i) => (
                            <circle key={i} cx={50 + Math.random() * 100} cy={50 + Math.random() * 100} r="1.5" fill="#f43f5e" />
                         ))}
                      </svg>
                      <div className="absolute bottom-4 left-4 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full text-[10px] text-rose-400 font-mono">
                         Calculated m: 2.05
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Quick Lookup Card */}
        <div className="lg:col-span-4">
           <div className="glass-card rounded-3xl p-8 border-white/5 bg-emerald-500/5 h-full flex flex-col">
              <h3 className="text-sm font-black text-white italic tracking-widest uppercase mb-6 flex items-center gap-2">
                 <Database size={16} className="text-emerald-500" /> Matrix Constants
              </h3>
              <div className="space-y-4 flex-1">
                 {[
                    { mineral: "Sandstone", rho: 2.65, dt: 55.5, pe: 1.81 },
                    { mineral: "Limestone", rho: 2.71, dt: 47.5, pe: 5.08 },
                    { mineral: "Dolomite", rho: 2.87, dt: 43.5, pe: 3.14 },
                    { mineral: "Anhydrite", rho: 2.98, dt: 50.0, pe: 5.05 },
                    { mineral: "Halite", rho: 2.03, dt: 67.0, pe: 4.65 },
                    { mineral: "Pyrite", rho: 4.99, dt: 39.0, pe: 16.97 }
                 ].map((m, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                       <div>
                          <p className="text-[10px] font-black text-white uppercase">{m.mineral}</p>
                          <p className="text-[10px] text-slate-500 font-mono uppercase">Reference Values</p>
                       </div>
                       <div className="text-right flex gap-3 text-[11px] font-mono">
                          <span className="text-emerald-400">ρ: {m.rho}</span>
                          <span className="text-cyan-400">Δt: {m.dt}</span>
                          <span className="text-amber-400">Pe: {m.pe}</span>
                       </div>
                    </div>
                 ))}
              </div>
              <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl shadow-inner">
                 <p className="text-[11px] text-emerald-400 font-mono italic leading-relaxed">
                    *All values derived from SPE/Schlumberger 2023 Chartbook equivalents. Matrix properties assume standard conditions (70°F, 0 salinity).
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
