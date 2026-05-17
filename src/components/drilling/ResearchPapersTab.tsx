import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, Zap, ExternalLink } from 'lucide-react';
import { DRILLING_PAPERS } from '../../lib/drilling';
import { cn } from '../../lib/utils';

interface ResearchPapersTabProps {
  paperTopicFilter: string;
  setPaperTopicFilter: (val: string) => void;
  paperSearchTerm: string;
  setPaperSearchTerm: (val: string) => void;
}

export const ResearchPapersTab: React.FC<ResearchPapersTabProps> = ({ 
  paperTopicFilter, 
  setPaperTopicFilter,
  paperSearchTerm,
  setPaperSearchTerm
}) => {
  const filteredPapers = DRILLING_PAPERS.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(paperSearchTerm.toLowerCase()) ||
                 p.authors.toLowerCase().includes(paperSearchTerm.toLowerCase()) ||
                 p.topic.toLowerCase().includes(paperSearchTerm.toLowerCase());
    const matchesTopic = paperTopicFilter === 'All' || p.topic === paperTopicFilter;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-12 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <p className="text-[10px] text-amber-400 font-mono uppercase tracking-widest mb-1">Module 2 / Phase 10</p>
              <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">DRILLING DATA REFERENCE & PAPERS</h3>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <select 
                value={paperTopicFilter}
                onChange={(e) => setPaperTopicFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white font-bold uppercase tracking-widest focus:border-amber-500/30 outline-none transition-all cursor-pointer"
              >
                <option value="All" className="bg-slate-900">ALL TOPICS</option>
                {Array.from(new Set(DRILLING_PAPERS.map(p => p.topic))).map(topic => (
                  <option key={topic} value={topic} className="bg-slate-900">{topic.toUpperCase()}</option>
                ))}
              </select>
              <div className="relative w-full md:w-72">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="w-3 h-3 text-amber-500/50" />
                </div>
                <input 
                  type="text" 
                  placeholder="SEARCH DRILLING PAPERS..." 
                  value={paperSearchTerm}
                  onChange={(e) => setPaperSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] text-white font-bold uppercase tracking-widest focus:border-amber-500/30 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper, idx) => (
              <div key={idx} className="group glass-card rounded-3xl p-6 border-white/5 bg-white/5 hover:bg-white/10 transition-all hover:translate-y-[-4px] flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500/10 rounded-lg">
                      <BookOpen className="w-3 h-3 text-amber-400" />
                    </div>
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{paper.topic}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                    paper.difficulty === 'Basic' ? "bg-emerald-400/10 text-emerald-400" :
                    paper.difficulty === 'Intermediate' ? "bg-amber-400/10 text-amber-400" : "bg-rose-400/10 text-rose-400"
                  )}>{paper.difficulty}</span>
                </div>
                <h4 className="text-sm font-black text-white mb-2 leading-tight group-hover:text-amber-400 transition-colors uppercase italic">{paper.title}</h4>
                <div className="flex items-center gap-3 mb-4 text-white/50">
                  <p className="text-[11px] font-bold uppercase tracking-tighter">By {paper.authors}</p>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <p className="text-[11px] font-mono">{paper.year}</p>
                </div>
                <div className="p-4 bg-black/20 rounded-2xl mb-4 flex-grow">
                  <p className="text-[10px] text-slate-500 leading-relaxed italic">"{paper.description}"</p>
                </div>
                <div className="flex flex-col gap-4 border-t border-white/5 pt-4 mt-auto">
                  <div className="text-[11px] text-slate-500 font-mono">
                    <span className="text-amber-500/60 mr-2 uppercase italic font-bold">Core Concept:</span>
                    <span className="text-white/80">{paper.keyConcept}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-600 font-mono font-bold tracking-widest uppercase">{paper.speNumber || "TECH REF"}</span>
                    <a 
                      href={paper.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1.5 text-[11px] text-amber-400 hover:text-white font-black uppercase transition-colors"
                    >
                      Full Text <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-8 border-white/5 bg-gradient-to-br from-amber-500/5 to-transparent">
            <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-4">Technical Standards Reference</h4>
            <div className="space-y-3">
              {['API RP 13B: Mud Testing Standard', 'API Spec 10: Casing Cementing', 'IADC Drilling Manual Vol. 1', 'SPE-11364: Drill Bit Selection'].map((standard, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-amber-500/30 transition-all cursor-pointer">
                  <span className="text-[10px] text-slate-300 font-medium uppercase tracking-tight group-hover:text-white">{standard}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <Zap className="w-4 h-4 text-indigo-400" />
              </div>
              <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Industry Impact Note</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed italic uppercase tracking-tighter">
              "These foundational works define the boundary between trial-and-error drilling and modern industrial engineering. Understanding the Bourgoyne & Young ROP variables or Eaton's pore pressure gradients is essential for any digital twin implementation or automated drilling system."
            </p>
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">Curated by AIS AI-Studio</span>
              <div className="flex gap-1">
                {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-amber-500/30" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
