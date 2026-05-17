import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Settings2, 
  Download, 
  Mail, 
  Clock, 
  FileCheck, 
  FileWarning, 
  Scroll,
  TrendingUp,
  Target,
  Activity,
  Zap,
  Printer,
  Archive,
  RefreshCw
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';

export function AnalyticsReportingTab() {
  const [activeReport, setActiveReport] = useState<'daily' | 'monthly' | 'regulatory' | 'review'>('daily');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (type: string) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const csvContent = (() => {
        const date = new Date().toLocaleString();
        switch(type) {
          case 'Daily_Ops':
            return `PETROSTREAM REPORT - DAILY OPERATIONS
Generated: ${date}

--- PRODUCTION METRICS ---
Metric,Value,Unit,Trend vs 24H
Field Total (Oil),12450,STBD,+2.1%
Gas Production,8.4,MMSCFD,-0.5%
Water Cut Avg,42.4,%,+1.2%

--- OPERATIONAL SUMMARY ---
Event,Status
Reservoir GULF-BRAVO-14X stable at 2450 PSI BHP average,OK
Well BRAVO-04 shut-in for ESP vibration alarm at 04:12 AM,WARNING
Water injection VRR holding at 1.02; Segment B under-injected,NOTICE
Injector INJ-02 casing pressure spike detected,CRITICAL
Network choke optimization executed at 06:00 AM - Est. Gain: +120 bbl,SUCCESS`;
          
          case 'Monthly_Mgmt':
            return `PETROSTREAM REPORT - MONTHLY MANAGEMENT
Generated: ${date}

--- VARIANCE ANALYSIS ---
KPI,Actual,Target,Status
Production Uptime (%),94,98,Under Target
Unit Lifting Cost ($/bbl),12.4,14.0,Better than Target
Gas Conservation (%),99.2,99.0,Better than Target

--- ALGORITHM RECOMMENDATIONS ---
Type,Description,Estimated Impact
Acid Stimulation,"System identified 4 candidate wells for acid stimulation based on skin trend analysis from previous 30 days.","+450 bbl/d total"
Choke Optimization,"Wells ALPHA-12 and BRAVO-08 operating below critical rate.","Prevent liquid loading"`;

          case 'Well_Review_Pack':
            return `PETROSTREAM REPORT - WELL REVIEW PACK
Generated: ${date}

--- WELL PERFORMANCE DOSSIER ---
Well ID,Status,Last Intervention,Current Rate (bbl/d),Water Cut (%),DCA EUR (Mbbl),Remaining Rsv (Mbbl)
BRAVO-01,Active,2024-02-15 (Acid),420,38%,1250,830
BRAVO-02,Active,2023-11-02 (Cleanout),510,42%,1400,890
BRAVO-04,Shut-in,2025-01-10 (ESP Swap),0,N/A,980,560
INJ-02,Injector,2024-05-20 (Acid),-1200 (bwipd),N/A,N/A,N/A

--- ASSET INTEGRITY ---
Well ID,Casing Pressure (PSI),Tubing Pressure (PSI),BHP (PSI),Risk Level
BRAVO-01,150,420,2100,LOW
BRAVO-02,180,450,2150,LOW
INJ-02,1450,2800,4100,HIGH - Spike Detected`;

          default:
            return `PETROSTREAM REPORT - ${type.replace(/_/g, ' ')}
Generated: ${date}

No detailed calculations available for this report type yet.`;
        }
      })();

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `PetroStream_${type}_Report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
      {/* Sidebar - Report Types */}
      <div className="lg:col-span-3 space-y-4">
        {[
          { id: 'daily', label: 'Daily Operations', desc: 'Ops summary & anomalies', icon: Clock },
          { id: 'monthly', label: 'Monthly Management', icon: FileText, desc: 'KPIs & Variance analysis' },
          { id: 'regulatory', label: 'Regulatory Filing', icon: Scroll, desc: 'TRRC / NDIC Formats' },
          { id: 'review', label: 'Well Review Pack', icon: FileCheck, desc: 'Full history compilation' }
        ].map(r => (
           <motion.div 
              key={r.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveReport(r.id as any)}
              className={cn(
                "glass-card rounded-2xl p-6 border-white/5 transition-all cursor-pointer",
                activeReport === r.id ? "bg-cyan-500/10 ring-1 ring-cyan-500/50" : "bg-black/40 hover:bg-white/[0.02]"
              )}
           >
              <div className="flex items-center gap-4">
                 <div className={cn("p-3 rounded-2xl", activeReport === r.id ? "bg-cyan-500 text-black" : "bg-white/5 text-slate-500")}>
                    <r.icon size={18} />
                 </div>
                 <div>
                    <h4 className={cn("text-xs font-black uppercase italic tracking-wider", activeReport === r.id ? "text-cyan-400" : "text-white")}>{r.label}</h4>
                    <p className="text-[11px] text-slate-600 italic mt-0.5">{r.desc}</p>
                 </div>
              </div>
           </motion.div>
        ))}

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-indigo-950/40 to-black border-white/5 mt-8">
           <div className="flex items-center gap-3 mb-6">
              <Zap size={18} className="text-cyan-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Auto-Reporting</h5>
           </div>
           <div className="space-y-4">
              <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                 <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Next Run</span>
                 <span className="text-[10px] text-white font-mono">06:00 AM</span>
              </div>
              <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                 <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Recipients</span>
                 <span className="text-[10px] text-white font-mono">12 PERS.</span>
              </div>
           </div>
        </div>
      </div>

      {/* Report Preview / Config */}
      <div className="lg:col-span-9 h-[650px]">
         {activeReport === 'daily' && <DailyReportBuilder onExport={() => handleExport('Daily_Ops')} isExporting={isExporting} />}
         {activeReport === 'monthly' && <MonthlyReportBuilder onExport={() => handleExport('Monthly_Mgmt')} isExporting={isExporting} />}
         {activeReport === 'regulatory' && <RegulatoryReportBuilder />}
         {activeReport === 'review' && <WellReviewPackBuilder onExport={() => handleExport('Well_Review_Pack')} isExporting={isExporting} />}
      </div>
    </div>
  );
}

 function DailyReportBuilder({ onExport, isExporting }: { onExport: () => void, isExporting: boolean }) {
   return (
     <motion.div 
       initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
       className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full flex flex-col"
     >
        <div className="flex justify-between items-start mb-12">
           <div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Daily Production <span className="text-cyan-400">Report</span></h3>
             <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Automated Compilation for Field-Wide Performance</p>
           </div>
           <div className="flex gap-4">
              <button className="p-4 bg-white/5 rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all">
                 <Printer size={18} />
              </button>
              <button 
                onClick={onExport}
                disabled={isExporting}
                className={cn(
                  "flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                  isExporting ? "bg-cyan-900 text-cyan-400 cursor-wait" : "bg-cyan-500 text-black shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-[1.02]"
                )}
              >
                 {isExporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />} 
                 {isExporting ? "Compiling CSV..." : "Export CSV"}
              </button>
           </div>
        </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <ReportMetric label="Field Total (Oil)" val="12,450" unit="STBD" trend={+2.1} />
          <ReportMetric label="Gas Production" val="8.4" unit="MMSCFD" trend={-0.5} />
          <ReportMetric label="Water Cut Avg" val="42.4" unit="%" trend={+1.2} />
       </div>

       <div className="grow bg-white/[0.02] border border-white/5 rounded-3xl p-10 font-mono text-[11px] text-slate-400 overflow-y-auto">
          <div className="border-b border-white/5 pb-4 mb-4 flex justify-between">
             <span className="text-white font-bold">OPERATIONAL SUMMARY — {new Date().toLocaleDateString()}</span>
             <span className="text-cyan-400">STATUS: VERIFIED</span>
          </div>
          <div className="space-y-2">
             <p>• Reservoir GULF-BRAVO-14X stable at 2,450 PSI BHP average.</p>
             <p>• Well BRAVO-04 shut-in for ESP vibration alarm at 04:12 AM.</p>
             <p>• Water injection VRR holding at 1.02; Segment B under-injected.</p>
             <p className="text-red-400">• ANOMALY: Injector INJ-02 casing pressure spike detected.</p>
             <p>• Network choke optimization executed at 06:00 AM — Est. Gain: +120 bbl.</p>
          </div>
       </div>
    </motion.div>
  );
}

 function MonthlyReportBuilder({ onExport, isExporting }: { onExport: () => void, isExporting: boolean }) {
   return (
     <motion.div 
       initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
       className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
     >
        <div className="flex justify-between items-start mb-12">
           <div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter italic">Management <span className="text-indigo-400 italic">Review</span></h3>
             <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Production vs Forecast & OPEX KPI Tracking</p>
           </div>
           <div className="flex gap-4">
              <button 
                onClick={onExport}
                disabled={isExporting}
                className={cn(
                  "flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                  isExporting ? "bg-indigo-900 text-indigo-400 cursor-wait" : "bg-indigo-500 text-white hover:scale-[1.02]"
                )}
              >
                 {isExporting ? <RefreshCw size={16} className="animate-spin" /> : <FileText size={16} />} 
                 {isExporting ? "Synthesizing..." : "Compile Report"}
              </button>
           </div>
        </div>

       <div className="grid grid-cols-2 gap-8">
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">Variance Analysis (MM$ / bbl)</h4>
             <div className="space-y-6">
                <VarianceBar label="Production Uptime" val={94} target={98} />
                <VarianceBar label="Unit Lifting Cost" val={12.4} target={14.0} inverse />
                <VarianceBar label="Gas Conservation" val={99.2} target={99.0} />
             </div>
          </div>

          <div className="p-8 bg-indigo-500/5 rounded-2xl border border-indigo-500/20 flex flex-col justify-center items-center text-center">
             <Archive size={32} className="text-indigo-400 mb-6" />
             <h4 className="text-xs font-black text-white uppercase italic mb-2 italic">Recommendation Engine</h4>
             <p className="text-[10px] text-slate-600 font-medium leading-relaxed px-4">System identified 4 candidate wells for acid stimulation based on skin trend analysis from previous 30 days.</p>
          </div>
       </div>
    </motion.div>
  );
}

function RegulatoryReportBuilder() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="mb-12">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter italic">Regulatory <span className="text-amber-500 italic">Compliance</span></h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Standardized Filings: TRRC-P1, NDIC-64, COGCC-7</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RegCard agency="TRRC" form="P-1" desc="Texas Production Report" />
          <RegCard agency="NDIC" form="Form 6" desc="Monthly Production" />
          <RegCard agency="BLM" form="3160-5" desc="Sundry Notices" />
       </div>

       <div className="mt-12 p-10 bg-amber-500/5 border border-amber-500/20 rounded-3xl">
          <div className="flex items-center gap-4 mb-6">
             <FileWarning size={20} className="text-amber-500" />
             <h4 className="text-xs font-black text-white uppercase italic">Proration Warning</h4>
          </div>
          <p className="text-[11px] text-slate-500 italic max-w-2xl leading-relaxed">Field proration factor exceeds regulatory limit of 0.85 for Segment C. Automated adjustment recommended for upcoming P-1 submission to avoid penalty.</p>
          <button className="mt-6 px-10 py-4 bg-amber-500 rounded-2xl text-[10px] font-black text-black uppercase tracking-widest">Apply Adjustments</button>
       </div>
    </motion.div>
  );
}

 function WellReviewPackBuilder({ onExport, isExporting }: { onExport: () => void, isExporting: boolean }) {
   return (
     <motion.div 
       initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }}
       className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full flex flex-col justify-center items-center text-center"
     >
        <div className="p-12 rounded-full bg-cyan-500/5 border-2 border-dashed border-cyan-500/20 mb-8">
           {isExporting ? <RefreshCw size={48} className="text-cyan-400 animate-spin" /> : <Archive size={48} className="text-cyan-400" />}
        </div>
        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4 italic">Integrated Well Review Pack</h3>
        <p className="text-[12px] text-slate-500 italic max-w-sm leading-relaxed mb-10">Fully automated compilation of completion schemas, production logs, DCA fits, and intervention history into a single engineering dossier.</p>
        <div className="flex gap-4">
           <button 
            onClick={onExport}
            disabled={isExporting}
            className={cn(
              "px-12 py-5 rounded-2xl text-xs font-black uppercase tracking-widest italic shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-all",
              isExporting ? "bg-cyan-900 text-cyan-400 cursor-wait" : "bg-cyan-500 text-black hover:scale-[1.05]"
            )}
           >
             {isExporting ? "Compiling Engineering Data..." : "Generate Dossier"}
           </button>
        </div>
     </motion.div>
   );
 }

function ReportMetric({ label, val, unit, trend }: { label: string, val: string, unit: string, trend: number }) {
  return (
    <div className="p-8 bg-black/40 rounded-2xl border border-white/5">
       <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest block mb-1 italic">{label}</span>
       <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-black text-white italic font-mono">{val}</span>
          <span className="text-[10px] text-slate-600 uppercase font-bold">{unit}</span>
       </div>
       <div className={cn("text-[10px] font-bold uppercase", trend > 0 ? "text-emerald-400" : "text-red-400")}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% Vs Prev 24H
       </div>
    </div>
  );
}

function VarianceBar({ label, val, target, inverse }: { label: string, val: number, target: number, inverse?: boolean }) {
  const diff = val - target;
  const isGood = inverse ? val <= target : val >= target;
  
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-baseline">
          <span className="text-[10px] font-black text-white uppercase italic tracking-tight">{label}</span>
          <span className={cn("text-[11px] font-black", isGood ? "text-emerald-400" : "text-red-400")}>{val} / {target}</span>
       </div>
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div className={cn("h-full", isGood ? "bg-emerald-500" : "bg-red-500")} style={{ width: `${Math.min(100, (val/target) * 100)}%` }} />
       </div>
    </div>
  );
}

function RegCard({ agency, form, desc }: { agency: string, form: string, desc: string }) {
  return (
    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group">
       <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{agency}</span>
          <Mail size={14} className="text-slate-800 group-hover:text-white transition-colors" />
       </div>
       <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">{form}</h4>
       <p className="text-[11px] text-slate-500 uppercase font-bold mt-1">{desc}</p>
    </div>
  );
}
