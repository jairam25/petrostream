import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  TrendingUp, 
  Droplets, 
  Wind, 
  Activity, 
  Map as MapIcon, 
  LayoutDashboard,
  Filter,
  BarChart3,
  Waves,
  RefreshCw,
  Search,
  Settings2,
  PieChart as PieIcon,
  Zap,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const WELL_LOCATIONS = [
  { x: 10, y: 20, rate: 1200, wc: 15, name: 'W-01' },
  { x: 25, y: 35, rate: 800, wc: 45, name: 'W-02' },
  { x: 45, y: 15, rate: 1500, wc: 5, name: 'W-03' },
  { x: 80, y: 60, rate: 450, wc: 85, name: 'W-04' },
  { x: 60, y: 80, rate: 2100, wc: 12, name: 'W-05' },
  { x: 40, y: 50, rate: 300, wc: 92, name: 'W-06' },
];

export function ProductionDashboard() {
  const [smoothingWindow, setSmoothingWindow] = useState(7);
  const [activeWell, setActiveWell] = useState('All');
  
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportReady, setReportReady] = useState(false);

  // Dynamic Production Data
  const { productionData, currentMetrics } = useMemo(() => {
    // Generate base data based on activeWell
    let baseOil = 0, baseWater = 0;
    if (activeWell === 'All') {
      baseOil = WELL_LOCATIONS.reduce((acc, w) => acc + (w.rate * (1 - w.wc/100)), 0);
      baseWater = WELL_LOCATIONS.reduce((acc, w) => acc + (w.rate * (w.wc/100)), 0);
    } else {
      const w = WELL_LOCATIONS.find(w => w.name === activeWell);
      if (w) {
         baseOil = w.rate * (1 - w.wc/100);
         baseWater = w.rate * (w.wc/100);
      }
    }
    
    // Apply smoothing window (less smoothing = more noise)
    const noiseLevel = Math.max(0.1, 1 - (smoothingWindow / 30));
    
    const data = Array.from({ length: 30 }).map((_, i) => {
      const q_oil = baseOil - i * (baseOil * 0.005) + (Math.random() * baseOil * 0.1 * noiseLevel);
      const q_water = baseWater + i * (baseWater * 0.01) + (Math.random() * baseWater * 0.1 * noiseLevel);
      return {
        date: `2026-05-${i + 1}`,
        q_oil,
        q_water,
        q_gas: q_oil * 0.6,
        q_total: q_oil + q_water,
        water_cut: (q_water / (q_oil + q_water)) * 100,
        cum_oil: baseOil * 30 * i, // mock
        gor: 600 + Math.random() * 100
      };
    });
    
    const last = data[data.length - 1];
    const prev = data[data.length - 8] || data[0]; // 7 days ago
    
    const metrics = {
       totalLiquid: formatNumber(last.q_total, 0),
       pi: (last.q_oil / 150).toFixed(1),
       piDelta: (((last.q_oil - prev.q_oil) / prev.q_oil) * 100).toFixed(1) + '%',
       wc: last.water_cut.toFixed(1) + '%',
       wcDelta: (last.water_cut - prev.water_cut).toFixed(1) + '%',
       depletion: (last.q_oil * 0.0001).toFixed(3),
       efficiency: (0.95 - (last.water_cut/100)*0.2).toFixed(2),
       efficiencyDelta: (((last.water_cut - prev.water_cut) > 0 ? -1 : 1) * Math.abs((last.water_cut - prev.water_cut)/10)).toFixed(1) + '%'
    };
    
    return { productionData: data, currentMetrics: metrics };
  }, [activeWell, smoothingWindow]);

  const fieldComposition = useMemo(() => {
    const last = productionData[productionData.length - 1];
    return [
      { name: 'Oil', value: last.q_oil, color: '#06b6d4' },
      { name: 'Water', value: last.q_water, color: '#3b82f6' },
      { name: 'Gas', value: last.q_gas, color: '#f59e0b' },
    ];
  }, [productionData]);

  const handleGenerateReport = async () => {
     setIsGeneratingReport(true);
     
     // Allow UI to update before blocking main thread
     await new Promise(resolve => setTimeout(resolve, 500));
     
     try {
       const doc = new jsPDF();
       
       // AstroCore Header
       doc.setFillColor(15, 23, 42); // slate-900
       doc.rect(0, 0, 210, 40, 'F');
       
       doc.setTextColor(255, 255, 255);
       doc.setFontSize(24);
       doc.setFont('helvetica', 'bolditalic');
       doc.text('AstroCore / PetroStream', 14, 20);
       
       doc.setFontSize(10);
       doc.setFont('helvetica', 'normal');
       doc.setTextColor(148, 163, 184); // slate-400
       doc.text('PRODUCTION INTELLIGENCE REPORT', 14, 30);
       
       // Timestamp & Well info
       doc.setTextColor(0, 0, 0);
       doc.setFontSize(12);
       doc.setFont('helvetica', 'bold');
       doc.text(`Field Diagnostic Report: ${activeWell === 'All' ? 'Field Aggregate' : activeWell}`, 14, 50);
       
       doc.setFontSize(10);
       doc.setFont('helvetica', 'normal');
       doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 56);
       
       // Key Metrics Section
       doc.setFontSize(14);
       doc.setFont('helvetica', 'bold');
       doc.text('Key Diagnostic Metrics', 14, 70);
       
       autoTable(doc, {
         startY: 75,
         theme: 'grid',
         headStyles: { fillColor: [6, 182, 212], textColor: [255, 255, 255], fontStyle: 'bold' },
         head: [['Parameter', 'Value', 'Delta (7D)']],
         body: [
           ['Total Liquid (BLPD)', currentMetrics.totalLiquid, '-'],
           ['Productivity Index (STB/d/psi)', currentMetrics.pi, currentMetrics.piDelta],
           ['Water Cut', currentMetrics.wc, currentMetrics.wcDelta],
           ['Flow Efficiency', currentMetrics.efficiency, currentMetrics.efficiencyDelta],
           ['Est. Depletion (psi/day)', currentMetrics.depletion, 'Stable']
         ],
       });
       
       const lastAutoTable = (doc as any).lastAutoTable;
       const currentY = lastAutoTable ? lastAutoTable.finalY + 15 : 130;
       
       doc.setFontSize(14);
       doc.setFont('helvetica', 'bold');
       doc.text('Production History (Last 10 Days)', 14, currentY);
       
       const tableData = [...productionData].reverse().slice(0, 10).map(d => [
         d.date,
         Math.round(d.q_oil),
         Math.round(d.q_water),
         Math.round(d.q_gas),
         d.water_cut.toFixed(1) + '%'
       ]);
       
       autoTable(doc, {
         startY: currentY + 5,
         theme: 'striped',
         headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
         head: [['Date', 'Oil (BOPD)', 'Water (BWPD)', 'Gas (MSCFD)', 'Water Cut']],
         body: tableData,
       });
       
       // Diagnostic Remarks
       const finalY = (doc as any).lastAutoTable.finalY + 15;
       doc.setFontSize(14);
       doc.setFont('helvetica', 'bold');
       doc.text('Diagnostic Insights', 14, finalY);
       
       doc.setFontSize(10);
       doc.setFont('helvetica', 'normal');
       const insights = [
          `• The system flow efficiency is currently ${currentMetrics.efficiency}.`,
          `• Water cut trend over the last 7 days is ${currentMetrics.wcDelta}.`,
          parseFloat(currentMetrics.piDelta) < 0 ? '• Warning: Productivity Index is declining.' : '• Productivity Index is stable or increasing.',
       ];
       doc.text(insights, 14, finalY + 8);
       
       doc.save(`AstroCore_Diagnostic_${activeWell}.pdf`);
       
       setReportReady(true);
     } catch (err) {
       console.error("Failed to generate PDF", err);
     } finally {
       setIsGeneratingReport(false);
     }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
      {/* Sidebar Controls */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Surveillance Controls</h4>
           </div>
           
           <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Well</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <select 
                    value={activeWell}
                    onChange={(e) => setActiveWell(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-[11px] text-white focus:ring-1 focus:ring-cyan-500 outline-none appearance-none"
                  >
                    <option value="All">Field Total (Aggregate)</option>
                    <option value="W-01">Well W-01</option>
                    <option value="W-02">Well W-02</option>
                    <option value="W-03">Well W-03</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Smoothing (Days)</label>
                <input 
                  type="range" min="1" max="30" value={smoothingWindow}
                  onChange={(e) => setSmoothingWindow(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-600">
                  <span>RAW</span>
                  <span className="text-cyan-400">{smoothingWindow} DAYS</span>
                  <span>HEAVY</span>
                </div>
              </div>
           </div>
        </div>

        {/* Field Composition Pie */}
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-6">
              <PieIcon size={16} className="text-amber-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Phase Distribution</h4>
           </div>
           <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={fieldComposition}
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                    >
                       {fieldComposition.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="flex flex-col gap-2 mt-4">
              {fieldComposition.map(c => (
                 <div key={c.name} className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                       <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{c.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-white">{formatNumber(c.value, 0)}</span>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="lg:col-span-9 space-y-8">
        <div className="flex items-center justify-between">
           <div>
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Production <span className="text-cyan-500">Intelligence</span></h3>
              <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Real-time Field Performance Tracker & Diagnostic Panel</p>
           </div>
           <div className="flex gap-4">
              <StatusBadge icon={<Activity size={12} />} label="Field Status" value="ACTIVE" color="text-emerald-500" />
              <StatusBadge icon={<TrendingUp size={12} />} label="Total Liquid" value={currentMetrics.totalLiquid} unit="BLPD" color="text-cyan-400" />
           </div>
        </div>

        {/* Rate-Time Plot */}
        <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden">
           <div className="flex items-center justify-between mb-8 relative z-10">
              <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Flow Rate History</h4>
              <div className="flex gap-6">
                 <LegendToggle label="Oil" color="#06b6d4" active />
                 <LegendToggle label="Water" color="#3b82f6" active />
                 <LegendToggle label="Gas" color="#f59e0b" active />
              </div>
           </div>

           <div className="h-[400px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={productionData}>
                    <defs>
                       <linearGradient id="colorOil" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="q_oil" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorOil)" />
                    <Area type="monotone" dataKey="q_water" stroke="#3b82f6" strokeWidth={2} fillOpacity={0} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Math Diagnostics */}
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent flex flex-col justify-between">
              <div>
                 <div className="flex items-center gap-3 mb-8">
                    <Zap className="text-indigo-400" size={20} />
                    <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Neural Mathematics</h4>
                 </div>
                 
                 <div className="space-y-6">
                    <MathRow label="Average Productivity Index (J)" value={currentMetrics.pi} unit="STB/d/psi" delta={currentMetrics.piDelta} negative={currentMetrics.piDelta.startsWith('-')} />
                    <MathRow label="Current Water Cut Trend" value={currentMetrics.wc} unit="Linear" delta={currentMetrics.wcDelta} negative={!currentMetrics.wcDelta.startsWith('-')} />
                    <MathRow label="Estimated Depletion Rate" value={currentMetrics.depletion} unit="psi/day" delta="Stable" />
                    <MathRow label="System Flow Efficiency" value={currentMetrics.efficiency} unit="Ratio" delta={currentMetrics.efficiencyDelta} negative={currentMetrics.efficiencyDelta.startsWith('-')} />
                 </div>
              </div>

              {!reportReady ? (
                 <button 
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                    className="w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50"
                 >
                    {isGeneratingReport ? "Compiling Diagnostics..." : "Full Engineering Report"} {!isGeneratingReport && <ChevronRight size={14} />}
                 </button>
              ) : (
                 <div className="w-full mt-10 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-400" />
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Diagnostic PDF Ready</span>
                       </div>
                       <button onClick={() => setReportReady(false)} className="text-[10px] font-black text-slate-500 uppercase hover:text-white transition-colors">Reset</button>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                       Comprehensive diagnostic parameters compiled for {activeWell === 'All' ? 'Field Total' : activeWell}. Data exported to module artifacts directory.
                    </p>
                 </div>
              )}
           </div>

           {/* Dynamic Flow Simulator */}
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a]">
              <div className="flex items-center gap-3 mb-8">
                 <Activity className="text-cyan-500" size={20} />
                 <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Flow Dynamics Simulator</h4>
              </div>
              <ProductionFlowSimulator3D data={productionData[productionData.length-1]} isAggregate={activeWell === 'All'} />
           </div>
        </div>
      </div>
    </div>
  );
}

function MathRow({ label, value, unit, delta, negative }: { label: string, value: string, unit: string, delta: string, negative?: boolean }) {
   return (
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
         <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{label}</span>
            <div className="flex items-baseline gap-2">
               <span className="text-xl font-black text-white italic">{value}</span>
               <span className="text-[10px] text-slate-600 font-bold uppercase">{unit}</span>
            </div>
         </div>
         <div className="text-right">
            <span className={cn(
               "text-[10px] font-black italic",
               negative ? "text-red-400" : "text-emerald-400"
            )}>{delta}</span>
            <p className="text-[10px] text-slate-700 font-bold uppercase mt-1">Vs Prev Week</p>
         </div>
      </div>
   );
}

function StatusBadge({ icon, label, value, unit, color }: { icon: React.ReactNode, label: string, value: string, unit?: string, color: string }) {
  return (
    <div className="flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl">
       <div className={cn("p-2 rounded-xl bg-white/5", color)}>{icon}</div>
       <div>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">{label}</span>
          <div className="flex items-baseline gap-1">
             <span className={cn("text-lg font-black tracking-tighter italic", color)}>{value}</span>
             {unit && <span className="text-[11px] font-black text-slate-700">{unit}</span>}
          </div>
       </div>
    </div>
  );
}

function LegendToggle({ label, color, active }: { label: string, color: string, active: boolean }) {
  return (
    <div className="flex items-center gap-2 cursor-pointer">
       <div className={cn("h-1.5 w-1.5 rounded-full", active ? "" : "bg-slate-800")} style={{ backgroundColor: active ? color : undefined }} />
       <span className={cn("text-[11px] font-black uppercase tracking-widest", active ? "text-slate-400" : "text-slate-700")}>{label}</span>
    </div>
  );
}

function ProductionFlowSimulator3D({ data, isAggregate }: { data: any, isAggregate: boolean }) {
   if (!data) return null;
   const { q_oil, q_water, water_cut } = data;
   
   // Fluid properties
   const oilSpeed = Math.max(0.2, 5000 / (q_oil || 1));
   const waterSpeed = Math.max(0.2, 5000 / (q_water || 1));
   const dropletCount = Math.floor(water_cut / 5);

   return (
      <div className="w-full h-[250px] relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0a0f18] to-[#05070a] border border-white/5 flex items-center justify-center">
         <svg viewBox="0 0 500 250" className="w-full h-full max-w-[500px]">
            {isAggregate ? (
               // Multiple wells feeding into a manifold
               <g transform="translate(100, 50)">
                  {[0, 1, 2].map(i => (
                     <g key={i} transform={`translate(0, ${i * 50})`}>
                        <rect x="0" y="10" width="150" height="10" fill="#ffffff10" />
                        <motion.path d="M 0 15 L 150 15" stroke={i === 1 && water_cut > 50 ? "#3b82f6" : "#06b6d4"} strokeWidth="6" strokeDasharray="10 5" animate={{ strokeDashoffset: [-20, 0] }} transition={{ repeat: Infinity, duration: oilSpeed, ease: "linear" }} />
                     </g>
                  ))}
                  <rect x="150" y="0" width="40" height="150" fill="#ffffff20" rx="4" />
                  <motion.path d="M 190 75 L 350 75" stroke="#06b6d4" strokeWidth="20" strokeDasharray="20 10" animate={{ strokeDashoffset: [-30, 0] }} transition={{ repeat: Infinity, duration: oilSpeed*0.5, ease: "linear" }} />
                  
                  {/* Water Droplets in Manifold */}
                  {[...Array(dropletCount)].map((_, i) => (
                     <motion.circle key={i} r={Math.random()*4+2} fill="#3b82f6" opacity="0.8"
                        initial={{ cx: 190, cy: 75 + (Math.random()-0.5)*15 }}
                        animate={{ cx: 350 }}
                        transition={{ repeat: Infinity, duration: waterSpeed*0.5, delay: Math.random() }}
                     />
                  ))}
               </g>
            ) : (
               // Single well cross-section
               <g transform="translate(200, 20)">
                  {/* Wellbore */}
                  <rect x="30" y="0" width="40" height="200" fill="#ffffff05" stroke="#ffffff20" strokeWidth="2" />
                  {/* Oil Flow */}
                  <motion.path d="M 50 200 L 50 0" stroke="#06b6d4" strokeWidth="30" strokeDasharray="30 15" animate={{ strokeDashoffset: [0, -45] }} transition={{ repeat: Infinity, duration: oilSpeed, ease: "linear" }} />
                  {/* Water Droplets */}
                  {[...Array(dropletCount * 2)].map((_, i) => (
                     <motion.circle key={i} r={Math.random()*5+3} fill="#3b82f6" opacity="0.9"
                        initial={{ cx: 50 + (Math.random()-0.5)*20, cy: 200 }}
                        animate={{ cy: 0 }}
                        transition={{ repeat: Infinity, duration: waterSpeed, delay: Math.random() * 2 }}
                     />
                  ))}
               </g>
            )}
         </svg>
      </div>
   );
}
