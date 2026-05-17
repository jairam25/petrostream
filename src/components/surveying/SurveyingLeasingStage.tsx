import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Map, FileText, Layers, Compass, BarChart2,
  Scale, Globe, Navigation, Zap, DollarSign, ShieldAlert,
  BarChart3, PieChart as PieChartIcon, Activity, TrendingUp, Search, Info, CheckCircle2, AlertTriangle, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { cn } from '../../lib/utils';
import { LandNeuralSimulator } from './LandNeuralSimulator';
import DataFlowIndicator from '../shared/DataFlowIndicator';

type SurveyingTab = 'ph1' | 'ph2' | 'ph3' | 'ph4' | 'ph5' | 'ph6' | 'ph7' | 'ph8' | 'ph9' | 'ph10' | 'ph11' | 'ph12' | 'ph13' | 'ph14' | 'ph15';

export default function SurveyingLeasingStage() {
  const [activeTab, setActiveTab] = useState<SurveyingTab>('ph1');
  const [showAiTerminal, setShowAiTerminal] = useState(true);
  const tabs = [
    { id: 'ph1' as SurveyingTab, label: 'Ph.1: Land & Mineral', icon: Scale },
    { id: 'ph2' as SurveyingTab, label: 'Ph.2: Land Surveying', icon: Map },
    { id: 'ph3' as SurveyingTab, label: 'Ph.3: Legal Descr.', icon: Layers },
    { id: 'ph4' as SurveyingTab, label: 'Ph.4: O&G Lease', icon: FileText },
    { id: 'ph5' as SurveyingTab, label: 'Ph.5: Acquisition', icon: Globe },
    { id: 'ph6' as SurveyingTab, label: 'Ph.6: Pooling/Unit', icon: BarChart2 },
    { id: 'ph7' as SurveyingTab, label: 'Ph.7: Fed/State', icon: Scale },
    { id: 'ph8' as SurveyingTab, label: 'Ph.8: Compliance', icon: FileText },
    { id: 'ph9' as SurveyingTab, label: 'Ph.9: GIS/Mapping', icon: Map },
    { id: 'ph10' as SurveyingTab, label: 'Ph.10: JOA/Farmout', icon: Layers },
    { id: 'ph11' as SurveyingTab, label: 'Ph.11: A&D', icon: DollarSign },
    { id: 'ph12' as SurveyingTab, label: 'Ph.12: ROW/Surface', icon: Compass },
    { id: 'ph13' as SurveyingTab, label: 'Ph.13: Land Law', icon: Scale },
    { id: 'ph14' as SurveyingTab, label: 'Ph.14: International', icon: Globe },
    { id: 'ph15' as SurveyingTab, label: 'Ph.15: Emerging', icon: Zap },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <Navigation className="text-brand-primary" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6">Surveying & Leasing</span>

        <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar max-w-[calc(100%-450px)]">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn('flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap',
                activeTab === t.id
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                  : 'text-slate-500 hover:text-white hover:bg-white/5')}>
              <t.icon size={13} />{t.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <button
          onClick={() => setShowAiTerminal(!showAiTerminal)}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
            showAiTerminal
              ? "bg-brand-primary/10 border-brand-primary/50 text-brand-primary shadow-lg shadow-brand-primary/10"
              : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
          )}
        >
          <Zap size={14} className={showAiTerminal ? "animate-pulse" : ""} />
          {showAiTerminal ? 'AI Terminal Active' : 'Show AI Terminal'}
        </button>
      </div>

      <DataFlowIndicator activeStage="SURVEYING" />

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <AnimatePresence>
          {showAiTerminal && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 32 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <LandNeuralSimulator />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {activeTab === 'ph1' && <Phase1LandMineral />}
            {activeTab === 'ph2' && <Phase2Surveying />}
            {activeTab === 'ph3' && <Phase3LegalDesc />}
            {activeTab === 'ph4' && <Phase4Lease />}
            {activeTab === 'ph5' && <Phase5Acquisition />}
            {activeTab === 'ph6' && <Phase6Unitization />}
            {activeTab === 'ph7' && <Phase7FederalState />}
            {activeTab === 'ph8' && <Phase8Compliance />}
            {activeTab === 'ph9' && <Phase9GISMapping />}
            {activeTab === 'ph10' && <Phase10JOAFarmout />}
            {activeTab === 'ph11' && <Phase11AD />}
            {activeTab === 'ph12' && <Phase12ROW />}
            {activeTab === 'ph13' && <Phase13LandLaw />}
            {activeTab === 'ph14' && <Phase14International />}
            {activeTab === 'ph15' && <Phase15Emerging />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── shared Card ─────────────────────────────────────────────────────────────
function Card({ title, desc, color = 'text-brand-primary' }: { title: string; desc: string; color?: string }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 bg-brand-primary/5 hover:border-brand-primary/30 transition-all flex flex-col justify-between">
      <div>
        <h5 className={cn('text-[11px] font-black uppercase tracking-widest mb-3', color)}>{title}</h5>
        <p className="text-[11px] text-slate-300 leading-relaxed font-medium italic">"{desc}"</p>
      </div>
      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
        <span className="text-[11px] text-slate-500 font-bold uppercase">Land Dept Standard</span>
        <Info size={12} className="text-slate-600" />
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, color = 'text-brand-primary' }: any) {
  return (
    <div className="glass-card p-8 rounded-3xl bg-white/5 border-white/5">
      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{label}</p>
      <h4 className={cn("text-4xl font-black italic tracking-tighter mb-2", color)}>{value}</h4>
      <p className="text-[11px] text-slate-400 uppercase font-bold italic">{sub}</p>
    </div>
  );
}

// ─── Phase 1 ─────────────────────────────────────────────────────────────────
function Phase1LandMineral() {
  const [sub, setSub] = useState<'1A' | '1B' | '1C'>('1A');
  const subs = [
    { id: '1A', name: 'Estates', icon: Layers },
    { id: '1B', name: 'Ownership', icon: FileText },
    { id: '1C', name: 'Title', icon: Scale },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Scale className="text-brand-primary" size={36} />
            Phase 1: Land & <span className="text-brand-primary/50">Mineral Management</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Title Chain · Ownership Distribution · Rights Analysis</p>
        </div>
        <div className="flex gap-2">
          {subs.map(s => (
            <button
              key={s.id}
              onClick={() => setSub(s.id as any)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                sub === s.id ? "border-brand-primary bg-brand-primary/10 text-white" : "border-white/5 text-slate-500"
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
            <MineralOwnership3D sub={sub} />
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-8">
          <StatBox label="Title Risk" value="LOW" sub="98% Coverage" color="text-emerald-400" />
          <div className="glass-card p-8 rounded-3xl bg-brand-primary/5 border-brand-primary/10 flex-1 flex flex-col justify-center text-center">
            <TrendingUp size={32} className="text-brand-primary mx-auto mb-4" />
            <h5 className="text-xs font-black text-white uppercase italic mb-2">Market Valuation</h5>
            <p className="text-3xl font-black text-white italic tracking-tighter mb-4">$42,500 <span className="text-xs text-slate-500">/ acre</span></p>
            <div className="flex items-center gap-2 justify-center">
              <div className="px-2 py-0.5 bg-emerald-500/10 rounded text-[10px] text-emerald-500 font-black uppercase">+12.4% vs LTM</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {sub === '1A' && (
          <>
            <Card title="Fee Simple & Severed Estates" desc="Owner holds both surface and mineral rights. Severed estate: mineral rights are separated from surface rights. The mineral estate is the 'dominant estate'." />
            <Card title="Accommodation Doctrine" desc="Resolves split estate conflicts. The mineral owner must accommodate existing surface uses if reasonable alternative methods exist." />
            <Card title="Executive Rights" desc="The legal right to execute an oil and gas lease. Can be separated from other mineral rights. Owed a fiduciary duty." />
          </>
        )}
        {sub === '1B' && (
          <>
            <Card title="WI & NRI" desc="WI is the operating interest. NRI is the share of revenue after royalties. NRI = WI × (1 − RI − ORRI)." />
            <Card title="Royalty Interests" desc="RI: Landowner's cost-free share (12.5% to 25%). ORRI: Cost-free interest carved out of WI." />
            <Card title="Carried Interest" desc="A WI where another party pays costs up to payout. Reversionary: Interest that activates later." />
          </>
        )}
      </div>
    </div>
  );
}

// ─── Phase 2 ─────────────────────────────────────────────────────────────────
function Phase2Surveying() {
  const [sub, setSub] = useState<'2A' | '2B' | '2C' | '2D'>('2A');
  const subs = [
    { id: '2A', name: 'PLSS', icon: Map },
    { id: '2B', name: 'Metes & Bounds', icon: Compass },
    { id: '2C', name: 'Lot & Block', icon: Layers },
    { id: '2D', name: 'Geodetic', icon: Globe },
  ];

  const plssComponents = [
    { name: 'Township', size: '36 sq. miles', desc: '6x6 miles (T3N, R5W)', color: 'text-emerald-400' },
    { name: 'Section', size: '640 acres', desc: '1 sq. mile (1-36)', color: 'text-blue-400' },
    { name: 'Quarter', size: '160 acres', desc: 'NE/4, SW/4, etc.', color: 'text-purple-400' },
    { name: 'QQ', size: '40 acres', desc: 'NE/4 of NW/4', color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Map className="text-brand-primary" size={36} />
            Phase 2: Land Surveying <span className="text-brand-primary/50">Engineering</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">PLSS · Metes & Bounds · Geodetic Systems</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit gap-1">
          {subs.map(s => (
            <button key={s.id} onClick={() => setSub(s.id as any)}
              className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
                sub === s.id ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-white')}>
              <s.icon size={12} />{s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] flex items-center justify-center relative overflow-hidden">
            <PLSSGrid3D sub={sub} />
          </div>
        </div>
        <div className="lg:col-span-5 flex flex-col gap-3">
          {plssComponents.map(pc => (
            <div key={pc.name} className="glass-card p-4 rounded-2xl border-white/5 bg-brand-primary/5 flex justify-between items-center px-8">
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{pc.name}</p>
                <p className="text-[11px] text-white font-bold italic">{pc.desc}</p>
              </div>
              <p className={cn("text-2xl font-black italic tracking-tighter", pc.color)}>{pc.size}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        <Card title="Geodetic Surveying" desc="Surveys that account for the Earth's curvature. Uses global coordinate systems (e.g., WGS84, NAD83) for absolute accuracy." />
        <Card title="Coordinate Systems" desc="State Plane Coordinate System (SPCS): feet/meters on a flat grid per state. UTM: global system dividing Earth into 60 zones." />
        <Card title="Well Location Surveying" desc="PLS stake the SHL. Directional surveys (MWD) track the BHL to ensure the lateral remains within the legally leased boundary." />
      </div>
    </div>
  );
}

// ─── Phase 3 ─────────────────────────────────────────────────────────────────
function Phase3LegalDesc() {
  const [sub, setSub] = useState<'3A' | '3B' | '3C'>('3A');
  const subs = [
    { id: '3A', name: 'PLSS Descriptions', icon: Map },
    { id: '3B', name: 'Metes & Bounds', icon: Compass },
    { id: '3C', name: 'Interpretation', icon: Scale },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '3A': {
      items: [
        { title: 'Standard PLSS Format', desc: 'Typical structure: Subdivision, Section, Township, Range, Meridian, County, State, Acreage. Example: "The NW/4 of Section 10, Township 5 North, Range 3 East of the Indian Meridian, Grady County, Oklahoma, containing 160 acres."' },
        { title: 'Complex Stacking & Exceptions', desc: 'When reading stacked quarters (e.g., NE/4 NW/4 SE/4), read from smallest to largest. This example equals 10 acres (640 / 4 / 4 / 4). Exceptions are explicitly carved out: "All of Section 10 EXCEPT the SE/4 of the NE/4."' },
        { title: 'Depth Severance', desc: 'Minerals can be severed horizontally (by depth or formation). Example: "All minerals from the surface down to 100 feet below the base of the Hunton Formation." Crucial for horizontal drilling where different operators own different formations.' },
      ]
    },
    '3B': {
      items: [
        { title: 'Metes & Bounds Drafting', desc: 'Must start at a clearly identifiable Point of Beginning (POB), follow calls sequentially around the perimeter, and mathematically "close" by returning precisely to the POB. Must include county, state, and original survey name.' },
        { title: 'Common Legal Errors', desc: 'Failure to close the polygon, ambiguous monument calls, transposed bearings (e.g., N45°E instead of S45°W), or omitted calls. Errors create "gaps and gores"—narrow, unleased strips of land between tracts that cause massive title headaches.' },
      ]
    },
    '3C': {
      items: [
        { title: 'Rules of Construction', desc: 'If a deed is ambiguous, the intent of the grantor controls. Specific descriptions prevail over general ones. Most importantly, the hierarchy of control: Monuments > Courses (Bearings) > Distances > Area (Acreage).' },
        { title: '"More or Less" & Boundaries', desc: 'The phrase "containing 160 acres, more or less" protects against minor surveying discrepancies. It is the described boundary that controls title ownership, not the exact acreage calculation.' },
        { title: '"To" vs "Along" Monuments', desc: 'A boundary call "to" a monument means the line terminates at that physical object. A call "along" a monument (like a creek or road) means the boundary line meanders and follows the centerline of that monument.' },
      ]
    },
  };

  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-white/5">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Layers className="text-brand-primary" size={32} />
          Phase 3: Legal Descriptions <span className="text-brand-primary/50">for O&G</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">PLSS Formats · Depth Severance · Interpretation</p>
      </div>

      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {subs.map(s => (
          <button key={s.id} onClick={() => setSub(s.id as any)}
            className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
              sub === s.id ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-white')}>
            <s.icon size={12} />{s.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="glass-card p-8 rounded-3xl border-white/5 bg-[#05070a] h-full flex items-center justify-center overflow-hidden">
                <MetesBounds3D sub={sub} />
              </div>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {content[sub].items.map(item => (
                <Card key={item.title} title={item.title} desc={item.desc} />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Phase 4 ─────────────────────────────────────────────────────────────────
function Phase4Lease() {
  const [sub, setSub] = useState<'4A' | '4B' | '4C'>('4A');
  const subs = [
    { id: '4A', name: 'Provisions', icon: FileText },
    { id: '4B', name: 'Negotiation', icon: DollarSign },
    { id: '4C', name: 'Compliance', icon: ShieldAlert },
  ];

  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-white/5">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <FileText className="text-brand-primary" size={36} />
            Phase 4: O&G <span className="text-brand-primary/50">Lease Instruments</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Habendum Clauses · Royalty Structures · Leasehold Obligations</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit gap-1">
          {subs.map(s => (
            <button key={s.id} onClick={() => setSub(s.id as any)}
              className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
                sub === s.id ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-white')}>
              <s.icon size={12} />{s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] flex items-center justify-center relative overflow-hidden">
            <LeaseInstrument3D sub={sub} />
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="glass-card p-8 rounded-3xl bg-white/5 border-white/5 flex-1 flex flex-col justify-center text-center">
            <DollarSign size={48} className="text-emerald-500 mx-auto mb-4" />
            <h5 className="text-xs font-black text-white uppercase italic mb-2">Portfolio Royalty Avg</h5>
            <p className="text-5xl font-black text-white italic tracking-tighter mb-4">18.75<span className="text-lg text-slate-500">%</span></p>
            <div className="flex items-center gap-2 justify-center">
              <div className="px-3 py-1 bg-emerald-500/10 rounded-full text-[11px] text-emerald-500 font-black uppercase">Above Basin Avg</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        <Card title="Habendum Clause" desc="Sets the duration of the lease. Divided into the primary term (fixed years) and secondary term (as long as oil/gas is produced)." />
        <Card title="Royalty Clause" desc="Defines the Lessor's share of production (typically 1/8 to 1/4). Specifies gross vs net proceeds." />
        <Card title="Pugh Clauses" desc="Prevents a single producing well from holding vast acreage. Horizontal and Vertical depth severances." />
      </div>
    </div>
  );
}

// ─── Phase 5 ─────────────────────────────────────────────────────────────────
function Phase5Acquisition() {
  const [sub, setSub] = useState<'5A' | '5B' | '5C' | '5D'>('5A');
  const subs = [
    { id: '5A', name: 'Leasing Process', icon: FileText },
    { id: '5B', name: 'Strategy', icon: Globe },
    { id: '5C', name: 'Administration', icon: Layers },
    { id: '5D', name: 'Division Orders', icon: BarChart2 },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '5A': {
      items: [
        { title: 'Title Examination & Courthouse Research', desc: 'Landmen run title at the county courthouse by examining deeds, probates, and tax records. They build a chain of title from sovereignty (original government patent) to the present to determine the exact fractional decimal interest of all current mineral owners.' },
        { title: 'Lease Negotiation', desc: 'Landmen contact mineral owners to present the lease form. They negotiate the upfront bonus, royalty percentage, primary term duration, and special provisions (e.g., surface damage compensation). Strong community relations are critical to prevent leasing holdouts.' },
      ]
    },
    '5B': {
      items: [
        { title: 'Block Strategy & Competitive Timing', desc: 'Operators quietly lease contiguous acreage forming a "block." The core area (highest prospectivity) is leased first, followed by delineation and buffer areas to block competitors. Brokers are often used as agents to mask the operator\'s identity and prevent bonus bidding wars.' },
        { title: 'Due Diligence & Brokerage', desc: 'Before closing, operators verify ownership, check for existing leases or liens, and conduct environmental assessments (endangered species, wetlands). Independent lease brokers are paid per-acre or per-day, sometimes earning an ORRI (override).' },
      ]
    },
    '5C': {
      items: [
        { title: 'Lease Administration & Expirations', desc: 'Tracking thousands of leases using GIS-linked databases. Missing a Delay Rental payment or failing to commence drilling before the Primary Term expires results in automatic lease termination (costing the operator millions in sunk bonuses).' },
        { title: 'Extensions & Amendments', desc: 'Operators can negotiate paid extensions of the primary term before it expires (requiring additional bonus). Amendments modify existing terms (e.g., authorizing pooling or altering surface use) and must be signed by both parties and recorded.' },
      ]
    },
    '5D': {
      items: [
        { title: 'Division Orders (DO)', desc: 'A legal document specifying each owner\'s precise decimal share of production revenue. Prepared based on the Division Order Title Opinion (DOTO). It authorizes the purchaser to disburse funds but does not convey or alter actual title.' },
        { title: 'Suspense Accounts', desc: 'When ownership is disputed, title is clouded, or heirs cannot be located, revenue is held in a "suspense account" until the title defect is cured. State laws dictate interest payments on suspended funds and escheat (unclaimed property) procedures.' },
      ]
    },
  };

  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-white/5">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Globe className="text-brand-primary" size={32} />
          Phase 5: Lease Acquisition <span className="text-brand-primary/50">& Land Management</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Title Examination · Block Strategy · Division Orders</p>
      </div>

      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {subs.map(s => (
          <button key={s.id} onClick={() => setSub(s.id as any)}
            className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
              sub === s.id ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-white')}>
            <s.icon size={12} />{s.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="glass-card p-8 rounded-3xl border-white/5 bg-[#05070a] h-full flex items-center justify-center overflow-hidden">
                <AcquisitionBlock3D sub={sub} />
              </div>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {content[sub].items.map(item => (
                <Card key={item.title} title={item.title} desc={item.desc} />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Phase 6 ─────────────────────────────────────────────────────────────────
function Phase6Unitization() {
  const [sub, setSub] = useState<'6A' | '6B' | '6C'>('6A');
  const subs = [
    { id: '6A', name: 'Well Spacing', icon: Layers },
    { id: '6B', name: 'Pooling', icon: Map },
    { id: '6C', name: 'Unitization', icon: BarChart2 },
  ];

  const spacingConcepts = [
    { rule: 'Setback', desc: 'Min. distance from lease line', color: 'text-emerald-400' },
    { rule: 'Density', desc: 'Acres assigned per well', color: 'text-blue-400' },
    { rule: 'Correlative', desc: 'Protects neighbor\'s rights', color: 'text-purple-400' },
    { rule: 'Drainage', desc: 'Prevented via offset spacing', color: 'text-orange-400' },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '6A': {
      items: [
        { title: 'Spacing Regulations & Correlative Rights', desc: 'State commissions (e.g., Texas RRC) mandate minimum distances from lease lines (setbacks) and between wells. Purpose: prevent physical waste (drilling too many wells) and protect correlative rights (preventing one operator from draining a neighbor\'s tract).' },
        { title: 'Standard vs Special Spacing', desc: 'Standard density varies (e.g., 40 acres for vertical oil, 640–1280 acres for modern horizontal shale wells). Operators can apply for "Increased Density" exceptions for infill drilling or irregular tract shapes to maximize recovery.' },
      ]
    },
    '6B': {
      items: [
        { title: 'Voluntary vs Compulsory Pooling', desc: 'Pooling combines small tracts into a legally sized drilling unit. Voluntary pooling occurs via lease clauses. Forced (Compulsory) Pooling is a state regulatory order binding unleased or holdout mineral owners to participate, preventing them from blocking development.' },
        { title: 'Forced Pooling Risk Penalties', desc: 'Under forced pooling, a holdout owner has options: lease, participate (pay upfront), or be "carried" subject to a statutory risk penalty. The operator recovers 150% to 300% of the non-consenting owner\'s share of drilling costs from their revenue before paying them out.' },
      ]
    },
    '6C': {
      items: [
        { title: 'Unitization (Field-Wide)', desc: 'While pooling combines tracts for a *single well*, Unitization combines all leases across an *entire reservoir* for field-wide management (typically for secondary recovery like waterflooding). Requires a Unit Agreement and Unit Operating Agreement (UOA).' },
        { title: 'Tract Participation Factors', desc: 'In a unit, revenue is no longer distributed based on whose land the well is on. Instead, each tract is assigned a "Tract Factor" based on surface acreage, net pay, or Original Oil in Place (OOIP). All production is allocated unit-wide based on these factors.' },
      ]
    },
  };

  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-white/5 pb-24">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <BarChart2 className="text-brand-primary" size={32} />
          Phase 6: Spacing, Pooling <span className="text-brand-primary/50">& Unitization</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Correlative Rights · Forced Pooling · Tract Factors</p>
      </div>

      {/* Spacing Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {spacingConcepts.map(sc => (
          <div key={sc.rule} className="glass-card p-4 rounded-2xl border-white/5 bg-brand-primary/5 text-center">
            <p className={cn("text-[13px] font-black uppercase mb-1", sc.color)}>{sc.rule}</p>
            <p className="text-[11px] text-slate-500 font-bold">{sc.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {subs.map(s => (
          <button key={s.id} onClick={() => setSub(s.id as any)}
            className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
              sub === s.id ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-white')}>
            <s.icon size={12} />{s.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="glass-card p-8 rounded-3xl border-white/5 bg-[#05070a] h-full flex items-center justify-center overflow-hidden">
                <Unitization3D sub={sub} />
              </div>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {content[sub].items.map(item => (
                <Card key={item.title} title={item.title} desc={item.desc} />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Phase 7 ─────────────────────────────────────────────────────────────────
function Phase7FederalState() {
  const [sub, setSub] = useState<'7A' | '7B' | '7C' | '7D'>('7A');
  const subs = [
    { id: '7A', name: 'Fed Onshore (BLM)', icon: Map },
    { id: '7B', name: 'Fed Offshore (BOEM)', icon: Globe },
    { id: '7C', name: 'State Leasing', icon: Scale },
    { id: '7D', name: 'Tribal Leasing', icon: Layers },
  ];

  const federalMetrics = [
    { type: 'BLM Royalty', metric: '16.67%', desc: 'Increased from 12.5%', color: 'text-orange-400' },
    { type: 'BOEM Royalty', metric: '18.75%', desc: 'Deepwater (>200m)', color: 'text-blue-400' },
    { type: 'Primary Term', metric: '10 Yrs', desc: 'Federal Onshore', color: 'text-emerald-400' },
    { type: 'Min. Bid', metric: '$2/acre', desc: 'BLM Onshore Auction', color: 'text-purple-400' },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '7A': {
      items: [
        { title: 'Bureau of Land Management (BLM)', desc: 'Manages onshore federal minerals. Leases are sold via quarterly competitive sealed-bid auctions. The 2022 IRA raised the royalty rate to 16.67% and increased minimum bids to $2/acre. The primary term is universally 10 years.' },
        { title: 'Nomination & APD Process', desc: 'Industry nominates parcels via an Expression of Interest (EOI). The BLM conducts NEPA environmental reviews before offering parcels. Before drilling, an Application for Permit to Drill (APD) must be approved, which can take 30 days to 6+ months.' },
        { title: 'Communitization & Units', desc: 'Communitization Agreements (CA) are the federal equivalent of pooling, required when federal lands share a spacing unit with state/private lands. Federal Exploratory Units hold massive acreage during the exploration phase.' },
      ]
    },
    '7B': {
      items: [
        { title: 'BOEM & Offshore Leasing', desc: 'The Bureau of Ocean Energy Management manages offshore OCS leasing under a 5-year program. Primary terms are shorter for shallow water (5 years) and longer for deep water (7–10 years). Royalties are steep (18.75% for deep water).' },
        { title: 'BSEE & Financial Assurance', desc: 'The Bureau of Safety and Environmental Enforcement (BSEE) regulates operational safety and issues drilling permits. Offshore operators must post massive supplemental bonds to guarantee decommissioning and platform removal.' },
      ]
    },
    '7C': {
      items: [
        { title: 'State Trust Lands', desc: 'States manage minerals beneath school lands, rivers, and lakes. Revenue funds public education (e.g., Texas Permanent School Fund). State agencies have a strict fiduciary duty to maximize trust revenue, often demanding 25% royalty rates.' },
        { title: 'State Regulatory Agencies', desc: 'Beyond leasing, state commissions (Texas RRC, Oklahoma Corporation Commission, NDIC) control all statewide well spacing, pooling, drilling permits, and environmental compliance, regardless of whether the land is private or state-owned.' },
      ]
    },
    '7D': {
      items: [
        { title: 'BIA & Trust Responsibility', desc: 'The Bureau of Indian Affairs (BIA) must approve all leasing on tribal and allotted lands, fulfilling the federal trust responsibility. Royalties are heavily negotiated (16.67%–25%) and require extensive NEPA and tribal environmental reviews.' },
        { title: 'Indian Mineral Development Act (IMDA)', desc: 'Allows tribes to bypass traditional leasing and enter into complex Joint Ventures or Production Sharing Agreements, giving the tribe massive control and direct operational participation.' },
      ]
    },
  };

  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-white/5">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Scale className="text-brand-primary" size={32} />
          Phase 7: Federal & State <span className="text-brand-primary/50">Leasing</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">BLM · BOEM · Trust Lands · BIA</p>
      </div>

      {/* Federal Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {federalMetrics.map(fm => (
          <div key={fm.type} className="glass-card p-4 rounded-2xl border-white/5 bg-brand-primary/5 text-center flex flex-col justify-center">
            <p className="text-[10px] text-white font-black uppercase mb-1">{fm.type}</p>
            <p className={cn("text-[14px] font-black font-mono", fm.color)}>{fm.metric}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1">{fm.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {subs.map(s => (
          <button key={s.id} onClick={() => setSub(s.id as any)}
            className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
              sub === s.id ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-white')}>
            <s.icon size={12} />{s.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="glass-card p-8 rounded-3xl border-white/5 bg-[#05070a] h-full flex items-center justify-center overflow-hidden">
                <RegulatoryShield3D sub={sub} />
              </div>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {content[sub].items.map(item => (
                <Card key={item.title} title={item.title} desc={item.desc} />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Phase 8 ─────────────────────────────────────────────────────────────────
function Phase8Compliance() {
  const [sub, setSub] = useState<'8A' | '8B' | '8C'>('8A');
  const subs = [
    { id: '8A', name: 'Drilling Permits', icon: FileText },
    { id: '8B', name: 'Environmental', icon: Globe },
    { id: '8C', name: 'Reporting', icon: BarChart2 },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '8A': {
      items: [
        { title: 'State & Federal Drilling Permits', desc: 'State permits require well location, target formation, and spacing unit data. Federal APDs (Application for Permit to Drill) require rigorous Surface Use and Drilling Plans and mandate BLM/BIA approval.' },
        { title: 'Bond Requirements', desc: 'Operators must post financial assurance (bonds) to guarantee the well will be properly plugged and abandoned (P&A). Options include individual well bonds ($10k-$150k) or state/nationwide blanket bonds.' },
      ]
    },
    '8B': {
      items: [
        { title: 'NEPA & Environmental Impact', desc: 'The National Environmental Policy Act dictates federal action. Minor actions get a Categorical Exclusion (CE). Moderate actions require an Environmental Assessment (EA) ending in a FONSI. Major actions demand a massive Environmental Impact Statement (EIS).' },
        { title: 'Clean Water & Clean Air Acts', desc: 'CWA regulates surface discharge via NPDES permits and wetland impacts (Army Corps Sec 404). CAA requires Title V operating permits for major production facilities, strictly auditing VOC, NOx, and Methane emissions.' },
        { title: 'ESA & NHPA Compliance', desc: 'Endangered Species Act (ESA) mandates biological assessments and seasonal drilling bans (e.g., Sage Grouse mating season). National Historic Preservation Act (NHPA) requires archaeological surveys (Class III) to avoid cultural sites.' },
        { title: 'RCRA & E&P Waste Exemption', desc: 'Under RCRA Subtitle C, E&P wastes (drilling mud, produced water) are legally exempt from being classified as "hazardous waste," massively reducing disposal costs. They are instead regulated as solid waste by states.' },
      ]
    },
    '8C': {
      items: [
        { title: 'Production & Royalty Reporting', desc: 'Operators submit monthly volumetric reports to the state detailing oil, gas, and water disposition (sold vs flared). Federal royalties are strictly audited and remitted to the Office of Natural Resources Revenue (ONRR).' },
        { title: 'Orphan Well Obligations', desc: 'State programs monitor inactive wells. If an operator goes bankrupt and abandons a well, it becomes an "orphan well." States use pooled industry bonding funds to safely plug these liabilities to prevent groundwater contamination.' },
      ]
    },
  };

  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-white/5 pb-24">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <FileText className="text-brand-primary" size={32} />
          Phase 8: Regulatory Compliance <span className="text-brand-primary/50">& Permitting</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">NEPA · ESA · Bonding · Orphan Wells</p>
      </div>

      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {subs.map(s => (
          <button key={s.id} onClick={() => setSub(s.id as any)}
            className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
              sub === s.id ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-white')}>
            <s.icon size={12} />{s.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="glass-card p-8 rounded-3xl border-white/5 bg-[#05070a] h-full flex items-center justify-center overflow-hidden">
                <AuditTrail3D sub={sub} />
              </div>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {content[sub].items.map(item => (
                <Card key={item.title} title={item.title} desc={item.desc} />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Phase 9 ─────────────────────────────────────────────────────────────────
function Phase9GISMapping() {
  const [sub, setSub] = useState<'9A' | '9B' | '9C'>('9A');
  const subs = [
    { id: '9A', name: 'GIS Platforms', icon: Map },
    { id: '9B', name: 'Lease Mapping', icon: Globe },
    { id: '9C', name: 'Digital Records', icon: Layers },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '9A': {
      items: [
        { title: 'GIS Platforms & Spatial Layers', desc: 'Land departments rely on ArcGIS, P2 Land, or Quorum to map lease boundaries over the PLSS/metes-and-bounds grid. Layers include surface/bottomhole well locations, pipelines, and spacing unit polygons.' },
        { title: 'Well Data Integration', desc: 'Spatial polygons are linked to live databases containing API numbers, Operator status, cumulative production, and directional MWD surveys to ensure horizontal laterals remain within leased boundaries.' },
      ]
    },
    '9B': {
      items: [
        { title: 'Lease Plat Mapping', desc: 'Visual representation of leasehold. Color-coded by status (e.g., Green = Held By Production [HBP], Yellow = Primary Term, Red = Expiring in <6 months). Crucial for planning infill drilling programs.' },
        { title: 'Net Acre Calculations', desc: 'GIS tools automatically calculate acreage metrics. Net Mineral Acres (NMA) = Gross Acres × Mineral Interest Fraction × Lease Interest Fraction. These metrics drive the valuation of the entire asset.' },
        { title: 'Competitive Intelligence', desc: 'Mapping competitor permits, rig locations, and newly recorded courthouse leases. Helps identify where the industry is moving and dictates where to deploy brokers for rapid acquisition.' },
      ]
    },
    '9C': {
      items: [
        { title: 'Electronic Recording & Cloud Land Systems', desc: 'Modernizing the courthouse. Cloud platforms (Enverus, Quorum) handle document imaging, track delay rental obligations, and automate expiration alerts, replacing archaic filing cabinets.' },
        { title: 'Blockchain for Title Records', desc: 'Emerging tech using immutable ledgers to track chain of title and smart contracts to auto-execute royalty payments, potentially eliminating massive title curative overhead.' },
      ]
    },
  };

  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-white/5">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Map className="text-brand-primary" size={32} />
          Phase 9: GIS & Mapping <span className="text-brand-primary/50">for Petroleum Land</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Spatial Data · Lease Plats · Digital Records</p>
      </div>

      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {subs.map(s => (
          <button key={s.id} onClick={() => setSub(s.id as any)}
            className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
              sub === s.id ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-white')}>
            <s.icon size={12} />{s.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="glass-card p-8 rounded-3xl border-white/5 bg-[#05070a] h-full flex items-center justify-center overflow-hidden">
                <GISGlobe3D sub={sub} />
              </div>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {content[sub].items.map(item => (
                <Card key={item.title} title={item.title} desc={item.desc} />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Phase 10 ────────────────────────────────────────────────────────────────
function Phase10JOAFarmout() {
  const [sub, setSub] = useState<'10A' | '10B' | '10C'>('10A');
  const subs = [
    { id: '10A', name: 'Farmouts', icon: Globe },
    { id: '10B', name: 'JOA (Form 610)', icon: FileText },
    { id: '10C', name: 'Dev Agreements', icon: Layers },
  ];

  const joaMetrics = [
    { type: 'Penalty', metric: '200–300%', desc: 'Non-Consent Risk Premium', color: 'text-red-400' },
    { type: 'Election', metric: '30 Days', desc: 'To participate in AFE', color: 'text-orange-400' },
    { type: 'Audit', metric: '24 Mos', desc: 'Joint Interest Billing', color: 'text-emerald-400' },
    { type: 'Form', metric: 'AAPL 610', desc: 'Standard US Onshore JOA', color: 'text-blue-400' },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '10A': {
      items: [
        { title: 'Farmout Structure & Earning', desc: 'A Farmor (lease owner) allows a Farmee to drill a well on their acreage. If the Farmee successfully drills to the target depth, they "earn" an assignment of the Working Interest. This allows the Farmor to hold their lease by production without spending CAPEX.' },
        { title: 'Farmor Retained Interests', desc: 'The Farmor usually retains an Overriding Royalty Interest (ORRI) during the payout phase. After the Farmee recoups their drilling costs, the Farmor may have the option to "back-in" and convert their ORRI into a full Working Interest.' },
        { title: 'Area of Mutual Interest (AMI)', desc: 'A geographic boundary drawn around the farmout. If either party acquires new leases inside the AMI, they must offer a proportionate share to the other party. Prevents one party from secretly surrounding the other after a discovery.' },
      ]
    },
    '10B': {
      items: [
        { title: 'Joint Operating Agreement (JOA)', desc: 'The contract governing operations when multiple companies own working interest in the same unit. The AAPL Form 610 is the US industry standard. It designates one party as the "Operator" with exclusive control over drilling and production.' },
        { title: 'Non-Consent Penalties', desc: 'When the Operator issues an Authorization for Expenditure (AFE) for a new well, non-operators have ~30 days to elect to participate. If they go "non-consent," the participating parties pay their share, but recoup 200%-300% of the costs from the non-consenting party\'s revenue as a risk penalty.' },
        { title: 'COPAS & Joint Interest Billing (JIB)', desc: 'COPAS dictates exact accounting procedures. The Operator bills non-operators monthly for their share of OPEX/CAPEX via a JIB. Non-operators have strict audit rights (typically a 24-month window) to dispute charges.' },
      ]
    },
    '10C': {
      items: [
        { title: 'Development & Participation Agreements', desc: 'Broader than a single JOA. Governs multi-year, multi-well development plans across massive areas, dictating the pace of drilling, facility sharing, and capital commitments between major JV partners.' },
        { title: 'Confidentiality (NDA)', desc: 'Crucial precursors to any Farmout or JV. Restricts the sharing of proprietary 3D seismic, well logs, and financial data during data-room reviews or acquisition negotiations.' },
      ]
    },
  };

  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-white/5 pb-24">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Layers className="text-brand-primary" size={32} />
          Phase 10: Farmout, JOA <span className="text-brand-primary/50">& Agreements</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">AFEs · Non-Consent · AMIs</p>
      </div>

      {/* JOA Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {joaMetrics.map(jm => (
          <div key={jm.type} className="glass-card p-4 rounded-2xl border-white/5 bg-brand-primary/5 text-center flex flex-col justify-center">
            <p className="text-[10px] text-white font-black uppercase mb-1">{jm.type}</p>
            <p className={cn("text-[14px] font-black font-mono", jm.color)}>{jm.metric}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1">{jm.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {subs.map(s => (
          <button key={s.id} onClick={() => setSub(s.id as any)}
            className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
              sub === s.id ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-white')}>
            <s.icon size={12} />{s.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="glass-card p-8 rounded-3xl border-white/5 bg-[#05070a] h-full flex items-center justify-center overflow-hidden">
                <PartnershipNetwork3D sub={sub} />
              </div>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {content[sub].items.map(item => (
                <Card key={item.title} title={item.title} desc={item.desc} />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Phase 11 ────────────────────────────────────────────────────────────────
function Phase11AD() {
  const [sub, setSub] = useState<'11A' | '11B' | '11C'>('11A');
  const subs = [
    { id: '11A', name: 'Asset Evaluation', icon: BarChart2 },
    { id: '11B', name: 'Deal Metrics', icon: DollarSign },
    { id: '11C', name: 'Transaction', icon: FileText },
  ];

  const dealMetrics = [
    { type: 'Price/Flowing Bbl', metric: '$30k–$80k', desc: 'Per Daily BOE', color: 'text-emerald-400' },
    { type: 'Price/Net Acre', metric: '$500–$20k', desc: 'Undeveloped', color: 'text-blue-400' },
    { type: 'Price/BOE Res.', metric: '$5–$25', desc: 'Total Proved', color: 'text-purple-400' },
    { type: 'Recycle Ratio', metric: '1.5x–3.0x', desc: 'Efficiency', color: 'text-orange-400' },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '11A': {
      items: [
        { title: 'Technical & Economic Evaluation', desc: 'The technical evaluation involves reserves estimation (PDP/PUD), production forecasting, and facility condition assessment. Economic evaluation uses cash flow modeling (DCF) to determine NPV at the buyer\'s discount rate, focusing on strategic fit and operating synergies.' },
        { title: 'The Data Room (VDR)', desc: 'A physical or virtual data room containing well files, lease records, title info, and environmental assessments. Access requires a strict Confidentiality Agreement (NDA) and usually marks the transition from screening to formal evaluation.' },
      ]
    },
    '11B': {
      items: [
        { title: 'Price per BOE & Flowing Barrel', desc: 'Price per BOE of reserves is the total price divided by proved reserves (PDP is valued highest). Price per flowing barrel (Price / Daily Rate) is a quick screening metric that varies by commodity mix and decline profile.' },
        { title: 'EV/EBITDA & Recycle Ratio', desc: 'EV/EBITDA is a corporate-level metric for earnings. The Recycle Ratio (Netback per BOE / F&D cost per BOE) measures capital efficiency; a ratio > 2.0 is generally considered highly attractive.' },
      ]
    },
    '11C': {
      items: [
        { title: 'Purchase & Sale Agreement (PSA)', desc: 'The definitive legal agreement. It covers the purchase price, environmental indemnities, and title defect thresholds. Effective Date acts as the economic cutoff—the buyer receives revenues and bears costs from this date forward.' },
        { title: 'Due Diligence & Title Review', desc: 'A 4-8 week period of deep-dive legal, technical, and title review. Title defects exceeding the PSA threshold (e.g., missing mineral interests) result in price adjustments or exclusion of affected tracts.' },
        { title: 'Post-Closing & Integration', desc: 'Transition period involving the assignment of leases, change of operator (COO) notifications to state agencies, and often a Transition Services Agreement (TSA) where the seller operates for a short period.' },
      ]
    },
  };

  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-white/5">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <DollarSign className="text-brand-primary" size={32} />
          Phase 11: Acquisition <span className="text-brand-primary/50">& Divestiture</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Data Rooms · PSA · Deal Metrics</p>
      </div>

      {/* Deal Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {dealMetrics.map(dm => (
          <div key={dm.type} className="glass-card p-4 rounded-2xl border-white/5 bg-brand-primary/5 text-center flex flex-col justify-center">
            <p className="text-[10px] text-white font-black uppercase mb-1">{dm.type}</p>
            <p className={cn("text-[14px] font-black font-mono", dm.color)}>{dm.metric}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1">{dm.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {subs.map(s => (
          <button key={s.id} onClick={() => setSub(s.id as any)}
            className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
              sub === s.id ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-white')}>
            <s.icon size={12} />{s.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="glass-card p-8 rounded-3xl border-white/5 bg-[#05070a] h-full flex items-center justify-center overflow-hidden">
                <AssetValuation3D sub={sub} />
              </div>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {content[sub].items.map(item => (
                <Card key={item.title} title={item.title} desc={item.desc} />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Phase 12 ────────────────────────────────────────────────────────────────
function Phase12ROW() {
  const [sub, setSub] = useState<'12A' | '12B' | '12C'>('12A');
  const subs = [
    { id: '12A', name: 'Pipeline ROW', icon: Compass },
    { id: '12B', name: 'Road Use', icon: Map },
    { id: '12C', name: 'Surface Use', icon: Layers },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '12A': {
      items: [
        { title: 'Pipeline Easements & ROW', desc: 'An easement grants the right to install and maintain a pipeline. Negotiated terms include construction width (50-100 ft), permanent corridor width (25-50 ft), depth requirements (36-48" cover), and damage payments for lost surface use.' },
        { title: 'Eminent Domain & Condemnation', desc: 'If private negotiations fail, "common carrier" pipelines may have the authority to condemn land for public necessity, ensuring "just compensation" is paid to the landowner via a court-monitored process.' },
      ]
    },
    '12B': {
      items: [
        { title: 'County & Private Road Use', desc: 'Agreements for heavy truck traffic during drilling. Operators commit to repairing road damage, improving road bases, and implementing safety measures like dust control and speed limits to maintain their social license to operate.' },
      ]
    },
    '12C': {
      items: [
        { title: 'Surface Use Agreements (SUA)', desc: 'Governs the footprint of the well pad (2-5 acres). Stipulates surface damage payments, topsoil preservation, water sourcing from surface ponds, and setback distances from residences or schools.' },
        { title: 'Restoration & Bonds', desc: 'Surface restoration involves re-grading and re-seeding the site once production equipment is removed. Performance bonds ensure the operator fulfills these obligations even in cases of financial distress.' },
      ]
    },
  };

  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-white/5 pb-24">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Compass className="text-brand-primary" size={32} />
          Phase 12: ROW <span className="text-brand-primary/50">& Surface Agreements</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Easements · Road Use · SUAs</p>
      </div>

      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {subs.map(s => (
          <button key={s.id} onClick={() => setSub(s.id as any)}
            className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
              sub === s.id ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-white')}>
            <s.icon size={12} />{s.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="glass-card p-8 rounded-3xl border-white/5 bg-[#05070a] h-full flex items-center justify-center overflow-hidden">
                <SurfaceAccess3D sub={sub} />
              </div>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {content[sub].items.map(item => (
                <Card key={item.title} title={item.title} desc={item.desc} />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Phase 13 ────────────────────────────────────────────────────────────────
function Phase13LandLaw() {
  const [sub, setSub] = useState<'13A' | '13B' | '13C' | '13D' | '13E'>('13A');
  const subs = [
    { id: '13A', name: 'Rule of Capture', icon: Scale },
    { id: '13B', name: 'Correlative', icon: Layers },
    { id: '13C', name: 'Drainage', icon: Compass },
    { id: '13D', name: 'Implied Cov.', icon: FileText },
    { id: '13E', name: 'Termination', icon: Zap },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '13A': {
      items: [
        { title: 'The Rule of Capture', desc: 'Landowners own all minerals produced from wells on their property, even if drained from neighbors. It incentivizes rapid drilling to "capture" the resource before others, subject to conservation laws and spacing rules.' },
      ]
    },
    '13B': {
      items: [
        { title: 'Correlative Rights Doctrine', desc: 'Each mineral owner has a right to a reasonable opportunity to produce their fair share of a common reservoir. This doctrine balances the Rule of Capture and is the legal basis for spacing and pooling orders.' },
      ]
    },
    '13C': {
      items: [
        { title: 'Drainage & Offset Obligations', desc: 'Lessees have an implied (and often express) duty to protect the lessor against substantial drainage by adjacent wells. If drainage is occurring, the "Prudent Operator" must drill an offset well or release the acreage.' },
      ]
    },
    '13D': {
      items: [
        { title: 'Implied Covenants', desc: 'Lessees are bound by implied duties to: 1. Reasonably Develop discovery; 2. Explore the leased premises; 3. Market production at the best price; and 4. Operate the lease with reasonable care (Prudent Operator standard).' },
      ]
    },
    '13E': {
      items: [
        { title: 'Lease Termination & Forfeiture', desc: 'Leases expire automatically at the end of the primary term if no production exists. Termination can also occur due to permanent cessation of production, breach of continuous development, or voluntary surrender.' },
      ]
    },
  };

  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-white/5">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Scale className="text-brand-primary" size={32} />
          Phase 13: Petroleum <span className="text-brand-primary/50">Land Law</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Rule of Capture · Covenants · Forfeiture</p>
      </div>

      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {subs.map(s => (
          <button key={s.id} onClick={() => setSub(s.id as any)}
            className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
              sub === s.id ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-white')}>
            <s.icon size={12} />{s.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="glass-card p-8 rounded-3xl border-white/5 bg-[#05070a] h-full flex items-center justify-center overflow-hidden">
                <LegalStatue3D sub={sub} />
              </div>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {content[sub].items.map(item => (
                <Card key={item.title} title={item.title} desc={item.desc} />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Phase 14 ────────────────────────────────────────────────────────────────
function Phase14International() {
  const [sub, setSub] = useState<'14A' | '14B' | '14C' | '14D'>('14A');
  const subs = [
    { id: '14A', name: 'License/Block', icon: Map },
    { id: '14B', name: 'Maritime Law', icon: Globe },
    { id: '14C', name: 'Local Content', icon: Scale },
    { id: '14D', name: 'Social Impact', icon: ShieldAlert },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '14A': {
      items: [
        { title: 'Concession & License Rounds', desc: 'Governments divide areas into blocks and hold license rounds. Exploration licenses (3-8 years) require work program commitments and acreage relinquishment before development licenses (20-30 years) are granted.' },
      ]
    },
    '14B': {
      items: [
        { title: 'UNCLOS & Maritime Boundaries', desc: 'Governs territorial seas (12nm) and EEZs (200nm). Boundary disputes often freeze exploration. Joint Development Zones (JDZs) allow cooperation in disputed waters (e.g., Malaysia-Thailand).' },
      ]
    },
    '14C': {
      items: [
        { title: 'Local Content & Participation', desc: 'Mandatory requirements for local employment, procurement of local services, and technology transfer to National Oil Companies (NOCs) to ensure host-country economic benefit.' },
      ]
    },
    '14D': {
      items: [
        { title: 'IFC Standards & ESIA', desc: 'IFC Performance Standards are required for project finance, covering resettlement, biodiversity, and indigenous rights. Environmental and Social Impact Assessments (ESIA) must precede any project approval.' },
      ]
    },
  };

  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-white/5">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Globe className="text-brand-primary" size={32} />
          Phase 14: International <span className="text-brand-primary/50">Surveying & Leasing</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">UNCLOS · License Rounds · Local Content</p>
      </div>

      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {subs.map(s => (
          <button key={s.id} onClick={() => setSub(s.id as any)}
            className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
              sub === s.id ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-white')}>
            <s.icon size={12} />{s.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="glass-card p-8 rounded-3xl border-white/5 bg-[#05070a] h-full flex items-center justify-center overflow-hidden">
                <GlobalConcessions3D sub={sub} />
              </div>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {content[sub].items.map(item => (
                <Card key={item.title} title={item.title} desc={item.desc} />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Phase 15 ────────────────────────────────────────────────────────────────
function Phase15Emerging() {
  const [sub, setSub] = useState<'15A' | '15B' | '15C' | '15D' | '15E'>('15A');
  const subs = [
    { id: '15A', name: 'CO2 Storage', icon: Zap },
    { id: '15B', name: 'Renewables', icon: Globe },
    { id: '15C', name: 'Water Rights', icon: Layers },
    { id: '15D', name: 'Blockchain', icon: FileText },
    { id: '15E', name: 'Lateral Chal.', icon: Compass },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '15A': {
      items: [
        { title: 'Pore Space Leasing for CCS', desc: 'Emerging laws clarify that pore space ownership typically follows the surface owner. CCS leases grant rights to inject and store CO2 perpetually, requiring new unitization statutes for aggregate pore space.' },
      ]
    },
    '15B': {
      items: [
        { title: 'Renewables & Geothermal', desc: 'Surface co-location of solar/wind with O&G wells. Geothermal leasing is separate, often utilizing abandoned oil wells for co-production of heat/power.' },
      ]
    },
    '15C': {
      items: [
        { title: 'Produced Water Ownership', desc: 'Legal battleground: does produced water belong to the mineral operator or surface owner? Growing focus on beneficial reuse and recycling for hydraulic fracturing to offset freshwater usage.' },
      ]
    },
    '15D': {
      items: [
        { title: 'Blockchain Land Records', desc: 'Smart contracts for self-executing royalties and rental payments. Digital courthouses are standardizing indexing and online title searching for instant verification.' },
      ]
    },
    '15E': {
      items: [
        { title: 'Horizontal & Multi-Unit Challenges', desc: 'Modern long-laterals cross multiple leases and units, requiring complex GIS-based production allocation formulas and specialized regulatory approvals for "cross-unit" wells.' },
      ]
    },
  };

  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-white/5 pb-24">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Zap className="text-brand-primary" size={32} />
          Phase 15: Emerging <span className="text-brand-primary/50">Topics</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Pore Space · Blockchain · Multi-Unit Laterals</p>
      </div>

      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {subs.map(s => (
          <button key={s.id} onClick={() => setSub(s.id as any)}
            className={cn('px-4 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all',
              sub === s.id ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-white')}>
            <s.icon size={12} />{s.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="glass-card p-8 rounded-3xl border-white/5 bg-[#05070a] h-full flex items-center justify-center overflow-hidden">
                <EnergyTransition3D sub={sub} />
              </div>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {content[sub].items.map(item => (
                <Card key={item.title} title={item.title} desc={item.desc} />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── 3D Visualizers ─────────────────────────────────────────────────────────

function MineralOwnership3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {sub === '1A' && (
          <motion.g key="1A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#0ea5e9" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Severed Estate Topology</text>
            {[
              { y: 180, l: 'MINERALS', c: '#0ea5e9' },
              { y: 120, l: 'SURFACE', c: '#3b82f6' }
            ].map((layer, i) => (
              <motion.g key={layer.l} animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, delay: i * 0.5 }}>
                <path d={`M 100 ${layer.y} L 200 ${layer.y - 30} L 300 ${layer.y} L 200 ${layer.y + 30} Z`} fill={layer.c} fillOpacity="0.1" stroke={layer.c} strokeWidth="2" />
                <path d={`M 100 ${layer.y} L 100 ${layer.y + 20} L 200 ${layer.y + 50} L 200 ${layer.y + 30} Z`} fill={layer.c} fillOpacity="0.2" />
                <path d={`M 300 ${layer.y} L 300 ${layer.y + 20} L 200 ${layer.y + 50} L 200 ${layer.y + 30} Z`} fill={layer.c} fillOpacity="0.1" />
                <text x="200" y={layer.y + 10} fill="white" fontSize="8" textAnchor="middle" className="font-black italic">{layer.l}</text>
              </motion.g>
            ))}
            <motion.path
              d="M 200 150 L 200 230" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
            />
            <motion.circle cx="200" cy="190" r="4" fill="#f59e0b" animate={{ r: [4, 8, 4] }} transition={{ repeat: Infinity, duration: 2 }} />
          </motion.g>
        )}

        {sub === '1B' && (
          <motion.g key="1B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Interest Distribution</text>
            <circle cx="200" cy="150" r="70" fill="none" stroke="#1e293b" strokeWidth="20" />
            <motion.circle
              cx="200" cy="150" r="70" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="440"
              initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: 110 }} transition={{ duration: 2 }}
            />
            <motion.circle
              cx="200" cy="150" r="70" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="440"
              initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: 350 }} transition={{ duration: 2, delay: 0.5 }}
            />
            <motion.g animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
              <text x="200" y="145" fill="white" fontSize="12" textAnchor="middle" className="font-black italic">NRI: 87.5%</text>
              <text x="200" y="165" fill="#10b981" fontSize="8" textAnchor="middle" className="font-black uppercase">WI: 100%</text>
            </motion.g>
          </motion.g>
        )}

        {sub === '1C' && (
          <motion.g key="1C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="40" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Title Chain Ledger</text>
            {[0, 1, 2, 3].map(i => (
              <motion.g key={i} transform={`translate(100, ${80 + i * 40})`}>
                <motion.rect
                  width="200" height="30" fill="#f59e0b" fillOpacity="0.05" stroke="#f59e0b" strokeWidth="1" rx="4"
                  initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.2 }}
                />
                <motion.circle
                  cx="15" cy="15" r="4" fill="#f59e0b"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.2 }}
                />
                <motion.path
                  d="M 180 15 L 190 15" stroke="#f59e0b" strokeWidth="2"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7 + i * 0.2 }}
                />
                <text x="30" y="18" fill="white" fontSize="7" className="font-bold opacity-40 uppercase">LEDGER ENTRY #{2048 - i}</text>
              </motion.g>
            ))}
            <motion.line
              x1="200" y1="80" x2="200" y2="240" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.2"
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1.5 }}
            />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function PLSSGrid3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {sub === '2A' && (
          <motion.g key="2A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transform="rotate(-15 200 150)">
            <text x="200" y="30" fill="#0ea5e9" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest" transform="rotate(15 200 30)">PLSS Township Grid (6x6 Mi)</text>
            {[...Array(7)].map((_, i) => (
              <React.Fragment key={i}>
                <line x1="50" y1={50 + i * 33} x2="350" y2={50 + i * 33} stroke="#475569" strokeWidth="1" strokeOpacity="0.2" />
                <line x1={50 + i * 43} y1="50" x2={50 + i * 43} y2="250" stroke="#475569" strokeWidth="1" strokeOpacity="0.2" />
              </React.Fragment>
            ))}
            <motion.rect
              x="136" y="116" width="43" height="33" fill="#0ea5e9" fillOpacity="0.2" stroke="#0ea5e9" strokeWidth="2"
              animate={{ fillOpacity: [0.2, 0.4, 0.2] }} transition={{ repeat: Infinity, duration: 2 }}
            />
            <text x="157" y="136" fill="white" fontSize="6" textAnchor="middle" className="font-black">SEC 15</text>
          </motion.g>
        )}

        {sub === '2B' && (
          <motion.g key="2B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Metes & Bounds Vector Trace</text>
            <motion.path
              d="M 100 200 L 150 100 L 280 120 L 320 220 L 180 250 Z"
              fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, ease: "linear", repeat: Infinity }}
            />
            {[
              { x: 100, y: 200, l: 'POB' },
              { x: 150, y: 100, l: 'N22°W' },
              { x: 280, y: 120, l: 'S85°E' },
              { x: 320, y: 220, l: 'S15°W' }
            ].map((p, i) => (
              <motion.g key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.5 }}>
                <circle cx={p.x} cy={p.y} r="4" fill="#f59e0b" />
                <text x={p.x} y={p.y - 8} fill="white" fontSize="6" className="font-black uppercase">{p.l}</text>
              </motion.g>
            ))}
          </motion.g>
        )}

        {sub === '2C' && (
          <motion.g key="2C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Urban Lot & Block Plat</text>
            {[0, 1, 2].map(row => (
              [0, 1, 2, 3].map(col => (
                <motion.rect
                  key={`${row}-${col}`}
                  x={80 + col * 65} y={80 + row * 55} width="60" height="50"
                  fill="#10b981" fillOpacity="0.05" stroke="#10b981" strokeWidth="1"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (row * 4 + col) * 0.1 }}
                />
              ))
            ))}
            <motion.rect
              x="145" y="135" width="60" height="50" fill="#10b981" fillOpacity="0.3" stroke="#10b981" strokeWidth="2"
              animate={{ strokeWidth: [2, 4, 2] }} transition={{ repeat: Infinity, duration: 2 }}
            />
            <text x="175" y="165" fill="white" fontSize="8" textAnchor="middle" className="font-black uppercase">LOT 12</text>
          </motion.g>
        )}

        {sub === '2D' && (
          <motion.g key="2D" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Geodetic Reference Frame</text>
            <circle cx="200" cy="150" r="100" fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.2" />
            <motion.path
              d="M 100 150 A 100 30 0 0 1 300 150" fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.5"
            />
            <motion.path
              d="M 200 50 A 30 100 0 0 1 200 250" fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.5"
            />
            <motion.circle
              cx="240" cy="120" r="6" fill="#3b82f6"
              animate={{ r: [6, 12, 6], opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2 }}
            />
            <text x="240" y="140" fill="white" fontSize="7" textAnchor="middle" className="font-black italic">WGS84 COORDINATE</text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function MetesBounds3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {sub === '3A' && (
          <motion.g key="3A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#0ea5e9" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">PLSS Nested Subdivision</text>
            {/* 640 Acre Section */}
            <rect x="100" y="80" width="200" height="140" fill="none" stroke="#475569" strokeWidth="1" strokeOpacity="0.3" />
            {/* NW/4 (160 Ac) */}
            <motion.rect
              x="100" y="80" width="100" height="70" fill="#0ea5e9" fillOpacity="0.05" stroke="#0ea5e9" strokeWidth="1"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            />
            {/* NE/4 of NW/4 (40 Ac) */}
            <motion.rect
              x="150" y="80" width="50" height="35" fill="#0ea5e9" fillOpacity="0.2" stroke="#0ea5e9" strokeWidth="2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            />
            <motion.path
              d="M 200 150 L 175 97" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4"
              animate={{ pathLength: [0, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            />
            <text x="200" y="240" fill="white" fontSize="8" textAnchor="middle" className="font-black italic">"NE/4 of the NW/4..."</text>
          </motion.g>
        )}

        {sub === '3B' && (
          <motion.g key="3B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Metes & Bounds Boundary Trace</text>
            <motion.path
              d="M 120 220 L 100 120 L 250 80 L 300 200 Z"
              fill="none" stroke="#f59e0b" strokeWidth="3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, ease: "linear", repeat: Infinity }}
            />
            <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} style={{ originX: '200px', originY: '150px' }}>
              <line x1="200" y1="130" x2="200" y2="170" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.2" />
              <line x1="180" y1="150" x2="220" y2="150" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.2" />
            </motion.g>
            <circle cx="120" cy="220" r="4" fill="#f59e0b" />
            <text x="120" y="235" fill="white" fontSize="6" textAnchor="middle" className="font-black">POB</text>
          </motion.g>
        )}

        {sub === '3C' && (
          <motion.g key="3C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Rules of Construction Hierarchy</text>
            {[
              { l: 'MONUMENTS', c: '#10b981', p: 1 },
              { l: 'COURSES', c: '#3b82f6', p: 2 },
              { l: 'DISTANCES', c: '#f59e0b', p: 3 },
              { l: 'ACREAGE', c: '#94a3b8', p: 4 }
            ].map((node, i) => (
              <motion.g key={node.l} transform={`translate(100, ${70 + i * 45})`}>
                <rect width="200" height="35" fill={node.c} fillOpacity="0.05" stroke={node.c} strokeWidth={i === 0 ? 2 : 1} rx="4" />
                <text x="10" y="22" fill={node.c} fontSize="10" className="font-black italic">{i + 1}. {node.l}</text>
                {i < 3 && <motion.path d="M 100 35 L 100 45" stroke="white" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="2 2" />}
              </motion.g>
            ))}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function LeaseInstrument3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <motion.g animate={{ y: [0, -5, 0], rotate: sub === '4B' ? [-2, 2, -2] : 0 }} transition={{ repeat: Infinity, duration: 4 }}>
        {/* Document Body */}
        <rect x="120" y="40" width="160" height="220" fill="#0f172a" stroke={sub === '4C' ? "#ef4444" : "#0ea5e9"} strokeWidth="2" rx="10" />
        {/* Text Lines */}
        {[...Array(10)].map((_, i) => (
          <motion.rect
            key={i} x="140" y={70 + i * 15} width={100 + Math.random() * 20} height="4" fill={sub === '4C' && i > 7 ? "#ef4444" : "#475569"} fillOpacity={0.3}
            animate={{ fillOpacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
          />
        ))}
        {/* Highlighted Clauses */}
        <rect x="135" y={sub === '4B' ? 140 : 100} width="130" height="20" fill="#0ea5e9" fillOpacity={0.1} stroke="#0ea5e9" strokeWidth="1" strokeDasharray="2,2" />
        <text x="200" y={sub === '4B' ? 153 : 113} fill="#0ea5e9" fontSize="8" textAnchor="middle" className="font-black uppercase italic">
          {sub === '4A' ? 'Habendum Clause' : sub === '4B' ? 'Royalty Provisions' : 'Compliance Terms'}
        </text>
      </motion.g>
      <text x="200" y="280" fill="#0ea5e9" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">
        {sub === '4A' ? 'Instrument Structural Analysis' : sub === '4B' ? 'Commercial Term Negotiation' : 'Regulatory Lease Compliance'}
      </text>
    </svg>
  );
}

function AcquisitionBlock3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {sub === '5A' && (
          <motion.g key="5A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#0ea5e9" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Lease Research & Verification</text>
            <rect x="120" y="60" width="160" height="200" fill="none" stroke="#475569" strokeWidth="1" strokeOpacity="0.3" rx="8" />
            {[0, 1, 2, 3, 4].map(i => (
              <motion.line
                key={i} x1="140" y1={90 + i * 30} x2="260" y2={90 + i * 30} stroke="#0ea5e9" strokeWidth="2" strokeOpacity="0.2"
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
              />
            ))}
            <motion.rect
              x="120" y="60" width="160" height="10" fill="#0ea5e9" fillOpacity="0.2"
              animate={{ y: [0, 190, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            />
            <motion.path d="M 230 210 L 245 225 L 275 195" stroke="#10b981" strokeWidth="3" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1 }} />
          </motion.g>
        )}

        {sub === '5B' && (
          <motion.g key="5B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Strategic Block Consolidation</text>
            {[...Array(16)].map((_, i) => (
              <motion.rect
                key={i} x={100 + (i % 4) * 50} y={60 + Math.floor(i / 4) * 45} width="45" height="40"
                fill="#10b981" fillOpacity={i % 2 === 0 ? 0.3 : 0.05} stroke="#10b981" strokeWidth="1" strokeOpacity="0.2"
                animate={{ fillOpacity: i % 2 === 0 ? [0.3, 0.6, 0.3] : 0.05 }} transition={{ repeat: Infinity, duration: 3, delay: i * 0.1 }}
              />
            ))}
            <motion.circle
              cx="175" cy="125" r="30" fill="none" stroke="#10b981" strokeWidth="2"
              animate={{ scale: [1, 3], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.g>
        )}

        {sub === '5C' && (
          <motion.g key="5C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Leasehold Expiration Matrix</text>
            {[0, 1, 2].map(row => (
              <motion.g key={row} transform={`translate(100, ${70 + row * 60})`}>
                <rect width="200" height="40" fill="#1e293b" rx="4" />
                <motion.rect
                  width={row === 0 ? "180" : row === 1 ? "60" : "120"} height="6" x="10" y="25" fill={row === 1 ? "#ef4444" : "#f59e0b"} rx="3"
                  initial={{ width: 0 }} animate={{ width: row === 0 ? 180 : row === 1 ? 60 : 120 }} transition={{ duration: 1.5 }}
                />
                <text x="10" y="18" fill="white" fontSize="7" className="font-black opacity-50 uppercase">{row === 1 ? 'EXPIRING IN 30 DAYS' : 'PRIMARY TERM ACTIVE'}</text>
              </motion.g>
            ))}
          </motion.g>
        )}

        {sub === '5D' && (
          <motion.g key="5D" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Fractional Revenue Splitter</text>
            <circle cx="200" cy="150" r="10" fill="#3b82f6" />
            {[0, 72, 144, 216, 288].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const tx = 200 + Math.cos(rad) * 80;
              const ty = 150 + Math.sin(rad) * 80;
              return (
                <g key={i}>
                  <motion.line
                    x1="200" y1="150" x2={tx} y2={ty} stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.4"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: i * 0.2 }}
                  />
                  <motion.circle
                    cx={tx} cy={ty} r="5" fill="#3b82f6"
                    animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                  />
                  <text x={tx} y={ty + 15} fill="white" fontSize="6" textAnchor="middle" className="font-bold opacity-40 uppercase">0.125 NRI</text>
                </g>
              );
            })}
            <motion.circle
              cx="200" cy="150" r="100" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.1"
              animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function Unitization3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {sub === '6A' && (
          <motion.g key="6A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#0ea5e9" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Well Spacing & Drainage</text>
            {[100, 200, 300].map((x, i) => (
              <g key={i}>
                <motion.circle
                  cx={x} cy="150" r="40" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4 4"
                  animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 3, delay: i }}
                />
                <circle cx={x} cy="150" r="4" fill="#f59e0b" />
                <motion.path
                  d={`M ${x} 110 L ${x} 190`} stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.3"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 + i * 0.2 }}
                />
              </g>
            ))}
            <text x="200" y="240" fill="white" fontSize="8" textAnchor="middle" className="font-black italic">SETBACK COMPLIANCE: OK</text>
          </motion.g>
        )}

        {sub === '6B' && (
          <motion.g key="6B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Compulsory Pooling consolidation</text>
            <rect x="100" y="80" width="200" height="140" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="8 4" rx="8" />
            {[
              { x: 120, y: 100 }, { x: 260, y: 110 }, { x: 140, y: 180 }, { x: 240, y: 190 }
            ].map((p, i) => (
              <motion.path
                key={i} d={`M ${p.x} ${p.y} L 200 150`} stroke="#10b981" strokeWidth="1" strokeOpacity="0.3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: i * 0.2 }}
              />
            ))}
            <motion.path
              d="M 110 150 L 290 150" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"
              animate={{ strokeDashoffset: [0, 20] }} strokeDasharray="10 5" transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <text x="200" y="155" fill="white" fontSize="8" textAnchor="middle" className="font-black">POOLED UNIT</text>
          </motion.g>
        )}

        {sub === '6C' && (
          <motion.g key="6C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Field-Wide Unitization Sync</text>
            <path d="M 100 150 Q 200 50 300 150 T 100 150" fill="#f59e0b" fillOpacity="0.05" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" />
            {[0, 60, 120, 180, 240, 300].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const tx = 200 + Math.cos(rad) * 90;
              const ty = 150 + Math.sin(rad) * 60;
              return (
                <motion.circle
                  key={i} cx={tx} cy={ty} r="4" fill="#f59e0b"
                  animate={{ scale: [1, 1.5, 1], fillOpacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                />
              );
            })}
            <motion.circle
              cx="200" cy="150" r="20" fill="none" stroke="#f59e0b" strokeWidth="2"
              animate={{ r: [20, 60], opacity: [0.8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
            />
            <text x="200" y="240" fill="white" fontSize="8" textAnchor="middle" className="font-black italic">SECONDARY RECOVERY SYNC</text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function RegulatoryShield3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {sub === '7A' && (
          <motion.g key="7A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">BLM Onshore Auction Grid</text>
            {[...Array(9)].map((_, i) => (
              <motion.rect
                key={i} x={125 + (i % 3) * 55} y={80 + Math.floor(i / 3) * 45} width="50" height="40"
                fill="#f59e0b" fillOpacity="0.05" stroke="#f59e0b" strokeWidth="1"
                animate={i === 4 ? { fillOpacity: [0.05, 0.4, 0.05] } : {}} transition={{ repeat: Infinity, duration: 2 }}
              />
            ))}
            <motion.path
              d="M 200 130 L 200 100" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"
              animate={{ rotate: [0, -30, 0] }} transition={{ repeat: Infinity, duration: 1 }}
              style={{ originX: '200px', originY: '130px' }}
            />
            <text x="200" y="240" fill="white" fontSize="8" textAnchor="middle" className="font-black italic">NOMINATED PARCEL: SEC 14</text>
          </motion.g>
        )}

        {sub === '7B' && (
          <motion.g key="7B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#0ea5e9" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Offshore OCS Leasing</text>
            <motion.path d="M 50 200 Q 200 180 350 200" stroke="#0ea5e9" strokeWidth="2" fill="none" animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 4 }} />
            <motion.g animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
              <rect x="170" y="100" width="60" height="40" fill="#0ea5e9" fillOpacity="0.2" stroke="#0ea5e9" strokeWidth="2" />
              {[180, 195, 210, 225].map(x => (
                <line key={x} x1={x} y1="140" x2={x} y2="190" stroke="#0ea5e9" strokeWidth="1" strokeOpacity="0.4" />
              ))}
            </motion.g>
            <text x="200" y="240" fill="white" fontSize="8" textAnchor="middle" className="font-black italic">DEEPWATER GULF OF MEXICO</text>
          </motion.g>
        )}

        {sub === '7C' && (
          <motion.g key="7C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">State Trust Fund Flow</text>
            <rect x="150" y="80" width="100" height="120" fill="none" stroke="#3b82f6" strokeWidth="2" rx="8" />
            {[0, 1, 2].map(i => (
              <motion.circle
                key={i} cx="200" cy={180 - i * 40} r="15" fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="1"
                animate={{ y: [0, -20, 0], fillOpacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
              />
            ))}
            <text x="200" y="220" fill="white" fontSize="8" textAnchor="middle" className="font-black uppercase">Education Trust</text>
          </motion.g>
        )}

        {sub === '7D' && (
          <motion.g key="7D" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Tribal Sovereign Boundary</text>
            <motion.circle
              cx="200" cy="140" r="70" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="10 5"
              animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            />
            <motion.path
              d="M 160 140 L 190 170 L 240 110" stroke="#10b981" strokeWidth="6" fill="none" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}
            />
            <text x="200" y="240" fill="white" fontSize="8" textAnchor="middle" className="font-black italic">BIA TRUST APPROVAL: ACTIVE</text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function AuditTrail3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      {[...Array(5)].map((_, i) => (
        <motion.g key={i} animate={{ y: [0, -50], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 5, delay: i }}>
          <rect x="120" y="250" width="160" height="40" fill={sub === '8B' ? "#10b98120" : "#1e293b"} stroke={sub === '8B' ? "#10b981" : "#0ea5e9"} strokeWidth="1" rx="5" />
          <text x="140" y="275" fill={sub === '8B' ? "#10b981" : "#475569"} fontSize="8" className="font-black uppercase tracking-widest italic">
            {sub === '8A' ? 'Permit #' : sub === '8B' ? 'NEPA Record' : 'Volume Report'} {1024 + i}
          </text>
        </motion.g>
      ))}
      <text x="200" y="280" fill="#0ea5e9" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">
        Compliance Documentation Engine
      </text>
    </svg>
  );
}

function GISGlobe3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <motion.g animate={{ rotate: sub === '9A' ? 360 : 0 }} transition={{ repeat: Infinity, duration: 60, ease: "linear" }}>
        <circle cx="200" cy="140" r="90" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="10,5" />
        <circle cx="200" cy="140" r="70" fill="none" stroke="#0ea5e9" strokeWidth="0.5" strokeOpacity={0.3} />
        {[...Array(12)].map((_, i) => (
          <circle key={i} cx={200 + 90 * Math.cos(i * 30 * Math.PI / 180)} cy={140 + 90 * Math.sin(i * 30 * Math.PI / 180)} r="2" fill={sub === '9B' ? "#10b981" : "#0ea5e9"} />
        ))}
      </motion.g>
      {/* Parcel Overlays */}
      <motion.path
        d={sub === '9B' ? "M 150 100 L 250 100 L 270 180 L 130 180 Z" : "M 180 120 L 220 120 L 230 160 L 170 160 Z"}
        fill={sub === '9B' ? "#10b981" : "#0ea5e9"} fillOpacity={0.2} stroke={sub === '9B' ? "#10b981" : "#0ea5e9"} strokeWidth="1"
        animate={{ fillOpacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 3 }}
      />
      <text x="200" y="280" fill="#0ea5e9" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">
        {sub === '9A' ? 'Spatial GIS Layer Stack' : sub === '9B' ? 'Lease Plat Parcel Mapping' : 'Digital Title Ledger'}
      </text>
    </svg>
  );
}

function PartnershipNetwork3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <g transform="translate(200, 140)">
        {/* Nodes */}
        {[
          { x: 0, y: 0, l: "OPERATOR", c: "#0ea5e9" },
          { x: -80, y: -60, l: "PARTNER A", c: sub === '10B' ? "#10b981" : "#475569" },
          { x: 80, y: -60, l: "PARTNER B", c: sub === '10B' ? "#10b981" : "#475569" },
          { x: 0, y: 80, l: "FARMOUT", c: sub === '10A' ? "#f59e0b" : "#475569" }
        ].map((n, i) => (
          <React.Fragment key={i}>
            <motion.line
              x1="0" y1="0" x2={n.x} y2={n.y} stroke={n.c} strokeWidth="1" strokeOpacity={0.3}
              animate={sub === '10C' ? { strokeDasharray: ["5,5", "0,0"], strokeOpacity: [0.5, 1, 0.5] } : { strokeOpacity: [0.1, 0.5, 0.1] }}
              transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
            />
            <circle cx={n.x} cy={n.y} r="6" fill={n.c} />
            <text x={n.x} y={n.y - 12} fill={n.c} fontSize="8" textAnchor="middle" className="font-black uppercase tracking-widest">{n.l}</text>
          </React.Fragment>
        ))}
      </g>
      <text x="200" y="280" fill="#0ea5e9" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">
        {sub === '10A' ? 'Farmout Earning Assignment' : sub === '10B' ? 'Joint Operating Framework' : 'Development Agreement Mesh'}
      </text>
    </svg>
  );
}

function AssetValuation3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <g transform="skewY(-10)">
        {[50, 120, 90, 160].map((h, i) => (
          <motion.rect
            key={i} x={100 + i * 50} y={220 - h} width="30" height={h} fill={sub === '11B' && i === 3 ? "#10b981" : "#0ea5e9"} fillOpacity={0.2 + i * 0.1} stroke="#0ea5e9"
            animate={{ height: sub === '11C' ? [h, h - 20, h] : [h, h + 20, h] }} transition={{ repeat: Infinity, duration: 4, delay: i * 0.5 }}
          />
        ))}
        <line x1="80" y1="220" x2="320" y2="220" stroke="#475569" strokeWidth="2" />
      </g>
      <text x="200" y="280" fill="#0ea5e9" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">
        {sub === '11A' ? 'Acreage Valuation Metrics' : sub === '11B' ? 'Cash Flow & NPV Analysis' : 'Risk & Market Sensitivity'}
      </text>
    </svg>
  );
}

function SurfaceAccess3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <g transform="perspective(500) rotateX(45)">
        <rect x="50" y="50" width="300" height="200" fill="#0f172a" stroke="#475569" strokeOpacity={0.2} />
        {/* ROW Path */}
        <motion.path
          d={sub === '12B' ? "M 50 150 L 150 150 L 200 50 L 250 150 L 350 150" : "M 50 150 Q 150 100 200 150 T 350 150"}
          fill="none" stroke={sub === '12C' ? "#ef4444" : "#f59e0b"} strokeWidth="4" strokeDasharray="10,5"
          animate={{ strokeDashoffset: [100, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
        />
        {/* Well Pad */}
        <rect x={sub === '12A' ? 220 : 250} y="100" width="40" height="40" fill={sub === '12A' ? "#0ea5e9" : "#ef4444"} fillOpacity={0.2} stroke={sub === '12A' ? "#0ea5e9" : "#ef4444"} strokeWidth="2" />
      </g>
      <text x="200" y="280" fill="#0ea5e9" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">
        {sub === '12A' ? 'Surface Damage & Pad Siting' : sub === '12B' ? 'Right-of-Way Corridor Plan' : 'Eminent Domain Limits'}
      </text>
    </svg>
  );
}

function LegalStatue3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <motion.g animate={{ y: sub === '13C' ? [0, -20, 0] : [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
        <path d="M 200 50 L 200 250 M 100 100 L 300 100" stroke={sub === '13B' ? "#f59e0b" : "#0ea5e9"} strokeWidth="4" strokeLinecap="round" />
        {/* Scale Pans */}
        <motion.g animate={{ rotate: sub === '13A' ? [-15, 15, -15] : [-5, 5, -5] }} style={{ transformOrigin: "200px 100px" }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
          <circle cx="100" cy="180" r="30" fill="none" stroke="#0ea5e9" strokeWidth="2" />
          <circle cx="300" cy="180" r="30" fill="none" stroke="#0ea5e9" strokeWidth="2" />
        </motion.g>
      </motion.g>
      <text x="200" y="280" fill="#0ea5e9" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">
        {sub === '13A' ? 'Rule of Capture Precedents' : sub === '13B' ? 'Surface vs Mineral Conflicts' : 'Dormant Mineral Statutes'}
      </text>
    </svg>
  );
}

function GlobalConcessions3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <motion.g animate={{ scale: sub === '14B' ? [1, 1.2, 1] : [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 10 }}>
        {/* Abstract World Map */}
        {[0, 1, 2, 3, 4].map(i => (
          <path key={i} d={`M ${50 + i * 60} ${100 + Math.random() * 50} Q ${100 + i * 60} ${50 + Math.random() * 50} ${150 + i * 60} ${100 + Math.random() * 50} Z`} fill={sub === '14A' && i === 2 ? "#0ea5e9" : "#1e293b"} />
        ))}
        {/* Concession Pulse */}
        <motion.circle
          cx="200" cy="150" r="10" fill={sub === '14C' ? "#10b981" : "#ef4444"}
          animate={{ r: [10, 40], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 3 }}
        />
      </motion.g>
      <text x="200" y="280" fill="#0ea5e9" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">
        {sub === '14A' ? 'License Round Allocation' : sub === '14B' ? 'Maritime Boundary EEZ' : sub === '14C' ? 'Local Content Compliance' : 'ESG Social Impact Audit'}
      </text>
    </svg>
  );
}

function EnergyTransition3D({ sub }: { sub: string }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
      <AnimatePresence mode="wait">
        {sub === '15A' && (
          <motion.g key="15A" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">CO2 Pore Space Sequestration</text>

            {/* Geological Strata */}
            {[150, 190, 230].map((y, i) => (
              <rect key={`strata-${i}`} x="50" y={y} width="300" height="30" fill={i === 1 ? "#10b981" : "#475569"} fillOpacity={i === 1 ? 0.2 : 0.1} rx="4" />
            ))}
            <text x="340" y="210" fill="#10b981" fontSize="8" textAnchor="end" className="font-black uppercase">Target Pore Space</text>

            {/* Injection Well */}
            <rect x="195" y="60" width="10" height="150" fill="#94a3b8" />
            <text x="200" y="55" fill="#94a3b8" fontSize="8" textAnchor="middle" className="font-black uppercase">Injection Well</text>

            {/* CO2 Particles Diffusing */}
            {[...Array(15)].map((_, i) => (
              <motion.circle
                key={`co2-${i}`} r="3" fill="#10b981"
                initial={{ cx: 200, cy: 60, opacity: 1 }}
                animate={{
                  cx: [200, 200, 200 + (Math.random() * 200 - 100)],
                  cy: [60, 205, 205 + (Math.random() * 10 - 5)],
                  opacity: [1, 1, 0]
                }}
                transition={{ repeat: Infinity, duration: 3 + Math.random(), delay: i * 0.3 }}
              />
            ))}
          </motion.g>
        )}

        {sub === '15B' && (
          <motion.g key="15B" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Surface Co-Location</text>

            {/* Surface Line */}
            <line x1="40" y1="220" x2="360" y2="220" stroke="#f59e0b" strokeWidth="2" />

            {/* Solar Array */}
            <motion.g transform="translate(100, 220) skewX(30)">
              <rect x="0" y="-30" width="60" height="30" fill="#3b82f6" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="1" />
              <line x1="20" y1="-30" x2="20" y2="0" stroke="#3b82f6" strokeWidth="1" />
              <line x1="40" y1="-30" x2="40" y2="0" stroke="#3b82f6" strokeWidth="1" />
            </motion.g>
            <text x="130" y="240" fill="#3b82f6" fontSize="8" textAnchor="middle" className="font-black uppercase">Solar Array</text>

            {/* Wind Turbine */}
            <g transform="translate(260, 220)">
              <rect x="-3" y="-80" width="6" height="80" fill="#94a3b8" />
              <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} style={{ originY: "-80px" }}>
                <line x1="0" y1="-80" x2="0" y2="-120" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                <line x1="0" y1="-80" x2="35" y2="-60" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                <line x1="0" y1="-80" x2="-35" y2="-60" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
              </motion.g>
              <circle cx="0" cy="-80" r="4" fill="#94a3b8" />
            </g>
            <text x="260" y="240" fill="#f59e0b" fontSize="8" textAnchor="middle" className="font-black uppercase">Wind Turbine</text>

            {/* Animated Sun Rays */}
            <motion.circle cx="80" cy="80" r="15" fill="#f59e0b" animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 3 }} />
            {[...Array(6)].map((_, i) => (
              <motion.line key={`ray-${i}`} x1="80" y1="80" x2={80 + Math.cos(i * 60 * Math.PI / 180) * 30} y2={80 + Math.sin(i * 60 * Math.PI / 180) * 30} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4"
                animate={{ strokeDashoffset: [0, 8] }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            ))}
          </motion.g>
        )}

        {sub === '15C' && (
          <motion.g key="15C" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Produced Water Recycling</text>

            {/* Surface & Subsurface */}
            <rect x="50" y="150" width="300" height="100" fill="#475569" fillOpacity="0.1" rx="8" />
            <text x="200" y="240" fill="#94a3b8" fontSize="8" textAnchor="middle" className="font-black uppercase">RESERVOIR</text>

            {/* Production Well */}
            <path d="M 120 100 L 120 200" stroke="#94a3b8" strokeWidth="4" />
            <text x="120" y="80" fill="#94a3b8" fontSize="8" textAnchor="middle" className="font-black uppercase">WELL PAD</text>

            {/* Recycling Facility */}
            <rect x="230" y="100" width="80" height="40" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2" rx="4" />
            <text x="270" y="123" fill="#3b82f6" fontSize="8" textAnchor="middle" className="font-black uppercase">WATER RECYCLING</text>

            {/* Flow Path */}
            <path d="M 120 100 L 120 60 L 270 60 L 270 100" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.3" />

            {/* Flowing Water Particles */}
            {[...Array(8)].map((_, i) => (
              <motion.circle
                key={`water-${i}`} r="3" fill="#3b82f6"
                animate={{ cx: [120, 120, 270, 270], cy: [200, 60, 60, 100] }}
                transition={{ repeat: Infinity, duration: 4, delay: i * 0.5, ease: "linear" }}
              />
            ))}
          </motion.g>
        )}

        {sub === '15D' && (
          <motion.g key="15D" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#a855f7" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Blockchain Land Ledger</text>

            {[
              { id: 1, x: 80, y: 150 },
              { id: 2, x: 200, y: 150 },
              { id: 3, x: 320, y: 150 },
            ].map((block, i) => (
              <motion.g key={block.id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.4 }}>
                <rect x={block.x - 35} y={block.y - 45} width="70" height="90" fill="#a855f7" fillOpacity="0.1" stroke="#a855f7" strokeWidth="2" rx="4" />
                <text x={block.x} y={block.y - 25} fill="#a855f7" fontSize="8" textAnchor="middle" className="font-black uppercase">BLOCK #{104 + i}</text>
                <rect x={block.x - 20} y={block.y - 5} width="40" height="4" fill="#a855f7" fillOpacity="0.5" />
                <rect x={block.x - 20} y={block.y + 5} width="30" height="4" fill="#a855f7" fillOpacity="0.5" />
                <rect x={block.x - 20} y={block.y + 15} width="20" height="4" fill="#a855f7" fillOpacity="0.5" />
                <circle cx={block.x} cy={block.y + 30} r="6" fill="#a855f7" fillOpacity="0.2" stroke="#a855f7" strokeWidth="1" />
              </motion.g>
            ))}

            {/* Chains */}
            <motion.path d="M 115 150 L 165 150" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8 }} />
            <motion.path d="M 235 150 L 285 150" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2 }} />

            {/* Hash Verifications */}
            <motion.circle cx="140" cy="150" r="4" fill="white" animate={{ scale: [1, 2, 1], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }} />
            <motion.circle cx="260" cy="150" r="4" fill="white" animate={{ scale: [1, 2, 1], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 1.4 }} />
          </motion.g>
        )}

        {sub === '15E' && (
          <motion.g key="15E" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <text x="200" y="30" fill="#ef4444" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">Cross-Unit Lateral Allocation</text>

            {/* Lease Units */}
            {[
              { id: 'TRACT A', x: 60, w: 100, color: '#0ea5e9' },
              { id: 'TRACT B', x: 160, w: 80, color: '#10b981' },
              { id: 'TRACT C', x: 240, w: 100, color: '#f59e0b' },
            ].map((tract) => (
              <g key={tract.id}>
                <rect x={tract.x} y="80" width={tract.w} height="140" fill={tract.color} fillOpacity="0.05" stroke={tract.color} strokeWidth="2" strokeDasharray="4 4" />
                <text x={tract.x + tract.w / 2} y="100" fill={tract.color} fontSize="8" textAnchor="middle" className="font-black uppercase">{tract.id}</text>
              </g>
            ))}

            {/* Wellpad */}
            <circle cx="80" cy="150" r="8" fill="#ef4444" />
            <text x="80" y="130" fill="#ef4444" fontSize="8" textAnchor="middle" className="font-black uppercase">WELL PAD</text>

            {/* Horizontal Lateral */}
            <motion.path
              d="M 80 150 L 320 150" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, ease: "easeInOut" }}
            />

            {/* Perforation Clusters allocating flow */}
            {[100, 140, 180, 220, 260, 300].map((x, i) => (
              <motion.circle
                key={`perf-${i}`} cx={x} cy="150" r="4" fill="white"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [1, 2, 1] }}
                transition={{ delay: 1 + i * 0.3, duration: 1.5, repeat: Infinity }}
              />
            ))}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}
