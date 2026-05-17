import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  BookOpen, 
  Settings2, 
  CheckCircle2, 
  ArrowRightCircle, 
  ShieldCheck, 
  Globe, 
  ExternalLink,
  ChevronRight,
  ClipboardList,
  Library,
  Layers,
  Activity,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function FDPReportTab() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const reportSections = [
    {
      id: 'exec',
      title: "Executive Summary",
      desc: "Overview of the project value proposition, key metrics (NPV, IRR), and strategic alignment.",
      subPoints: ["Project Objectives", "Key Technical Findings", "Economic Highlights", "Main Risks & Mitigations"]
    },
    {
      id: 'sub',
      title: "Geology & Geophysics",
      desc: "Structural definition, seismic interpretation, and petrophysical properties of the reservoir.",
      subPoints: ["Seismic Interpretation", "Structural Framework", "Reservoir Properties", "Fluid Characterization"]
    },
    {
      id: 'res',
      title: "Reservoir Engineering",
      desc: "Resource estimation (1P, 2P, 3P), development strategy, and production forecasting.",
      subPoints: ["STOOIP/GIIP Estimation", "Recovery Mechanism", "Production Profiles", "Simulation Modeling"]
    },
    {
      id: 'well',
      title: "Well Engineering",
      desc: "Well design, drilling schedule, and completion strategy for the development wells.",
      subPoints: ["Well Trajectories", "Casing & Completion Design", "Drilling Sequence", "Rig Requirements"]
    },
    {
      id: 'fac',
      title: "Facilities Engineering",
      desc: "Design and sizing of surface processing equipment, pipelines, and export infrastructure.",
      subPoints: ["Process Flow Diagrams (PFD)", "Sizing Calcs (API 12J)", "Pipeline Hydraulics", "Utility Systems"]
    },
    {
      id: 'hse',
      title: "HSE & Regulatory",
      desc: "Health, Safety, and Environmental impact assessment and regulatory compliance plan.",
      subPoints: ["Environmental Impact Study", "Safety Management System", "Oil Spill Response", "Permitting Traceability"]
    },
    {
      id: 'econ',
      title: "Economic Evaluation",
      desc: "Full lifecycle cost analysis, sensitivity studies, and fiscal regime application.",
      subPoints: ["CAPEX/OPEX Breakdown", "NPV/IRR Sensitivity", "Fiscal Terms Analysis", "Funding Requirements"]
    }
  ];

  const standards = [
    { code: "API RP 14E", title: "Design and Installation of Offshore Production Platform Piping Systems", category: "Piping & Valves" },
    { code: "API 12J", title: "Specification for Oil and Gas Separators", category: "Process Vessels" },
    { code: "ISO 13628", title: "Design and Operation of Subsea Production Systems", category: "Subsea" },
    { code: "SPE PRMS", title: "Petroleum Resources Management System", category: "Reserves Reporting" },
    { code: "ASME VIII", title: "Boiler and Pressure Vessel Code", category: "Pressure Integrity" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
      {/* Report Outline Generator */}
      <div className="lg:col-span-8 space-y-8">
        <div className="flex items-center justify-between mb-2">
           <div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">FDP <span className="text-cyan-500">Report Template</span></h2>
              <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Comprehensive Field Development Plan Structure</p>
           </div>
           <button className="px-6 py-3 bg-cyan-500 rounded-2xl flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
              <FileText size={14} /> Export Report Skeleton
           </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
           {reportSections.map((section, idx) => (
              <motion.div 
                 key={section.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                 className={cn(
                    "glass-card rounded-2xl border-white/5 transition-all cursor-pointer overflow-hidden",
                    selectedSection === section.id ? "bg-white/[0.05] p-10 ring-1 ring-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.05)]" : "bg-black/40 p-8 hover:bg-white/[0.02]"
                 )}
              >
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <span className="text-[11px] font-black text-slate-700 font-mono">0{idx + 1}</span>
                       <div>
                          <h4 className={cn(
                            "text-lg font-black uppercase italic tracking-tighter transition-colors",
                            selectedSection === section.id ? "text-cyan-400" : "text-white"
                          )}>{section.title}</h4>
                          <p className="text-[10px] text-slate-500 italic mt-0.5">{section.desc}</p>
                       </div>
                    </div>
                    <ChevronRight className={cn("text-slate-700 transition-all", selectedSection === section.id && "rotate-90 text-cyan-400")} />
                 </div>

                 <AnimatePresence>
                    {selectedSection === section.id && (
                       <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pt-8 mt-8 border-t border-white/5"
                       >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             {section.subPoints.map(point => (
                                <div key={point} className="flex items-center gap-3">
                                   <div className="h-1.5 w-1.5 rounded-full bg-cyan-500/40" />
                                   <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{point}</span>
                                </div>
                             ))}
                          </div>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </motion.div>
           ))}
        </div>
      </div>

      {/* References & Standards */}
      <div className="lg:col-span-4 space-y-8">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Library size={18} className="text-indigo-400" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Industry Standards</h4>
           </div>
           
           <div className="space-y-4">
              {standards.map(std => (
                 <div key={std.code} className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/[0.08] transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{std.code}</span>
                       <ExternalLink size={10} className="text-slate-600 group-hover:text-white" />
                    </div>
                    <h5 className="text-[10px] font-bold text-white uppercase mb-1 leading-tight">{std.title}</h5>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{std.category}</span>
                 </div>
              ))}
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-indigo-900/40 to-black border-white/5 space-y-6">
           <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Quality Assurance</h5>
           </div>
           <p className="text-[10px] text-slate-400 italic leading-relaxed">
              Standardized reporting structures ensure consistency across your portfolio and improve internal technical audit efficiency.
           </p>
           <div className="pt-6 border-t border-white/5">
              <button className="w-full py-4 bg-white/5 rounded-xl text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all">
                 Technical Peer Review
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
