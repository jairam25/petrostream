import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Snowflake, AlertTriangle, Droplets, Shield, FlaskConical, Waves } from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateHydrateTempProxy } from '../../lib/production';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { VLPFlowSimulator } from './VLPFlowSimulator';

export function FlowAssuranceModule() {
  const [activePhase, setActivePhase] = useState<'8A' | '8B' | '8C' | '8D' | '8E' | '8F'>('8A');
  const phases = [
    { id: '8A', name: 'Paraffin/Wax', icon: Snowflake },
    { id: '8B', name: 'Asphaltene', icon: AlertTriangle },
    { id: '8C', name: 'Scale', icon: Shield },
    { id: '8D', name: 'Corrosion', icon: FlaskConical },
    { id: '8E', name: 'Hydrates', icon: Waves },
    { id: '8F', name: 'Emulsions', icon: Droplets },
  ];

  // Hydrate inputs
  const [wellTemp, setWellTemp] = useState(90); // °F
  
  const hydrateData = useMemo(() => {
    const pts = [];
    for (let p = 50; p <= 5000; p += 100) {
      pts.push({ pressure: p, hydrateTemp: Math.round(calculateHydrateTempProxy(p)) });
    }
    return pts;
  }, []);

  const assuranceItems: Record<string, { items: { title: string; desc: string }[] }> = {
    '8A': { items: [
      { title: 'Wax Appearance Temp (WAT)', desc: 'Temperature where wax crystals first precipitate. Below WAT, wax deposits on pipe walls by molecular diffusion driven by the radial temperature gradient.' },
      { title: 'Chemical Prevention', desc: 'Pour point depressants (PPDs) modify crystal structure. Crystal modifiers disrupt wax lattice. Dispersants keep wax in suspension.' },
      { title: 'Mechanical Remediation', desc: 'Wireline or coiled tubing cutters, pigging (foam, brush, or scraper pigs), mechanical scratchers during workover.' },
      { title: 'Thermal Management', desc: 'Insulated tubing (OHTC reduction), electric heat trace (on flowlines/umbilicals), periodic hot oil/water circulation.' },
    ]},
    '8B': { items: [
      { title: 'Asphaltene Onset', desc: 'Precipitates below bubble point as pressure drops (gas comes out of solution). Also triggered by CO₂ injection, acid stimulation, and commingling incompatible crude oils.' },
      { title: 'Prevention', desc: 'Chemical dispersants/stabilizers injected downhole via chemical injection mandrel (CIM). Operational: avoid pressure depletion below onset pressure.' },
      { title: 'Remediation', desc: 'Xylene or toluene soak (dissolves asphaltenes). Mechanical (coiled tubing jetting). High-pressure hot water jetting at surface facilities.' },
      { title: 'SARA Analysis', desc: 'Saturates-Aromatics-Resins-Asphaltenes compositional analysis predicts stability. Colloidal Instability Index (CII) used for risk assessment.' },
    ]},
    '8C': { items: [
      { title: 'CaCO₃ (Calcite)', desc: 'Most common downhole scale. Precipitates as pressure drops (CO₂ release raises pH). Easily removed with HCl acid wash.' },
      { title: 'BaSO₄ / SrSO₄', desc: 'Barite and Strontianite: extremely hard, almost insoluble. Forms when incompatible waters mix (high-Ba formation + high-SO₄ seawater). Requires EDTA chelant or mechanical milling.' },
      { title: 'Scale Inhibitor Squeeze', desc: 'Inhibitor (phosphonate or polymer) adsorbs onto formation rock. Returns in produced water above minimum inhibitory concentration (MIC). Squeeze life: weeks to months.' },
      { title: 'Compatibility Testing', desc: 'Mix formation water with injection water at various ratios. Measure TDS, ion concentrations, and observe precipitates. Saturation Index (Langelier, Ryznar) for carbonate scale.' },
    ]},
    '8D': { items: [
      { title: 'CO₂ Sweet Corrosion', desc: 'De Waard-Milliams model: rate depends on CO₂ partial pressure, temperature, pH, and flow velocity. Protective FeCO₃ film forms above 60°C. pH stabilization with bicarbonate reduces rate.' },
      { title: 'H₂S Sour Corrosion', desc: 'Causes SSC (Sulfide Stress Cracking), HIC, and SOHIC. Material selection per NACE MR0175/ISO 15156 is mandatory for sour service.' },
      { title: 'Material Selection', desc: 'Carbon steel → 13Cr stainless → 22Cr duplex → 25Cr super-duplex → Nickel alloys (825, 625). Driven by CO₂ partial pressure, H₂S concentration, chloride content, and temperature.' },
      { title: 'Corrosion Inhibitors', desc: 'Film-forming amine compounds (imidazolines) adsorb on metal surface. Injection at wellhead or via capillary string downhole. Monitored by ER probes and iron in produced water.' },
    ]},
    '8F': { items: [
      { title: 'Emulsion Types', desc: 'Water-in-oil (W/O): most common, stabilized by asphaltenes, resins, and fine solids at oil-water interface. Oil-in-water (O/W): reverse emulsion in high water cut wells.' },
      { title: 'Impact on Operations', desc: 'Dramatic increase in effective viscosity. Increased pressure drop in tubulars and flowlines. Upsets in separators. Corrosion under emulsion deposits.' },
      { title: 'Demulsifier Chemistry', desc: 'Surface-active agents (polyols, polyamines, alkoxylates) disrupt interface film. Injected downhole or at wellhead. Bottle tests determine optimum type and dosage.' },
      { title: 'Treatment Methods', desc: 'Chemical demulsifiers + heat (heater-treater) + electrostatic coalescence (electrostatic treater). Temperature reduces interfacial film strength, aiding droplet coalescence.' },
    ]},
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Snowflake className="text-sky-500" size={32} />
          Phase 8: Flow Assurance <span className="text-sky-500/50">Deposition & Corrosion</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Wellbore Integrity & Fluid Management</p>
      </div>
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {phases.map(p => (
          <button key={p.id} onClick={() => setActivePhase(p.id as any)}
            className={cn("px-4 py-2.5 rounded-[14px] flex items-center gap-1.5 transition-all text-[10px] font-black uppercase tracking-widest",
              activePhase === p.id ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-slate-500 hover:text-white")}>
            <p.icon size={12} />{p.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activePhase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

          {activePhase === '8E' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-4">
                <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] space-y-6">
                  <h3 className="text-xl font-black text-white italic">Operating Conditions</h3>
                  <InputWithSlider label="Wellbore Temperature (°F)" value={wellTemp} min={30} max={250} step={1} unit="°F" onChange={setWellTemp} />
                  <div className="p-5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-center">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk at 1000 psia</p>
                    <p className={cn("text-3xl font-black italic", wellTemp < calculateHydrateTempProxy(1000) ? "text-red-400" : "text-emerald-400")}>
                      {wellTemp < calculateHydrateTempProxy(1000) ? "⚠ Hydrate Risk" : "✓ Safe"}
                    </p>
                  </div>
                </div>
                <div className="glass-card p-6 rounded-3xl border-white/5 bg-sky-500/5">
                  <h5 className="text-[11px] font-black text-sky-400 uppercase tracking-widest mb-2">Prevention</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Thermodynamic inhibitors: MeOH (20-50 wt%), MEG (30-60 wt%). Low-dosage: KHI (kinetic) or AA (anti-agglomerant). Insulation + electrical heat trace.</p>
                </div>
              </div>
              <div className="lg:col-span-8">
                <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] h-[450px] flex flex-col">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic mb-6">Hydrate Stability Envelope (0.6 Gravity Gas Proxy)</h4>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={hydrateData} margin={{ left: 20, right: 20, top: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" />
                        <XAxis dataKey="hydrateTemp" type="number" domain={[20, 100]} stroke="#475569" fontSize={10} label={{ value: 'Temperature (°F)', position: 'insideBottom', offset: -10, fill: '#64748b' }} />
                        <YAxis dataKey="pressure" stroke="#475569" fontSize={10} label={{ value: 'Pressure (psia)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                        <Line type="monotone" dataKey="pressure" stroke="#0ea5e9" strokeWidth={3} dot={false} name="Hydrate Curve" isAnimationActive={false} />
                        <ReferenceLine x={wellTemp} stroke="#ef4444" strokeDasharray="6 3" label={{ value: `Well Temp: ${wellTemp}°F`, fill: '#ef4444', fontSize: 10 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-4 text-center font-bold uppercase tracking-wider">Region LEFT of curve = Hydrate Stability Zone (Risk). Region RIGHT = Safe.</p>
                </div>
              </div>
            </div>
          )}

          {activePhase !== '8E' && assuranceItems[activePhase] && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {assuranceItems[activePhase].items.map(item => (
                  <div key={item.title} className="glass-card p-8 rounded-3xl border-white/5 bg-sky-500/5 hover:border-sky-500/30 transition-all">
                    <h5 className="text-[13px] font-black text-sky-400 uppercase tracking-widest mb-3">{item.title}</h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-4 flex justify-center">
                 <VLPFlowSimulator 
                    pattern={activePhase === '8A' ? 'slug' : activePhase === '8F' ? 'bubble' : 'annular'} 
                    intensity={0.4} 
                 />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
