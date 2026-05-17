import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  BookMarked,
  Layers,
  Database,
  BrainCircuit,
  TrendingDown,
  LineChart,
  Waves,
  Library
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function AnalyticsReferencesTab() {
  const references = [
    {
      category: "Classic Decline Analysis",
      icon: TrendingDown,
      color: "text-blue-400",
      papers: [
        { title: "Analysis of Complex Decline Curves", author: "Arps, J.J. (1945)", journal: "Trans. AIME", year: "1945", url: "https://onepetro.org/JPT/article/46/05/395/164800/Analysis-of-Complex-Decline-Curves" },
        { title: "Rate-Decline Analysis for Tight Oil", author: "Duong, A.N.", journal: "SPE-137748", year: "2011", url: "https://onepetro.org/MS/article/26/03/441/200057/An-Equation-for-Rate-Decline-Analysis-of-Fractured" },
        { title: "Power-Law Exponential Decline", author: "Ilk, D. et al", journal: "SPE-116731", year: "2008", url: "https://onepetro.org/MS/article-abstract/24/02/178/200155/Power-Law-Exponential-Decline-A-New-Model-for" }
      ]
    },
    {
      category: "Type Curve Methods",
      icon: Waves,
      color: "text-indigo-400",
      papers: [
        { title: "Decline Analysis Using Type Curves", author: "Fetkovich, M.J.", journal: "JPT", year: "1980", url: "https://onepetro.org/JPT/article/32/06/1065/161439/Decline-Curve-Analysis-Using-Type-Curves" },
        { title: "Type Curves for Unconventional Reservoirs", author: "Blasingame, T.A.", journal: "SPE-131742", year: "2010", url: "https://onepetro.org/MS/article-abstract/26/02/191/199857/New-Type-Curves-for-Analyzing-Production-Data" },
        { title: "Rate-Transient Analysis Reference", author: "Agarwal-Gardner", journal: "SPE-57916", year: "1998", url: "https://onepetro.org/MS/article/4/01/21/197995/Real-Gas-Flow-in-Unconventional-Reservoirs" }
      ]
    },
    {
      category: "Machine Learning & Big Data",
      icon: BrainCircuit,
      color: "text-purple-400",
      papers: [
        { title: "Data-Driven Reservoir Modeling", author: "Mohaghegh, S.D.", journal: "SPE Textbook Series", year: "2017", url: "https://scholar.google.com/scholar?q=Data-Driven+Reservoir+Modeling+Mohaghegh" },
        { title: "Harnessing Oil & Gas Big Data", author: "Holdaway, K.R.", journal: "Wiley", year: "2014", url: "https://scholar.google.com/scholar?q=Harnessing+Oil+%26+Gas+Big+Data+Holdaway" },
        { title: "SHAP Explainability in ML", author: "Lundberg & Lee", journal: "NeurIPS", year: "2017", url: "https://proceedings.neurips.cc/paper/2017/hash/8a20a8621978632d76c713d28ad4b0d1-Abstract.html" }
      ]
    },
    {
      category: "Reservoir Engineering",
      icon: Database,
      color: "text-emerald-400",
      papers: [
        { title: "Linear Flow Analysis", author: "Wattenbarger, R.A.", journal: "SPE-31004", year: "1998", url: "https://onepetro.org/MS/article-abstract/5/04/191/198124/Production-Analysis-of-Wells-with-Finite" },
        { title: "Material Balance Principles", author: "Odeh, A.S.", journal: "JPT", year: "1964", url: "https://onepetro.org/JPT/article/16/01/91/161427/The-Material-Balance-as-an-Equation-of-a-Straight" },
        { title: "Advanced Reservoir Engineering", author: "Ahmed, T.", journal: "Elsevier", year: "2010", url: "https://scholar.google.com/scholar?q=Advanced+Reservoir+Engineering+Ahmed" }
      ]
    }
  ];

  return (
    <div className="p-12 max-w-7xl mx-auto space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Library size={24} className="text-indigo-400" />
             </div>
             <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">Reference <span className="text-indigo-500">Library</span></h2>
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">Foundational Papers, Algorithms & Digital Oilfield Standards</p>
        </div>
        
        <div className="relative group">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors" size={18} />
           <input 
             type="text" 
             placeholder="SEARCH BY SPE#, AUTHOR, OR TOPIC..." 
             className="bg-white/5 border border-white/5 rounded-full pl-16 pr-10 py-5 text-[10px] font-black uppercase tracking-widest text-white w-full md:w-96 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all italic"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-16">
        {references.map((section, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
               <div className={cn("p-4 rounded-2xl bg-white/5", section.color)}>
                  <section.icon size={20} />
               </div>
               <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{section.category}</h3>
            </div>

            <div className="space-y-4">
              {section.papers.map((paper, pIdx) => (
                <div 
                  key={pIdx}
                  onClick={() => window.open(paper.url, '_blank')}
                  className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start gap-6">
                    <div className="space-y-3">
                       <h4 className="text-sm font-black text-white uppercase italic group-hover:text-indigo-400 transition-colors leading-tight">{paper.title}</h4>
                       <div className="flex flex-wrap gap-x-6 gap-y-2">
                          <div className="flex items-center gap-2">
                             <BookMarked size={12} className="text-slate-700" />
                             <span className="text-[10px] font-bold text-slate-500 uppercase">{paper.author}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Layers size={12} className="text-slate-700" />
                             <span className="text-[10px] font-bold text-slate-600 uppercase italic">{paper.journal} — {paper.year}</span>
                          </div>
                       </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl text-slate-700 group-hover:text-white transition-all">
                       <ExternalLink size={18} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recommended Tech Stack References */}
      <div className="glass-card rounded-3xl p-12 bg-gradient-to-br from-indigo-950/20 to-black border-white/5 mt-20">
         <div className="flex items-center gap-4 mb-10">
            <TrendingDown size={24} className="text-indigo-400" />
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter italic">Algorithm <span className="text-indigo-500">Frameworks</span></h3>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <TechRef label="Regression" tool="Scikit-Learn" />
            <TechRef label="Deep Learning" tool="TensorFlow / Keras" />
            <TechRef label="Explainability" tool="SHAP / LIME" />
            <TechRef label="Visualization" tool="D3 / Recharts" />
         </div>
      </div>
    </div>
  );
}

function TechRef({ label, tool }: { label: string, tool: string }) {
  return (
    <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
       <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest block mb-2 italic">{label}</span>
       <span className="text-xs font-black text-white uppercase italic">{tool}</span>
    </div>
  );
}
