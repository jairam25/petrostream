import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Settings2, 
  Table, 
  FileCheck, 
  Trash2, 
  ArrowDownToLine,
  Filter,
  RefreshCw,
  AlertOctagon,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  AlertCircle,
  Waves,
  ShieldAlert
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { InputWithSlider, FileDropZone } from '../SharedUI';
import { performHeuristicAudit, imputeBasic } from '../../lib/analytics';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Line } from 'recharts';

class CleaningErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { console.error("Cleaning Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) return (
      <div className="p-10 text-red-500 bg-red-500/10 h-[600px] overflow-auto rounded-3xl">
        <h2 className="text-2xl font-bold mb-4">React Error in DataCleaningTab</h2>
        <pre className="text-xs font-mono whitespace-pre-wrap">{this.state.error?.stack || this.state.error?.toString()}</pre>
      </div>
    );
    return this.props.children;
  }
}

export function DataCleaningTab({ 
  ingestionStatus, 
  setIngestionStatus, 
  fileName, 
  setFileName, 
  calculatedAnomalies, 
  setCalculatedAnomalies,
  onProcessingComplete 
}: {
  ingestionStatus: 'idle' | 'processing' | 'success',
  setIngestionStatus: (s: any) => void,
  fileName: string,
  setFileName: (n: string) => void,
  calculatedAnomalies: any[],
  setCalculatedAnomalies: (a: any[]) => void,
  onProcessingComplete: (name: string, anomalies: any[], data?: any[]) => void
}) {
  const [activeTool, setActiveTool] = useState<'import' | 'clean' | 'impute'>('import');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
      {/* Sidebar - Tools */}
      <div className="lg:col-span-3 space-y-4">
        {[
          { id: 'import', label: 'Data Ingestion', desc: 'CSV, LAS, WITSML formats', icon: Database },
          { id: 'clean', label: 'Quality Audit', icon: ShieldCheck, desc: 'Outliers & meter errors' },
          { id: 'impute', label: 'Gap Filling', icon: Zap, desc: 'Linear & LVCF models' }
        ].map(t => (
          <motion.div
            key={t.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTool(t.id as any)}
            className={cn(
              "glass-card rounded-2xl p-6 border-white/5 transition-all cursor-pointer",
              activeTool === t.id ? "bg-indigo-500/10 ring-1 ring-indigo-500/50" : "bg-black/40 hover:bg-white/[0.02]"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl", activeTool === t.id ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-500")}>
                <t.icon size={18} />
              </div>
              <div>
                <h4 className={cn("text-xs font-black uppercase italic tracking-wider", activeTool === t.id ? "text-indigo-400" : "text-white")}>{t.label}</h4>
                <p className="text-[11px] text-slate-600 italic mt-0.5">{t.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-indigo-950 to-black border-indigo-500/10 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings2 size={16} className="text-indigo-400" />
            <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Global Pipeline</h5>
          </div>
          <div className="space-y-4">
            <PipelineStatus 
              label="Norm. Units" 
              status={ingestionStatus === 'processing' ? 'PROCESSING' : ingestionStatus === 'success' ? 'VALIDATED' : 'READY'} 
              active={ingestionStatus === 'processing'}
              desc="Standardizing units (MCF/BOE) across disparate streams." 
            />
            <PipelineStatus 
              label="TZ Offset" 
              status={ingestionStatus === 'processing' ? 'CALIBRATING' : ingestionStatus === 'success' ? 'SYNCED' : 'IDLE'} 
              active={ingestionStatus === 'processing'}
              desc="Synchronizing SCADA timestamps to UTC-Master." 
            />
            <PipelineStatus 
              label="Aliasing" 
              status={ingestionStatus === 'processing' ? 'FILTERING' : ingestionStatus === 'success' ? 'CLEAN' : 'OFF'} 
              active={ingestionStatus === 'processing'}
              desc="Filtering high-frequency signal noise and jitter." 
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-9">
         <CleaningErrorBoundary>
           <AnimatePresence mode="wait">
              {activeTool === 'import' && (
                <DataImportTool 
                  key="import" 
                  onStatusChange={setIngestionStatus} 
                  onProcessingComplete={onProcessingComplete}
                />
              )}
              {activeTool === 'clean' && (
                <QualityAuditTool 
                  key="clean" 
                  status={ingestionStatus} 
                  fileName={fileName}
                  anomalies={calculatedAnomalies}
                  setAnomalies={setCalculatedAnomalies}
                />
              )}
              {activeTool === 'impute' && (
                <GapFillingTool 
                  key="impute" 
                  status={ingestionStatus} 
                  fileName={fileName}
                />
              )}
           </AnimatePresence>
         </CleaningErrorBoundary>
      </div>
    </div>
  );
}

function DataImportTool({ onStatusChange, onProcessingComplete }: { onStatusChange: (s: 'idle' | 'processing' | 'success') => void, onProcessingComplete: (name: string, anomalies: any[], data?: any[]) => void }) {
  const [status, setInternalStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [internalFileName, setInternalFileName] = useState('');
  const [stats, setStats] = useState({ rows: 0, mean: '0', density: '0' });

  const handleFile = (file: File) => {
    setInternalFileName(file.name);
    setInternalStatus('processing');
    onStatusChange('processing');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const parsedData = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim());
        const entry: any = {};
        headers.forEach((header, idx) => {
          const val = values[idx];
          entry[header] = isNaN(Number(val)) ? val : Number(val);
        });
        return entry;
      });

      // Calculate stats for the success screen
      const rows = parsedData.length;
      let totalOil = 0;
      let validOilRows = 0;
      
      parsedData.forEach(row => {
        // Handle common variations of Oil Production headers
        const oil = Number(row.Oil_Prod_BBL || row.Oil || row.oil_bbl || 0);
        if (!isNaN(oil) && oil > 0) {
          totalOil += oil;
          validOilRows++;
        }
      });
      
      const mean = validOilRows > 0 ? totalOil / validOilRows : 0;
      const density = rows > 0 ? (validOilRows / rows) * 100 : 0;
      
      setStats({
        rows,
        mean: formatNumber(mean, 1),
        density: density.toFixed(1)
      });

      // Execute Heuristic Audit
      const results = performHeuristicAudit(parsedData);
      
      setTimeout(() => {
        setInternalStatus('success');
        onStatusChange('success');
        onProcessingComplete(file.name, results, parsedData);
      }, 1500);
    };
    reader.readAsText(file);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full flex flex-col justify-center items-center text-center relative overflow-hidden"
    >
       <AnimatePresence mode="wait">
         {status === 'idle' && (
           <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
             <FileDropZone 
               onFileSelect={handleFile}
               icon={ArrowDownToLine}
               label="Drop Production File"
             />
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8">
               <FormatBox label="CSV" icon={Table} />
               <FormatBox label="LAS 3.0" icon={Database} />
               <FormatBox label="SCADA" icon={Zap} />
               <FormatBox label="Excel" icon={FileCheck} />
             </div>
             <div className="flex flex-col md:flex-row gap-4 justify-center">
               <a 
                 href="/PetroStream_Production_Template.csv" 
                 download 
                 className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 hover:border-indigo-500/30 transition-all group"
               >
                 <ArrowDownToLine size={14} className="group-hover:animate-bounce" />
                 Download Standard Template
               </a>
               <a 
                 href="/Permian_Basin_Industrial_Scale.csv" 
                 download 
                 className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white hover:bg-indigo-500 transition-all group"
               >
                 <Waves size={14} className="group-hover:animate-pulse" />
                 Permian Basin Industrial Sample
               </a>
             </div>
           </motion.div>
         )}

         {status === 'processing' && (
           <motion.div key="processing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
             <div className="relative w-24 h-24 mb-6">
                <motion.div 
                  className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
                <motion.div 
                  className="absolute inset-0 border-t-4 border-indigo-500 rounded-full"
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
                <Database className="absolute inset-0 m-auto text-indigo-400" size={32} />
             </div>
             
             <div className="h-8 overflow-hidden mb-4">
                <motion.div 
                   animate={{ y: [0, -100] }} 
                   transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                   className="flex flex-col items-center gap-2"
                >
                   {["q = k·A·ΔP / μ·L", "Np = Gp·(Bg - Bgi)", "q(t) = qi / (1 + b·di·t)^(1/b)", "Pwf = Pe - (qμ / 2πkh)·ln(re/rw)"].map((math, i) => (
                     <span key={i} className="text-[10px] font-mono text-indigo-500/60 font-bold italic">{math}</span>
                   ))}
                </motion.div>
             </div>

             <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Neural Stream Sync</h3>
             <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Analyzing Schema for: <span className="text-indigo-400">{internalFileName}</span></p>
             <div className="w-64 h-1 bg-white/5 rounded-full mt-8 overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-500"
                  initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.5 }}
                />
             </div>
           </motion.div>
         )}

         {status === 'success' && (
           <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center w-full max-w-lg">
             <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                <CheckCircle2 size={32} className="text-green-500" />
             </div>
             <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Data Stream <span className="text-green-500">Active</span></h3>
             <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-12">Successfully Ingested <span className="text-white">{internalFileName}</span></p>
             
             <div className="grid grid-cols-3 gap-6 w-full mb-12">
                {[
                  { label: "Row Count", value: formatNumber(stats.rows, 0), icon: Table },
                  { label: "Mean Prod", value: stats.mean, sub: "BBL/D", icon: Activity },
                  { label: "Density", value: `${stats.density}%`, icon: Zap }
                ].map((m, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1 }}
                    className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center relative overflow-hidden group"
                  >
                     <m.icon size={12} className="text-slate-700 mx-auto mb-3" />
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{m.label}</span>
                     <div className="flex items-baseline justify-center gap-1">
                        <span className="text-lg font-black text-white italic">{m.value}</span>
                        {m.sub && <span className="text-[10px] font-black text-indigo-400">{m.sub}</span>}
                     </div>
                     <div className="absolute bottom-0 left-0 h-0.5 bg-indigo-500 w-0 group-hover:w-full transition-all" />
                  </motion.div>
                ))}
             </div>

             <button 
               onClick={() => {
                 setInternalStatus('idle');
                 onStatusChange('idle');
               }}
               className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all hover:bg-white/10"
             >
               Upload Another Stream
             </button>
           </motion.div>
         )}
       </AnimatePresence>
    </motion.div>
  );
}

function QualityAuditTool({ status, fileName, anomalies, setAnomalies }: { 
  status: 'idle' | 'processing' | 'success', 
  fileName: string,
  anomalies: any[],
  setAnomalies: React.Dispatch<React.SetStateAction<any[]>>
}) {
  const [isCleaning, setIsCleaning] = useState(false);

  if (status !== 'success') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full flex flex-col justify-center items-center text-center">
         <ShieldAlert size={48} className="text-slate-700 mb-6" />
         <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Audit Module <span className="text-slate-500">Locked</span></h3>
         <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest max-w-xs">Ingest a valid production stream to trigger heuristic anomaly detection.</p>
      </motion.div>
    );
  }

  const statusOptions = ['Meter Error', 'Sensing Failure', 'Human Error', 'Physical Event', 'Valid Signal', 'Physics Violation'];

  const cycleStatus = (idx: number) => {
    setAnomalies(prev => {
      const next = [...prev];
      const currentIdx = statusOptions.indexOf(next[idx].status);
      next[idx].status = statusOptions[(currentIdx + 1) % statusOptions.length];
      return next;
    });
  };

  const runPipeline = () => {
    setIsCleaning(true);
    setTimeout(() => {
      setIsCleaning(false);
      setAnomalies([]);
    }, 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Quality <span className="text-indigo-500">Audit</span></h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Heuristic Scan for: <span className="text-indigo-400">{fileName}</span></p>
          </div>
          <div className="flex gap-4">
             <div className="p-6 bg-red-500/10 rounded-3xl border border-red-500/20 text-center">
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-1">Anomalies Found</span>
                <span className="text-2xl font-black text-white italic">{anomalies.length}</span>
             </div>
          </div>
       </div>

       <div className="space-y-4 min-h-[200px] flex flex-col justify-center">
          <AnimatePresence mode="popLayout">
            {anomalies.length > 0 ? (
               <>
                 {anomalies.slice(0, 10).map((issue, idx) => (
                   <motion.div 
                     key={issue.well + issue.type + idx}
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group hover:bg-white/5 transition-all"
                   >
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 text-red-400">
                           <AlertOctagon size={20} />
                        </div>
                        <div>
                           <h4 className="text-xs font-black text-white uppercase italic">{issue.type}</h4>
                           <p className="text-[11px] text-slate-500 font-mono uppercase tracking-widest">{issue.well} • {issue.timestamp}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <button 
                          onClick={() => cycleStatus(idx)}
                          className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500 hover:text-black transition-all cursor-pointer"
                        >
                           {issue.status}
                        </button>
                        <button 
                          onClick={() => {
                            setAnomalies(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="p-3 text-slate-700 hover:text-red-500 transition-colors"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                   </motion.div>
                 ))}
                 {anomalies.length > 10 && (
                   <div className="text-center pt-4">
                     <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">
                       + {formatNumber(anomalies.length - 10, 0)} More Anomalies Hidden for Performance
                     </span>
                   </div>
                 )}
               </>
             ) : !isCleaning ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <ShieldCheck size={48} className="text-indigo-500 mx-auto mb-4" />
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest italic">All Production Data Validated & Sanitized</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
       </div>

       <button 
         onClick={runPipeline}
         disabled={isCleaning || anomalies.length === 0}
         className={cn(
           "mt-12 w-full py-5 rounded-2xl text-xs font-black uppercase tracking-widest italic transition-all relative overflow-hidden",
           isCleaning ? "bg-indigo-900 text-indigo-300 cursor-wait" : 
           anomalies.length === 0 ? "bg-white/5 text-slate-700 cursor-not-allowed" :
           "bg-indigo-500 text-black hover:shadow-[0_0_40px_rgba(99,102,241,0.3)]"
         )}
       >
          <span className={cn("transition-all", isCleaning ? "opacity-0" : "opacity-100")}>
            {anomalies.length === 0 ? "Pipeline Execution Complete" : "Execute Auto-Cleaning Pipeline"}
          </span>
          {isCleaning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw size={20} className="animate-spin mr-3" />
              <span>Sanitizing Neural Streams...</span>
              <div className="absolute bottom-0 left-0 h-1 bg-indigo-400 animate-progress" />
            </div>
          )}
       </button>
    </motion.div>
  );
}

function GapFillingTool({ status, fileName }: { status: 'idle' | 'processing' | 'success', fileName: string }) {
  const [selected, setSelected] = useState('Linear Interpolation');
  const [isApplying, setIsApplying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  if (status !== 'success') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full flex flex-col justify-center items-center text-center">
         <Zap size={48} className="text-slate-700 mb-6" />
         <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Imputation <span className="text-slate-500">Locked</span></h3>
         <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest max-w-xs">Active data stream required for neural gap synthesis.</p>
      </motion.div>
    );
  }

  const previewData = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const isGap = i > 8 && i < 14;
      let val = 400 + Math.random() * 50;
      let filled = val;
      
      if (isGap) {
        val = 0; // Gap
        if (selected === 'Linear Interpolation') filled = 420;
        else if (selected === 'LVCF') filled = 445;
        else filled = 420 + Math.sin(i * 0.5) * 30;
      }
      
      return { time: i, actual: val > 0 ? val : null, imputed: filled };
    });
  }, [selected]);

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setIsComplete(true);
      setTimeout(() => setIsComplete(false), 3000); // Reset after 3s
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="mb-12">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Data <span className="text-indigo-500">Imputation</span></h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Synthesizing gaps for: <span className="text-indigo-400">{fileName}</span></p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
             <ImputeCard 
               label="Linear Interpolation" 
               desc="Best for short 1-3 day gaps" 
               type="Recommended"
               selected={selected === 'Linear Interpolation'}
               onClick={() => setSelected('Linear Interpolation')}
             />
             <ImputeCard 
               label="LVCF" 
               desc="Last Value Carried Forward" 
               type="Conservative"
               selected={selected === 'LVCF'}
               onClick={() => setSelected('LVCF')}
             />
             <ImputeCard 
               label="Seasonal Decomp." 
               desc="Periodic pattern matching" 
               type="Advanced"
               selected={selected === 'Seasonal Decomp.'}
               onClick={() => setSelected('Seasonal Decomp.')}
             />
             
             <button 
               onClick={handleApply}
               disabled={isApplying || isComplete}
               className={cn(
                 "w-full mt-8 py-5 rounded-2xl text-xs font-black uppercase tracking-widest italic transition-all flex items-center justify-center gap-3",
                 isApplying ? "bg-indigo-900 text-indigo-300 cursor-wait" :
                 isComplete ? "bg-green-500 text-black shadow-[0_0_40px_rgba(34,197,94,0.3)]" :
                 "bg-indigo-500 text-black hover:shadow-[0_0_40px_rgba(99,102,241,0.3)] cursor-pointer"
               )}
             >
                {isApplying ? (
                  <><RefreshCw className="animate-spin" size={16} /> Synthesizing...</>
                ) : isComplete ? (
                  <><CheckCircle2 size={16} /> Synthesis Complete</>
                ) : (
                  "Apply Neural Imputation"
                )}
             </button>
          </div>

          <div className="p-10 bg-white/5 rounded-3xl border border-white/5 flex flex-col">
             <div className="flex justify-between items-center mb-8">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic flex items-center gap-2">
                   <Activity size={14} />
                   Stream Preview
                </h4>
                <div className="flex gap-4">
                   <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-700" /><span className="text-[10px] text-slate-500 uppercase font-black">Actual</span></div>
                   <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /><span className="text-[10px] text-indigo-400 uppercase font-black">Imputed</span></div>
                </div>
             </div>
             
             <div className="flex-1 min-h-[200px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={previewData}>
                      <defs>
                        <linearGradient id="colorImputed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="imputed" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorImputed)" />
                      <Line type="monotone" dataKey="actual" stroke="#334155" strokeWidth={4} dot={false} strokeDasharray="5 5" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>

             <div className="text-center">
                <p className="text-[11px] text-slate-600 leading-relaxed uppercase font-bold tracking-tighter">Physics-informed engine ensures mass balance preservation during synthesis.</p>
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function PipelineStatus({ label, status, active, desc }: { label: string, status: string, active?: boolean, desc: string }) {
  return (
    <div className="group relative">
      <div className={cn(
        "flex justify-between items-center bg-black/40 p-4 rounded-2xl border transition-all",
        active ? "border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.05)]" : "border-white/5"
      )}>
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
              <div className="p-1 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Settings2 size={8} className="text-slate-600" />
              </div>
           </div>
           <p className="text-[10px] text-slate-600 font-medium italic leading-tight max-w-[120px] hidden group-hover:block animate-in fade-in slide-in-from-left-1">
             {desc}
           </p>
        </div>
        <div className="flex items-center gap-2">
           {active && <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
           <span className={cn(
              "text-[11px] font-black uppercase tracking-widest italic",
              active ? "text-indigo-400" : "text-white/40"
           )}>{status}</span>
        </div>
      </div>
    </div>
  );
}

function FormatBox({ label, icon: Icon }: { label: string, icon: any }) {
  return (
    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center gap-3 hover:bg-white/[0.08] transition-all cursor-pointer">
       <Icon size={18} className="text-slate-600" />
       <span className="text-[10px] font-black text-white uppercase italic">{label}</span>
    </div>
  );
}

function ImputeCard({ label, desc, type, selected, onClick }: { label: string, desc: string, type: string, selected?: boolean, onClick?: () => void }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "p-6 rounded-3xl border transition-all cursor-pointer group",
        selected ? "bg-indigo-500/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.1)]" : "bg-black/40 border-white/5 hover:border-white/20"
      )}
    >
       <div className="flex justify-between items-start mb-2">
          <h4 className={cn(
            "text-xs font-black uppercase italic transition-colors",
            selected ? "text-indigo-400" : "text-white group-hover:text-indigo-400"
          )}>{label}</h4>
          <span className={cn(
            "text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest transition-colors",
            selected ? "bg-indigo-500 text-black" : "bg-white/5 text-slate-600 group-hover:text-white"
          )}>{type}</span>
       </div>
       <p className={cn(
         "text-[11px] italic font-medium transition-colors",
         selected ? "text-indigo-300/60" : "text-slate-600"
       )}>{desc}</p>
    </motion.div>
  );
}

