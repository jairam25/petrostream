import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Table as TableIcon, 
  FlaskConical, 
  Thermometer, 
  Gauge, 
  Layers, 
  Droplet,
  Info,
  CheckCircle2,
  XCircle,
  Lightbulb
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { screenEOR, calculateCO2MMP } from '../../lib/reservoir';

const EOR_METHODS_DATA = [
  { name: "Waterflooding", description: "Secondary recovery injecting water to maintain pressure and displace oil.", range: "Recovery: 10-20% incremental" },
  { name: "Polymer Flooding", description: "Adding polymers to water to increase viscosity and improve sweep efficiency.", range: "Recovery: 5-15% incremental" },
  { name: "CO2 Miscible Injection", description: "Injecting CO2 which mixes with oil, reducing viscosity and swelling oil.", range: "Recovery: 7-15% incremental" },
  { name: "Steam Flooding", description: "Thermal recovery using steam to heat heavy oil and reduce its viscosity.", range: "Recovery: 25-50% incremental" },
  { name: "In-Situ Combustion", description: "Burning a portion of the oil in place to generate heat and drive oil.", range: "Recovery: 10-20% incremental" },
  { name: "Surfactant/ASP Flooding", description: "Using chemicals to reduce interfacial tension between oil and water.", range: "Recovery: 10-20% incremental" }
];

export function EORScreeningTab() {
  const [api, setApi] = useState(35);
  const [viscosity, setViscosity] = useState(5);
  const [depth, setDepth] = useState(5000);
  const [temp, setTemp] = useState(150);
  const [porosity, setPorosity] = useState(0.2);
  const [permeability, setPermeability] = useState(100);
  const [oilSat, setOilSat] = useState(0.6);

  const screenedMethods = useMemo(() => {
    return screenEOR({ api, viscosity, depth, temp, porosity, permeability, oilSat });
  }, [api, viscosity, depth, temp, porosity, permeability, oilSat]);

  const co2mmp = useMemo(() => calculateCO2MMP(temp), [temp]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Parameters Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <FlaskConical size={18} className="text-pink-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Reservoir & Fluid Props</h4>
           </div>

           <div className="space-y-8">
              <InputWithSlider label="Oil API Gravity" value={api} min={5} max={60} step={1} unit="°API" onChange={setApi} />
              <InputWithSlider label="Oil Viscosity" value={viscosity} min={0.1} max={5000} step={1} unit="cp" onChange={setViscosity} />
              <InputWithSlider label="Reservoir Depth" value={depth} min={500} max={20000} step={100} unit="ft" onChange={setDepth} />
              <InputWithSlider label="Temperature" value={temp} min={60} max={350} step={1} unit="°F" onChange={setTemp} />
              <InputWithSlider label="Permeability" value={permeability} min={0.1} max={5000} step={10} unit="md" onChange={setPermeability} />
              <InputWithSlider label="Oil Saturation (So)" value={oilSat * 100} min={10} max={90} step={1} unit="%" onChange={(v) => setOilSat(v/100)} />
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-pink-900/40 to-black border-white/5">
           <div className="flex justify-between items-center mb-6">
              <p className="text-[10px] text-pink-400 font-mono uppercase tracking-widest">Miscibility Check</p>
              <Gauge size={16} className="text-pink-500" />
           </div>
           <div className="space-y-4">
              <div>
                <p className="text-3xl font-black text-white italic tracking-tighter">{Math.round(co2mmp)} PSI</p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Estimated CO2 MMP</p>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                *Minimum Miscibility Pressure estimated using Cronquist Correlation. Miscible flood requires res. pressure &gt; MMP.
              </p>
           </div>
        </div>
      </div>

      {/* Results Display */}
      <div className="lg:col-span-8 space-y-8">
        <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <ShieldCheck size={160} className="text-white" />
           </div>

           <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                 <div className="h-10 w-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500">
                   <Lightbulb size={20} />
                 </div>
                 <h4 className="text-xs font-black text-white italic uppercase tracking-widest">EOR Screening Report</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {EOR_METHODS_DATA.map(method => {
                   const isApplicable = screenedMethods.includes(method.name);
                   return (
                     <div 
                       key={method.name}
                       className={cn(
                        "p-6 rounded-2xl border transition-all",
                        isApplicable 
                          ? "bg-emerald-500/10 border-emerald-500/20" 
                          : "bg-white/5 border-transparent opacity-50"
                       )}
                     >
                        <div className="flex justify-between items-start mb-4">
                           <h5 className="text-[11px] font-black text-white uppercase tracking-widest">{method.name}</h5>
                           {isApplicable ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-slate-700" />}
                        </div>
                        <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">{method.description}</p>
                        <div className="pt-4 border-t border-white/5">
                           <p className={cn("text-[11px] font-mono", isApplicable ? "text-emerald-400" : "text-slate-600")}>
                             {method.range}
                           </p>
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>
        </div>

        {/* Global Reference Table */}
        <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 backdrop-blur-xl">
           <div className="flex items-center gap-4 mb-10">
              <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                <TableIcon size={20} />
              </div>
              <h4 className="text-xs font-black text-white italic uppercase tracking-widest">Global Reference Cases</h4>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                    <th className="pb-4">Field / Project</th>
                    <th className="pb-4">Method</th>
                    <th className="pb-4">Perm (md)</th>
                    <th className="pb-4">API</th>
                    <th className="pb-4">Incr. RF</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] text-slate-400">
                  <tr className="border-b border-white/5">
                    <td className="py-4 font-bold text-white">Prudhoe Bay, USA</td>
                    <td className="py-4 italic">Miscible HC Gas</td>
                    <td className="py-4">100-300</td>
                    <td className="py-4">27</td>
                    <td className="py-4 text-emerald-400">8-12%</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 font-bold text-white">Weyburn, Canada</td>
                    <td className="py-4 italic">CO2 Flooding</td>
                    <td className="py-4">10-50</td>
                    <td className="py-4">29</td>
                    <td className="py-4 text-emerald-400">10-15%</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 font-bold text-white">Daqing, China</td>
                    <td className="py-4 italic">Polymer</td>
                    <td className="py-4">500-1000</td>
                    <td className="py-4">35</td>
                    <td className="py-4 text-emerald-400">12%</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-white">Kern River, USA</td>
                    <td className="py-4 italic">Steam Injection</td>
                    <td className="py-4">1000+</td>
                    <td className="py-4">13</td>
                    <td className="py-4 text-emerald-400">50%+</td>
                  </tr>
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
