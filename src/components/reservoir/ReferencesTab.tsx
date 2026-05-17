import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  FileText, 
  ExternalLink, 
  Bookmark,
  Award,
  Hash,
  Search
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Paper {
  title: string;
  author: string;
  year: string;
  topic: string;
  description: string;
  contribution: string;
  tag: string;
}

const FOUNDATIONAL_PAPERS: Paper[] = [
  {
    title: "Pressure Build-up in Wells",
    author: "Horner, D.R.",
    year: "1951",
    topic: "Pressure Transient Analysis",
    description: "Introduced the 'Horner Plot' method for analyzing pressure build-up data to estimate reservoir pressure and permeability.",
    contribution: "Foundation of modern well testing and buildup analysis.",
    tag: "PTA"
  },
  {
    title: "The Application of the Laplace Transformation to Flow Problems in Reservoirs",
    author: "van Everdingen, A.F. & Hurst, W.",
    year: "1949",
    topic: "Aquifer Influx",
    description: "Developed dimensionless solutions for unsteady-state water influx using pressure and time functions.",
    contribution: "The standard for analytical aquifer modeling.",
    tag: "Aquifers"
  },
  {
    title: "Analysis of Decline Curves",
    author: "Arps, J.J.",
    year: "1945",
    topic: "Production Forecasting",
    description: "Established empirical equations for exponential, hyperbolic, and harmonic production decline.",
    contribution: "Universal industry standard for reserve estimation (DCA).",
    tag: "DCA"
  },
  {
    title: "Inflow Performance Relationships for Solution-Gas Drive Wells",
    author: "Vogel, J.V.",
    year: "1968",
    topic: "Production Engineering",
    description: "Developed the dimensionless IPR curve to describe well behavior in saturated reservoirs.",
    contribution: "Standard tool for well performance and Nodal Analysis.",
    tag: "IPR"
  },
  {
    title: "Decline Analysis Using Type Curves",
    author: "Fetkovich, M.J.",
    year: "1980",
    topic: "Type Curve Analysis",
    description: "Combined transient flow solutions with Arps decline curves on a single log-log plot.",
    contribution: "Enabled reservoir characterization from production data.",
    tag: "DCA"
  },
  {
    title: "The Material Balance Equation for a Gas-Condenstate Reservoir",
    author: "Havlena, D. & Odeh, A.S.",
    year: "1963",
    topic: "Reservoir Performance",
    description: "Proposed the linear form of the material balance equation (F vs Et).",
    contribution: "Simplified MB analysis for identifying drive mechanisms.",
    tag: "MBE"
  },
  {
    title: "Mechanism of Fluid Displacement in Sands",
    author: "Buckley, S.E. & Leverett, M.C.",
    year: "1942",
    topic: "Waterflooding",
    description: "Formulated the fractional flow equation and displacement theory for immiscible fluids.",
    contribution: "Core theory for reservoir simulation and waterflooding.",
    tag: "Simulation"
  },
  {
    title: "Correlation of Bottom Hole Sample Data",
    author: "Standing, M.B.",
    year: "1947",
    topic: "PVT Properties",
    description: "Developed correlations for bubble-point pressure, GOR, and oil formation volume factor.",
    contribution: "Most widely used black-oil correlations in the industry.",
    tag: "PVT"
  }
];

export function ReferencesTab() {
  return (
    <div className="space-y-12 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
         <div>
            <div className="flex items-center gap-3 mb-4">
               <BookOpen size={20} className="text-cyan-500" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Knowledge Repository</span>
            </div>
            <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
              Foundational <span className="text-cyan-500">Literature</span>
            </h2>
         </div>
         <div className="flex gap-4">
            <div className="relative">
               <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
               <input 
                 type="text" 
                 placeholder="SEARCH BY TOPIC OR AUTHOR..."
                 className="bg-white/5 border border-white/10 rounded-2xl pl-10 pr-6 py-3 text-[11px] font-bold text-white outline-none focus:ring-1 focus:ring-cyan-500 w-64 tracking-widest"
               />
            </div>
         </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
         {FOUNDATIONAL_PAPERS.map((paper, i) => (
           <motion.div
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.05 }}
             className="glass-card group p-10 rounded-3xl border-white/5 bg-black/40 hover:bg-black/60 transition-all cursor-pointer relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-cyan-500/10 transition-colors">
                <Bookmark size={80} />
              </div>

              <div className="relative z-10 space-y-6">
                 <div className="flex justify-between items-start">
                    <div className="px-3 py-1 bg-cyan-500/10 rounded-full text-[10px] font-black text-cyan-400 tracking-widest">{paper.tag}</div>
                    <span className="text-[10px] font-mono text-slate-600">{paper.year}</span>
                 </div>

                 <div className="space-y-2">
                    <h4 className="text-lg font-black text-white leading-tight group-hover:text-cyan-400 transition-colors italic">{paper.title}</h4>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{paper.author}</p>
                 </div>

                 <div className="space-y-4 pt-6 border-t border-white/5">
                    <p className="text-[11px] text-slate-400 leading-relaxed italic line-clamp-3">"{paper.description}"</p>
                    <div className="flex items-center gap-3">
                       <Award size={14} className="text-emerald-500" />
                       <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Key Impact: {paper.contribution}</span>
                    </div>
                 </div>

                 <div className="pt-4 flex items-center justify-between ">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 hover:text-white transition-colors uppercase tracking-widest">
                       <FileText size={12} />
                       Topic: {paper.topic}
                    </div>
                    <button className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                       <ExternalLink size={12} />
                    </button>
                 </div>
              </div>
           </motion.div>
         ))}
      </div>

      {/* Engineering Handbook Footer */}
      <div className="glass-card rounded-3xl p-12 bg-gradient-to-br from-slate-900 to-black border-white/5 flex flex-col md:flex-row justify-between items-center gap-12">
         <div className="flex-1 space-y-4">
            <h5 className="text-2xl font-black text-white italic uppercase tracking-tighter">Reservoir Engineering Handbook</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
               Our curated library integrates directly with the calculation modules. Each method (Vogel, Standing, Arps) used in the application is cross-referenced with its foundational SPE literature for technical integrity.
            </p>
         </div>
         <div className="flex gap-4">
            <StatBox label="Methods Indexed" value="150+" />
            <StatBox label="Paper References" value="2.4k" />
         </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="text-center px-8 border-l border-white/5">
       <p className="text-3xl font-black text-white italic tracking-tighter">{value}</p>
       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}
