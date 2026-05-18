/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Filter, ExternalLink, Clock, Award, GraduationCap, Telescope, Microscope, Globe, Factory, Droplets, Database } from 'lucide-react';
import { ACADEMIC_LIBRARY, Reference } from '../../lib/references';
import { cn } from '../../lib/utils';

const TOPIC_ICONS: Record<Reference['topic'], React.ReactNode> = {
  'Seismic': <Telescope size={14} />,
  'Petrophysics': <Microscope size={14} />,
  'Geology': <Globe size={14} />,
  'Gravity/Mag': <Database size={14} />,
  'Production': <Factory size={14} />,
  'Reservoir': <Droplets size={14} />,
};

const DIFFICULTY_COLORS: Record<Reference['difficulty'], string> = {
  Foundational: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Advanced: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Expert: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

const DIFFICULTY_ICONS: Record<Reference['difficulty'], React.ReactNode> = {
  Foundational: <GraduationCap size={12} />,
  Advanced: <Award size={12} />,
  Expert: <Clock size={12} />,
};

export default function LibraryStage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [topicFilter, setTopicFilter] = useState<Reference['topic'] | 'All'>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<Reference['difficulty'] | 'All'>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const topics = useMemo(() => {
    const unique = new Set(ACADEMIC_LIBRARY.map(r => r.topic));
    return ['All' as const, ...Array.from(unique)];
  }, []);

  const filtered = useMemo(() => {
    return ACADEMIC_LIBRARY.filter(r => {
      const matchesTopic = topicFilter === 'All' || r.topic === topicFilter;
      const matchesDifficulty = difficultyFilter === 'All' || r.difficulty === difficultyFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch = !q ||
        r.title.toLowerCase().includes(q) ||
        r.authors.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q));
      return matchesTopic && matchesDifficulty && matchesSearch;
    });
  }, [searchTerm, topicFilter, difficultyFilter]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <BookOpen size={20} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Academic Reference Library</h1>
            <p className="text-[11px] text-slate-400">Curated collection of foundational geoscience & petroleum engineering papers</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, author, tag, or keyword..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={12} className="text-slate-500" />
            <select
              value={topicFilter}
              onChange={e => setTopicFilter(e.target.value as Reference['topic'] | 'All')}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              {topics.map(t => (
                <option key={t} value={t} className="bg-slate-800">{t}</option>
              ))}
            </select>

            <select
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value as Reference['difficulty'] | 'All')}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              <option value="All" className="bg-slate-800">All Levels</option>
              <option value="Foundational" className="bg-slate-800">Foundational</option>
              <option value="Advanced" className="bg-slate-800">Advanced</option>
              <option value="Expert" className="bg-slate-800">Expert</option>
            </select>
          </div>

          <div className="text-[11px] text-slate-500">
            {filtered.length} of {ACADEMIC_LIBRARY.length} papers
          </div>
        </div>
      </div>

      {/* Paper List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
            <Search size={32} className="opacity-30" />
            <p className="text-xs">No papers match your filters.</p>
            <button
              onClick={() => { setSearchTerm(''); setTopicFilter('All'); setDifficultyFilter('All'); }}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((paper) => {
              const isExpanded = expandedId === paper.id;
              return (
                <div
                  key={paper.id}
                  className={cn(
                    'bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 hover:border-slate-600/80 transition-all cursor-pointer',
                    isExpanded && 'border-cyan-500/40 ring-1 ring-cyan-500/10'
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : paper.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-700/50 flex-shrink-0 text-slate-400">
                      {TOPIC_ICONS[paper.topic]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{paper.topic}</span>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1', DIFFICULTY_COLORS[paper.difficulty])}>
                          {DIFFICULTY_ICONS[paper.difficulty]}
                          {paper.difficulty}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white leading-snug mb-1">{paper.title}</h3>
                      <p className="text-[11px] text-slate-400">{paper.authors} ({paper.year})</p>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-3">
                          <p className="text-[11px] text-slate-300 leading-relaxed">{paper.summary}</p>

                          <div className="flex flex-wrap gap-1.5">
                            {paper.tags.map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-slate-700/70 rounded-md text-[10px] text-cyan-400/80 font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="text-[10px] text-slate-500 italic leading-relaxed border-l-2 border-slate-700 pl-3 py-1">
                            {paper.citation}
                          </div>

                          <a
                            href={`https://scholar.google.com/scholar?q=${encodeURIComponent(paper.title + ' ' + paper.authors)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                            onClick={e => e.stopPropagation()}
                          >
                            <ExternalLink size={11} />
                            Search on Google Scholar
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}