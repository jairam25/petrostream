import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Settings2, 
  TrendingUp, 
  Activity, 
  Cpu, 
  BrainCircuit,
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Layers,
  FlaskConical,
  Target,
  RefreshCw
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export function PredictiveModelsTab() {
  const [activeModel, setActiveModel] = useState<'rf' | 'xgb' | 'nn'>('rf');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  // Training Params State
  const [params, setParams] = useState({
    kFold: true,
    gridSearch: true,
    shapExplain: true
  });

  const modelData = useMemo(() => {
    switch(activeModel) {
      case 'xgb':
        return {
          accuracy: 0.892,
          prediction: 1315,
          importance: [
            { feature: 'Proppant/ft', val: 0.92, color: '#6366f1' },
            { feature: 'Lat Length', val: 0.65, color: '#818cf8' },
            { feature: 'Fluid/ft', val: 0.78, color: '#a5b4fc' },
            { feature: 'Pressure', val: 0.52, color: '#c7d2fe' },
            { feature: 'Depth', val: 0.28, color: '#e0e7ff' },
            { feature: 'Spacing', val: 0.12, color: '#f5f3ff' },
          ],
          shap: [
            { name: 'Lat Length', value: 145 },
            { name: 'Proppant', value: 95 },
            { name: 'Fluid', value: -45 },
            { name: 'Pressure', value: 60 },
            { name: 'Spacing', value: -20 },
          ]
        };
      case 'nn':
        return {
          accuracy: 0.915,
          prediction: 1288,
          importance: [
            { feature: 'Proppant/ft', val: 0.75, color: '#6366f1' },
            { feature: 'Lat Length', val: 0.88, color: '#818cf8' },
            { feature: 'Fluid/ft', val: 0.62, color: '#a5b4fc' },
            { feature: 'Pressure', val: 0.59, color: '#c7d2fe' },
            { feature: 'Depth', val: 0.45, color: '#e0e7ff' },
            { feature: 'Spacing', val: 0.35, color: '#f5f3ff' },
          ],
          shap: [
            { name: 'Lat Length', value: 110 },
            { name: 'Proppant', value: 75 },
            { name: 'Fluid', value: -25 },
            { name: 'Pressure', value: 40 },
            { name: 'Spacing', value: -15 },
          ]
        };
      default:
        return {
          accuracy: 0.865,
          prediction: 1240,
          importance: [
            { feature: 'Proppant/ft', val: 0.85, color: '#6366f1' },
            { feature: 'Lat Length', val: 0.72, color: '#818cf8' },
            { feature: 'Fluid/ft', val: 0.58, color: '#a5b4fc' },
            { feature: 'Pressure', val: 0.44, color: '#c7d2fe' },
            { feature: 'Depth', val: 0.31, color: '#e0e7ff' },
            { feature: 'Spacing', val: 0.15, color: '#f5f3ff' },
          ],
          shap: [
            { name: 'Lat Length', value: 120 },
            { name: 'Proppant', value: 85 },
            { name: 'Fluid', value: -30 },
            { name: 'Pressure', value: 45 },
            { name: 'Spacing', value: -15 },
          ]
        };
    }
  }, [activeModel]);

  const handleModelSwitch = (id: 'rf' | 'xgb' | 'nn') => {
    setIsRecalculating(true);
    setActiveModel(id);
    setTimeout(() => setIsRecalculating(false), 1200);
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleGeneratePDP = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 2000);
  };

  const handleDownloadPDP = () => {
    setIsDownloading(true);
    setTimeout(() => {
      // Physical browser download
      const pdpContent = `PDP SENSITIVITY ANALYSIS\n========================\nModel: ${activeModel.toUpperCase()}\nAccuracy: ${modelData.accuracy}\n\nFEATURE IMPORTANCE:\n${modelData.importance.map(f => `${f.feature}: ${f.val}`).join('\n')}\n\nSHAP CONTRIBUTIONS:\n${modelData.shap.map(s => `${s.name}: ${s.value}`).join('\n')}\n`;
      const blob = new Blob([pdpContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PDP_Analysis_${activeModel}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsDownloading(false);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
      {/* Sidebar - Model Config */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <BrainCircuit size={20} className="text-indigo-400" />
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Algorithm Hub</h4>
           </div>
           
           <div className="space-y-3">
              {[
                { id: 'rf', label: 'Random Forest', desc: 'EUR Regression', icon: Layers },
                { id: 'xgb', label: 'XGBoost', desc: 'Gradient Boosting', icon: Zap },
                { id: 'nn', label: 'Neural Network', desc: 'Deep Learning', icon: Cpu }
              ].map(m => (
                <button 
                  key={m.id}
                  onClick={() => handleModelSwitch(m.id as any)}
                  className={cn(
                    "w-full p-5 rounded-2xl flex items-center gap-4 transition-all border text-left",
                    activeModel === m.id ? "bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]" : "bg-white/4 shadow-none border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                   <div className={cn("p-3 rounded-xl", activeModel === m.id ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-500")}>
                      <m.icon size={16} />
                   </div>
                   <div>
                      <span className="text-[10px] font-black text-white uppercase tracking-tight block">{m.label}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{m.desc}</span>
                   </div>
                </button>
              ))}
           </div>
        </div>

        <div className="glass-card rounded-2xl p-8 bg-gradient-to-br from-indigo-950/40 to-black border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <FlaskConical size={18} className="text-indigo-400" />
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Training Params</h4>
           </div>
           <div className="space-y-6">
              <ParamToggle label="K-Fold CV" active={params.kFold} onClick={() => { setParams(p => ({ ...p, kFold: !p.kFold })); setIsRecalculating(true); setTimeout(() => setIsRecalculating(false), 800); }} />
              <ParamToggle label="Grid Search" active={params.gridSearch} onClick={() => { setParams(p => ({ ...p, gridSearch: !p.gridSearch })); setIsRecalculating(true); setTimeout(() => setIsRecalculating(false), 800); }} />
              <ParamToggle label="SHAP Explain" active={params.shapExplain} onClick={() => setParams(p => ({ ...p, shapExplain: !p.shapExplain }))} />
              
              <div className="pt-4 border-t border-white/5">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] text-slate-500 uppercase font-black">Train/Test Split</span>
                    <span className="text-[10px] text-indigo-400 font-bold">80:20</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: '80%' }} />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Main Analysis Display */}
      <div className="lg:col-span-9 space-y-8">
         <div className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a]">
            <div className="flex justify-between items-start mb-12">
               <div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Production <span className="text-indigo-500">Predictor</span></h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold italic">
                     {activeModel === 'rf' ? 'Random Forest Regression' : activeModel === 'xgb' ? 'XGBoost Gradient Boosting' : 'Deep Neural Network Architecture'} - EUR Estimation
                  </p>
               </div>
               <div className="bg-indigo-500/10 p-6 rounded-2xl border border-indigo-500/20 text-center relative overflow-hidden">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Model Accuracy (R²)</span>
                  <AnimatePresence mode="wait">
                    <motion.span 
                      key={activeModel}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="text-3xl font-black text-white italic font-mono block"
                    >
                       {modelData.accuracy}
                    </motion.span>
                  </AnimatePresence>
                  {isRecalculating && <motion.div layoutId="loader" className="absolute bottom-0 left-0 h-1 bg-indigo-500 w-full animate-progress" />}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {/* Feature Importance */}
               <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                     <BarChart3 size={14} /> Global Feature Importance
                  </h4>
                  <div className="h-[300px] relative">
                     {isRecalculating && (
                        <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[2px] flex items-center justify-center rounded-3xl">
                           <Activity size={24} className="text-indigo-400 animate-pulse" />
                        </div>
                     )}
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={modelData.importance} layout="vertical" margin={{ left: 40 }}>
                           <XAxis type="number" hide />
                           <YAxis 
                              dataKey="feature" 
                              type="category" 
                              stroke="#475569" 
                              fontSize={10} 
                              axisLine={false} 
                              tickLine={false}
                              width={80}
                           />
                           <Tooltip 
                              cursor={{ fill: 'transparent' }}
                              contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }}
                           />
                           <Bar dataKey="val" radius={[0, 8, 8, 0]} barSize={20}>
                              {modelData.importance.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Sample Well Prediction */}
               <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                     <Target size={20} className="text-emerald-400" />
                     <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Single-Well Forecast</span>
                  </div>
                  <div className="text-center space-y-2 mb-10">
                     <h5 className="text-[10px] font-black text-white uppercase tracking-widest opacity-40">Predicted IP-90</h5>
                     <AnimatePresence mode="wait">
                       <motion.div 
                         key={activeModel}
                         initial={{ scale: 0.9, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         className="text-5xl font-black text-white italic tracking-tighter"
                       >
                          {modelData.prediction.toLocaleString()} <span className="text-lg font-normal text-slate-500 uppercase">STBD</span>
                       </motion.div>
                     </AnimatePresence>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="p-4 bg-black/40 rounded-2xl flex justify-between items-center text-[10px] font-bold uppercase tracking-widest italic">
                        <span className="text-slate-600">Confidence Interval (95%)</span>
                        <span className="text-white">± 12%</span>
                     </div>
                     <div className="p-4 bg-black/40 rounded-2xl flex justify-between items-center text-[10px] font-bold uppercase tracking-widest italic">
                        <span className="text-slate-600">Data Freshness</span>
                        <span className="text-emerald-400 flex items-center gap-2">
                           <CheckCircle2 size={12} /> SYNCED
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Explainability / SHAP Section */}
         <AnimatePresence mode="popLayout">
           {params.shapExplain && (
             <motion.div 
               initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
               animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
               exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
               className="grid grid-cols-1 md:grid-cols-2 gap-8"
             >
                <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a]">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 italic">SHAP Value Contributions (Well: Bravo-04)</h4>
                   <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={modelData.shap} layout="vertical" margin={{ left: 40 }}>
                            <XAxis type="number" fontSize={9} />
                            <YAxis dataKey="name" type="category" fontSize={9} width={60} />
                            <Tooltip />
                            <Bar dataKey="value">
                               {modelData.shap.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#10b981' : '#ef4444'} />
                               ))}
                            </Bar>
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] flex flex-col justify-center items-center text-center">
                   <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                      <Search size={24} className="text-indigo-400" />
                   </div>
                   <h4 className="text-xs font-black text-white uppercase italic mb-2">Partial Dependence Plots</h4>
                   <p className="text-[10px] text-slate-500 leading-relaxed font-medium px-4">Analyze the marginal effect of proppant loading on EUR while keeping other variables constant.</p>
                   <button 
                      onClick={isGenerated ? handleDownloadPDP : handleGeneratePDP}
                      disabled={isGenerating || isDownloading}
                      className={cn(
                         "mt-8 px-8 py-3 border rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                         isDownloading 
                            ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            : isGenerated 
                            ? "bg-emerald-500 text-black border-emerald-500 hover:bg-emerald-400"
                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 active:scale-95"
                      )}
                   >
                      {isGenerating ? (
                         <div className="flex items-center gap-2">
                            <RefreshCw size={12} className="animate-spin" />
                            Generating...
                         </div>
                      ) : isDownloading ? (
                         <div className="flex items-center gap-2">
                            <RefreshCw size={12} className="animate-spin" />
                            Downloading...
                         </div>
                      ) : isGenerated ? (
                         <div className="flex items-center gap-2">
                            <CheckCircle2 size={12} />
                            PDP Suite Ready (Download)
                         </div>
                      ) : (
                         'Generate PDP Suite'
                      )}
                   </button>
                </div>
             </motion.div>
           )}
         </AnimatePresence>
      </div>
    </div>
  );
}

function ParamToggle({ label, active, onClick }: { label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors"
      onClick={onClick}
    >
       <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">{label}</span>
       <div className={cn("w-10 h-5 rounded-full relative transition-all", active ? "bg-indigo-500" : "bg-slate-800")}>
          <div className={cn("absolute top-1 w-3 h-3 rounded-full bg-white transition-all", active ? "left-6" : "left-1")} />
       </div>
    </div>
  );
}
