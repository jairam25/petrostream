import React from 'react';
import { Database, Search, Compass, CheckCircle2, Activity, Layers, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LOGGING_TOOLS, PEF_MATRIX_VALUES, LoggingTool } from '../../lib/petrophysics';

interface LoggingTabProps {
  logSearchTerm: string;
  setLogSearchTerm: (v: string) => void;
  selectedLoggingTool: LoggingTool | null;
  setSelectedLoggingTool: (v: LoggingTool) => void;
}

export const LoggingTab: React.FC<LoggingTabProps> = ({ 
  logSearchTerm, 
  setLogSearchTerm, 
  selectedLoggingTool, 
  setSelectedLoggingTool 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar: Tool Selection & Search */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logging Catalog</h4>
            <Database size={16} className="text-emerald-500" />
          </div>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
            <input 
              type="text" 
              placeholder="Search tools..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] text-white font-bold uppercase tracking-widest focus:border-emerald-500/30 outline-none transition-all placeholder:text-slate-700"
              value={logSearchTerm}
              onChange={e => setLogSearchTerm(e.target.value)}
            />
          </div>
          <div className="space-y-4 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {['Resistivity', 'Porosity', 'Lithology', 'Auxiliary'].map(cat => (
              <div key={cat} className="space-y-2 mb-4">
                <h5 className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest px-2 mb-2">{cat}</h5>
                <div className="space-y-2">
                  {LOGGING_TOOLS.filter(t => t.category === cat && (t.name.toLowerCase().includes(logSearchTerm.toLowerCase()) || t.acronym.toLowerCase().includes(logSearchTerm.toLowerCase()))).map(tool => (
                    <button 
                      key={tool.id}
                      onClick={() => setSelectedLoggingTool(tool)}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border transition-all group",
                        selectedLoggingTool?.id === tool.id 
                          ? "bg-emerald-500/10 border-emerald-500/40" 
                          : "bg-white/5 border-white/5 hover:border-white/10"
                      )}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={cn(
                          "text-[10px] font-bold group-hover:text-emerald-400 transition-colors uppercase italic",
                          selectedLoggingTool?.id === tool.id ? "text-emerald-400" : "text-white"
                        )}>{tool.name}</span>
                        <span className="text-[11px] font-mono text-slate-500 border border-white/10 px-1 rounded">{tool.acronym}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 italic">"{tool.description}"</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main: Tool Details & Technical Reference */}
      <div className="lg:col-span-8 space-y-6">
        <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_50%)]"></div>
          
          {selectedLoggingTool ? (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-start mb-12 relative z-10">
                <div>
                  <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest mb-2">{selectedLoggingTool.category} Tool / {selectedLoggingTool.acronym}</p>
                  <h3 className="text-3xl font-black text-white italic tracking-tight uppercase">{selectedLoggingTool.name}</h3>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Res: {selectedLoggingTool.verticalResolution}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">DOI: {selectedLoggingTool.depthOfInvestigation}</p>
                  </div>
                  <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                    <Compass className="text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                <div className="space-y-8">
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      Measurement Principle
                    </h4>
                    <div className="bg-white/5 p-6 rounded-[24px] border border-white/5">
                      <p className="text-xs text-slate-300 leading-relaxed font-medium italic">
                        {selectedLoggingTool.measurePrinciple}
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                      Usage & When to Run
                    </h4>
                    <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10">
                      <p className="text-[11px] text-indigo-200/70 font-medium italic">
                        {selectedLoggingTool.usage}
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      Environmental Corrections
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedLoggingTool.environmentalCorrections.map((c: string) => (
                        <div key={c} className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center gap-2">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500/50" />
                          <span className="text-[11px] text-slate-500 font-bold uppercase">{c}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <div className="glass-card p-8 rounded-2xl bg-slate-900 border-white/5">
                    <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Formation Response</h4>
                    <div className="space-y-6">
                      {Object.entries(selectedLoggingTool.lithologyResponse).map(([lith, resp]: [string, any]) => (
                        <div key={lith} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] text-emerald-400 font-black uppercase italic tracking-widest">{lith}</span>
                            <Activity size={10} className="text-slate-700" />
                          </div>
                          <p className="text-[10px] text-slate-400 leading-snug">{resp}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedLoggingTool.formula && (
                    <div className="glass-card p-8 rounded-2xl bg-emerald-500/5 border-emerald-500/10 text-center">
                      <p className="text-[11px] text-emerald-500 font-bold uppercase mb-2">{selectedLoggingTool.formula.name}</p>
                      <div className="text-xl font-mono text-white tracking-widest py-4 border-y border-white/5 mb-2">
                        {selectedLoggingTool.formula.latex}
                      </div>
                      <p className="text-[10px] text-slate-600 font-mono">Standard FE Core Transform</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center py-40">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full mx-auto flex items-center justify-center animate-pulse">
                  <Layers size={32} className="text-slate-700" />
                </div>
                <p className="text-[10px] text-slate-500 tracking-widest font-bold uppercase border-t border-white/5 pt-4">Select tool for full technical spec</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40">
            <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldAlert size={14} className="text-amber-500" />
              Photoelectric Multi-Matrix
            </h4>
            <div className="space-y-3">
              {PEF_MATRIX_VALUES.map(m => (
                <div key={m.mineral} className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold uppercase">{m.mineral}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-1 bg-white/5 rounded-full">
                      <div className="h-full bg-amber-500" style={{ width: `${(m.pe / 15) * 100}%` }}></div>
                    </div>
                    <span className="text-white font-mono font-bold w-8 text-right">{m.pe}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 border-white/5 bg-white/5 flex flex-col justify-center">
            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4 italic">Interpretation Fundamentals</h4>
            <div className="space-y-3 text-[10px]">
              <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                <span className="text-slate-500 font-bold">Resistivity Rule</span>
                <span className="text-emerald-400 font-black">Rt &gt; 10 x Rw</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                <span className="text-slate-500 font-bold">Porosity Index</span>
                <span className="text-indigo-400 font-black">HI = H / Vol</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                <span className="text-slate-500 font-bold">Lithology ID</span>
                <span className="text-amber-400 font-black">Pe + Rhob</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
