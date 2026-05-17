import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Search, 
  FileText, 
  Download, 
  ExternalLink, 
  Info,
  ChevronRight,
  BrainCircuit,
  Database
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ACADEMIC_LIBRARY, Reference } from '../../lib/references';

export function LibraryStage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedRef, setSelectedRef] = useState<Reference | null>(null);

  const topics = Array.from(new Set(ACADEMIC_LIBRARY.map(r => r.topic)));

  const filtered = ACADEMIC_LIBRARY.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.authors.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = !selectedTopic || r.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="flex flex-col h-full gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        {/* Knowledge Base Browser */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-card rounded-2xl p-8 border-cyan-500/10 bg-black/40">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Academic Library</h3>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">Global Petroleum & Geoscience Literature</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedTopic(null)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
                    !selectedTopic ? "bg-cyan-500 text-white" : "bg-white/5 text-slate-500 hover:text-white"
                  )}
                >All</button>
                {topics.map(t => (
                  <button 
                    key={t}
                    onClick={() => setSelectedTopic(t)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
                      selectedTopic === t ? "bg-cyan-500 text-white" : "bg-white/5 text-slate-500 hover:text-white"
                    )}
                  >{t}</button>
                ))}
              </div>
            </div>

            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search by paper title, author, or concept..." 
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filtered.map((ref) => (
                <button 
                  key={ref.id}
                  onClick={() => setSelectedRef(ref)}
                  className={cn(
                    "w-full text-left p-5 rounded-2xl border transition-all group",
                    selectedRef?.id === ref.id 
                      ? "bg-cyan-500/10 border-cyan-500/30" 
                      : "bg-white/5 border-white/5 hover:border-white/10"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                      {ref.topic}
                    </span>
                    <span className="text-[11px] font-mono text-slate-600">{ref.year}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{ref.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium italic">{ref.authors}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reference Inspector / AI Assistant */}
        <div className="lg:col-span-4 space-y-8">
          <AnimatePresence mode="wait">
            {selectedRef ? (
              <motion.div 
                key={selectedRef.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-card rounded-2xl p-8 border-white/5 bg-black/40 h-full flex flex-col"
              >
                <div className="mb-8">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                    selectedRef.difficulty === 'Expert' ? "bg-red-500/20 text-red-400" :
                    selectedRef.difficulty === 'Advanced' ? "bg-amber-500/20 text-amber-400" :
                    "bg-emerald-500/20 text-emerald-400"
                  )}>
                    <FileText size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight mb-2">{selectedRef.title}</h3>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{selectedRef.difficulty} Reference</p>
                </div>

                <div className="space-y-6 flex-1">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">Executive Summary</p>
                    <p className="text-xs text-slate-300 leading-relaxed italic">{selectedRef.summary}</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">Core Concepts</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRef.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-[11px] font-bold text-cyan-400 uppercase tracking-tighter">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-black/60 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-mono text-slate-600 uppercase mb-2 tracking-widest">Citation (APA/SPE)</p>
                    <p className="text-[10px] text-slate-400 font-mono leading-tight">{selectedRef.citation}</p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[0.98] transition-all">
                    <Download size={14} /> Download PDF
                  </button>
                  <button className="flex items-center justify-center gap-2 py-4 bg-white/5 text-white border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    <ExternalLink size={14} /> Full Text
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card rounded-2xl p-8 border-dashed border-white/10 flex flex-col items-center justify-center text-center h-full">
                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                  <BookOpen size={32} className="text-slate-800" />
                </div>
                <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Inspector Cold</h4>
                <p className="text-slate-500 text-xs font-medium italic leading-relaxed px-8">
                  Select a paper from the database to view technical summaries and citations.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
