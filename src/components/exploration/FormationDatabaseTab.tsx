import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Search, 
  Map as MapIcon, 
  Layers, 
  Thermometer, 
  Droplet, 
  Activity,
  ArrowRight,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { FORMATION_DATABASE, FormationProperty } from '../../lib/formation_data';
import { SectionHeader } from '../SharedUI';

export function FormationDatabaseTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFormation, setSelectedFormation] = useState<FormationProperty | null>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  const filtered = FORMATION_DATABASE.filter(f => 
    f.formation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.lithology.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-app-bg">
      <div className="p-8 shrink-0">
        <SectionHeader 
          title="Global Formation Property Database" 
          subtitle="Rock & Fluid References for Major Producing Plays" 
        />
        
        <div className="mt-8 relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search formations, basins, or lithologies..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-brand-primary/50 transition-colors shadow-2xl"
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden p-8 pt-0 gap-8">
        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3">
          {filtered.map((f, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedFormation(f);
                setImported(false);
                setImporting(false);
              }}
              className={cn(
                "w-full text-left p-6 rounded-2xl border transition-all flex justify-between items-center group",
                selectedFormation?.formation === f.formation 
                  ? "bg-brand-primary border-brand-primary shadow-lg shadow-brand-primary/20" 
                  : "bg-panel-bg border-white/5 hover:border-white/20"
              )}
            >
              <div className="flex gap-4 items-center">
                 <div className={cn(
                   "p-3 rounded-xl",
                   selectedFormation?.formation === f.formation ? "bg-white/20" : "bg-white/5"
                 )}>
                   <Database size={16} className={selectedFormation?.formation === f.formation ? "text-white" : "text-brand-primary"} />
                 </div>
                 <div>
                    <h4 className={cn(
                      "text-sm font-black uppercase tracking-tighter italic",
                      selectedFormation?.formation === f.formation ? "text-white" : "text-text-primary"
                    )}>{f.formation}</h4>
                    <p className={cn(
                      "text-[11px] font-bold uppercase tracking-widest",
                      selectedFormation?.formation === f.formation ? "text-white/70" : "text-text-tertiary"
                    )}>{f.region}</p>
                 </div>
              </div>
              <ArrowRight size={16} className={cn(
                "transition-transform",
                selectedFormation?.formation === f.formation ? "text-white translate-x-1" : "text-slate-800 group-hover:translate-x-1"
              )} />
            </button>
          ))}
          
          {filtered.length === 0 && (
            <div className="text-center py-20">
               <Info size={40} className="mx-auto text-slate-800 mb-4" />
               <p className="text-slate-500 uppercase text-xs font-black italic tracking-widest">No formations matched your search</p>
            </div>
          )}
        </div>

        {/* Details Panel */}
        <div className="w-[450px] shrink-0 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            {selectedFormation ? (
              <motion.div
                key={selectedFormation.formation}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 h-full flex flex-col"
              >
                <div className="mb-10 text-center">
                   <div className="inline-block px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[11px] font-black text-brand-primary uppercase tracking-widest italic mb-4">Detailed Analytics</div>
                   <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">{selectedFormation.formation}</h3>
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{selectedFormation.region}</p>
                </div>

                <div className="space-y-6 flex-1">
                   <DetailRow icon={<Layers size={14}/>} label="Lithology" value={selectedFormation.lithology} />
                   <DetailRow icon={<Activity size={14}/>} label="Depth Range" value={selectedFormation.depthRange} />
                   <div className="grid grid-cols-2 gap-4">
                      <DetailRow icon={<Droplet size={14}/>} label="Porosity" value={selectedFormation.porosity} />
                      <DetailRow icon={<Droplet size={14}/>} label="Permeability" value={selectedFormation.permeability} />
                   </div>
                   <DetailRow icon={<Thermometer size={14}/>} label="Typical Drive" value={selectedFormation.driveMechanism} />
                   
                   <div className="p-6 bg-white/5 border border-white/5 rounded-2xl mt-8">
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4 italic flex items-center gap-2">
                        <TrendingUp size={12}/> Fluid Diagnostics
                      </p>
                      <div className="space-y-4">
                         <div className="flex justify-between items-baseline">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Oil Gravity</span>
                            <span className="text-sm font-black text-white font-mono">{selectedFormation.apiGravity}</span>
                         </div>
                         <div className="flex justify-between items-baseline">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Solution GOR</span>
                            <span className="text-sm font-black text-white font-mono">{selectedFormation.gor}</span>
                         </div>
                         <div className="flex justify-between items-baseline">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Recovery Factor</span>
                            <span className="text-sm font-black text-brand-primary font-mono">{selectedFormation.recoveryFactor}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => {
                    setImporting(true);
                    setTimeout(() => {
                      setImporting(false);
                      setImported(true);
                      setTimeout(() => setImported(false), 3000);
                    }, 1500);
                  }}
                  disabled={importing}
                  className={cn(
                    "mt-10 w-full py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden",
                    importing ? "bg-slate-800 text-slate-500 cursor-wait" : 
                    imported ? "bg-emerald-500 text-white" : "bg-white text-black hover:scale-[0.98]"
                  )}
                >
                   {importing ? (
                     <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                        Ingesting Neural Data...
                     </div>
                   ) : imported ? (
                     <div className="flex items-center justify-center gap-2">
                        <Activity size={14} className="animate-pulse" />
                        Link Established
                     </div>
                   ) : "Import into Simulator"}
                </button>
              </motion.div>
            ) : (
              <div className="h-full border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-12">
                 <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                    <MapIcon size={32} className="text-slate-800" />
                 </div>
                 <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Select a Formation</h3>
                 <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic uppercase tracking-widest">
                   Pick a major play from the directory to load reservoir properties and fluid analytics.
                 </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex gap-4 items-start">
       <div className="mt-1 p-2 bg-white/5 rounded-lg border border-white/10 text-slate-400">
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-xs font-bold text-white leading-tight italic">{value}</p>
       </div>
    </div>
  );
}

function TrendingUp({ size, className }: { size?: number, className?: string }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    );
  }
