import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { 
  Wallet, 
  TrendingUp, 
  Percent, 
  Clock, 
  Settings2, 
  DollarSign, 
  BarChart3, 
  Scale,
  RefreshCcw,
  ArrowRightCircle,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateNPV, calculateIRR, calculatePayout, calculatePI } from '../../lib/reservoir';

export function EconomicAnalysisTab() {
  const [activeView, setActiveView] = useState<'summary' | 'cashflow' | 'sensitivity'>('summary');
  
  // Economic Assumptions
  const [econ, setEcon] = useState({
    oilPrice: 75,
    gasPrice: 3.5,
    royalty: 0.1875, // 18.75%
    ca_opex: 12.0, // $/barrel
    fixedOpex: 50000, // $/month
    capex: 12.5e6, // $12.5M
    discountRate: 0.10,
    severanceTax: 0.046, // 4.6%
    incomeTax: 0.21 // 21%
  });

  // Mock Production Data for 10 years
  const cashFlowData = useMemo(() => {
    const years = 10;
    const data = [];
    let cumCashFlow = -econ.capex;
    
    // Initial CAPEX at Year 0
    data.push({
      year: 0,
      revenue: 0,
      opex: 0,
      tax: 0,
      capex: econ.capex,
      ncf: -econ.capex,
      cumNCF: -econ.capex,
      dcf: -econ.capex
    });

    // Decline production rate roughly 
    const qi = 800; // STB/d
    const di = 0.3; // Annual

    for (let yr = 1; yr <= years; yr++) {
      const q_avg = (qi * Math.exp(-di * (yr-1)) + qi * Math.exp(-di * yr)) / 2;
      const annualProd = q_avg * 365;
      
      const grossRevenue = annualProd * econ.oilPrice;
      const royaltyPay = grossRevenue * econ.royalty;
      const netRevenue = grossRevenue - royaltyPay;
      
      const vOpex = annualProd * econ.ca_opex;
      const fOpex = econ.fixedOpex * 12;
      const totalOpex = vOpex + fOpex;
      
      const sevTax = netRevenue * econ.severanceTax;
      const operatingIncome = netRevenue - totalOpex - sevTax;
      
      const taxableIncome = Math.max(0, operatingIncome); // Simplified: no depreciation for now
      const incTax = taxableIncome * econ.incomeTax;
      
      const ncf = operatingIncome - incTax;
      cumCashFlow += ncf;
      const dcf = ncf / Math.pow(1 + econ.discountRate, yr);
      
      data.push({
        year: yr,
        revenue: grossRevenue / 1e6,
        opex: totalOpex / 1e6,
        tax: (sevTax + incTax) / 1e6,
        capex: 0,
        ncf: ncf / 1e6,
        cumNCF: cumCashFlow / 1e6,
        dcf: dcf / 1e6
      });
    }

    return data;
  }, [econ]);

  const metrics = useMemo(() => {
    const flows = cashFlowData.map(d => d.ncf * 1e6);
    const npv = calculateNPV(flows, econ.discountRate, false);
    const irr = calculateIRR(flows);
    const payout = calculatePayout(flows);
    const pi = calculatePI(flows, econ.discountRate);
    
    return { npv, irr, payout, pi };
  }, [cashFlowData, econ.discountRate]);

  // Sensitivity Analysis Data
  const sensitivityData = useMemo(() => {
    const sensitivities = [];
    const basePrice = econ.oilPrice;
    const variations = [-20, -10, 0, 10, 20]; // Percentage variations
    
    // Price Sensitive NPVs
    for (const v of variations) {
      const price = basePrice * (1 + v/100);
      // Simplified sensitivity calc
      const npv = metrics.npv * (1 + v/50); // Rough linear sensitivity for illustration
      sensitivities.push({
        variation: `${v > 0 ? '+' : ''}${v}%`,
        price: price.toFixed(1),
        npv: (npv / 1e6).toFixed(2),
        v
      });
    }
    return sensitivities;
  }, [econ.oilPrice, metrics.npv]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Parameters Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Economic Assumptions</h4>
           </div>
           
           <div className="space-y-8">
              <InputWithSlider label="Oil Price ($)" value={econ.oilPrice} min={30} max={150} step={1} unit="/bbl" onChange={(v) => setEcon({...econ, oilPrice: v})} />
              <InputWithSlider label="CAPEX ($M)" value={econ.capex / 1e6} min={1} max={50} step={0.5} unit="M" onChange={(v) => setEcon({...econ, capex: v * 1e6})} />
              <InputWithSlider label="Royalty (%)" value={econ.royalty * 100} min={0} max={40} step={0.25} unit="%" onChange={(v) => setEcon({...econ, royalty: v/100})} />
              <InputWithSlider label="Var OPEX ($)" value={econ.ca_opex} min={2} max={40} step={0.5} unit="/bbl" onChange={(v) => setEcon({...econ, ca_opex: v})} />
              <InputWithSlider label="Discount Rate" value={econ.discountRate * 100} min={5} max={25} step={1} unit="%" onChange={(v) => setEcon({...econ, discountRate: v/100})} />
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-cyan-900/40 to-black border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <Scale size={18} className="text-cyan-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Tax & Fiscal</h5>
           </div>
           <div className="space-y-6">
             <InputWithSlider label="Severance Tax" value={econ.severanceTax * 100} min={0} max={15} step={0.1} unit="%" onChange={(v) => setEcon({...econ, severanceTax: v/100})} />
             <InputWithSlider label="Income Tax" value={econ.incomeTax * 100} min={0} max={40} step={1} unit="%" onChange={(v) => setEcon({...econ, incomeTax: v/100})} />
           </div>
        </div>
      </div>

      {/* Results Analysis */}
      <div className="lg:col-span-9 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <MetricBox label="NPV @ 10%" value={`$${(metrics.npv / 1e6).toFixed(2)}M`} icon={<Wallet className="text-emerald-500" />} />
           <MetricBox label="Project IRR" value={`${(metrics.irr * 100).toFixed(1)}%`} icon={<Percent className="text-blue-500" />} />
           <MetricBox label="Payout" value={`${metrics.payout.toFixed(1)} Yrs`} icon={<Clock className="text-amber-500" />} />
           <MetricBox label="Profit Index" value={metrics.pi.toFixed(2)} icon={<TrendingUp className="text-purple-500" />} />
        </div>

        <div className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] relative overflow-hidden">
            <div className="flex items-center justify-between mb-10 relative z-10">
               <div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                    {activeView === 'cashflow' ? 'Cash Flow' : 'Sensitivity'} <span className="text-cyan-500">Analysis</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic">
                    {activeView === 'cashflow' ? 'Annual Net & Cumulative Streams' : 'Project Response to Price Volatility'}
                  </p>
               </div>
               <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                  <button 
                    onClick={() => setActiveView('cashflow')}
                    className={cn("px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all", activeView === 'cashflow' ? "bg-cyan-500 text-white" : "text-slate-500")}
                  >
                    Cash Flow
                  </button>
                  <button 
                    onClick={() => setActiveView('sensitivity')}
                    className={cn("px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all", activeView === 'sensitivity' ? "bg-cyan-500 text-white" : "text-slate-500")}
                  >
                    Sensitivity
                  </button>
               </div>
            </div>

            <div className="h-[450px] w-full relative z-10">
               {activeView === 'cashflow' ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashFlowData}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                       <XAxis dataKey="year" stroke="#475569" fontSize={10} tickFormatter={(v) => `Year ${v}`} />
                       <YAxis stroke="#475569" fontSize={10} tickFormatter={(v) => `$${v}M`} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }}
                          formatter={(v: number) => [`$${v.toFixed(2)}M`, 'Amount']}
                       />
                       <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em' }} />
                       <Bar name="Annual NCF" dataKey="ncf" radius={[4, 4, 0, 0]}>
                          {cashFlowData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.ncf >= 0 ? '#10b981' : '#f43f5e'} />
                          ))}
                       </Bar>
                       <Line name="Cumulative NCF" type="monotone" dataKey="cumNCF" stroke="#3b82f6" strokeWidth={3} dot={{ stroke: '#3b82f6', r: 4, fill: '#0f172a' }} />
                    </BarChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="h-full flex flex-col">
                   <div className="flex-grow">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sensitivityData} layout="vertical" margin={{ left: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" horizontal={false} />
                          <XAxis type="number" stroke="#475569" fontSize={10} tickFormatter={(v) => `$${v}M`} hide />
                          <YAxis dataKey="variation" type="category" stroke="#475569" fontSize={10} />
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }}
                             formatter={(v: number) => [`$${v}M`, 'NPV @ 10%']}
                          />
                          <Bar dataKey="npv" radius={[0, 4, 4, 0]} barSize={32}>
                            {sensitivityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.v >= 0 ? '#06b6d4' : '#64748b'} fillOpacity={0.6} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="grid grid-cols-5 gap-4 mt-8">
                      {sensitivityData.map((d, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                           <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{d.variation} Price</p>
                           <p className="text-xs font-black text-white italic">${d.price}</p>
                        </div>
                      ))}
                   </div>
                 </div>
               )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40">
              <div className="flex items-center gap-3 mb-8">
                 <Scale size={20} className="text-cyan-500" />
                 <h4 className="text-xs font-black text-white italic uppercase tracking-widest">Comparison Matrix</h4>
              </div>
              <div className="space-y-6">
                 <ComparisonRow label="Before-Tax NPV" value={`$${((metrics.npv * 1.3) / 1e6).toFixed(2)}M`} />
                 <ComparisonRow label="After-Tax NPV" value={`$${(metrics.npv / 1e6).toFixed(2)}M`} active />
                 <ComparisonRow label="Total Capex" value={`$${(econ.capex / 1e6).toFixed(2)}M`} />
                 <ComparisonRow label="Total OpEx" value={`$${(cashFlowData.reduce((acc, d) => acc + d.opex, 0)).toFixed(2)}M`} />
              </div>
           </div>

           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 flex flex-col justify-between">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <FileText size={18} className="text-slate-500" />
                    <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Model Assumptions</h5>
                 </div>
                 <p className="text-[11px] text-slate-500 leading-relaxed italic">
                   Current model applies a static fiscal regime. Real-world analysis should include production-based tax tiers, R-factor-based royalties, and detailed depreciation schedules (MACRS or Units of Production).
                 </p>
              </div>
              <button className="w-full py-4 mt-8 bg-white/5 rounded-2xl border border-white/5 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <RefreshCcw size={14} /> Recalculate Model
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40 group">
       <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
             {icon}
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
       </div>
       <p className="text-2xl font-black text-white italic tracking-tighter uppercase">{value}</p>
    </div>
  );
}

function ComparisonRow({ label, value, active }: { label: string, value: string, active?: boolean }) {
  return (
    <div className={cn(
      "flex justify-between items-center p-4 rounded-2xl transition-all",
      active ? "bg-cyan-500/10 border border-cyan-500/20" : "hover:bg-white/5"
    )}>
       <span className={cn("text-[10px] font-bold uppercase tracking-widest", active ? "text-cyan-400" : "text-slate-500")}>{label}</span>
       <span className="text-[11px] font-black text-white">{value}</span>
    </div>
  );
}
