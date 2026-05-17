import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  HelpCircle, 
  ChevronRight, 
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  FileSearch,
  Scale
} from 'lucide-react';
import { cn } from '../../lib/utils';

type ResourceCategory = 'PROSPECTIVE' | 'CONTINGENT' | 'RESERVES' | 'UNKNOWN';
type ReserveClass = '1P' | '2P' | '3P' | 'NONE';

interface Question {
  id: string;
  text: string;
  options: { label: string; value: boolean; next?: string }[];
}

export function ReserveClassificationTab() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [activeView, setActiveView] = useState<'decision' | 'prms' | 'sec'>('decision');

  const questions: Question[] = [
    {
      id: 'discovered',
      text: "Has a discovery been confirmed by drilling and testing?",
      options: [
        { label: "Yes, Discovered", value: true },
        { label: "No, Undrilled", value: false }
      ]
    },
    {
      id: 'commercial',
      text: "Is the project commercially viable under current conditions?",
      options: [
        { label: "Yes, Commercial", value: true },
        { label: "No, Sub-commercial", value: false }
      ]
    },
    {
      id: 'commitment',
      text: "Is there a firm commitment to develop the project within 5 years?",
      options: [
        { label: "Yes, Committed", value: true },
        { label: "No, Pending", value: false }
      ]
    }
  ];

  const handleAnswer = (val: boolean) => {
    setAnswers({ ...answers, [questions[step].id]: val });
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setStep(step + 1); // Show result
    }
  };

  const getResult = () => {
    if (!answers.discovered) return { cat: 'Prospective Resources', color: 'text-amber-500', desc: 'Undiscovered accumulation. High risk.' };
    if (!answers.commercial) return { cat: 'Contingent Resources', color: 'text-blue-500', desc: 'Discovered but non-commercial due to technology, economics, or regulation.' };
    return { cat: 'Reserves', color: 'text-emerald-500', desc: 'Discovered, commercial, and committed for development.' };
  };

  return (
    <div className="space-y-8 p-4">
      {/* View Switcher */}
      <div className="flex gap-4 p-1 bg-white/5 rounded-2xl w-fit">
        {[
          { id: 'decision', label: 'Decision Tree', icon: ChevronRight },
          { id: 'prms', label: 'SPE-PRMS Hierarchy', icon: FileSearch },
          { id: 'sec', label: 'SEC Compliance', icon: Scale }
        ].map(v => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id as any)}
            className={cn(
              "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
              activeView === v.id ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-white"
            )}
          >
            <v.icon size={14} />
            {v.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {activeView === 'decision' && (
              <motion.div
                key="decision"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-card rounded-3xl p-12 border-white/5 bg-black/40 min-h-[500px] flex flex-col"
              >
                <div className="mb-12">
                   <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Classification <span className="text-cyan-500">Wizard</span></h3>
                   <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-widest">Interactive PRMS decision logic</p>
                </div>

                {step < questions.length ? (
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-start gap-6 mb-12">
                       <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                         <HelpCircle className="text-cyan-500" size={24} />
                       </div>
                       <h4 className="text-2xl font-bold text-white leading-tight">{questions[step].text}</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {questions[step].options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(opt.value)}
                          className="group p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-all text-left relative overflow-hidden"
                        >
                           <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                             <CheckCircle2 className="text-cyan-500" size={20} />
                           </div>
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Option {i + 1}</span>
                           <span className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                     <div className={cn("inline-flex p-6 rounded-full mb-8", getResult().color.replace('text', 'bg').concat('/20'))}>
                        <ShieldCheck size={48} className={getResult().color} />
                     </div>
                     <h4 className={cn("text-5xl font-black italic tracking-tighter uppercase mb-4", getResult().color)}>
                       {getResult().cat}
                     </h4>
                     <p className="text-slate-400 max-w-md mx-auto leading-relaxed">{getResult().desc}</p>
                     <button 
                       onClick={() => { setStep(0); setAnswers({}); }}
                       className="mt-12 px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-cyan-500 hover:text-white transition-all shadow-xl"
                     >
                       Restart Wizard
                     </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeView === 'prms' && (
              <motion.div
                key="prms"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-3xl p-12 border-white/5 bg-black/40"
              >
                 <div className="mb-12">
                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">PRMS <span className="text-blue-500">Hierarchy</span></h3>
                 </div>
                 <div className="space-y-4">
                    <HierarchyBlock label="Reserves" color="bg-emerald-500/20 text-emerald-400" sub="Commercial & Discovered" children={['1P (Proved) - P90', '2P (Probable) - P50', '3P (Possible) - P10']} />
                    <HierarchyBlock label="Contingent Resources" color="bg-blue-500/20 text-blue-400" sub="Potentially Commercial (Technical, Regulatory, or Economic hurdles)" children={['1C', '2C', '3C']} />
                    <HierarchyBlock label="Prospective Resources" color="bg-amber-500/20 text-amber-400" sub="Undiscovered (Risked)" children={['Low Estimate', 'Best Estimate', 'High Estimate']} />
                 </div>
              </motion.div>
            )}

            {activeView === 'sec' && (
              <motion.div
                key="sec"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-12 border-white/5 bg-black/40"
              >
                <div className="flex items-center gap-4 mb-10">
                   <AlertTriangle className="text-amber-500" />
                   <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">SEC Reporting Standards</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                      <h5 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Price Assumption</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">SEC requires the use of the 12-month average price (1st day of month) for economic calculations. PRMS allows forward curve or management estimates.</p>
                   </div>
                   <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                      <h5 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Certainty Criteria</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">Only Proved (1P) reserves can be reported as "Reasonable Certainty". Probable and Possible are optional and highly scrutinized.</p>
                   </div>
                   <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                      <h5 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">The 5-Year Rule</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">Proved Undeveloped (PUD) reserves must have a specific development plan that ensures production within 5 years of booking.</p>
                   </div>
                   <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                      <h5 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Reasonable Certainty</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">Requires a high degree of confidence that quantities will actually be recovered. SEC emphasizes technical evidence over generic analogies.</p>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Categories Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Classification States</h5>
              <div className="space-y-4">
                 <StateBox icon={<CheckCircle2 className="text-emerald-500" />} label="PDP" title="Proved Developed Producing" desc="Active production wells." />
                 <StateBox icon={<Info className="text-cyan-500" />} label="PDNP" title="Proved Developed Non-Producing" desc="Waiting on completion or workover." />
                 <StateBox icon={<AlertTriangle className="text-amber-500" />} label="PUD" title="Proved Undeveloped" desc="Require significant investment to produce." />
              </div>
           </div>

           <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-indigo-900/40 to-black border-white/5">
              <div className="flex items-center gap-3 mb-6">
                 <Scale size={18} className="text-indigo-400" />
                 <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Key Differences</h5>
              </div>
              <ul className="space-y-4">
                 <li className="flex gap-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div>
                       <p className="text-[10px] font-bold text-white uppercase">PRMS: Project-based</p>
                       <p className="text-[11px] text-slate-500">Evaluates whole potential spectrum.</p>
                    </div>
                 </li>
                 <li className="flex gap-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div>
                       <p className="text-[10px] font-bold text-white uppercase">SEC: Disclosure-based</p>
                       <p className="text-[11px] text-slate-500">Strictly for financial reporting.</p>
                    </div>
                 </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}

function HierarchyBlock({ label, color, sub, children }: { label: string, color: string, sub: string, children: string[] }) {
  return (
    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h4 className={cn("text-xl font-black italic uppercase tracking-tighter", color.split(' ')[1])}>{label}</h4>
            <p className="text-[11px] text-slate-500 font-mono mt-1 uppercase">{sub}</p>
          </div>
          <div className={cn("px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest", color.split(' ')[0])}>Commercial</div>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {children.map(c => (
            <div key={c} className="p-4 rounded-2xl bg-black/40 border border-white/5 text-[10px] font-bold text-white text-center">
              {c}
            </div>
          ))}
       </div>
    </div>
  );
}

function StateBox({ icon, label, title, desc }: { icon: React.ReactNode, label: string, title: string, desc: string }) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all group">
       <div className="shrink-0 pt-1">{icon}</div>
       <div>
          <div className="flex items-center gap-2">
             <span className="text-[11px] font-black text-white tracking-widest group-hover:text-cyan-400 transition-colors">{label}</span>
             <span className="text-[10px] font-bold text-slate-500">• {title}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}
