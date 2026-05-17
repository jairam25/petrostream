import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  BookOpen, 
  ShieldCheck, 
  Scale, 
  TrendingUp, 
  Globe,
  ExternalLink,
  ChevronRight,
  Library,
  Zap,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function EconomicsReferencesTab() {
  const references = [
    {
      category: "Standards & Regulations",
      icon: <ShieldCheck className="text-emerald-500" />,
      papers: [
        { title: "SPE PRMS 2018 Guidelines", desc: "Petroleum Resources Management System - The global standard for resource classification.", link: "https://www.spe.org/en/industry/reserves/" },
        { title: "SEC Regulation S-X Rule 4-10", desc: "US Federal financial reporting rules for oil and gas reserves.", link: "https://www.sec.gov/rules/final/2008/33-8995.pdf" },
        { title: "UNFC-2009", desc: "United Nations Framework Classification for Fossil Energy and Mineral Reserves and Resources.", link: "https://unece.org/energy/unfc-and-sustainable-resource-management" }
      ]
    },
    {
      category: "Classic Technical Papers",
      icon: <FileText className="text-blue-500" />,
      papers: [
        { title: "Arps (1945)", desc: "Original paper on decline curve analysis and hyperbolic decline methods.", link: "https://doi.org/10.2118/945228-G" },
        { title: "Capen (1976)", desc: "The difficulty of assessing uncertainty: Guidelines on honest reporting of reserves.", link: "https://doi.org/10.2118/5587-PA" },
        { title: "Thompson & Wright (1984)", desc: "Probabilistic methods in petroleum economics and reserves estimation.", link: "#" }
      ]
    },
    {
      category: "Fiscal & Economic Analysis",
      icon: <TrendingUp className="text-purple-500" />,
      papers: [
        { title: "Daniel Johnston (1994)", desc: "International Petroleum Fiscal Systems and Production Sharing Contracts.", link: "#" },
        { title: "SPE Paper 16484", desc: "Improving project economics through risk-based decision making.", link: "#" },
        { title: "Kemp (1987)", desc: "Petroleum Taxation: Analysis of Government Take and Contractor Shares.", link: "#" }
      ]
    }
  ];

  return (
    <div className="space-y-12 p-8">
      <div className="max-w-4xl">
         <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-3xl bg-indigo-500/20 flex items-center justify-center text-indigo-500">
               <Library size={28} />
            </div>
            <div>
               <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Knowledge <span className="text-indigo-500">Repository</span></h2>
               <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Curated references for Reserves & Economics</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
         {references.map((section, idx) => ( section &&
            <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="space-y-8"
            >
               <div className="flex items-center gap-3">
                  {section.icon}
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">{section.category}</h3>
               </div>

               <div className="space-y-4">
                  {section.papers.map((paper, pIdx) => (
                     <motion.a 
                        key={pIdx}
                        href={paper.link !== "#" ? paper.link : undefined}
                        target={paper.link !== "#" ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                           "glass-card rounded-3xl p-6 border-white/5 bg-black/40 hover:bg-white/[0.03] transition-all group cursor-pointer block relative overflow-hidden",
                           paper.link === "#" && "opacity-60 cursor-not-allowed"
                        )}
                     >
                        <div className="flex justify-between items-start mb-3 relative z-10">
                           <h4 className="text-[11px] font-black text-white uppercase tracking-wider group-hover:text-cyan-400 transition-colors">{paper.title}</h4>
                           <ExternalLink size={12} className="text-slate-600 group-hover:text-white" />
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed italic relative z-10">{paper.desc}</p>
                        
                        {/* Kinetic Knowledge Pulse */}
                        {paper.link !== "#" && (
                           <motion.div 
                             animate={{ opacity: [0, 0.05, 0] }}
                             transition={{ duration: 2, repeat: Infinity, delay: pIdx * 0.4 }}
                             className="absolute inset-0 bg-cyan-400 pointer-events-none" 
                           />
                        )}
                     </motion.a>
                  ))}
               </div>
            </motion.div>
         ))}
      </div>

      <div className="mt-12 p-10 glass-card rounded-3xl border-indigo-500/20 bg-indigo-500/5 flex flex-col md:flex-row items-center gap-12">
         <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
               <Info size={20} className="text-indigo-400" />
               <h4 className="text-xs font-black text-white uppercase tracking-widest">A Note on PRMS Compliance</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
               The calculations performed in this module follow the PRMS 2018 guidelines for deterministic and probabilistic reserves estimation. However, for statutory reporting, always consult with a certified petroleum reserves auditor (CPRA) to ensure project-specific technical and commercial risks are fully captured in the final booking.
            </p>
         </div>
         <div className="bg-white/5 rounded-2xl p-8 border border-white/5 text-center">
            <div className="text-2xl font-black text-white italic tracking-tighter mb-1">P1 / P2 / P3</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Confidence Thresholds</div>
         </div>
      </div>
    </div>
  );
}
