import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  Layers, 
  ArrowRightLeft, 
  ClipboardList, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  DollarSign,
  Box,
  FileText,
  Clock,
  Briefcase,
  Share2,
  Workflow,
  ShieldCheck,
  Network,
  LayoutDashboard,
  PieChart,
  ListFilter,
  Zap,
  Filter,
  ArrowUpRight,
  History,
  Settings,
  Key,
  Users,
  BookOpen,
  Database,
  Truck,
  X,
  Download,
  Loader2,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const productionVsForecast = [
  { name: 'Jan', actual: 4200, forecast: 4000 },
  { name: 'Feb', actual: 3800, forecast: 4100 },
  { name: 'Mar', actual: 4500, forecast: 4200 },
  { name: 'Apr', actual: 4100, forecast: 4300 },
  { name: 'May', actual: 4000, forecast: 4400 },
  { name: 'Jun', actual: 3900, forecast: 4500 },
];

const capexData = [
  { category: 'Drilling', actual: 12.4, budget: 15.0, trend: 'up' },
  { category: 'Completion', actual: 18.2, budget: 16.5, trend: 'down' },
  { category: 'Facilities', actual: 5.8, budget: 6.0, trend: 'stable' },
  { category: 'Workovers', actual: 2.1, budget: 2.5, trend: 'up' },
];

const workflowStages = [
  { id: 'concept', label: 'Concept Selection', status: 'completed', icon: Box, deliverables: ['Screening Study', 'Economic Evaluation'] },
  { id: 'feed', label: 'FEED', status: 'completed', icon: Layers, deliverables: ['Facilities Design', 'Drilling Plan'] },
  { id: 'sanction', label: 'Sanction', status: 'active', icon: ShieldCheck, deliverables: ['Final Budget Approval', 'Contractor Award'] },
  { id: 'execution', label: 'Execution', status: 'pending', icon: Workflow, deliverables: ['Rig Mobilization', 'Construction'] },
  { id: 'production', label: 'First Oil', status: 'pending', icon: Zap, deliverables: ['Facility Commissioning'] },
];

const simulationScenarios = [
  { name: 'Base Case', eur: '42.5 MMbbl', npv: '$1.2B', description: 'Current development plan with existing rigs.' },
  { name: 'High Case', eur: '58.2 MMbbl', npv: '$1.8B', description: 'Increased drilling density and high-pressure waterflood.' },
  { name: 'Infill Scenario', eur: '48.9 MMbbl', npv: '$1.4B', description: 'Adding 12 infill wells in Block B.' }
];

const lessonsLearned = [
  { id: 1, category: 'Drilling', title: 'Losses in Karst Zone', lesson: 'Pre-drill seismic inversion helps flag high-risk cavernous zones.', impact: 'High' },
  { id: 2, category: 'Completion', title: 'Sand Concentration', lesson: 'Increasing proppant density above 2.5 lb/gal led to screen-outs in Zone C.', impact: 'Medium' }
];

export function AssetManagementStage() {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'workflow' | 'modeling' | 'knowledge' | 'planning' | 'compliance' | 'abandonment'>('dashboard');
  const [assetInp, setAssetInp] = useState({ grossOil: 45.2, activeRigs: 4, fleetUptime: 98, oilPrice: 75 });
  
  const productionData = useMemo(() => [
    { name: 'Jan', actual: assetInp.grossOil * 0.95, forecast: assetInp.grossOil },
    { name: 'Feb', actual: assetInp.grossOil * 0.92, forecast: assetInp.grossOil },
    { name: 'Mar', actual: assetInp.grossOil * 1.05, forecast: assetInp.grossOil },
    { name: 'Apr', actual: assetInp.grossOil * 0.98, forecast: assetInp.grossOil },
    { name: 'May', actual: assetInp.grossOil * 0.94, forecast: assetInp.grossOil },
    { name: 'Jun', actual: assetInp.grossOil * 0.91, forecast: assetInp.grossOil },
  ], [assetInp.grossOil]);

  const variance = useMemo(() => {
    const avgActual = productionData.reduce((a, b) => a + b.actual, 0) / 6;
    const avgForecast = productionData.reduce((a, b) => a + b.forecast, 0) / 6;
    return ((avgActual - avgForecast) / avgForecast) * 100;
  }, [productionData]);

  const [capexInp, setCapexInp] = useState([
    { category: 'Drilling', actual: 12.4, budget: 15.0 },
    { category: 'Completion', actual: 18.2, budget: 16.5 },
    { category: 'Facilities', actual: 5.8, budget: 6.0 },
    { category: 'Workovers', actual: 2.1, budget: 2.5 },
  ]);

  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [activeStageId, setActiveStageId] = useState('sanction');
  const [selectedScenario, setSelectedScenario] = useState('Base Case');
  const [modelingControls, setModelingControls] = useState({ layers: true, history: false });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationSuccess, setOptimizationSuccess] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [isSimulatingLiability, setIsSimulatingLiability] = useState(false);
  const [liabilityForecast, setLiabilityForecast] = useState<null | number>(null);

  // Technically Validated Scenario Engine
  const scenarios = useMemo(() => [
    { 
      name: 'Base Case', 
      eur: 42.5, 
      npv: 1240, 
      description: 'Standard development plan with existing rig allocation and 660ft spacing.',
      cells: 3.2,
      complexity: 0.4
    },
    { 
      name: 'High Case', 
      eur: 58.2, 
      npv: 1850, 
      description: 'Aggressive development with increased rig density and high-pressure waterflood.',
      cells: 5.8,
      complexity: 0.8
    },
    { 
      name: 'Infill Scenario', 
      eur: 48.9, 
      npv: 1420, 
      description: 'Adding 12 infill wells in Block B to capture bypassed reserves.',
      cells: 4.4,
      complexity: 0.6
    }
  ], []);

  const activeScenario = useMemo(() => 
    scenarios.find(s => s.name === selectedScenario) || scenarios[0],
  [selectedScenario, scenarios]);

  const [complianceInp, setComplianceInp] = useState({ trir: 0.24, auditScore: 98.5 });
  const [complianceLogs, setComplianceLogs] = useState([
    { id: 301, title: 'EPA-2024 Air Quality Renewal', status: 'Completed', date: '14-Oct-23' },
    { id: 302, title: 'State Water Disposal Permit B', status: 'Completed', date: '14-Oct-23' },
    { id: 303, title: 'Endangered Species Habitat Survey', status: 'Completed', date: '14-Oct-23' }
  ]);

  const [paItems, setPaItems] = useState([
    { id: 1, well: 'Permian-B42', type: 'Plug & Abandon', budget: 1.2, progress: 85, health: 'Optimal' },
    { id: 2, well: 'Block-D_Collector', type: 'Site Remediation', budget: 0.8, progress: 42, health: 'Warning' },
    { id: 3, well: 'South-Flank_Rig', type: 'Equipment Removal', budget: 4.5, progress: 15, health: 'Optimal' }
  ]);

  const [rigs, setRigs] = useState([
    { id: 101, rig: 'Rig-101', wells: ['Block-A1', 'Block-A2', 'Block-A3'], progress: 65, status: 'Drilling' },
    { id: 204, rig: 'Rig-204', wells: ['Block-B4', 'Block-B5'], progress: 32, status: 'Moving' },
    { id: 307, rig: 'Rig-307', wells: ['Block-C1', 'Block-C2'], progress: 88, status: 'Completion' },
    { id: 402, rig: 'Rig-402', wells: ['Block-D6'], progress: 12, status: 'Mobilizing' }
  ]);

  const logisticsData = useMemo(() => {
    const activeCount = assetInp.activeRigs;
    return [
      { label: 'Proppant Logistics', value: `${(10.5 * activeCount).toFixed(0)}k tons/mo`, health: 92 },
      { label: 'Water Management', value: `${(28.7 * activeCount).toFixed(0)}k bbl/d`, health: 85 },
      { label: 'Trucking Throughput', value: `${(310 * activeCount).toLocaleString()} cycles`, health: 78 },
      { label: 'Fleet Fuel Index', value: '94% Efficiency', health: 95 }
    ];
  }, [assetInp.activeRigs]);

  const liabilityMatrix = useMemo(() => {
    const totalARO = paItems.reduce((sum, item) => sum + item.budget, 0);
    const bond = totalARO * 0.36; // 36% bond requirement
    const avgRemediation = paItems.reduce((sum, item) => sum + item.progress, 0) / (paItems.length * 20); // Scale to 5.0
    return [
      { label: 'Gross ARO Liability', value: `$${totalARO.toFixed(1)}M`, trend: 'stable' },
      { label: 'Environmental Bond', value: `$${bond.toFixed(1)}M`, trend: 'up' },
      { label: 'Remediation Index', value: `${avgRemediation.toFixed(1)}/5.0`, trend: 'up' }
    ];
  }, [paItems]);

  // Sync Compliance Metrics with Engine
  useEffect(() => {
    const calculatedScore = Math.round((complianceLogs.filter(l => l.status === 'Completed').length / complianceLogs.length) * 100);
    const calculatedTrir = 0.24 + (complianceLogs.filter(l => l.status !== 'Completed').length * 0.15);
    setComplianceInp({ trir: Number(calculatedTrir.toFixed(2)), auditScore: calculatedScore });
  }, [complianceLogs]);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setOptimizationSuccess(true);
      setTimeout(() => setOptimizationSuccess(false), 3000);
    }, 2000);
  };

  const handleDownload = (deliverable: string) => {
    const blob = new Blob([`DELIVERABLE: ${deliverable}\n\nTechnical validation in progress...`], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deliverable.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#020408] p-8">
      {/* Premium Header Navigation */}
      <div className="flex justify-between items-center mb-10">
         <div>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
               <Activity className="text-brand-primary animate-pulse" size={32} />
               Asset Management <span className="text-brand-primary">Terminal</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Precision Control & Lifecycle Optimization</p>
         </div>
         <div className="flex bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-2xl">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'workflow', label: 'Workflow', icon: Workflow },
              { id: 'modeling', label: 'Modeling', icon: Activity },
              { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
              { id: 'planning', label: 'Planning', icon: Clock },
              { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
              { id: 'abandonment', label: 'Abandonment', icon: History }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                  activeSubTab === tab.id 
                    ? "bg-brand-primary text-white shadow-[0_0_20px_rgba(47,129,247,0.4)]" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
         </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {activeSubTab === 'dashboard' ? (
            <div className="grid grid-cols-12 gap-8">
              {/* Left Column: Summary Metrics */}
              <div className="col-span-3 space-y-6">
                <div className="glass-card p-8 rounded-3xl border-white/5 bg-panel-bg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-brand-primary/20 transition-all duration-700" />
                  <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-6 italic">Field Operational Pulse</h3>
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <label className="text-[11px] text-slate-500 block mb-2 uppercase font-black tracking-widest">Gross Oil Target (kbpd)</label>
                      <input type="number" step="0.1" value={assetInp.grossOil} onChange={e => setAssetInp({...assetInp, grossOil: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-2xl font-black text-white italic outline-none focus:border-brand-primary transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-white/5 rounded-3xl border border-white/5 text-center">
                        <p className="text-[11px] text-slate-500 uppercase font-black mb-1">Active Rigs</p>
                        <input type="number" value={assetInp.activeRigs} onChange={e => setAssetInp({...assetInp, activeRigs: Number(e.target.value)})} className="w-full bg-transparent text-center text-2xl font-black text-white italic outline-none" />
                      </div>
                      <div className="p-5 bg-white/5 rounded-3xl border border-white/5 text-center">
                        <p className="text-[11px] text-slate-500 uppercase font-black mb-1">Fleet Uptime</p>
                        <p className="text-2xl font-black text-emerald-400 italic">{assetInp.fleetUptime}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8 rounded-3xl border-white/5 bg-panel-bg">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic flex items-center gap-2">
                      <DollarSign size={14} className="text-brand-primary" />
                      CAPEX Performance
                   </h3>
                   <div className="space-y-6">
                      {capexInp.map((d, i) => (
                        <div key={d.category} className="space-y-2">
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="text-slate-400">{d.category}</span>
                              <input 
                                type="number" 
                                value={d.actual} 
                                onChange={e => {
                                  const newCapex = [...capexInp];
                                  newCapex[i].actual = Number(e.target.value);
                                  setCapexInp(newCapex);
                                }} 
                                className={cn("w-16 bg-transparent text-right outline-none", d.actual > d.budget ? "text-status-error" : "text-emerald-400")} 
                              />
                           </div>
                           <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${Math.min(100, (d.actual / d.budget) * 100)}%` }}
                                className={cn("h-full rounded-full", d.actual > d.budget ? "bg-status-error" : "bg-brand-primary")} 
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Center Column: Neural Field Simulation */}
              <div className="col-span-6">
                 <div className="glass-card p-10 rounded-3xl border-white/5 bg-panel-bg h-[600px] flex flex-col items-center justify-center relative overflow-hidden group shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                    <div className="w-full h-full relative">
                       <FieldProduction3D data={productionData} />
                    </div>
                    <div className="absolute top-10 right-10 z-10 flex flex-col items-end gap-2">
                       <div className={cn(
                          "px-5 py-2 backdrop-blur-md border rounded-2xl flex items-center gap-2 shadow-2xl transition-all duration-500",
                          variance < 0 ? "bg-status-error/10 border-status-error/20 text-status-error" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                       )}>
                          {variance < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                          <span className="text-[11px] font-black uppercase tracking-widest italic">{variance.toFixed(1)}% {variance < 0 ? 'Below' : 'Above'} Base Case</span>
                       </div>
                       <p className="text-[11px] text-slate-500 uppercase font-bold tracking-widest italic">Neural Digital Twin Analysis</p>
                    </div>
                    <div className="absolute top-10 left-10 p-6 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl max-w-sm z-20">
                       <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3 italic">Integrated Optimization Insight</h4>
                       <p className="text-[12px] text-slate-300 leading-relaxed italic font-medium">
                          {variance < 0 
                            ? `"Underperformance detected in Block-4. Integrated simulation suggests increasing injection pressure by 15% to restore reservoir energy."`
                            : `"Asset performing above baseline. Monitoring pressure-depletion rates for early water-breakthrough risk in the south-west flank."`}
                       </p>
                    </div>
                 </div>
              </div>

              {/* Right Column: KPIs & Decision Queue */}
              <div className="col-span-3 space-y-6">
                 <div className="glass-card p-8 rounded-3xl border-white/5 bg-panel-bg">
                    <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-6 italic">Strategic KPIs</h3>
                    <div className="space-y-5">
                       {[
                         { label: "Reserve Replacement", value: "112%", trend: "+2%" },
                         { label: "Unit Lifting Cost", value: `$${(8.45 * (1 + variance/200)).toFixed(2)}`, trend: "-$0.12" },
                         { label: "Carbon Intensity", value: "0.14", trend: "stable" },
                         { label: "Project IRR", value: `${(32.4 * (1 + variance/100)).toFixed(1)}%`, trend: "+1.4%" }
                       ].map((kpi, i) => (
                         <div key={i} className="flex justify-between items-center group cursor-help p-3 rounded-2xl hover:bg-white/5 transition-all">
                           <div className="space-y-1">
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{kpi.label}</p>
                              <p className="text-xl font-black text-white italic data-mono">{kpi.value}</p>
                           </div>
                           <div className={cn(
                               "px-2 py-1 rounded text-[10px] font-black uppercase",
                               kpi.trend.includes('+') ? "bg-emerald-500/10 text-emerald-500" : 
                               kpi.trend.includes('-') ? "bg-rose-500/10 text-rose-500" : "bg-slate-500/10 text-slate-500"
                           )}>
                              {kpi.trend}
                           </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="glass-card p-8 rounded-3xl border-white/5 bg-panel-bg relative overflow-hidden group">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic flex items-center gap-2">
                       <Zap size={14} className="text-brand-primary" />
                       Decision Support Queue
                    </h3>
                    <div className="space-y-4">
                       <div 
                        onClick={() => setSelectedCase({ id: 101, decision: `Rig-${assetInp.activeRigs} Re-allocation`, area: 'Operations' })}
                        className="p-5 bg-brand-primary/10 rounded-3xl border border-brand-primary/20 hover:bg-brand-primary/20 transition-all cursor-pointer group/item shadow-lg"
                       >
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-[11px] font-black text-white uppercase italic">Rig-{assetInp.activeRigs} Schedule</span>
                             <ArrowUpRight size={12} className="text-brand-primary group-hover/item:translate-x-1 group-hover/item:-translate-y-1 transition-transform" />
                          </div>
                          <p className="text-[10px] text-slate-400 italic">Optimized re-allocation to Permian Block-B infill targets.</p>
                       </div>
                       <div 
                        onClick={() => setSelectedCase({ id: 102, decision: 'Abandonment Phase 1', area: 'Compliance' })}
                        className="p-5 bg-white/5 rounded-3xl border border-white/10 hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all cursor-pointer group/item shadow-lg"
                       >
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-[11px] font-black text-slate-300 uppercase italic group-hover/item:text-white transition-colors">Abandonment Phase 1</span>
                             <Clock size={12} className="text-slate-500 group-hover/item:text-brand-primary" />
                          </div>
                          <p className="text-[10px] text-slate-500 group-hover/item:text-slate-400 transition-colors italic">Regulatory deadline: 14 days. Click to review dossier.</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          ) : activeSubTab === 'workflow' ? (
            <div className="grid grid-cols-12 gap-10">
              <div className="col-span-12">
                 <div className="glass-card p-16 rounded-3xl bg-[#05070a] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />
                    
                    <div className="flex justify-between items-center mb-16">
                       <div>
                          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Development <span className="text-brand-primary">Pipeline</span></h2>
                          <p className="text-[10px] text-slate-600 font-black uppercase tracking-wide mt-4">Stage-Gate Integration Engine v4.0</p>
                       </div>
                       <div className="px-6 py-3 bg-brand-primary/5 border border-brand-primary/20 rounded-[20px] flex items-center gap-3">
                          <Sparkles className="text-brand-primary animate-pulse" size={16} />
                          <span className="text-[11px] text-brand-primary font-black uppercase tracking-widest italic">Current Stage: {workflowStages.find(s => s.id === activeStageId)?.label}</span>
                       </div>
                    </div>

                    <div className="relative flex justify-between items-center px-16 py-10">
                       <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2 overflow-hidden">
                          <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="w-1/3 h-full bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent"
                          />
                       </div>
                       
                       {workflowStages.map((stage, i) => (
                         <motion.div 
                           key={stage.id} 
                           onClick={() => setActiveStageId(stage.id)}
                           className="relative z-10 flex flex-col items-center gap-6 cursor-pointer group"
                           initial={{ opacity: 0, scale: 0.8 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: i * 0.1 }}
                         >
                            <div className={cn(
                              "w-24 h-24 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 relative overflow-hidden",
                              stage.status === 'completed' ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]" :
                              activeStageId === stage.id ? "bg-brand-primary text-white border-brand-primary shadow-[0_0_50px_rgba(47,129,247,0.4)] scale-110" :
                              "bg-black border-white/5 hover:border-white/20"
                            )}>
                               {activeStageId === stage.id && (
                                 <motion.div 
                                   layoutId="activeGlow"
                                   className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full"
                                 />
                               )}
                               {stage.status === 'completed' ? (
                                 <CheckCircle2 size={32} className="text-emerald-500" />
                               ) : (
                                 <stage.icon size={32} className={activeStageId === stage.id ? "text-white" : "text-slate-600 group-hover:text-slate-400 transition-colors"} />
                               )}
                            </div>
                            <div className="text-center space-y-1">
                               <p className={cn(
                                 "text-[10px] font-black uppercase tracking-widest transition-colors",
                                 activeStageId === stage.id ? "text-white" : "text-slate-600 group-hover:text-slate-400"
                               )}>{stage.label}</p>
                               <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest italic">{stage.status}</p>
                            </div>
                         </motion.div>
                       ))}
                    </div>

                    <div className="mt-20 grid grid-cols-12 gap-10">
                       <div className="col-span-7 p-10 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-8 opacity-5">
                             <FileText size={120} />
                          </div>
                          <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-10 italic flex items-center gap-2">
                             <Layers size={14} />
                             Gate Deliverables
                          </h4>
                          <div className="grid grid-cols-2 gap-6">
                             {workflowStages.find(s => s.id === activeStageId)?.deliverables.map((d, idx) => (
                               <motion.div 
                                 key={idx}
                                 onClick={() => handleDownload(d)}
                                 whileHover={{ scale: 1.02, x: 5 }}
                                 className="p-6 bg-black/60 rounded-2xl border border-white/5 hover:border-brand-primary/40 transition-all flex items-center gap-4 group/item cursor-pointer shadow-xl"
                               >
                                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center text-brand-primary group-hover/item:bg-brand-primary group-hover/item:text-white transition-all">
                                     <Download size={18} />
                                  </div>
                                  <div>
                                     <p className="text-[11px] font-black text-white uppercase tracking-widest italic">{d}</p>
                                     <p className="text-[11px] text-slate-500 uppercase mt-1">Ready for review</p>
                                  </div>
                               </motion.div>
                             ))}
                          </div>
                       </div>

                       <div className="col-span-5 p-10 bg-rose-500/5 rounded-3xl border border-rose-500/10 relative overflow-hidden flex flex-col">
                          <div className="absolute top-0 right-0 p-8">
                             <AlertCircle className="text-rose-500/20" size={64} />
                          </div>
                          <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-8 italic">Constraint Resolver</h4>
                          <div className="flex-1 space-y-6">
                             <p className="text-sm text-slate-300 italic leading-relaxed font-medium">
                                "Facilities handover for Block B is currently lagging behind rig mobilization by 14 days. Potential NPV impact: <span className="text-rose-500 font-black">-$2.4M</span>."
                             </p>
                             <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                   <span>Optimization confidence</span>
                                   <span>92%</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                   <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-rose-500" />
                                </div>
                             </div>
                          </div>
                          
                          <button 
                            onClick={handleOptimize}
                            disabled={isOptimizing}
                            className={cn(
                              "w-full py-6 rounded-[28px] text-xs font-black uppercase tracking-widest italic transition-all relative overflow-hidden mt-8 flex items-center justify-center gap-3",
                              optimizationSuccess 
                                ? "bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]" 
                                : "bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
                            )}
                          >
                             {isOptimizing ? (
                               <>
                                 <Loader2 size={18} className="animate-spin" />
                                 Running AI Simulation...
                               </>
                             ) : optimizationSuccess ? (
                               <>
                                 <CheckCircle2 size={18} />
                                 Schedule Optimized
                               </>
                             ) : (
                               <>
                                 <Sparkles size={18} />
                                 Optimize Schedule
                               </>
                             )}
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          ) : activeSubTab === 'modeling' ? (
            <div className="grid grid-cols-12 gap-8">
               <div className="col-span-8">
                  <div className="glass-card p-12 rounded-3xl bg-panel-bg border-white/5 h-[650px] flex items-center justify-center relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)]">
                     <GeocellularGrid3D complexity={activeScenario.complexity} showHistory={modelingControls.history} />
                     <div className="absolute top-12 left-12 z-10">
                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4 block italic">Physics-Based Rendering</span>
                        <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">{selectedScenario} <span className="text-brand-primary">Discretization</span></h3>
                        <div className="flex gap-4 mt-6">
                           <div className="px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[10px] font-black text-brand-primary uppercase tracking-widest italic">{activeScenario.cells}M Active Cells</div>
                           <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Mesh-Grid: 50m x 50m</div>
                        </div>
                     </div>
                     <div className="absolute bottom-12 right-12 flex gap-4 z-20">
                        <button 
                          onClick={() => setModelingControls({...modelingControls, layers: !modelingControls.layers})}
                          className={cn(
                            "w-14 h-14 rounded-2xl backdrop-blur-xl flex items-center justify-center transition-all border",
                            modelingControls.layers ? "bg-brand-primary text-white border-brand-primary shadow-[0_0_20px_rgba(47,129,247,0.3)]" : "bg-black/60 text-slate-500 border-white/10 hover:text-white"
                          )}
                        >
                           <Layers size={20} />
                        </button>
                        <button 
                          onClick={() => setModelingControls({...modelingControls, history: !modelingControls.history})}
                          className={cn(
                            "w-14 h-14 rounded-2xl backdrop-blur-xl flex items-center justify-center transition-all border",
                            modelingControls.history ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-black/60 text-slate-500 border-white/10 hover:text-white"
                          )}
                        >
                           <History size={20} />
                        </button>
                     </div>
                  </div>
               </div>
               <div className="col-span-4 space-y-8">
                  <div className="glass-card p-10 rounded-3xl border-white/5 bg-panel-bg h-full flex flex-col">
                     <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 italic">Static vs Dynamic Scenarios</h3>
                     <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {scenarios.map(s => (
                          <motion.div 
                            key={s.name} 
                            onClick={() => setSelectedScenario(s.name)}
                            whileHover={{ scale: 1.02 }}
                            className={cn(
                              "p-8 rounded-3xl border transition-all duration-500 cursor-pointer group relative overflow-hidden",
                              selectedScenario === s.name 
                                ? "bg-brand-primary/10 border-brand-primary/30 shadow-[0_0_40px_rgba(47,129,247,0.15)]" 
                                : "bg-white/5 border-white/5 hover:border-white/10"
                            )}
                          >
                             {selectedScenario === s.name && (
                               <div className="absolute top-0 right-0 p-4">
                                  <div className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
                                </div>
                             )}
                             <div className="flex justify-between items-start mb-4">
                                <div>
                                   <span className="text-xs font-black text-white uppercase italic tracking-widest">{s.name}</span>
                                   <div className="flex items-center gap-2 mt-1">
                                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                      <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest italic">{s.eur} MMbbl EUR</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-xl font-black text-white italic italic">${(s.npv / 1000).toFixed(2)}B</p>
                                   <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Est. NPV</p>
                                </div>
                             </div>
                             <p className="text-[11px] text-slate-400 leading-relaxed italic">{s.description}</p>
                          </motion.div>
                        ))}
                     </div>
                     <button 
                       onClick={() => {
                         setIsSimulating(true);
                         setTimeout(() => {
                           setIsSimulating(false);
                           setSimulationComplete(true);
                           setTimeout(() => setSimulationComplete(false), 3000);
                         }, 2500);
                       }}
                       disabled={isSimulating}
                       className={cn(
                         "w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-widest italic mt-8 transition-all shadow-[0_0_30px_rgba(47,129,247,0.3)] flex items-center justify-center gap-2",
                         simulationComplete ? "bg-emerald-500 text-white" : "bg-brand-primary text-white hover:scale-[1.02] active:scale-[0.98]"
                       )}
                     >
                        {isSimulating ? <Loader2 className="animate-spin" size={16} /> : simulationComplete ? <CheckCircle2 size={16} /> : null}
                        {isSimulating ? "Processing Engine..." : simulationComplete ? "Simulation Complete" : "Run Integrated Simulation"}
                     </button>
                  </div>
               </div>
            </div>
          ) : activeSubTab === 'knowledge' ? (
            <div className="grid grid-cols-12 gap-10">
               <div className="col-span-7 p-12 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl">
                  <h3 className="text-[10px] font-black text-status-warning uppercase tracking-widest mb-12 italic flex items-center gap-2">
                     <Briefcase size={14} className="text-status-warning" />
                     Institutional Lessons Learned
                  </h3>
                  <div className="space-y-8">
                     {lessonsLearned.map(lesson => (
                        <motion.div 
                          key={lesson.id} 
                          onClick={() => setSelectedCase({ 
                            id: lesson.id + 200, 
                            decision: lesson.title, 
                            area: lesson.category,
                            description: lesson.lesson,
                            impact: lesson.impact
                          })}
                          whileHover={{ x: 10, scale: 1.01 }}
                          className="p-10 bg-black/60 rounded-3xl border border-white/10 hover:border-brand-primary/40 transition-all cursor-pointer group shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        >
                           <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                              <BookOpen size={120} />
                           </div>
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex gap-3">
                                 <span className="px-4 py-1.5 bg-status-warning/10 text-status-warning text-[10px] font-black uppercase rounded-full border border-status-warning/20">{lesson.category}</span>
                                 <span className="px-4 py-1.5 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase rounded-full border border-rose-500/20 tracking-widest italic">Impact: {lesson.impact}</span>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-brand-primary transition-colors border border-white/5">
                                 <ArrowUpRight size={16} />
                              </div>
                           </div>
                           <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">{lesson.title}</h4>
                           <p className="text-sm text-slate-400 leading-relaxed italic">"{lesson.lesson}"</p>
                        </motion.div>
                     ))}
                  </div>

                  {/* Neural Knowledge Graph Animation Background */}
                  <div className="absolute inset-0 pointer-events-none opacity-20">
                     {Array.from({ length: 6 }).map((_, i) => (
                        <motion.div 
                           key={i}
                           className="absolute bg-brand-primary/20 rounded-full blur-3xl"
                           style={{ 
                              width: 200 + Math.random() * 200, 
                              height: 200 + Math.random() * 200,
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`
                           }}
                           animate={{ 
                              scale: [1, 1.2, 1],
                              opacity: [0.1, 0.3, 0.1]
                           }}
                           transition={{ duration: 10 + i * 2, repeat: Infinity }}
                        />
                     ))}
                  </div>
               </div>

               <div className="col-span-5 space-y-10">
                  <div className="glass-card p-12 rounded-3xl bg-panel-bg border-white/5 shadow-2xl">
                     <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-10 italic">Strategic Technical Dossiers</h3>
                     <div className="space-y-4">
                        {[
                          { id: 1, decision: 'Waterflood over Gas Injection', area: 'Subsurface' },
                          { id: 2, decision: '660-ft Well Spacing', area: 'Planning' }
                        ].map(decision => (
                          <motion.div 
                            key={decision.id}
                            onClick={() => setSelectedCase(decision)}
                            whileHover={{ scale: 1.02 }}
                            className="p-8 bg-white/5 rounded-3xl border border-white/5 hover:border-brand-primary/30 transition-all cursor-pointer flex justify-between items-center group shadow-lg"
                          >
                             <div>
                                <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest block mb-1">{decision.area}</span>
                                <span className="text-lg font-black text-white uppercase italic tracking-tight leading-none">{decision.decision}</span>
                             </div>
                             <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-brand-primary transition-all shadow-inner">
                                <ArrowUpRight className="text-slate-600 group-hover:text-white transition-colors" size={24} />
                             </div>
                          </motion.div>
                        ))}
                     </div>
                  </div>

                  <div className="glass-card p-12 rounded-3xl bg-[#05070a] border border-white/5 flex flex-col justify-center items-center text-center group shadow-2xl">
                     <div className="w-24 h-24 rounded-2xl bg-white/5 flex items-center justify-center mb-8 relative">
                        <div className="absolute inset-0 bg-brand-primary/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Database size={48} className="text-slate-700 group-hover:text-brand-primary transition-all duration-500" />
                     </div>
                     <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4 italic leading-none">Global Analog <span className="text-brand-primary">Benchmarking</span></h3>
                     <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-relaxed italic px-10">Cross-basin analytics engine synchronization active</p>
                  </div>
               </div>
            </div>
          ) : activeSubTab === 'planning' ? (
            <div className="grid grid-cols-12 gap-10 relative">
               {/* Logistics Vector Animation Background */}
               <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
                  <LogisticsVectorAnimation />
               </div>

               {/* Left Column: Rig Schedule Gantt */}
               <div className="col-span-8 relative z-10">
                  <div className="glass-card p-12 rounded-3xl bg-panel-bg border-white/5 h-[650px] flex flex-col shadow-2xl relative overflow-hidden">
                     <div className="flex justify-between items-center mb-12">
                        <div>
                           <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4 italic">Integrated Asset Timeline</h3>
                           <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Strategic <span className="text-brand-primary">Rig Schedule</span></h2>
                        </div>
                        <div className="flex gap-4">
                           <div className="px-6 py-3 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
                              <span className="text-[11px] font-black text-white uppercase tracking-widest italic">Sync: Permian Basin Fleet v2</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-4">
                        {rigs.map((item, idx) => (
                           <motion.div 
                             key={item.rig}
                             initial={{ opacity: 0, x: -20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: idx * 0.1 }}
                             onClick={() => setSelectedCase({ id: 101, decision: item.rig, area: 'Logistics', description: `Strategic schedule and mobilization path for ${item.rig}.` })}
                             className="p-8 bg-black/40 rounded-3xl border border-white/5 hover:border-brand-primary/30 transition-all group cursor-pointer relative overflow-hidden"
                           >
                              <div className="flex justify-between items-center mb-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-primary border border-white/5">
                                       <Box size={20} />
                                    </div>
                                    <div>
                                       <span className="text-xl font-black text-white uppercase italic tracking-tight">{item.rig}</span>
                                       <div className="flex gap-2 mt-1">
                                          {item.wells.map(w => (
                                             <span key={w} className="text-[11px] text-slate-500 font-black uppercase tracking-widest">{w}</span>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <span className={cn(
                                       "px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border",
                                       item.status === 'Drilling' ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20" :
                                       item.status === 'Completion' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                       "bg-status-warning/10 text-status-warning border-status-warning/20"
                                    )}>
                                       {item.status}
                                    </span>
                                 </div>
                              </div>
                              <div className="space-y-3">
                                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span>Cumulative Schedule Progress</span>
                                    <span className="text-white italic">{item.progress}%</span>
                                 </div>
                                 <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${item.progress}%` }}
                                      className={cn(
                                         "h-full rounded-full transition-all duration-1000",
                                         item.status === 'Drilling' ? "bg-brand-primary shadow-[0_0_15px_rgba(47,129,247,0.5)]" :
                                         item.status === 'Completion' ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" :
                                         "bg-status-warning shadow-[0_0_15px_rgba(240,136,62,0.5)]"
                                      )}
                                    />
                                 </div>
                              </div>
                           </motion.div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Right Column: Logistics Pulse */}
               <div className="col-span-4 space-y-8">
                  <div className="glass-card p-10 rounded-3xl bg-panel-bg border-white/5 shadow-2xl">
                     <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 italic flex items-center gap-2">
                        <Truck size={14} className="text-brand-primary" />
                        Operational Logistics
                     </h3>
                     <div className="space-y-8">
                        {logisticsData.map((log, idx) => (
                           <div key={log.label} className="space-y-4 group/log relative">
                              <div className="flex justify-between items-center relative z-10">
                                 <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{log.label}</p>
                                    <p className="text-lg font-black text-white italic uppercase tracking-tight">{log.value}</p>
                                 </div>
                                 <div className="text-right">
                                    <motion.div 
                                      animate={{ opacity: [0.5, 1, 0.5] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                      className="text-[11px] font-black text-emerald-400 uppercase tracking-widest"
                                    >
                                       {log.health}% Health
                                    </motion.div>
                                 </div>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative z-10">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${log.health}%` }}
                                   className={cn(
                                      "h-full rounded-full shadow-[0_0_10px_rgba(47,129,247,0.3)]",
                                      log.health > 90 ? "bg-emerald-500" : log.health > 80 ? "bg-brand-primary" : "bg-status-warning"
                                   )}
                                 />
                              </div>
                              <motion.div 
                                animate={{ opacity: [0, 0.05, 0] }}
                                transition={{ duration: 3, repeat: Infinity, delay: idx * 0.5 }}
                                className="absolute -inset-4 bg-brand-primary rounded-3xl pointer-events-none" 
                              />
                           </div>
                        ))}
                     </div>
                     
                     <div className="mt-12 p-8 bg-brand-primary/5 rounded-3xl border border-brand-primary/10">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-10 h-10 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                              <TrendingUp size={18} />
                           </div>
                           <h4 className="text-[11px] font-black text-white uppercase tracking-widest italic">Efficiency Gain</h4>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">
                           "Optimized scheduling has reduced mobilization downtime by <span className="text-emerald-400 font-black">18%</span> across the central corridor."
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          ) : activeSubTab === 'compliance' ? (
            <div className="grid grid-cols-12 gap-10 relative">
               {/* HSE Sentinel Pulse Animation Background */}
               <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                  <ComplianceSentinelAnimation />
               </div>

               <div className="col-span-12 relative z-10">
                  <div className="glass-card p-16 rounded-3xl bg-[#05070a] border border-white/5 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-16 opacity-[0.02]">
                        <ShieldCheck size={300} />
                     </div>
                     
                     <div className="flex justify-between items-start mb-16">
                        <div>
                           <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-wide mb-4 italic">Regulatory HSE Sentinel</h3>
                           <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">Compliance <span className="text-emerald-400">Governance</span></h2>
                        </div>
                         <div className="flex gap-4">
                            <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center group/metric cursor-help">
                               <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1">TRIR Index</p>
                               <input 
                                 type="number" 
                                 step="0.01"
                                 value={complianceInp.trir} 
                                 onChange={e => setComplianceInp({...complianceInp, trir: Number(e.target.value)})}
                                 className="w-24 bg-transparent text-center text-4xl font-black text-white italic outline-none focus:text-emerald-400 transition-colors" 
                               />
                               <p className="text-[10px] text-emerald-400/50 uppercase font-black tracking-widest mt-2">Incidence Variance Active</p>
                            </div>
                            <div className="p-8 bg-white/5 border border-white/10 rounded-2xl text-center group/metric cursor-help">
                               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Audit Score</p>
                               <div className="flex items-center justify-center">
                                  <input 
                                    type="number" 
                                    step="1"
                                    value={complianceInp.auditScore} 
                                    onChange={e => setComplianceInp({...complianceInp, auditScore: Number(e.target.value)})}
                                    className="w-24 bg-transparent text-center text-4xl font-black text-white italic outline-none focus:text-brand-primary transition-colors" 
                                  />
                                  <span className="text-2xl font-black text-slate-500 italic">%</span>
                               </div>
                               <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mt-2">Real-time Validation</p>
                            </div>
                         </div>
                     </div>

                     <div className="grid grid-cols-3 gap-10">
                        {[
                           { label: 'Air Emissions (GHG)', status: 'Optimal', value: '12.4 tCO2e/boe', color: 'text-emerald-400' },
                           { label: 'Water Discharge', status: 'Warning', value: 'Within Limits', color: 'text-status-warning' },
                           { label: 'Land Reclamation', status: 'Optimal', value: '42 Acres Active', color: 'text-emerald-400' }
                        ].map((stat, idx) => (
                           <motion.div 
                             key={stat.label}
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: idx * 0.1 }}
                             className="p-10 bg-white/5 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all group"
                           >
                              <h4 className="text-[11px] text-slate-500 font-black uppercase tracking-widest mb-6 group-hover:text-emerald-400 transition-colors">{stat.label}</h4>
                              <input 
                                defaultValue={stat.value}
                                className="bg-transparent text-2xl font-black text-white italic uppercase tracking-tighter mb-2 outline-none focus:text-brand-primary transition-all w-full"
                              />
                              <div className="flex items-center gap-2">
                                 <div className={cn("w-2 h-2 rounded-full animate-pulse", stat.color.replace('text', 'bg'))} />
                                 <span className={cn("text-[11px] font-black uppercase tracking-widest", stat.color)}>{stat.status}</span>
                              </div>
                           </motion.div>
                        ))}
                     </div>

                     <div className="mt-12 p-10 bg-white/5 rounded-3xl border border-white/5">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 italic">Regulatory Milestone Audit Log</h4>
                         <div className="space-y-4">
                            {complianceLogs.map((log, i) => (
                               <motion.div 
                                 key={log.id} 
                                 onClick={() => setSelectedCase({ 
                                   id: log.id, 
                                   decision: log.title, 
                                   area: 'Regulatory Compliance',
                                   description: `Regulatory milestone verification for ${log.title}. Full audit trail validated and stored in regional archives.`,
                                   impact: 'Critical',
                                   status: log.status,
                                   date: log.date
                                 })}
                                 whileHover={{ x: 10, scale: 1.01 }}
                                 className="flex justify-between items-center p-6 bg-black/40 rounded-3xl border border-white/5 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all cursor-pointer group shadow-lg"
                               >
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                        <CheckCircle2 size={18} />
                                     </div>
                                     <span className="text-[12px] font-black text-white uppercase italic tracking-wide group-hover:text-emerald-400 transition-colors">{log.title}</span>
                                  </div>
                                  <div className="flex items-center gap-6">
                                     <div className="text-right">
                                        <select 
                                          value={log.status} 
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            const newLogs = [...complianceLogs];
                                            newLogs[i].status = e.target.value;
                                            setComplianceLogs(newLogs);
                                          }}
                                          className="bg-transparent text-[10px] text-brand-primary font-black uppercase tracking-widest italic outline-none border border-brand-primary/20 rounded px-2 py-0.5 hover:bg-brand-primary/10 transition-colors"
                                        >
                                           <option value="Completed" className="bg-[#05070a]">Completed</option>
                                           <option value="Pending" className="bg-[#05070a]">Pending</option>
                                           <option value="In Progress" className="bg-[#05070a]">In Progress</option>
                                        </select>
                                        <span className="text-[11px] text-slate-700 font-black uppercase tracking-widest italic block mt-1">{log.date}</span>
                                     </div>
                                  </div>
                               </motion.div>
                            ))}
                         </div>
                     </div>
                  </div>
               </div>
            </div>
          ) : activeSubTab === 'abandonment' ? (
            <div className="grid grid-cols-12 gap-10 relative">
               {/* Decommissioning Flow Animation Background */}
               <div className="absolute inset-0 pointer-events-none opacity-[0.05] overflow-hidden">
                  <DecommissioningFlowAnimation />
               </div>

               <div className="col-span-7 relative z-10">
                  <div className="glass-card p-12 rounded-3xl bg-panel-bg border-white/5 h-[650px] flex flex-col shadow-2xl relative overflow-hidden">
                     <div className="flex justify-between items-center mb-12">
                        <div>
                           <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4 italic">End-of-Life Oversight</h3>
                           <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Decommissioning <span className="text-rose-500">& P&A</span></h2>
                        </div>
                     </div>
                     
                     <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-4">
                        {paItems.map((item, idx) => (
                           <div 
                             key={item.well} 
                             onClick={() => setSelectedCase({ id: 102, decision: item.well, area: item.type, description: `End-of-life P&A operation for ${item.well}.` })}
                             className="p-8 bg-black/40 rounded-3xl border border-white/5 hover:border-rose-500/30 transition-all group cursor-pointer relative overflow-hidden"
                           >
                              <div className="flex justify-between items-start mb-6">
                                 <div>
                                    <span className="text-[11px] text-rose-500 font-black uppercase tracking-widest block mb-1">{item.type}</span>
                                    <span className="text-xl font-black text-white uppercase italic tracking-tight">{item.well}</span>
                                 </div>
                                 <div className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                       <span className="text-lg font-black text-white italic">$</span>
                                       <input 
                                         type="number" 
                                         step="0.1" 
                                         value={item.budget} 
                                         onChange={e => {
                                            const newItems = [...paItems];
                                            newItems[idx].budget = Number(e.target.value);
                                            setPaItems(newItems);
                                         }}
                                         onClick={e => e.stopPropagation()}
                                         className="w-16 bg-transparent text-right text-lg font-black text-white italic outline-none focus:text-rose-500" 
                                       />
                                       <span className="text-lg font-black text-white italic">M</span>
                                    </div>
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Est. Cost</p>
                                 </div>
                              </div>
                              <div className="space-y-3">
                                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-500 italic">Phase Progress</span>
                                    <div className="flex items-center gap-1">
                                       <input 
                                         type="number" 
                                         value={item.progress} 
                                         onChange={e => {
                                            const newItems = [...paItems];
                                            newItems[idx].progress = Number(e.target.value);
                                            setPaItems(newItems);
                                         }}
                                         onClick={e => e.stopPropagation()}
                                         className="w-8 bg-transparent text-right text-white italic outline-none" 
                                       />
                                       <span className="text-white italic">%</span>
                                    </div>
                                 </div>
                                 <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${item.progress}%` }}
                                      className="h-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                                    />
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="col-span-5 space-y-8">
                  <div className="glass-card p-10 rounded-3xl bg-panel-bg border-white/5 shadow-2xl">
                     <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 italic flex items-center gap-2">
                        <Activity size={14} className="text-rose-500" />
                        Liability Accrual Matrix
                     </h3>
                     <div className="space-y-8">
                        {liabilityMatrix.map(m => (
                           <div key={m.label} className="p-6 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden group">
                              <motion.div 
                                animate={{ opacity: [0.02, 0.08, 0.02] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute inset-0 bg-rose-500 pointer-events-none" 
                              />
                              <div className="flex justify-between items-center mb-2 relative z-10">
                                 <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{m.label}</span>
                                 <motion.div 
                                   animate={{ y: [0, -5, 0] }}
                                   transition={{ duration: 2, repeat: Infinity }}
                                 >
                                    <Activity size={14} className="text-rose-500" />
                                 </motion.div>
                              </div>
                              <div className="flex items-baseline gap-2 relative z-10">
                                 <span className="text-4xl font-black text-white italic tracking-tighter">{m.value}</span>
                                 {m.trend === 'up' && <TrendingUp size={14} className="text-rose-500" />}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                   <div 
                     onClick={() => {
                        setIsSimulatingLiability(true);
                        setLiabilityForecast(null);
                        setTimeout(() => {
                           const totalARO = paItems.reduce((sum, item) => sum + item.budget, 0);
                           setLiabilityForecast(totalARO * 1.85); // 1.85x forecast over 15 yrs
                           setIsSimulatingLiability(false);
                        }, 2500);
                     }}
                     className="glass-card p-10 rounded-3xl bg-rose-500/5 border border-rose-500/10 flex flex-col items-center justify-center text-center group cursor-pointer relative overflow-hidden active:scale-95 transition-all"
                   >
                      {isSimulatingLiability && (
                         <motion.div 
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center p-6"
                         >
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: '100%' }}
                                 transition={{ duration: 2.5 }}
                                 className="h-full bg-rose-500"
                               />
                            </div>
                            <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest animate-pulse italic">Physics-Core Simulation Active</span>
                         </motion.div>
                      )}
                      <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20 relative">
                         <div className="absolute inset-0 rounded-full border border-rose-500/50 animate-ping opacity-20" />
                         <History size={32} className={cn("transition-transform duration-1000", isSimulatingLiability ? "animate-spin" : "group-hover:rotate-180")} />
                      </div>
                      <h4 className="text-lg font-black text-white uppercase italic tracking-widest mb-2">
                         {liabilityForecast ? "Simulation Results" : "Liability Simulation"}
                      </h4>
                      {liabilityForecast ? (
                         <div className="space-y-1">
                            <p className="text-3xl font-black text-rose-500 italic tracking-tighter">${liabilityForecast.toFixed(1)}M</p>
                            <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest">Projected 2038 Obligation</p>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setLiabilityForecast(null); }}
                              className="mt-4 text-[10px] text-rose-500/60 uppercase font-black tracking-widest hover:text-rose-500 transition-colors"
                            >
                               Reset Forecast
                            </button>
                         </div>
                      ) : (
                         <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest italic px-10">Forecasting decommissioning costs for the next 15 years based on current inflation index.</p>
                      )}
                   </div>
               </div>
            </div>
          ) : (
             <div className="h-[600px] flex items-center justify-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                <div className="text-center">
                   <Settings className="text-white/10 mx-auto mb-6 animate-spin-slow" size={80} />
                   <h3 className="text-2xl font-black text-white uppercase italic tracking-widest">Module Interface Initializing</h3>
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-4">Security handshake in progress...</p>
                </div>
             </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {selectedCase && (
          <TechnicalCaseModal 
            item={{...selectedCase, context: { assetInp }}} 
            onClose={() => setSelectedCase(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TechnicalCaseModal({ item, onClose }: { item: any, onClose: () => void }) {
  const { assetInp } = (item as any).context || { assetInp: { activeRigs: 4, oilPrice: 75 } };

  const caseData = useMemo(() => {
    // Dynamic Physics-Core Calculations
    const rigMult = (assetInp?.activeRigs || 4) / 4;
    const priceMult = (assetInp?.oilPrice || 75) / 75;

    if (item.id === 1 || item.id === 101) {
      return {
        npv: item.id === 101 ? `$${(85 * rigMult * priceMult).toFixed(1)}M` : '$420M',
        irr: item.id === 101 ? `${(18.4 * priceMult).toFixed(1)}%` : '24.5%',
        payback: item.id === 101 ? '2.1 yrs' : '3.2 yrs',
        risk: 'Medium',
        description: item.id === 101 
          ? 'Rig re-allocation strategy for the Permian central corridor. Optimizing mobilization paths to minimize non-productive time (NPT) between Block-A and Block-B drilling targets.'
          : 'Comparison of secondary recovery mechanisms for the Lower Wolfcamp formation. Waterflood was selected over Gas Injection due to favorable mobility ratios.',
        metrics: [
          { label: item.id === 101 ? 'NPT Reduction' : 'Incremental EUR', value: item.id === 101 ? '14%' : '4.2 MMbbl' },
          { label: item.id === 101 ? 'Rig Move Days' : 'Injection Efficiency', value: item.id === 101 ? '3.2 Days' : '1.4 bbl/bbl' },
          { label: 'OPEX Delta', value: '-12%' }
        ]
      };
    }
    if (item.id === 401 || item.id === 201 + 200) { // Mapping fix for IDs
      return {
        npv: '-$4.2M (Cost Avoided)',
        irr: 'Risk Mitigation',
        payback: 'N/A',
        risk: 'Extreme Subsurface',
        description: 'Analysis of drilling fluid losses in cavernous limestone (Karst). Implementation of pre-drill seismic inversion identified a 250ft void, allowing for casing seat optimization and preventing a $4M wellbore loss.',
        metrics: [
          { label: 'Fluid Recovery', value: '1,200 bbl' },
          { label: 'NPT Prevented', value: '72 Hours' },
          { label: 'Casing Index', value: 'Optimized' }
        ]
      };
    }
    if (item.id === 402 || item.id === 202 + 200) {
      return {
        npv: `+$${(1.8 * priceMult).toFixed(1)}M / Well`,
        irr: `${(32 * priceMult).toFixed(1)}%`,
        payback: '0.8 yrs',
        risk: 'Operational',
        description: 'Optimization study for proppant concentration. Data from Zone C indicates that exceeding 2.5 lb/gal increases screen-out risk by 40%. Optimal efficiency reached at 2.2 lb/gal.',
        metrics: [
          { label: 'Proppant Efficiency', value: '94%' },
          { label: 'Stimulated Vol', value: '+15%' },
          { label: 'Screen-out Rate', value: '2.1%' }
        ]
      };
    }
    if (item.id === 102 || item.id === 201) {
      return {
        npv: '-$12M (Liability)',
        irr: 'N/A',
        payback: 'N/A',
        risk: 'High (Regulatory)',
        description: 'Comprehensive well abandonment and site remediation plan. Ensuring compliance with EPA sub-part W requirements for long-term subsurface isolation.',
        metrics: [
          { label: 'Plug Count', value: '4 Wells' },
          { label: 'Remediation Area', value: '12 Acres' },
          { label: 'Liability Reduction', value: '15%' }
        ]
      };
    }
    if (item.id >= 301 && item.id <= 303) {
      return {
        npv: 'Compliance Asset Value',
        irr: 'Risk Mitigated',
        payback: 'N/A',
        risk: 'Regulatory Secured',
        description: item.description || 'Regulatory milestone verification and validation.',
        metrics: [
          { label: 'Audit Rating', value: 'AAA+' },
          { label: 'Validation Date', value: '14-Oct-23' },
          { label: 'Renewal Cycle', value: '24 Months' }
        ]
      };
    }
    return {
      npv: '$185M',
      irr: '32.1%',
      payback: '1.8 yrs',
      risk: 'Low',
      description: 'Optimization study for unconventional horizontal development.',
      metrics: [
        { label: 'Well Density', value: '8 wells/sec' },
        { label: 'Fracture Efficiency', value: '92%' },
        { label: 'NPV per Section', value: '+$14.2M' }
      ]
    };
  }, [item, assetInp]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[500] flex items-center justify-center p-12 bg-[#020408]/90 backdrop-blur-2xl cursor-pointer"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-5xl rounded-3xl border-white/10 bg-[#05070a] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,1)] cursor-default flex"
      >
        <div className="flex-1 p-16 overflow-y-auto custom-scrollbar">
           <div className="flex justify-between items-start mb-12">
              <div>
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-wide italic">Technical Justification Dossier</span>
                 </div>
                 <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">{item.decision}</h2>
              </div>
              <button 
                onClick={onClose}
                className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 hover:rotate-90 transition-all duration-500 shadow-2xl"
              >
                <X size={28} />
              </button>
           </div>

           <p className="text-lg text-slate-400 leading-relaxed mb-16 font-medium italic">
              {caseData.description}
           </p>

           <div className="grid grid-cols-2 gap-10 mb-16">
              <div className="p-10 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TrendingUp size={80} />
                 </div>
                 <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-10 italic">Economic Impact Matrix</h4>
                 <div className="space-y-8">
                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                       <span className="text-xs text-slate-500 uppercase font-black tracking-widest">NPV (PV10)</span>
                       <span className="text-4xl font-black text-white italic data-mono">{caseData.npv}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                       <span className="text-xs text-slate-500 uppercase font-black tracking-widest">Project IRR</span>
                       <span className="text-4xl font-black text-emerald-400 italic data-mono">{caseData.irr}</span>
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-white/5 rounded-3xl border border-white/5">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 italic">Engineering Performance KPIs</h4>
                 <div className="space-y-6">
                    {caseData.metrics.map(m => (
                      <div key={m.label} className="flex justify-between items-end border-b border-white/5 pb-4 group hover:border-brand-primary/20 transition-all">
                         <span className="text-[11px] text-slate-400 uppercase font-black tracking-widest group-hover:text-white transition-colors">{m.label}</span>
                         <span className="text-xl font-black text-white italic data-mono">{m.value}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="flex gap-6">
              <button 
                onClick={() => {
                   const metricsString = caseData.metrics.map(m => `${m.label}: ${m.value}`).join('\n');
                   const content = `TECHNICAL DOSSIER: ${item.decision}
==========================================
AREA: ${item.area || 'General Operations'}
STATUS: ${item.status || 'Verified'}
DATE: ${item.date || new Date().toLocaleDateString()}
IMPACT: ${item.impact || 'Standard'}

DESCRIPTION:
${caseData.description}

ECONOMIC IMPACT:
NPV: ${caseData.npv}
IRR: ${caseData.irr}
PAYBACK: ${caseData.payback}
RISK: ${caseData.risk}

ENGINEERING METRICS:
${metricsString}

------------------------------------------
PHYSICS-CORE ENGINE VALIDATION: 94.2%
------------------------------------------`;
                   const blob = new Blob([content], { type: 'text/plain' });
                   const url = window.URL.createObjectURL(blob);
                   const a = document.createElement('a');
                   a.href = url;
                   a.download = `Dossier_${item.id}_${(item.status || 'Status').toUpperCase()}.txt`;
                   a.click();
                }}
                className="flex-1 py-7 bg-brand-primary rounded-2xl text-xs font-black text-white uppercase tracking-widest italic hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(47,129,247,0.4)]"
              >
                 <Download size={20} />
                 Download Full PDF Dossier
              </button>
              <button 
                onClick={() => {
                   const subject = `Technical Case: ${item.decision}`;
                   const body = `Review the latest analysis for ${item.decision}. NPV: ${caseData.npv} | IRR: ${caseData.irr}`;
                   window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                }}
                className="px-12 py-7 bg-white/5 rounded-2xl text-xs font-black text-white uppercase tracking-widest italic hover:bg-white/10 border border-white/10 flex items-center gap-3 transition-all"
              >
                 <Share2 size={20} />
                 Share Case
              </button>
           </div>
        </div>

        <div className="w-[400px] bg-brand-primary/5 border-l border-white/5 p-16 flex flex-col justify-center gap-12 relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(47,129,247,0.1)_0%,transparent_70%)]" />
           
           <div className="text-center relative">
              <div className="w-24 h-24 rounded-2xl bg-brand-primary flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(47,129,247,0.5)]">
                 <Zap size={48} className="text-white animate-pulse" />
              </div>
              <h5 className="text-[11px] font-black text-white uppercase tracking-widest mb-2 italic">Physics Core Engine</h5>
              <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest">Confidence Index: <span className="text-emerald-400">94.2%</span></p>
           </div>

           <div className="space-y-10 relative">
              <div className="p-8 bg-black/60 rounded-3xl border border-white/5 shadow-2xl">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-4">
                    <span className="text-slate-500 italic">Validation Score</span>
                    <span className="text-brand-primary">High Fidelity</span>
                 </div>
                 <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} className="h-full bg-brand-primary" />
                 </div>
              </div>

              <div className="p-8 bg-black/60 rounded-3xl border border-white/5 shadow-2xl">
                 <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">Sensitivity Matrix Output</h5>
                 <div className="grid grid-cols-4 gap-2 h-32">
                    {Array.from({length: 16}).map((_, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: Math.random() * 0.8 + 0.2 }}
                        transition={{ delay: i * 0.05, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                        className="bg-brand-primary/40 rounded-lg hover:bg-brand-primary transition-colors cursor-crosshair" 
                      />
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FieldProduction3D({ data }: { data: any }) {
  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center relative">
       <svg viewBox="0 0 600 400" className="w-full h-full max-w-[800px]">
          <defs>
             <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#2F81F7" />
                <stop offset="100%" stopColor="#2F81F7" />
             </linearGradient>
          </defs>
          <g transform="translate(50, 350) scale(1, -1)">
             {/* Grid Lines */}
             {[0, 50, 100, 150, 200, 250, 300].map(y => (
               <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="white" strokeOpacity="0.05" strokeWidth="1" />
             ))}
             
             {/* Main Path */}
             <motion.path 
                d={`M 0 0 ${data.map((d: any, i: number) => `L ${i * 100} ${d.actual / 15}`).join(' ')}`}
                fill="none" stroke="url(#lineGrad)" strokeWidth="4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
             />
             
             {/* Forecast Path */}
             <motion.path 
                d={`M 0 0 ${data.map((d: any, i: number) => `L ${i * 100} ${d.forecast / 15}`).join(' ')}`}
                fill="none" stroke="#6E7681" strokeWidth="2" strokeDasharray="10,10" strokeOpacity="0.4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
             />

             {/* Data Points */}
             {data.map((d: any, i: number) => (
                <motion.circle 
                  key={i}
                  cx={i * 100} cy={d.actual / 15} r="6"
                  fill="#020408" stroke="#2F81F7" strokeWidth="3"
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 2 + i * 0.1 }}
                />
             ))}
          </g>
          <text x="300" y="380" fill="#2F81F7" fontSize="12" textAnchor="middle" className="font-black uppercase tracking-wide italic opacity-40">Field Performance Kinetic Vector</text>
       </svg>
    </div>
  );
}

function GeocellularGrid3D({ complexity = 0.5, showHistory = false }: { complexity?: number, showHistory?: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
       <svg viewBox="0 0 800 600" className="w-full h-full max-w-[1000px]">
          <g transform="translate(400, 300)">
             {[...Array(24)].map((_, i) => (
               <motion.g 
                key={i} 
                animate={{ 
                  y: showHistory ? [0, -20, 0] : [0, -5, 0],
                  scale: showHistory ? [1, 1.05, 1] : 1
                }} 
                transition={{ duration: showHistory ? 2 : 4, repeat: Infinity, delay: i * 0.1 }}
               >
                  <motion.path 
                     d={`M ${-200 + i*(12 + complexity*10)} ${-100 + i*6} L ${-100 + i*(12 + complexity*10)} ${-150 + i*6} L ${100 + i*(12 + complexity*10)} ${-50 + i*6} L 0 ${i*6} Z`}
                     fill={showHistory ? (i % 3 === 0 ? "#10b981" : "#121d2f") : (i % 4 === 0 ? "#2F81F7" : i % 7 === 0 ? "#F0883E" : "#121d2f")}
                     fillOpacity={0.2 + (i/24)*0.6}
                     stroke="white" 
                     strokeOpacity={showHistory ? 0.3 : 0.1} 
                     strokeWidth={showHistory ? 1 : 0.5}
                     initial={{ opacity: 0, scale: 0 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: i * 0.03 }}
                   />
                </motion.g>
              ))}
           </g>
           <text x="400" y="580" fill="#2F81F7" fontSize="12" textAnchor="middle" className="font-black uppercase tracking-normal italic opacity-20">Integrated Subsurface Digital Twin</text>
        </svg>
     </div>
   );
 }

function ComplianceSentinelAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center">
       <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <defs>
             <radialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
             </radialGradient>
          </defs>
          
          {/* Radar Scans */}
          {[1, 2, 3].map(i => (
             <motion.circle 
                key={i}
                cx="500" cy="500" r={100 * i}
                fill="none" stroke="#10b981" strokeWidth="1" strokeOpacity="0.1"
                animate={{ 
                   scale: [1, 1.2, 1],
                   opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ duration: 4, delay: i * 0.5, repeat: Infinity, ease: "easeInOut" }}
             />
          ))}

          {/* Rotating Scan Beam */}
          <motion.g 
             animate={{ rotate: 360 }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             style={{ transformOrigin: '500px 500px' }}
          >
             <path d="M 500 500 L 500 100 A 400 400 0 0 1 700 150 Z" fill="url(#pulseGrad)" />
          </motion.g>

          {/* Floating Security Nodes */}
          {[...Array(12)].map((_, i) => (
             <motion.g 
                key={i}
                initial={{ 
                   x: 500 + Math.cos(i * (Math.PI/6)) * 300,
                   y: 500 + Math.sin(i * (Math.PI/6)) * 300
                }}
                animate={{ 
                   y: [500 + Math.sin(i * (Math.PI/6)) * 300 - 10, 500 + Math.sin(i * (Math.PI/6)) * 300 + 10],
                   opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, repeatType: 'reverse' }}
             >
                <circle r="4" fill="#10b981" className="shadow-[0_0_10px_#10b981]" />
                <circle r="12" fill="none" stroke="#10b981" strokeWidth="0.5" strokeDasharray="2,2" />
             </motion.g>
          ))}
       </svg>
    </div>
  );
}

function LogisticsVectorAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center">
       <svg viewBox="0 0 1000 1000" className="w-full h-full">
          {[...Array(8)].map((_, i) => (
             <motion.line 
                key={i}
                x1="-100" y1={100 + i * 120} x2="1100" y2={100 + i * 120}
                stroke="#2F81F7" strokeWidth="1" strokeDasharray="20,20"
                animate={{ strokeDashoffset: [0, -100] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             />
          ))}
          {[...Array(15)].map((_, i) => (
             <motion.circle 
                key={i}
                r="3" fill="#2F81F7"
                animate={{ 
                   x: [-100, 1100],
                   y: [100 + (i % 8) * 120, 100 + (i % 8) * 120]
                }}
                transition={{ duration: 15 + Math.random() * 10, repeat: Infinity, delay: i * 2 }}
             />
          ))}
       </svg>
    </div>
  );
}

function DecommissioningFlowAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center">
       <svg viewBox="0 0 1000 1000" className="w-full h-full">
          {[...Array(20)].map((_, i) => (
             <motion.path 
                key={i}
                d={`M ${Math.random() * 1000} 1100 L ${Math.random() * 1000} -100`}
                stroke="#f43f5e" strokeWidth="0.5" strokeOpacity="0.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: [0, 1, 0], y: [0, -100] }}
                transition={{ duration: 5 + Math.random() * 5, repeat: Infinity }}
             />
          ))}
       </svg>
    </div>
  );
}
function BenchmarkingPulseAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center">
       <svg viewBox="0 0 400 400" className="w-full h-full">
          {[...Array(5)].map((_, i) => (
             <motion.rect 
                key={i}
                x={100 + i * 40} y={200 - i * 20} width="30" height={i * 40 + 40}
                fill="#2F81F7" fillOpacity="0.2"
                animate={{ 
                   height: [i * 40 + 40, i * 40 + 60, i * 40 + 40],
                   fillOpacity: [0.1, 0.3, 0.1]
                }}
                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
             />
          ))}
          <motion.path 
             d="M 100 200 L 140 180 L 180 160 L 220 140 L 260 120"
             fill="none" stroke="#2F81F7" strokeWidth="2"
             initial={{ pathLength: 0 }}
             animate={{ pathLength: 1 }}
             transition={{ duration: 2, repeat: Infinity }}
          />
       </svg>
    </div>
  );
}
