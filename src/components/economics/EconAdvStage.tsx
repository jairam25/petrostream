import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp, DollarSign, BarChart2, FileText, Globe,
  Layers, Zap, Scale, PieChart, Calculator, ShieldAlert,
  Ship, TowerControl, Anchor
} from 'lucide-react';
import { cn } from '../../lib/utils';
import DataFlowIndicator from '../shared/DataFlowIndicator';
import SampleDataLoader from '../shared/SampleDataLoader';
import { getEconomicsSample } from '../../lib/sampleData';
import { EconomicsNeuralSimulator } from './EconomicsNeuralSimulator';

type EconTab = 'ph1' | 'ph2' | 'ph3' | 'ph4' | 'ph5' | 'ph6' | 'ph7' | 'ph8' | 'ph9' | 'ph10' | 'ph11' | 'ph12' | 'ph13' | 'ph14' | 'ph15';

export default function EconAdvStage() {
  const [activeTab, setActiveTab] = useState<EconTab>('ph1');
  const [showAiTerminal, setShowAiTerminal] = useState(true);
  const tabs = [
    { id: 'ph1' as EconTab, label: 'Ph.1: Fiscal Systems', icon: Scale },
    { id: 'ph2' as EconTab, label: 'Ph.2: Cash Flow', icon: TrendingUp },
    { id: 'ph3' as EconTab, label: 'Ph.3: Discounting', icon: Calculator },
    { id: 'ph4' as EconTab, label: 'Ph.4: Indicators', icon: BarChart2 },
    { id: 'ph5' as EconTab, label: 'Ph.5: Risk', icon: PieChart },
    { id: 'ph6' as EconTab, label: 'Ph.6: Price Forecast', icon: TrendingUp },
    { id: 'ph7' as EconTab, label: 'Ph.7: Reserves', icon: Layers },
    { id: 'ph8' as EconTab, label: 'Ph.8: Dev Planning', icon: Calculator },
    { id: 'ph9' as EconTab, label: 'Ph.9: Prod Econ', icon: TrendingUp },
    { id: 'ph10' as EconTab, label: 'Ph.10: Exploration', icon: Globe },
    { id: 'ph11' as EconTab, label: 'Ph.11: Uncertainty', icon: PieChart },
    { id: 'ph12' as EconTab, label: 'Ph.12: Benchmarking', icon: BarChart2 },
    { id: 'ph13' as EconTab, label: 'Ph.13: Carbon Econ', icon: Globe },
    { id: 'ph14' as EconTab, label: 'Ph.14: Int. Econ', icon: Scale },
    { id: 'ph15' as EconTab, label: 'Ph.15: Digital Econ', icon: Zap },
  ];

  return (
    <div className="h-full flex flex-col">
      <DataFlowIndicator activeStage="ECON_ADV" />
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <Calculator className="text-amber-400" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6">Petroleum Economics</span>

        <button
          onClick={() => setShowAiTerminal(!showAiTerminal)}
          className={cn(
            "mr-4 flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-lg hover:scale-105 active:scale-95",
            showAiTerminal ? "bg-amber-500 text-black border-amber-600" : "bg-white/5 border-white/10 text-slate-500"
          )}
        >
          <Zap size={14} className={showAiTerminal ? "fill-black" : ""} />
          {showAiTerminal ? "HIDE AI COCKPIT" : "SHOW AI PREDICTOR"}
        </button>

        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={cn('flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === t.id
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-slate-500 hover:text-white hover:bg-white/5')}>
            <t.icon size={13} />{t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        <AnimatePresence>
          {showAiTerminal && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 32 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <EconomicsNeuralSimulator activeTab={activeTab} onHide={() => setShowAiTerminal(false)} />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {activeTab === 'ph1' && <Phase1FiscalSystems />}
            {activeTab === 'ph2' && <Phase2CashFlow />}
            {activeTab === 'ph3' && <Phase3Discounting />}
            {activeTab === 'ph4' && <Phase4Indicators />}
            {activeTab === 'ph5' && <Phase5Risk />}
            {activeTab === 'ph6' && <Phase6Pricing />}
            {activeTab === 'ph7' && <Phase7Reserves />}
            {activeTab === 'ph8' && <Phase8DevPlanning />}
            {activeTab === 'ph9' && <Phase9ProdEcon />}
            {activeTab === 'ph10' && <Phase10Exploration />}
            {activeTab === 'ph11' && <Phase11Uncertainty />}
            {activeTab === 'ph12' && <Phase12Benchmarking />}
            {activeTab === 'ph13' && <Phase13CarbonEcon />}
            {activeTab === 'ph14' && <Phase14IntEcon />}
            {activeTab === 'ph15' && <Phase15DigitalEcon />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- shared Card ---
function Card({ title, desc, color = 'text-amber-400' }: { title: string; desc: string; color?: string }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 bg-amber-500/5 hover:border-amber-500/30 transition-all">
      <h5 className={cn('text-[11px] font-black uppercase tracking-widest mb-3', color)}>{title}</h5>
      <p className="text-[11px] text-slate-300 leading-relaxed">{desc}</p>
    </div>
  );
}

function MetricRow({ label, value, status }: { label: string; value: string; status?: 'good' | 'warning' | 'bad' }) {
  const statusColor = status === 'good' ? 'text-emerald-400' : status === 'warning' ? 'text-amber-400' : status === 'bad' ? 'text-red-400' : 'text-white';
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={cn("text-[11px] font-black font-mono", statusColor)}>{value}</span>
    </div>
  );
}

// --- Phase 1 ---
function Phase1FiscalSystems() {
  const [sub, setSub] = useState<'1A' | '1B' | '1C' | '1D'>('1A');
  const subs = [
    { id: '1A', name: 'Royalty / Tax', icon: DollarSign },
    { id: '1B', name: 'PSC', icon: Layers },
    { id: '1C', name: 'Service Ctrs', icon: FileText },
    { id: '1D', name: 'Comparison', icon: BarChart2 },
  ];

  const govTake = [
    { country: 'Norway', pct: 78, color: 'bg-blue-500' },
    { country: 'UK (NSTA)', pct: 75, color: 'bg-purple-500' },
    { country: 'Angola (PSC)', pct: 70, color: 'bg-yellow-500' },
    { country: 'US (Fed. OCS)', pct: 60, color: 'bg-green-500' },
    { country: 'US (Texas)', pct: 45, color: 'bg-teal-500' },
    { country: 'UAE (Abu Dhabi)', pct: 85, color: 'bg-orange-500' },
    { country: 'Nigeria (PSC)', pct: 72, color: 'bg-red-500' },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '1A': {
      items: [
        { title: 'Royalty Structure', desc: 'Gross revenue payment to government before cost deductions. NRI = WI x (1 - royalty rate).' },
        { title: 'Bonuses', desc: 'Signature, discovery, and production bonuses are sunk costs.' },
        { title: 'Drilling Deductibility', desc: 'IDC vs Tangible costs. powerful tax incentives for US operators.' },
        { title: 'Income Tax', desc: 'Tax on taxable income after deductions. Ring-fencing prevents cross-license loss sheltering.' },
      ]
    },
    '1B': {
      items: [
        { title: 'PSC Structure', desc: 'Government owns resource; contractor bears cost/risk. Cost Oil vs Profit Oil splits.' },
        { title: 'R-Factor Mechanics', desc: 'Measures project profitability (Cum Revenue / Cum Cost) to trigger sliding scales.' },
        { title: 'FTP & DMO', desc: 'First Tranche Petroleum and Domestic Market Obligations increase front-loading.' },
        { title: 'PSC Variations', desc: 'Indonesian, Angolan, and Nigerian models show varying cost recovery ceilings.' },
      ]
    },
    '1C': {
      items: [
        { title: 'Pure Service Contract', desc: 'Contractor provides technical services for a fixed fee. No ownership stake.' },
        { title: 'Risk Service Contract', desc: 'Contractor bears full exploration risk. Reimbursed costs + fee if successful.' },
        { title: 'Hybrid Models', desc: 'Fee per barrel with performance bonuses. Common in resource-sovereignty restricted states.' },
        { title: 'Contractor Economics', desc: 'predictable revenue but no upside from commodity price appreciation.' },
      ]
    },
    '1D': {
      items: [
        { title: 'Government Take Metric', desc: 'GT = (Total Gov Rev) / (Total Project Rev). Typical range 50-85%.' },
        { title: 'Front-loading vs Back-loading', desc: 'Royalties vs Income tax. Balancing gov revenue security with investment incentive.' },
        { title: 'Progressivity', desc: 'Capturing windfalls at high prices vs regressive systems that penalize efficiency.' },
        { title: 'Stability Clauses', desc: 'Locking fiscal terms to protect long-life project NPV from unilateral changes.' },
      ]
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Scale className="text-amber-500" size={32} />
          Phase 1: Fiscal Systems <span className="text-amber-500/50">& Government Take</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Royalty/Tax · PSC · Service Contracts · Comparison</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card rounded-3xl p-6 border-white/5 bg-[#05070a]">
            <p className="text-[11px] font-black text-amber-400 uppercase tracking-widest mb-5">Typical Government Take by Jurisdiction (%)</p>
            <div className="space-y-4">
              {govTake.map((g, i) => (
                <motion.div
                  key={g.country}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-1 group"
                >
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-wider transition-colors">{g.country}</span>
                    <span className="text-[10px] font-black text-amber-400 font-mono">{g.pct}%</span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                    <motion.div
                      className={cn('h-full rounded-full relative', g.color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${g.pct}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.1 }}
                    >
                      {/* Live Scanning Light */}
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                      {/* Micro-pulse luminosity */}
                      <motion.div
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-white/10"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
            {subs.map(s => (
              <button key={s.id} onClick={() => setSub(s.id as any)}
                className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
                  sub === s.id ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white')}>
                <s.icon size={12} />{s.name}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content[sub].items.map(item => (
                  <Card key={item.title} title={item.title} desc={item.desc} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl sticky top-8">
            <FiscalRegime3D sub={sub} />
            <div className="mt-8 space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 italic">Phase Intelligence</p>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Modeling corporate income tax, royalties, and windfall profit taxes for global assets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function ReservesLadder3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <motion.path d="M 200 50 L 300 250 L 100 250 Z" fill="none" stroke="#f59e0b" strokeWidth="2" strokeOpacity={0.3} />
      <motion.rect
        x="140" y="200" width="120" height="50"
        fill="#10b981" animate={{ fillOpacity: sub === '7A' ? 0.8 : 0.2 }}
      />
      <motion.rect
        x="160" y="150" width="80" height="50"
        fill="#3b82f6" animate={{ fillOpacity: sub === '7B' ? 0.8 : 0.2 }}
      />
      <motion.rect
        x="180" y="100" width="40" height="50"
        fill="#ef4444" animate={{ fillOpacity: sub === '7C' ? 0.8 : 0.2 }}
      />
    </svg>
  );
}

function ProductionDecline3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {sub === '9A' && (
          <motion.g key="9A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Arps Decline Model (DCA)</text>
            <motion.path
              d="M 50 50 Q 100 200 350 250" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeOut" }}
            />
            <motion.circle
              r="6" fill="#f59e0b"
              animate={{ cx: [50, 100, 350], cy: [50, 200, 250] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <line x1="50" y1="250" x2="350" y2="250" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />
          </motion.g>
        )}

        {sub === '9B' && (
          <motion.g key="9B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#fbbf24" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Workover Production Uplift</text>
            {/* Base Decline */}
            <path d="M 50 50 Q 100 150 150 180" fill="none" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.3" strokeDasharray="4 2" />
            {/* Uplift Path */}
            <motion.path
              d="M 50 50 Q 100 150 150 180 L 150 100 Q 200 180 350 220"
              fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}
            />
            <motion.g initial={{ scale: 0 }} animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} transform="translate(150, 100)">
              <Zap className="text-amber-400" size={16} x="-8" y="-8" />
            </motion.g>
          </motion.g>
        )}

        {sub === '9C' && (
          <motion.g key="9C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#ef4444" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Economic Limit Threshold</text>
            <line x1="50" y1="200" x2="350" y2="200" stroke="#ef4444" strokeWidth="2" strokeDasharray="8 4" strokeOpacity="0.5" />
            <text x="340" y="190" fill="#ef4444" fontSize="6" textAnchor="end" className="font-black uppercase">OPEX Limit</text>
            <motion.path
              d="M 50 50 Q 150 100 350 280" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5 }}
            />
            <motion.circle
              cx="225" cy="168" r="8" fill="none" stroke="#ef4444" strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.5 }}
            />
            <text x="230" y="160" fill="white" fontSize="8" className="font-black italic">EXIT POINT</text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function DevPlanning3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {sub === '8A' && (
          <motion.g key="8A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Facility Concept Selector</text>
            {/* 3D-ish Concept Blocks */}
            {[
              { x: 80, y: 120, label: 'FPSO', icon: Ship },
              { x: 200, y: 120, label: 'JACKET', icon: TowerControl },
              { x: 320, y: 120, label: 'SUBSEA', icon: Anchor }
            ].map((concept, i) => (
              <motion.g key={concept.label} transform={`translate(${concept.x - 40}, ${concept.y - 40})`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}>
                <rect x="0" y="0" width="80" height="80" fill="#0f172a" stroke="#475569" strokeWidth="1" rx="12" />
                <motion.rect
                  x="0" y="0" width="80" height="80" fill="#f59e0b" fillOpacity="0.05" rx="12"
                  animate={{ opacity: [0, 0.1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
                <text x="40" y="65" fill="#f59e0b" fontSize="8" textAnchor="middle" className="font-black uppercase">{concept.label}</text>
                <circle cx="40" cy="35" r="15" fill="#f59e0b" fillOpacity="0.1" />
              </motion.g>
            ))}
          </motion.g>
        )}

        {sub === '8B' && (
          <motion.g key="8B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#fbbf24" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Phased Deployment Roadmap</text>
            <line x1="50" y1="150" x2="350" y2="150" stroke="#475569" strokeWidth="2" strokeDasharray="8 4" />
            {[0, 1, 2].map(i => (
              <motion.g key={i} transform={`translate(${80 + i * 100}, 150)`}>
                <motion.circle
                  r="10" fill="#fbbf24"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.5 }}
                />
                <motion.rect
                  x="-20" y="15" width="40" height="15" fill="#fbbf24" fillOpacity="0.2" rx="4"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5 + 0.2 }}
                />
                <text y="25" fill="white" fontSize="6" textAnchor="middle" className="font-black">PHASE {i + 1}</text>
              </motion.g>
            ))}
          </motion.g>
        )}

        {sub === '8C' && (
          <motion.g key="8C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="25" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Integrated Hub Network</text>
            <circle cx="200" cy="170" r="30" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2" />
            <text x="200" y="175" fill="white" fontSize="8" textAnchor="middle" className="font-black">HUB</text>
            {[0, 1, 2, 3].map(i => {
              const angle = (i * 90) * (Math.PI / 180);
              const x2 = 200 + Math.cos(angle) * 100;
              const y2 = 170 + Math.sin(angle) * 100;
              return (
                <g key={i}>
                  <motion.line
                    x1="200" y1="170" x2={x2} y2={y2} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: i * 0.2 }}
                  />
                  <motion.circle
                    cx={x2} cy={y2} r="10" fill="#1e293b" stroke="#3b82f6" strokeWidth="1"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.2 + 0.5 }}
                  />
                </g>
              );
            })}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}
function FiscalRegime3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {sub === '1A' && (
          <motion.g key="1A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Royalty / Tax Waterfall */}
            <text x="200" y="40" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Gross Revenue Waterfall</text>
            {[
              { label: 'ROYALTY', h: 40, c: '#ef4444', y: 60 },
              { label: 'OPEX', h: 30, c: '#3b82f6', y: 105 },
              { label: 'TAXABLE', h: 60, c: '#10b981', y: 140 },
              { label: 'NET PROFIT', h: 40, c: '#f59e0b', y: 205 }
            ].map((block, i) => (
              <motion.g key={block.label} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                <rect x="100" y={block.y} width="200" height={block.h} fill={block.c} fillOpacity="0.1" stroke={block.c} strokeWidth="1" rx="4" />
                <text x="110" y={block.y + block.h / 2 + 3} fill={block.c} fontSize="7" className="font-black uppercase">{block.label}</text>
                <motion.rect
                  x="100" y={block.y} width="4" height={block.h} fill={block.c}
                  animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.g>
            ))}
          </motion.g>
        )}

        {sub === '1B' && (
          <motion.g key="1B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* PSC Split */}
            <text x="200" y="40" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">PSC Production Split</text>
            <rect x="100" y="70" width="200" height="160" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" rx="12" />
            {/* Cost Oil */}
            <motion.rect
              x="110" y="80" width="180" height="60" fill="#3b82f6" fillOpacity="0.2" rx="6"
              animate={{ fillOpacity: [0.1, 0.3, 0.1] }} transition={{ duration: 3, repeat: Infinity }}
            />
            <text x="200" y="115" fill="#3b82f6" fontSize="8" textAnchor="middle" className="font-black italic">COST OIL (RECOVERY)</text>
            {/* Profit Oil */}
            <g transform="translate(110, 150)">
              <rect width="180" height="70" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="1" strokeDasharray="4 2" rx="6" />
              <motion.line
                x1="90" y1="0" x2="90" y2="70" stroke="#10b981" strokeWidth="2"
                animate={{ x: [80, 120, 80] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <text x="45" y="40" fill="#10b981" fontSize="6" textAnchor="middle" className="font-black">GOVT PROFIT</text>
              <text x="135" y="40" fill="#10b981" fontSize="6" textAnchor="middle" className="font-black">CONTRACTOR</text>
            </g>
          </motion.g>
        )}

        {sub === '1C' && (
          <motion.g key="1C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Service CTRS Fee */}
            <text x="200" y="40" fill="#94a3b8" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Technical Service Fee</text>
            <circle cx="200" cy="150" r="80" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />
            <motion.path
              d="M 120 150 A 80 80 0 0 1 280 150" fill="none" stroke="#f59e0b" strokeWidth="12" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 0.7 }} transition={{ duration: 1.5 }}
            />
            <text x="200" y="140" fill="white" fontSize="12" textAnchor="middle" className="font-black italic">$/BBL FEE</text>
            <motion.g animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} style={{ originX: '200px', originY: '150px' }}>
              <circle cx="280" cy="150" r="6" fill="#f59e0b" />
            </motion.g>
          </motion.g>
        )}

        {sub === '1D' && (
          <motion.g key="1D" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Comparison Meter */}
            <text x="200" y="40" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Government Take Meter</text>
            <path d="M 100 220 Q 200 80 300 220" fill="none" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" />
            <motion.path
              d="M 100 220 Q 200 80 300 220" fill="none" stroke="#ef4444" strokeWidth="20" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 0.75 }} transition={{ duration: 2, ease: "easeOut" }}
            />
            <motion.line
              x1="200" y1="220" x2="200" y2="100" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"
              initial={{ rotate: -60 }} animate={{ rotate: 45 }} transition={{ duration: 2, ease: "easeOut" }}
              style={{ originX: '200px', originY: '220px' }}
            />
            <text x="200" y="250" fill="white" fontSize="18" textAnchor="middle" className="font-black italic">75% GT</text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function CashFlow3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {sub === '2A' && (
          <motion.g key="2A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Revenue Streams (P90)</text>
            {[100, 140, 180, 220].map((h, i) => (
              <motion.g key={i}>
                <motion.rect
                  x={80 + i * 70} y={250 - h} width="40" height={h} fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="2" rx="8"
                  initial={{ height: 0, y: 250 }} animate={{ height: h, y: 250 - h }} transition={{ delay: i * 0.1 }}
                />
                <motion.rect
                  x={80 + i * 70} y={250 - h} width="40" height="4" fill="#10b981"
                  animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                />
              </motion.g>
            ))}
          </motion.g>
        )}

        {sub === '2B' && (
          <motion.g key="2B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#ef4444" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">CAPEX Investment Outflow</text>
            {[220, 180, 100, 40].map((h, i) => (
              <motion.rect
                key={i} x={80 + i * 70} y={50} width="40" height={h} fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="2" rx="8"
                initial={{ height: 0 }} animate={{ height: h }} transition={{ delay: i * 0.1 }}
              />
            ))}
            <motion.path
              d="M 80 50 Q 200 280 350 150" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
            />
          </motion.g>
        )}

        {sub === '2C' && (
          <motion.g key="2C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">OPEX Efficiency Baseline</text>
            <rect x="50" y="150" width="300" height="40" fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="1" rx="8" />
            <motion.rect
              x="50" y="150" width="4" height="40" fill="#3b82f6"
              animate={{ x: [50, 346, 50] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <text x="200" y="175" fill="white" fontSize="8" textAnchor="middle" className="font-black italic">$/BBL LIFTING COST</text>
          </motion.g>
        )}

        {sub === '2D' && (
          <motion.g key="2D" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#94a3b8" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">ABEX Decommissioning Spike</text>
            {[20, 20, 20, 200].map((h, i) => (
              <motion.rect
                key={i} x={80 + i * 70} y={250 - h} width="40" height={h} fill="#94a3b8" fillOpacity="0.2" stroke="#94a3b8" strokeWidth="2" rx="8"
                initial={{ height: 0, y: 250 }} animate={{ height: h, y: 250 - h }} transition={{ delay: i * 0.1 }}
              />
            ))}
            {sub === '2D' && <ShieldAlert className="text-slate-500" size={32} x="294" y="20" />}
          </motion.g>
        )}

        {sub === '2E' && (
          <motion.g key="2E" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Working Capital Liquidity</text>
            <motion.path
              d="M 50 150 Q 125 50 200 150 T 350 150" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"
              animate={{
                d: [
                  "M 50 150 Q 125 50 200 150 T 350 150",
                  "M 50 150 Q 125 250 200 150 T 350 150",
                  "M 50 150 Q 125 50 200 150 T 350 150"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <circle cx="200" cy="150" r="10" fill="#f59e0b" fillOpacity="0.2" />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}





function Benchmarking3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {sub === '12A' && (
          <motion.g key="12A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="25" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Global Play Breakeven Analysis</text>

            {/* Main X-Axis at Bottom */}
            <line x1="40" y1="260" x2="360" y2="260" stroke="#475569" strokeWidth="2" />

            {/* Market Price Baseline ($70) */}
            <motion.line
              x1="40" y1="120" x2="360" y2="120" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            />
            <text x="360" y="115" fill="#ef4444" fontSize="6" textAnchor="end" className="font-black">MARKET PRICE ($70)</text>

            {[
              { x: 50, w: 70, h: 70, l: 'SHALE', c: '#10b981' },
              { x: 120, w: 80, h: 90, l: 'OFFSHORE', c: '#10b981' },
              { x: 200, w: 90, h: 110, l: 'DEEPWATER', c: '#10b981' },
              { x: 290, w: 60, h: 150, l: 'OIL SANDS', c: '#ef4444' }
            ].map((p, i) => (
              <motion.g key={p.l}>
                <motion.rect
                  x={p.x} y={260 - p.h} width={p.w} height={p.h} fill={p.c} fillOpacity="0.15" stroke={p.c} strokeWidth="1.5"
                  initial={{ height: 0, y: 260 }} animate={{ height: p.h, y: 260 - p.h }} transition={{ duration: 1, delay: i * 0.1 }}
                />
                <rect x={p.x} y={260 - p.h} width={p.w} height="4" fill={p.c} />
                <text x={p.x + p.w / 2} y={275} fill="white" fontSize="6" textAnchor="middle" className="font-black uppercase tracking-tighter opacity-50">{p.l}</text>
                <text x={p.x + p.w / 2} y={255 - p.h} fill={p.c} fontSize="7" textAnchor="middle" className="font-bold italic">${p.h / 2}</text>
              </motion.g>
            ))}
          </motion.g>
        )}

        {sub === '12B' && (
          <motion.g key="12B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#fbbf24" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Lifting Cost Efficiency Gauge</text>
            <path d="M 100 220 Q 200 80 300 220" fill="none" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" />
            <motion.path
              d="M 100 220 Q 200 80 300 220" fill="none" stroke="#10b981" strokeWidth="20" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 0.65 }} transition={{ duration: 2, ease: "easeOut" }}
            />
            <motion.line
              x1="200" y1="220" x2="200" y2="100" stroke="white" strokeWidth="4" strokeLinecap="round"
              initial={{ rotate: -60 }} animate={{ rotate: 30 }} transition={{ duration: 2, ease: "easeOut" }}
              style={{ originX: '200px', originY: '220px' }}
            />
            <text x="200" y="250" fill="white" fontSize="14" textAnchor="middle" className="font-black italic">TOP QUARTILE</text>
          </motion.g>
        )}

        {sub === '12C' && (
          <motion.g key="12C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Corporate Capital Allocation</text>
            <circle cx="200" cy="150" r="70" fill="none" stroke="#1e293b" strokeWidth="20" />
            <motion.circle
              cx="200" cy="150" r="70" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="440"
              initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: 150 }} transition={{ duration: 2 }}
            />
            <motion.circle
              cx="200" cy="150" r="70" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="440"
              initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: 350 }} transition={{ duration: 2, delay: 0.5 }}
            />
            <text x="200" y="145" fill="white" fontSize="10" textAnchor="middle" className="font-black uppercase">DIVIDENDS</text>
            <text x="200" y="165" fill="#3b82f6" fontSize="8" textAnchor="middle" className="font-black italic">REINVESTMENT</text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}


function CarbonTax3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {sub === '13A' && (
          <motion.g key="13A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Carbon Price Horizon</text>
            <path d="M 50 250 L 350 250 M 50 250 L 50 50" stroke="#475569" strokeWidth="1" strokeOpacity="0.3" />

            {/* Smooth Area Curve */}
            <motion.path
              d="M 50 250 Q 150 240 250 150 T 350 80 L 350 250 Z" fill="#10b981" fillOpacity="0.1"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
            />
            <motion.path
              d="M 50 250 Q 150 240 250 150 T 350 80" fill="none" stroke="#10b981" strokeWidth="3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
            />

            {[
              { x: 50, y: 250, l: '$0' },
              { x: 150, y: 240, l: '$25' },
              { x: 250, y: 150, l: '$75' },
              { x: 350, y: 80, l: '$150' }
            ].map((p, i) => (
              <motion.g key={i}>
                <circle cx={p.x} cy={p.y} r="3" fill="#10b981" />
                <text x={p.x} y={p.y - 10} fill="white" fontSize="8" textAnchor="middle" className="font-black italic">{p.l}</text>
              </motion.g>
            ))}
            <text x="200" y="275" fill="#475569" fontSize="8" textAnchor="middle" className="font-black tracking-widest">REGULATORY ESCALATION (2025-2050)</text>
          </motion.g>
        )}

        {sub === '13B' && (
          <motion.g key="13B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#ef4444" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Stranded Asset Audit</text>
            <circle cx="200" cy="150" r="80" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.3" />

            {/* Scanning Lens */}
            <motion.g animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} style={{ originX: '200px', originY: '150px' }}>
              <line x1="200" y1="150" x2="280" y2="150" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.5" />
              <circle cx="280" cy="150" r="4" fill="#ef4444" />
            </motion.g>

            {[...Array(6)].map((_, i) => (
              <motion.circle
                key={i} cx={200 + Math.cos(i) * 50} cy={150 + Math.sin(i) * 50} r="10"
                fill={i % 2 === 0 ? "#ef4444" : "#475569"} fillOpacity="0.3"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
            <text x="200" y="250" fill="#ef4444" fontSize="8" textAnchor="middle" className="font-black italic">HIGH EMISSION INTENSITY RISK</text>
          </motion.g>
        )}

        {sub === '13C' && (
          <motion.g key="13C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">H2 Transition Flow</text>

            <g transform="translate(80, 150)">
              <rect x="-30" y="-30" width="60" height="60" fill="#1e293b" stroke="#3b82f6" rx="12" />
              <text y="5" fill="#3b82f6" fontSize="8" textAnchor="middle" className="font-black uppercase">Blue H2</text>
            </g>

            <g transform="translate(320, 150)">
              <rect x="-30" y="-30" width="60" height="60" fill="#1e293b" stroke="#10b981" rx="12" />
              <text y="5" fill="#10b981" fontSize="8" textAnchor="middle" className="font-black uppercase">Green H2</text>
            </g>

            {/* Particle Flow */}
            {[0, 1, 2].map(i => (
              <motion.circle
                key={i} r="3" fill="#3b82f6"
                animate={{
                  cx: [110, 290],
                  cy: [150, 150],
                  opacity: [0, 1, 0],
                  fill: ["#3b82f6", "#10b981"]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 1 }}
              />
            ))}
            <path d="M 110 150 L 290 150" stroke="white" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.2" />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function IntEcon3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {sub === '14A' && (
          <motion.g key="14A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Geopolitical Risk Radar</text>
            <circle cx="200" cy="150" r="80" fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.2" />
            <circle cx="200" cy="150" r="50" fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.1" />

            <motion.path
              d="M 200 70 L 260 120 L 250 200 L 150 210 L 130 130 Z" fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="2"
              animate={{
                d: [
                  "M 200 70 L 260 120 L 250 200 L 150 210 L 130 130 Z",
                  "M 200 80 L 240 130 L 230 190 L 160 200 L 140 140 Z",
                  "M 200 70 L 260 120 L 250 200 L 150 210 L 130 130 Z"
                ]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <text x="200" y="260" fill="white" fontSize="8" textAnchor="middle" className="font-black uppercase opacity-50">Stability Index: HIGH</text>
          </motion.g>
        )}

        {sub === '14B' && (
          <motion.g key="14B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">JV Equity Distribution</text>
            <circle cx="200" cy="150" r="70" fill="none" stroke="#1e293b" strokeWidth="20" />
            <motion.circle
              cx="200" cy="150" r="70" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="440"
              initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: 176 }} transition={{ duration: 2 }}
            />
            <text x="200" y="145" fill="white" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-tighter">OPERATOR (60%)</text>
            <text x="200" y="165" fill="#10b981" fontSize="8" textAnchor="middle" className="font-black italic">PARTNER SPLIT</text>
          </motion.g>
        )}

        {sub === '14C' && (
          <motion.g key="14C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Cross-Border Repatriation</text>
            <rect x="50" y="100" width="80" height="100" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" rx="8" />
            <text x="90" y="155" fill="white" fontSize="6" textAnchor="middle" className="font-black">LOCAL SPV</text>

            <motion.path
              d="M 130 150 L 270 150" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4"
              animate={{ strokeDashoffset: [0, -20] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />

            <rect x="270" y="100" width="80" height="100" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" rx="8" />
            <text x="310" y="155" fill="white" fontSize="6" textAnchor="middle" className="font-black">HQ HOLDCO</text>
            <text x="200" y="145" fill="#f59e0b" fontSize="8" textAnchor="middle" className="font-black uppercase italic">DIVIDEND FLOW</text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function DigitalTwinEcon3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {sub === '15A' && (
          <motion.g key="15A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#0ea5e9" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">ML Prediction Network</text>
            {[0, 1, 2].map(col => (
              <g key={col} transform={`translate(${100 + col * 100}, 0)`}>
                {[...Array(col === 1 ? 4 : 2)].map((_, row) => (
                  <motion.circle
                    key={row} cx="0" cy={150 + (row * 40) - (col === 1 ? 60 : 20)} r="5" fill="#0ea5e9"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: col * 0.2 }}
                  />
                ))}
              </g>
            ))}
            <motion.path
              d="M 100 130 L 200 90 M 100 170 L 200 210" stroke="#0ea5e9" strokeWidth="1" strokeOpacity="0.3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
            />
          </motion.g>
        )}

        {sub === '15B' && (
          <motion.g key="15B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#a855f7" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Digital Twin Sync Mirror</text>
            <rect x="80" y="80" width="100" height="140" fill="#a855f7" fillOpacity="0.1" stroke="#a855f7" strokeWidth="1" rx="8" />
            <rect x="220" y="80" width="100" height="140" fill="#a855f7" fillOpacity="0.1" stroke="#a855f7" strokeWidth="1" rx="8" strokeDasharray="4 4" />
            <motion.path d="M 180 150 L 220 150" stroke="#a855f7" strokeWidth="2" animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1 }} />
            <motion.circle cx="130" cy="150" r="20" fill="none" stroke="#a855f7" strokeWidth="2" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
            <motion.circle cx="270" cy="150" r="20" fill="none" stroke="#a855f7" strokeWidth="2" strokeOpacity="0.5" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
          </motion.g>
        )}

        {sub === '15C' && (
          <motion.g key="15C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Automation Control Loop</text>
            <circle cx="200" cy="150" r="30" fill="#f59e0b" fillOpacity="0.1" stroke="#f59e0b" strokeWidth="1" />
            <motion.circle cx="200" cy="150" r="60" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="40 20" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} />
            <motion.circle cx="200" cy="150" r="80" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="5 15" strokeOpacity="0.4" animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }} />
            <motion.path d="M 120 150 L 170 150 M 230 150 L 280 150" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            <text x="200" y="155" fill="white" fontSize="8" textAnchor="middle" className="font-black">RPA CORE</text>
          </motion.g>
        )}

      </AnimatePresence>
    </svg>
  );
}

// --- Phases 2-9 Stubs (To be expanded) ---
function Phase2CashFlow() {
  const [sub, setSub] = useState<'2A' | '2B' | '2C' | '2D' | '2E'>('2A');
  const subs = [
    { id: '2A', name: 'Revenue', icon: TrendingUp },
    { id: '2B', name: 'CAPEX', icon: Zap },
    { id: '2C', name: 'OPEX', icon: BarChart2 },
    { id: '2D', name: 'ABEX', icon: Globe },
    { id: '2E', name: 'Working Cap', icon: PieChart },
  ];

  const opexBenchmarks = [
    { env: 'Onshore Conv.', low: 5, high: 15, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' },
    { env: 'Offshore Shelf', low: 10, high: 25, color: 'text-blue-400    border-blue-500/30    bg-blue-500/5' },
    { env: 'Deepwater', low: 15, high: 40, color: 'text-purple-400  border-purple-500/30  bg-purple-500/5' },
    { env: 'Oil Sands', low: 20, high: 40, color: 'text-orange-400  border-orange-500/30  bg-orange-500/5' },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '2A': {
      items: [
        { title: 'Oil Revenue - Pricing', desc: 'Realised price = benchmark (WTI, Brent) +/- quality/location differentials.' },
        { title: 'Gas Revenue - Benchmarks', desc: 'Henry Hub, NBP, TTF, JKM. Calorific value adjustments.' },
        { title: 'NGL & Condensate', desc: 'Ethane, Propane, Butane, Natural Gasoline pricing mechanics.' },
        { title: 'Hedging Strategies', desc: 'Swaps, Collars, and Puts for downside protection.' },
      ]
    },
    '2B': {
      items: [
        { title: 'Exploration CAPEX', desc: 'Seismic and wildcat well costs. G&G studies.' },
        { title: 'Development CAPEX', desc: 'Wells, flowlines, and processing facilities (CPF/FPSO).' },
        { title: 'CAPEX Phasing', desc: 'Time-value impact of front-loaded investment schedules.' },
        { title: 'AACE Classification', desc: 'Estimate accuracy from Class 5 (concept) to Class 1 (definitive).' },
      ]
    },
    '2C': {
      items: [
        { title: 'Fixed vs Variable OPEX', desc: 'manning/maintenance (fixed) vs chemicals/power (variable).' },
        { title: 'OPEX Benchmarking', desc: '$5-15/BOE (onshore) to $15-40/BOE (deepwater).' },
        { title: 'Well Intervention', desc: 'Workovers, ESP replacements, and well integrity testing.' },
        { title: 'Economic Limit', desc: 'The point where daily OPEX exceeds daily revenue.' },
      ]
    },
    '2D': {
      items: [
        { title: 'Well P&A Costs', desc: 'Plugging and abandonment regulatory requirements and costs.' },
        { title: 'Facility Decommissioning', desc: 'Topsides removal, jacket toppling, and rigs-to-reefs options.' },
        { title: 'Pipeline Abandonment', desc: 'Flush, cap, and leave-in-place vs full removal.' },
        { title: 'ARO Accrual', desc: 'Asset Retirement Obligation accounting and tax deductibility.' },
      ]
    },
    '2E': {
      items: [
        { title: 'Accounts Receivable/Payable', desc: 'Cash cycle timing for oil sales and service invoices.' },
        { title: 'Inventory Management', desc: 'Linefill, tank storage, and critical spare parts capital.' },
        { title: 'Joint Venture Cash Calls', desc: 'Operator vs Non-operator funding cycles.' },
        { title: 'Farm-out Promotes', desc: 'Carried interest and payout mechanics in partnership deals.' },
      ]
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <TrendingUp className="text-amber-500" size={32} />
          Phase 2: Cash Flow <span className="text-amber-500/50">Modeling</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Revenue · CAPEX · OPEX · ABEX · Working Capital</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {opexBenchmarks.map(b => (
              <div key={b.env} className={cn('p-4 rounded-2xl border transition-all text-center', b.color)}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">{b.env}</p>
                <p className="text-sm font-black italic">${b.low}-{b.high}</p>
              </div>
            ))}
          </div>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
            {subs.map(s => (
              <button key={s.id} onClick={() => setSub(s.id as any)}
                className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
                  sub === s.id ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white')}>
                <s.icon size={12} />{s.name}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content[sub].items.map(item => (
                  <Card key={item.title} title={item.title} desc={item.desc} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl sticky top-8 text-center">
            <CashFlow3D sub={sub} />
            <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 text-left">
              <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4 italic">Cash Analytics</h4>
              <MetricRow label="Peak Exposure" value="$420M" status="warning" />
              <MetricRow label="Cumulative CF" value="+$1.2B" status="good" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Phase3Discounting() {
  const [sub, setSub] = useState<'3A' | '3B' | '3C'>('3A');
  const subs = [
    { id: '3A', name: 'Fundamentals', icon: Calculator },
    { id: '3B', name: 'Discount Rate', icon: BarChart2 },
    { id: '3C', name: 'Multi-Currency', icon: Globe },
  ];

  const waccComponents = [
    { name: 'Risk-Free Rate', value: '3-5%', color: 'text-blue-400' },
    { name: 'Equity Premium', value: '4-7%', color: 'text-purple-400' },
    { name: 'Beta (beta)', value: '0.8-1.5', color: 'text-yellow-400' },
    { name: 'Cost of Debt', value: '5-9%', color: 'text-emerald-400' },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '3A': {
      items: [
        { title: 'Present Value (PV)', desc: 'PV = FV / (1+r)^n. Time value of money basics.' },
        { title: 'Discrete vs Continuous', desc: 'End-of-year vs mid-year discounting conventions.' },
        { title: 'Inflation Consistency', desc: 'Matching nominal cash flows with nominal discount rates.' },
      ]
    },
    '3B': {
      items: [
        { title: 'WACC', desc: 'Blended cost of equity and debt. Tax shield impacts.' },
        { title: 'CAPM', desc: 'Calculating cost of equity using beta and risk premiums.' },
        { title: 'Country Risk', desc: 'CRP added for volatile international jurisdictions.' },
        { title: 'Hurdle Rates', desc: 'Minimum acceptable IRR for project approval.' },
      ]
    },
    '3C': {
      items: [
        { title: 'Exchange Rates', desc: 'PPP modeling for long-term currency forecasts.' },
        { title: 'Currency Hedging', desc: 'Forwards and swaps for local currency exposure.' },
      ]
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Calculator className="text-amber-500" size={32} />
          Phase 3: Time Value <span className="text-amber-500/50">of Money</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">PV · WACC · Hurdle Rates · Multi-Currency</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card rounded-3xl p-6 border-white/5 bg-[#05070a]">
            <p className="text-[11px] font-black text-amber-400 uppercase tracking-widest mb-4">WACC Components</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {waccComponents.map(w => (
                <div key={w.name}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{w.name}</p>
                  <p className={cn("text-lg font-black font-mono", w.color)}>{w.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
            {subs.map(s => (
              <button key={s.id} onClick={() => setSub(s.id as any)}
                className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
                  sub === s.id ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white')}>
                <s.icon size={12} />{s.name}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content[sub].items.map(item => (
                  <Card key={item.title} title={item.title} desc={item.desc} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl sticky top-8 text-center">
            <Discounting3D sub={sub} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Phase4Indicators() {
  const [sub, setSub] = useState<'4A' | '4B' | '4C' | '4D'>('4A');
  const subs = [
    { id: '4A', name: 'NPV', icon: TrendingUp },
    { id: '4B', name: 'IRR', icon: Zap },
    { id: '4C', name: 'Payout', icon: BarChart2 },
    { id: '4D', name: 'PI / UTC', icon: PieChart },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '4A': {
      items: [
        { title: 'Net Present Value', desc: 'Absolute measure of value creation. NPV > 0 for project approval.' },
        { title: 'Expected Monetary Value', desc: 'Probability-weighted NPV for exploration risking.' },
      ]
    },
    '4B': {
      items: [
        { title: 'Internal Rate of Return', desc: 'The discount rate that forces NPV to zero.' },
        { title: 'Modified IRR', desc: 'Resolves reinvestment flaws in standard IRR calculations.' },
      ]
    },
    '4C': {
      items: [
        { title: 'Payout Time', desc: 'Duration until investment is fully recovered.' },
        { title: 'Discounted Payout', desc: 'Recovery timing adjusted for time-value.' },
      ]
    },
    '4D': {
      items: [
        { title: 'Profitability Index', desc: 'Value created per dollar invested. Used for capital rationing.' },
        { title: 'Unit Technical Cost', desc: 'Long-term breakeven price (CAPEX+OPEX)/Total Prod.' },
      ]
    },
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
        <BarChart2 className="text-amber-500" size={32} />
        Phase 4: Indicators <span className="text-amber-500/50">& KPIs</span>
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
            {subs.map(s => (
              <button key={s.id} onClick={() => setSub(s.id as any)}
                className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
                  sub === s.id ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white')}>
                <s.icon size={12} />{s.name}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content[sub].items.map(item => (
                  <Card key={item.title} title={item.title} desc={item.desc} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="lg:col-span-1">
          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl sticky top-8 text-center">
            <EconomicIndicators3D sub={sub} />
            <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 text-left">
              <MetricRow label="NPV Rule" value="> 0" status="good" />
              <MetricRow label="IRR Hurdle" value="15%" status="warning" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Phase5Risk() {
  const [sub, setSub] = useState<'5A' | '5B' | '5C' | '5D'>('5A');
  const subs = [
    { id: '5A', name: 'Sensitivity', icon: BarChart2 },
    { id: '5B', name: 'Monte Carlo', icon: PieChart },
    { id: '5C', name: 'Decision Trees', icon: Layers },
    { id: '5D', name: 'Real Options', icon: Zap },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '5A': {
      items: [
        { title: 'Tornado Charts', desc: 'Identifies key value drivers by horizontal range analysis.' },
        { title: 'Spider Diagrams', desc: 'Cross-impact analysis of variables on project NPV.' },
      ]
    },
    '5B': {
      items: [
        { title: 'Stochastic Simulation', desc: 'Monte Carlo runs to generate S-curve distributions.' },
        { title: 'P90 / P50 / P10', desc: 'Quantifying uncertainty ranges for management decisions.' },
      ]
    },
    '5C': {
      items: [
        { title: 'Expected Value', desc: 'Sequential decision logic and chance node evaluation.' },
        { title: 'Value of Information', desc: 'Calculating the maximum budget for data acquisition.' },
      ]
    },
    '5D': {
      items: [
        { title: 'Flexibility Value', desc: 'Option to defer, expand, or abandon project stages.' },
        { title: 'Lattice Models', desc: 'Binomial valuation for staged development optionality.' },
      ]
    },
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
        <PieChart className="text-amber-500" size={32} />
        Phase 5: Risk <span className="text-amber-500/50">& Uncertainty</span>
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
            {subs.map(s => (
              <button key={s.id} onClick={() => setSub(s.id as any)}
                className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
                  sub === s.id ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white')}>
                <s.icon size={12} />{s.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content[sub].items.map(item => <Card key={item.title} title={item.title} desc={item.desc} />)}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl sticky top-8 text-center">
            <RiskTornado3D sub={sub} />
          </div>
        </div>
      </div>
    </div>
  );
}
function Phase6Pricing() {
  const [sub, setSub] = useState<'6A' | '6B' | '6C'>('6A');
  const subs = [
    { id: '6A', name: 'Forecasts', icon: TrendingUp },
    { id: '6B', name: 'Differentials', icon: Calculator },
    { id: '6C', name: 'Gas Hubs', icon: Globe },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '6A': {
      items: [
        { title: 'Long-term Forecasts', desc: 'Forward curves vs analyst consensus. Brent/WTI equilibrium.' },
        { title: 'Volatility Modeling', desc: 'Stochastic price paths for risk-adjusted valuations.' },
      ]
    },
    '6B': {
      items: [
        { title: 'API & Sulfur', desc: 'Light-sweet premiums and heavy-sour discounts.' },
        { title: 'Location Basis', desc: 'Pipeline tariffs and netback adjustments from regional hubs.' },
      ]
    },
    '6C': {
      items: [
        { title: 'Global Hubs', desc: 'Henry Hub, NBP, TTF, and JKM LNG spot pricing.' },
        { title: 'Oil Indexation', desc: 'Transition from oil-linked to hub-linked gas contracts.' },
      ]
    },
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-white italic tracking-tighter">Phase 6: Price Forecasting</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit gap-1">
            {subs.map(s => (
              <button key={s.id} onClick={() => setSub(s.id as any)}
                className={cn('px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all',
                  sub === s.id ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white')}>
                {s.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content[sub].items.map(item => <Card key={item.title} title={item.title} desc={item.desc} />)}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl sticky top-8 text-center">
            <PriceCurve3D sub={sub} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Phase7Reserves() {
  const [sub, setSub] = useState<'7A' | '7B' | '7C'>('7A');
  const subs = [
    { id: '7A', name: 'Classification', icon: Layers },
    { id: '7B', name: 'Entitlement', icon: Scale },
    { id: '7C', name: 'Maturation', icon: TrendingUp },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '7A': {
      items: [
        { title: 'PRMS Framework', desc: '1P (Proved), 2P (Probable), and 3P (Possible) reserves definitions.' },
        { title: 'Contingent Resources', desc: 'Hydrocarbons discovered but not yet commercially viable.' },
      ]
    },
    '7B': {
      items: [
        { title: 'Working Interest', desc: 'Reserves share based on equity participation.' },
        { title: 'Net Entitlement', desc: 'Barrel share after royalty and government profit oil splits.' },
      ]
    },
    '7C': {
      items: [
        { title: 'Reserve Maturation', desc: 'Moving volumes from 2C to 2P through appraisal and FID.' },
        { title: 'SEC Reporting', desc: 'Standardized reserve disclosure rules for listed entities.' },
      ]
    },
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-white italic tracking-tighter">Phase 7: Reserves Economics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit gap-1">
            {subs.map(s => (
              <button key={s.id} onClick={() => setSub(s.id as any)}
                className={cn('px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all',
                  sub === s.id ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white')}>
                {s.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content[sub].items.map(item => <Card key={item.title} title={item.title} desc={item.desc} />)}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl sticky top-8 text-center">
            <ReservesLadder3D sub={sub} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Phase8DevPlanning() {
  const [sub, setSub] = useState<'8A' | '8B' | '8C'>('8A');
  const subs = [
    { id: '8A', name: 'Concepts', icon: Zap },
    { id: '8B', name: 'Phasing', icon: Layers },
    { id: '8C', name: 'Integration', icon: Globe },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '8A': {
      items: [
        { title: 'Concept Selection', desc: 'Choosing between FPSO, TLP, or subsea tie-back options.' },
        { title: 'Technical vs Econ', desc: 'Balancing reservoir recovery with upfront capital intensity.' },
      ]
    },
    '8B': {
      items: [
        { title: 'Phased Development', desc: 'Managing risk by starting small and expanding modularly.' },
        { title: 'Plateau Optimization', desc: 'Determining the optimal facility size for field life NPV.' },
      ]
    },
    '8C': {
      items: [
        { title: 'Surface Network', desc: 'Integrated modeling of multiple reservoirs and host facilities.' },
      ]
    },
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-white italic tracking-tighter">Phase 8: Development Planning</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit gap-1">
            {subs.map(s => (
              <button key={s.id} onClick={() => setSub(s.id as any)}
                className={cn('px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all',
                  sub === s.id ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white')}>
                {s.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content[sub].items.map(item => <Card key={item.title} title={item.title} desc={item.desc} />)}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl sticky top-8 text-center">
            <DevPlanning3D sub={sub} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Phase9ProdEcon() {
  const [sub, setSub] = useState<'9A' | '9B' | '9C'>('9A');
  const subs = [
    { id: '9A', name: 'Decline Curves', icon: TrendingUp },
    { id: '9B', name: 'Workovers', icon: Zap },
    { id: '9C', name: 'Economic Limit', icon: ShieldAlert },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '9A': {
      items: [
        { title: 'DCA Analysis', desc: 'Arps hyperbolic and exponential decline model forecasting.' },
        { title: 'Type Curves', desc: 'Statistical well performance normalization for shale plays.' },
      ]
    },
    '9B': {
      items: [
        { title: 'Production Uplift', desc: 'Evaluating IRR of ESP swaps and stimulation campaigns.' },
        { title: 'Maintenance Capex', desc: 'Capital allocated to offset natural field decline.' },
      ]
    },
    '9C': {
      items: [
        { title: 'Abandonment Timing', desc: 'Calculating the exact date of project termination.' },
        { title: 'Incremental NPV', desc: 'Value of life extension vs immediate decommissioning.' },
      ]
    },
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-white italic tracking-tighter">Phase 9: Production Economics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit gap-1">
            {subs.map(s => (
              <button key={s.id} onClick={() => setSub(s.id as any)}
                className={cn('px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all',
                  sub === s.id ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white')}>
                {s.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content[sub].items.map(item => <Card key={item.title} title={item.title} desc={item.desc} />)}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl sticky top-8 text-center">
            <ProductionDecline3D sub={sub} />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Phase 10 ---
function Phase10Exploration() {
  const [sub, setSub] = useState<'10A' | '10B' | '10C' | '10D'>('10A');
  const subs = [
    { id: '10A', name: 'Prospect Eval', icon: PieChart },
    { id: '10B', name: 'Portfolio', icon: Layers },
    { id: '10C', name: 'Bid Rounds', icon: Calculator },
    { id: '10D', name: 'Strategy', icon: Globe },
  ];

  const posComponents = [
    { factor: 'Source (Charge)', prob: '0.80', color: 'text-emerald-400' },
    { factor: 'Reservoir Presence', prob: '0.70', color: 'text-blue-400' },
    { factor: 'Trap Geometry', prob: '0.60', color: 'text-purple-400' },
    { factor: 'Seal Effectiveness', prob: '0.75', color: 'text-yellow-400' },
    { factor: 'Migration Timing', prob: '0.90', color: 'text-orange-400' },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '10A': {
      items: [
        { title: 'Chance of Success (COS)', desc: 'Geological COS is the product of independent subsurface probabilities: Source x Reservoir x Trap x Seal x Timing. If any factor is 0, the prospect is dry.' },
        { title: 'Resource Estimation', desc: 'Volumetric calculation using Monte Carlo simulation for uncertain parameters (P90/P50/P10).' },
        { title: 'EMV & Dry Hole Cost', desc: 'EMV = [COS x NPV(success)] - [(1-COS) x Dry Hole Cost]. Drill only if EMV > 0.' },
      ]
    },
    '10B': {
      items: [
        { title: 'Portfolio Diversification', desc: 'A portfolio of 10 independent 20% COS prospects has an 89% chance of at least one discovery.' },
        { title: 'Play vs Prospect Risk', desc: 'Conditional probability modeling where play failure results in concurrent prospect failure.' },
        { title: 'Creaming Curve', desc: 'Cumulative discovered volume vs wells drilled to assess basin maturity.' },
      ]
    },
    '10C': {
      items: [
        { title: 'Signature Bonuses', desc: 'Upfront cash paid to win the block in competitive bid rounds.' },
        { title: 'License Terms', desc: 'Exploration periods and relinquishment clauses (drill or drop decisions).' },
      ]
    },
    '10D': {
      items: [
        { title: 'Frontier vs Near-Field', desc: 'High-risk billion-barrel potential vs low-risk tie-back economics.' },
        { title: 'Farm-in Promotes', desc: 'Strategies to earn equity by paying a disproportionate share of well costs.' },
      ]
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Globe className="text-amber-500" size={32} />
          Phase 10: Exploration <span className="text-amber-500/50">Economics</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Prospect Risking · Portfolios · Bid Rounds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card rounded-3xl p-6 border-white/5 bg-[#05070a]">
            <p className="text-[11px] font-black text-amber-400 uppercase tracking-widest mb-4">Geological COS Multiplication</p>
            <div className="flex flex-wrap items-center gap-3">
              {posComponents.map((pc, i) => (
                <React.Fragment key={pc.factor}>
                  <div className="text-center">
                    <p className={cn("text-lg font-black font-mono", pc.color)}>{pc.prob}</p>
                    <p className="text-[11px] text-slate-500 font-bold uppercase mt-1">{pc.factor}</p>
                  </div>
                  {i < posComponents.length - 1 && <span className="text-slate-600 font-black text-lg">x</span>}
                </React.Fragment>
              ))}
              <span className="text-white font-black text-lg mx-2">=</span>
              <div className="text-center bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20">
                <p className="text-xl font-black text-amber-400 font-mono">22.6%</p>
              </div>
            </div>
          </div>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
            {subs.map(s => (
              <button key={s.id} onClick={() => setSub(s.id as any)}
                className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
                  sub === s.id ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white')}>
                <s.icon size={12} />{s.name}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content[sub].items.map(item => (
                  <Card key={item.title} title={item.title} desc={item.desc} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl sticky top-8 text-center">
            <ExplorationRisk3D sub={sub} />
            <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 text-left">
              <MetricRow label="Geological POS" value="22.6%" status="warning" />
              <MetricRow label="Risked EMV" value="+$45M" status="good" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Phases 11-15 Stubs ---
function Phase11Uncertainty() {
  const [sub, setSub] = useState<'11A' | '11B' | '11C' | '11D'>('11A');
  const subs = [
    { id: '11A', name: 'Cost Estimation', icon: DollarSign },
    { id: '11B', name: 'Schedule Risk', icon: Calculator },
    { id: '11C', name: 'Reservoir Unc.', icon: Layers },
    { id: '11D', name: 'Integrated Risk', icon: ShieldAlert },
  ];

  const aaceClasses = [
    { class: 'Class 5', phase: 'Screening', accuracy: '+/-30-50%', color: 'text-red-400' },
    { class: 'Class 3', phase: 'FEED / FID', accuracy: '+/-10-20%', color: 'text-yellow-400' },
    { class: 'Class 1', phase: 'Definitive', accuracy: '+/-3-10%', color: 'text-emerald-400' },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '11A': {
      items: [
        { title: 'AACE Classification', desc: 'Cost estimates progress from Class 5 (concept) to Class 1 (definitive).' },
        { title: 'Contingency', desc: 'Covering known-unknowns to achieve P80/P85 confidence levels.' },
      ]
    },
    '11B': {
      items: [
        { title: 'First Oil Delay', desc: 'Time-value impact of schedule slips on project NPV.' },
        { title: 'Critical Path', desc: 'Identifying sequential activities dictating total duration.' },
      ]
    },
    '11C': {
      items: [
        { title: 'Reservoir Ranges', desc: 'Subsurface uncertainties (STOOIP, RF) and water breakthrough timing.' },
      ]
    },
    '11D': {
      items: [
        { title: 'Value at Risk (VaR)', desc: 'Maximum expected loss at a given confidence level.' },
      ]
    },
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-white italic tracking-tighter">Phase 11: Uncertainty Analysis</h2>
      <div className="glass-card rounded-3xl p-6 border-white/5 bg-[#05070a] mb-8">
        <p className="text-[11px] font-black text-amber-400 uppercase tracking-widest mb-4">AACE Cost Classification</p>
        <div className="grid grid-cols-3 gap-4">
          {aaceClasses.map(a => (
            <div key={a.class}>
              <p className="text-[10px] font-black text-white uppercase">{a.class}</p>
              <p className={cn("text-sm font-black font-mono", a.color)}>{a.accuracy}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit gap-1">
            {subs.map(s => (
              <button key={s.id} onClick={() => setSub(s.id as any)}
                className={cn('px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all',
                  sub === s.id ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white')}>
                {s.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content[sub].items.map(item => <Card key={item.title} title={item.title} desc={item.desc} />)}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl sticky top-8 text-center">
            <Uncertainty3D sub={sub} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Phase12Benchmarking() {
  const [sub, setSub] = useState<'12A' | '12B' | '12C'>('12A');
  const subs = [
    { id: '12A', name: 'Play Econ', icon: Globe },
    { id: '12B', name: 'Metrics', icon: BarChart2 },
    { id: '12C', name: 'Corp Finance', icon: Calculator },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '12A': { items: [{ title: 'Shale vs Deepwater', desc: 'Short-cycle manufacturing vs long-cycle project economics.' }] },
    '12B': { items: [{ title: 'Lifting Cost', desc: 'Operational efficiency benchmarking per physical unit.' }] },
    '12C': { items: [{ title: 'Capital Allocation', desc: 'FCF yield and dividend payout ratio optimization.' }] },
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-white italic tracking-tighter">Phase 12: Benchmarking</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit gap-1">
            {subs.map(s => (
              <button key={s.id} onClick={() => setSub(s.id as any)}
                className={cn('px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all',
                  sub === s.id ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white')}>
                {s.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content[sub].items.map(item => <Card key={item.title} title={item.title} desc={item.desc} />)}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl sticky top-8 text-center">
            <Benchmarking3D sub={sub} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Phase13CarbonEcon() {
  const [sub, setSub] = useState<'13A' | '13B' | '13C'>('13A');
  const subs = [
    { id: '13A', name: 'Carbon Pricing', icon: TrendingUp },
    { id: '13B', name: 'Stranded Assets', icon: ShieldAlert },
    { id: '13C', name: 'Transition', icon: Zap },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '13A': { items: [{ title: 'Internal Pricing', desc: 'Stress-testing projects against future carbon regulatory scenarios.' }] },
    '13B': { items: [{ title: 'Stranded Risk', desc: 'IEA Net Zero scenarios and reserve write-down risks.' }] },
    '13C': { items: [{ title: 'Hydrogen Econ', desc: 'Blue vs Green hydrogen levelized cost (LCOH) analysis.' }] },
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-white italic tracking-tighter">Phase 13: Carbon Economics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit gap-1">
            {subs.map(s => (
              <button key={s.id} onClick={() => setSub(s.id as any)}
                className={cn('px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all',
                  sub === s.id ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white')}>
                {s.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content[sub].items.map(item => <Card key={item.title} title={item.title} desc={item.desc} />)}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl sticky top-8 text-center">
            <CarbonTax3D sub={sub} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Phase14IntEcon() {
  const [sub, setSub] = useState<'14A' | '14B' | '14C'>('14A');
  const subs = [
    { id: '14A', name: 'Country Risk', icon: ShieldAlert },
    { id: '14B', name: 'JV Economics', icon: Layers },
    { id: '14C', name: 'Tax/Repatriation', icon: DollarSign },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '14A': { items: [{ title: 'Stability Clauses', desc: 'Protecting project NPV from retroactive fiscal changes.' }] },
    '14B': { items: [{ title: 'Carries & Promotes', desc: 'Bridging risk-tolerance gaps between partners.' }] },
    '14C': { items: [{ title: 'Transfer Pricing', desc: 'Intercompany transactions and withholding tax treaties.' }] },
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-white italic tracking-tighter">Phase 14: International Econ</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit gap-1">
            {subs.map(s => (
              <button key={s.id} onClick={() => setSub(s.id as any)}
                className={cn('px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all',
                  sub === s.id ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white')}>
                {s.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content[sub].items.map(item => <Card key={item.title} title={item.title} desc={item.desc} />)}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl sticky top-8 text-center">
            <IntEcon3D sub={sub} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Phase15DigitalEcon() {
  const [sub, setSub] = useState<'15A' | '15B' | '15C'>('15A');
  const subs = [
    { id: '15A', name: 'Data-Driven', icon: PieChart },
    { id: '15B', name: 'Digital Twin', icon: Layers },
    { id: '15C', name: 'Automation', icon: Zap },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '15A': { items: [{ title: 'ML Estimation', desc: 'Predicting CAPEX and well costs using historical datasets.' }] },
    '15B': { items: [{ title: 'Twin Economics', desc: 'Real-time optimization of facility choke settings and gas lift.' }] },
    '15C': { items: [{ title: 'Unmanned Ops', desc: 'OPEX savings vs CAPEX for advanced telemetry platforms.' }] },
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-white italic tracking-tighter">Phase 15: Digital Economics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit gap-1">
            {subs.map(s => (
              <button key={s.id} onClick={() => setSub(s.id as any)}
                className={cn('px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all',
                  sub === s.id ? 'bg-amber-500 text-black' : 'text-slate-500 hover:text-white')}>
                {s.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content[sub].items.map(item => <Card key={item.title} title={item.title} desc={item.desc} />)}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl sticky top-8 text-center">
            <DigitalTwinEcon3D sub={sub} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceCurve3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {sub === '6A' && (
          <motion.g key="6A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Forward Price Curve (Brent)</text>
            <motion.path
              d="M 50 150 Q 150 100 250 120 T 350 80" fill="none" stroke="#f59e0b" strokeWidth="3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
            />
            <motion.circle cx="350" cy="80" r="4" fill="#f59e0b" animate={{ r: [4, 6, 4] }} transition={{ repeat: Infinity, duration: 2 }} />
          </motion.g>
        )}

        {sub === '6B' && (
          <motion.g key="6B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#ef4444" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Quality/Location Differentials</text>
            <line x1="50" y1="100" x2="350" y2="100" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />
            <text x="60" y="90" fill="#f59e0b" fontSize="8" className="font-black">BENCHMARK</text>
            {[
              { l: 'API Gravity', d: 30, c: '#3b82f6' },
              { l: 'Sulfur Content', d: 50, c: '#ef4444' },
              { l: 'Freight/Netback', d: 20, c: '#94a3b8' }
            ].map((diff, i) => (
              <motion.g key={diff.l} transform={`translate(${100 + i * 100}, 100)`}>
                <motion.path
                  d={`M 0 0 L 0 ${diff.d}`} stroke={diff.c} strokeWidth="4" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: i * 0.2 }}
                />
                <text y={diff.d + 15} fill="white" fontSize="6" textAnchor="middle" className="font-black uppercase">{diff.l}</text>
              </motion.g>
            ))}
          </motion.g>
        )}

        {sub === '6C' && (
          <motion.g key="6C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Global Gas Hub Network</text>
            {[
              { x: 100, y: 150, l: 'Henry Hub' },
              { x: 200, y: 120, l: 'TTF' },
              { x: 300, y: 180, l: 'JKM' }
            ].map((hub, i) => (
              <motion.g key={hub.l} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.2 }}>
                <circle cx={hub.x} cy={hub.y} r="15" fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="1" />
                <motion.circle
                  cx={hub.x} cy={hub.y} r="15" fill="none" stroke="#3b82f6" strokeWidth="1"
                  animate={{ scale: [1, 1.5], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                />
                <text x={hub.x} y={hub.y + 25} fill="white" fontSize="6" textAnchor="middle" className="font-black uppercase">{hub.l}</text>
              </motion.g>
            ))}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function Discounting3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <defs>
        <linearGradient id="pvGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <AnimatePresence mode="wait">
        {sub === '3A' && (
          <motion.g key="3A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Time Value Decay (PV)</text>

            {/* Axes */}
            <path d="M 40 260 L 360 260" stroke="#475569" strokeWidth="1" />
            <path d="M 40 60 L 40 260" stroke="#475569" strokeWidth="1" />
            <text x="360" y="275" fill="#94a3b8" fontSize="8" textAnchor="end" className="font-black uppercase">Time (Years)</text>
            <text x="35" y="60" fill="#94a3b8" fontSize="8" textAnchor="end" className="font-black uppercase">Value ($)</text>

            {/* Area Under Curve */}
            <motion.path
              d="M 40 80 Q 150 240 360 250 L 360 260 L 40 260 Z" fill="url(#pvGradient)"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1.5 }}
            />

            {/* Line Curve */}
            <motion.path
              d="M 40 80 Q 150 240 360 250" fill="none" stroke="#f59e0b" strokeWidth="4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Traveling Particle */}
            <motion.circle
              r="5" fill="white" stroke="#f59e0b" strokeWidth="2"
              animate={{ cx: [40, 100, 160, 220, 280, 360], cy: [80, 155, 205, 230, 243, 250] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </motion.g>
        )}

        {sub === '3B' && (
          <motion.g key="3B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Discount Rate Sensitivity</text>

            {/* Axes */}
            <path d="M 40 260 L 360 260" stroke="#475569" strokeWidth="1" />
            <path d="M 40 60 L 40 260" stroke="#475569" strokeWidth="1" />

            {/* Low WACC Curve */}
            <motion.path
              d="M 40 80 Q 200 120 360 180" fill="none" stroke="#10b981" strokeWidth="3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}
            />
            <motion.text x="360" y="175" fill="#10b981" fontSize="8" textAnchor="end" className="font-black"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
            >
              WACC 5% (Higher PV)
            </motion.text>

            {/* High WACC Curve */}
            <motion.path
              d="M 40 80 Q 150 220 360 250" fill="none" stroke="#ef4444" strokeWidth="3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.5 }}
            />
            <motion.text x="360" y="245" fill="#ef4444" fontSize="8" textAnchor="end" className="font-black"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
            >
              WACC 15% (Lower PV)
            </motion.text>

            {/* Spread Arrow */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
              <path d="M 280 155 L 280 235" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
              <polygon points="275,230 285,230 280,240" fill="#f59e0b" />
              <polygon points="275,160 285,160 280,150" fill="#f59e0b" />
              <text x="270" y="195" fill="#f59e0b" fontSize="8" textAnchor="end" className="font-black">VALUE EROSION</text>
            </motion.g>
          </motion.g>
        )}

        {sub === '3C' && (
          <motion.g key="3C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Multi-Currency & FX Hedging</text>

            {/* Central Base Currency */}
            <motion.circle
              cx="200" cy="150" r="30" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="2"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}
            />
            <motion.text x="200" y="154" fill="#10b981" fontSize="12" textAnchor="middle" className="font-black"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            >
              USD
            </motion.text>

            {/* Orbiting Currencies */}
            {[
              { id: 'EUR', cx: 100, cy: 100, color: '#3b82f6', d: "M 200 150 Q 150 100 100 100" },
              { id: 'GBP', cx: 300, cy: 100, color: '#ef4444', d: "M 200 150 Q 250 100 300 100" },
              { id: 'JPY', cx: 200, cy: 250, color: '#f59e0b', d: "M 200 150 Q 180 200 200 250" },
            ].map((curr, i) => (
              <motion.g key={curr.id}>
                {/* Connecting Arc */}
                <motion.path
                  d={curr.d} fill="none" stroke={curr.color} strokeWidth="2" strokeDasharray="4 4"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: i * 0.3 + 0.5 }}
                />
                {/* Data Particle simulating FX hedging */}
                <motion.circle r="4" fill="white"
                  animate={{ cx: [200, curr.cx, 200], cy: [150, curr.cy, 150] }}
                  transition={{ duration: 3, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Currency Node */}
                <motion.circle
                  cx={curr.cx} cy={curr.cy} r="20" fill={curr.color} fillOpacity="0.2" stroke={curr.color} strokeWidth="2"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.3 + 0.8 }}
                />
                <motion.text
                  x={curr.cx} y={curr.cy + 4} fill={curr.color} fontSize="10" textAnchor="middle" className="font-black"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.3 + 1.1 }}
                >
                  {curr.id}
                </motion.text>
              </motion.g>
            ))}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function EconomicIndicators3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {sub === '4A' && (
          <motion.g key="4A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">NPV (Cumulative Cash Flow)</text>

            {/* Zero Line */}
            <path d="M 40 180 L 360 180" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />

            {/* Cash Flow Bars */}
            {[
              { y: 220, h: 40, c: '#ef4444' }, // Year 0 Capex (Negative)
              { y: 150, h: 30, c: '#10b981' }, // Year 1
              { y: 120, h: 60, c: '#10b981' }, // Year 2
              { y: 130, h: 50, c: '#10b981' }, // Year 3
              { y: 150, h: 30, c: '#10b981' }, // Year 4
              { y: 160, h: 20, c: '#10b981' }  // Year 5
            ].map((bar, i) => (
              <motion.rect
                key={`cf-${i}`} x={60 + i * 55} y={bar.c === '#ef4444' ? 180 : bar.y} width="30" height={bar.h} fill={bar.c} fillOpacity="0.4" rx="2"
                initial={{ height: 0, y: 180 }} animate={{ height: bar.h, y: bar.c === '#ef4444' ? 180 : bar.y }} transition={{ duration: 1, delay: i * 0.2 }}
              />
            ))}

            {/* Cumulative Line */}
            <motion.path
              d="M 75 220 L 130 190 L 185 130 L 240 80 L 295 50 L 350 30" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
            />
            <motion.circle cx="350" cy="30" r="6" fill="#f59e0b" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.5 }} />
            <motion.text x="350" y="20" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }}>+ NPV</motion.text>
          </motion.g>
        )}

        {sub === '4B' && (
          <motion.g key="4B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">IRR (Discount Rate where NPV=0)</text>

            {/* Axes */}
            <path d="M 40 250 L 360 250" stroke="#475569" strokeWidth="1" />
            <path d="M 40 50 L 40 250" stroke="#475569" strokeWidth="1" />

            {/* Zero NPV Line */}
            <path d="M 40 180 L 360 180" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.5" />
            <text x="360" y="175" fill="#10b981" fontSize="8" textAnchor="end" className="font-black">NPV = $0</text>

            {/* Curve */}
            <motion.path
              d="M 40 60 Q 150 180 320 230" fill="none" stroke="#3b82f6" strokeWidth="4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}
            />

            {/* IRR Point Highlight */}
            <motion.circle
              cx="150" cy="180" r="10" fill="none" stroke="#f59e0b" strokeWidth="2"
              initial={{ scale: 5, opacity: 0 }} animate={{ scale: [5, 1.5, 1], opacity: [0, 1, 1] }} transition={{ delay: 1.5, duration: 1 }}
            />
            <motion.circle cx="150" cy="180" r="4" fill="#f59e0b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} />

            <motion.path d="M 150 180 L 150 250" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.5 }} />
            <motion.text x="150" y="265" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>IRR = 15%</motion.text>
          </motion.g>
        )}

        {sub === '4C' && (
          <motion.g key="4C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#0ea5e9" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Payout & Breakeven Timing</text>

            {/* Zero Line (Breakeven) */}
            <path d="M 40 150 L 360 150" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
            <text x="50" y="145" fill="#10b981" fontSize="8" className="font-black uppercase">Capital Recovered ($0)</text>

            {/* Cumulative Cash Flow Curve (Starts deep negative, crosses zero) */}
            <motion.path
              d="M 40 260 Q 150 260 220 150 T 360 50" fill="none" stroke="#0ea5e9" strokeWidth="4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut" }}
            />

            {/* Shaded Area under zero (Unrecovered Cap) */}
            <motion.path
              d="M 40 260 Q 150 260 220 150 L 220 150 L 40 150 Z" fill="#ef4444" fillOpacity="0.2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            />

            {/* Payout Point Marker */}
            <motion.g initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }}>
              <circle cx="220" cy="150" r="6" fill="#f59e0b" />
              <path d="M 220 150 L 220 70" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
              <rect x="180" y="50" width="80" height="20" fill="#f59e0b" rx="4" />
              <text x="220" y="64" fill="black" fontSize="9" textAnchor="middle" className="font-black">PAYOUT</text>
            </motion.g>
          </motion.g>
        )}

        {sub === '4D' && (
          <motion.g key="4D" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#a855f7" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Profitability Index (PI)</text>

            {/* Scale / Balance Concept */}
            <path d="M 100 240 L 300 240" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            <path d="M 200 240 L 200 260" stroke="#475569" strokeWidth="4" />
            <path d="M 180 260 L 220 260" stroke="#475569" strokeWidth="4" />

            {/* Investment Stack (Left) */}
            <motion.g initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }}>
              <rect x="120" y="160" width="40" height="80" fill="#ef4444" fillOpacity="0.8" rx="4" />
              <text x="140" y="150" fill="#ef4444" fontSize="10" textAnchor="middle" className="font-black">CAPEX: $1</text>
            </motion.g>

            {/* Return Stack (Right) */}
            <motion.g initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, type: "spring" }}>
              <rect x="240" y="80" width="40" height="160" fill="#10b981" fillOpacity="0.8" rx="4" />
              <text x="260" y="70" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black">PV: $2.5</text>
            </motion.g>

            {/* PI Ratio Display */}
            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: "spring" }}>
              <circle cx="200" cy="120" r="30" fill="#a855f7" fillOpacity="0.2" stroke="#a855f7" strokeWidth="2" />
              <text x="200" y="117" fill="#a855f7" fontSize="10" textAnchor="middle" className="font-black uppercase">PI RATIO</text>
              <text x="200" y="132" fill="white" fontSize="14" textAnchor="middle" className="font-black">2.5x</text>
            </motion.g>

            <motion.path
              d="M 150 120 Q 200 80 250 120" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.5, duration: 1 }}
            />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function Uncertainty3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        <motion.g key={sub} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <text x="200" y="40" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Stochastic VaR Histogram</text>
          {[...Array(12)].map((_, i) => {
            const h = 40 + Math.random() * 100;
            return (
              <motion.rect
                key={i} x={80 + i * 20} y={250 - h} width="15" height={h} fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="1"
                initial={{ height: 0, y: 250 }} animate={{ height: h, y: 250 - h }}
                transition={{ delay: i * 0.05 }}
              />
            );
          })}
          <motion.line
            x1="200" y1="50" x2="200" y2="250" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          />
          <text x="205" y="60" fill="#ef4444" fontSize="8" className="font-black">P50 BASE</text>
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}

function ExplorationRisk3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        <motion.g key={sub} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <text x="200" y="40" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Success Probability Chain</text>
          {[0, 1, 2, 3].map(i => (
            <motion.g key={i} transform={`translate(${80 + i * 80}, 150)`}>
              <motion.circle
                r="20" fill="none" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.3"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.2 }}
              />
              <motion.circle
                r="20" fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="2" strokeDasharray="125"
                initial={{ strokeDashoffset: 125 }} animate={{ strokeDashoffset: 40 }} transition={{ duration: 1.5, delay: i * 0.2 }}
              />
            </motion.g>
          ))}
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}

function RiskTornado3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        <motion.g key={sub} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <text x="200" y="40" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Sensitivity Swing Analysis</text>
          {[
            { l: 'PRICE', w: 200, c: '#10b981' },
            { l: 'CAPEX', w: 160, c: '#3b82f6' },
            { l: 'OPEX', w: 120, c: '#f59e0b' },
            { l: 'RESRV', w: 80, c: '#ef4444' }
          ].map((item, i) => (
            <motion.g key={item.l} transform={`translate(200, ${80 + i * 40})`}>
              <motion.rect
                x={-item.w / 2} y="0" width={item.w} height="20" fill={item.c} fillOpacity="0.2" stroke={item.c} strokeWidth="1" rx="4"
                initial={{ width: 0, x: 0 }} animate={{ width: item.w, x: -item.w / 2 }} transition={{ duration: 1, delay: i * 0.1 }}
              />
              <text x={-item.w / 2 - 10} y="13" fill="white" fontSize="6" textAnchor="end" className="font-black uppercase">{item.l}</text>
            </motion.g>
          ))}
          <line x1="200" y1="60" x2="200" y2="240" stroke="white" strokeWidth="1" strokeOpacity="0.2" />
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}
