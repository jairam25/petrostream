import React, { useState } from 'react';
import { 
  User, 
  Moon, 
  Shield, 
  Zap,
  Cpu,
  Save,
  Database,
  Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function SettingsStage({ theme, setTheme }: { theme: 'stealth' | 'deep-blue', setTheme: (t: 'stealth' | 'deep-blue') => void }) {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', icon: User, label: 'Admin Identity' },
    { id: 'visual', icon: Moon, label: 'Control Room Style' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-8 h-full">
        {/* Navigation */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-4 px-8 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab.id 
                    ? "bg-brand-primary text-white shadow-[0_0_30px_rgba(99,102,241,0.3)]" 
                    : "text-slate-500 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
          
          <div className="mt-auto p-8 glass-card rounded-2xl bg-indigo-500/5 border-indigo-500/10">
             <div className="flex items-center gap-3 mb-4">
                <Shield size={16} className="text-indigo-400" />
                <h5 className="text-[11px] font-black text-white uppercase tracking-widest">System Status</h5>
             </div>
             <p className="text-[10px] text-slate-500 font-medium italic">All neural nodes synchronized. Terminal version 4.2.0-STABLE.</p>
          </div>
        </div>

        {/* Content */}
        <div className="grow">
          <div className="glass-card rounded-3xl p-16 border-white/5 bg-black/20 h-full flex flex-col">
             {activeTab === 'profile' && (
               <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-10">
                     <div className="w-32 h-32 rounded-3xl bg-brand-primary/10 border-2 border-brand-primary/40 flex items-center justify-center text-brand-primary relative group shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                        <User size={64} />
                        <div className="absolute inset-0 bg-brand-primary/20 rounded-3xl animate-pulse" />
                     </div>
                     <div>
                        <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter">Jairam <span className="text-brand-primary">Pawar</span></h3>
                        <p className="text-sm text-slate-500 font-mono uppercase tracking-widest mt-2 font-bold italic">Principal System Administrator</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-4">Terminal Username</label>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-xl font-black text-white italic">
                           jairam.pawar
                        </div>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-4">Access Level</label>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-xl font-black text-emerald-400 italic flex items-center gap-3">
                           <Zap size={20} /> ROOT_ACCESS
                        </div>
                     </div>
                  </div>

                  <div className="p-10 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl mt-10">
                     <h4 className="text-xs font-black text-white uppercase italic mb-4">Security Protocol</h4>
                     <p className="text-sm text-slate-500 leading-relaxed font-medium">System identity is locked to the hardware signature of the master workstation. Multi-factor authentication is active via neural link.</p>
                  </div>
               </div>
             )}

             {activeTab === 'visual' && (
               <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div>
                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Aesthetic <span className="text-brand-primary">Matrix</span></h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-widest italic font-bold">Configure the visual energy of the PetroStream interface</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-10">
                     <div className="space-y-6">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-4">Interface Mode Selection</p>
                        <div className="grid grid-cols-1 gap-4">
                           <button 
                             onClick={() => setTheme('stealth')}
                             className={cn(
                               "p-8 rounded-3xl bg-black/40 border-2 transition-all flex items-center gap-6 group",
                               theme === 'stealth' ? "border-brand-primary bg-brand-primary/5" : "border-white/5 hover:border-white/20"
                             )}
                           >
                              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                 <Zap size={32} />
                              </div>
                              <div className="text-left">
                                 <p className="text-lg font-black text-white uppercase italic tracking-tighter">Stealth Indigo</p>
                                 <p className="text-[10px] text-slate-500 font-bold uppercase">High-Contrast Neural Grid</p>
                              </div>
                           </button>

                           <button 
                             onClick={() => setTheme('deep-blue')}
                             className={cn(
                               "p-8 rounded-3xl bg-[#020617]/40 border-2 transition-all flex items-center gap-6 group",
                               theme === 'deep-blue' ? "border-brand-primary bg-brand-primary/5" : "border-white/5 hover:border-white/20"
                             )}
                           >
                              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                 <Globe size={32} />
                              </div>
                              <div className="text-left">
                                 <p className="text-lg font-black text-white uppercase italic tracking-tighter">Deep Oceanic</p>
                                 <p className="text-[10px] text-slate-500 font-bold uppercase">Submerged Data Environment</p>
                              </div>
                           </button>
                        </div>
                     </div>
                     
                     <div className="space-y-8">
                        <div className="p-10 bg-white/5 border border-white/5 rounded-3xl space-y-8">
                           <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                 <span className="text-[10px] font-black text-white uppercase italic">Glass Blur Intensity</span>
                                 <span className="text-[10px] font-mono text-brand-primary">85%</span>
                              </div>
                              <input type="range" className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-brand-primary cursor-pointer" />
                           </div>
                           <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                 <span className="text-[10px] font-black text-white uppercase italic">Neural Pulse Frequency</span>
                                 <span className="text-[10px] font-mono text-brand-primary">0.5Hz</span>
                              </div>
                              <input type="range" className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-brand-primary cursor-pointer" />
                           </div>
                        </div>
                        <div className="p-10 bg-brand-primary/10 border border-brand-primary/20 rounded-3xl flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <Cpu size={24} className="text-brand-primary" />
                              <div>
                                 <p className="text-xs font-black text-white uppercase italic">GPU Acceleration</p>
                                 <p className="text-[11px] text-slate-500 font-bold uppercase">Hardware Render Active</p>
                              </div>
                           </div>
                           <div className="w-14 h-8 bg-brand-primary rounded-full p-1 relative cursor-pointer shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                              <div className="w-6 h-6 bg-white rounded-full absolute right-1" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
             )}

             <div className="mt-auto pt-10 border-t border-white/5 flex justify-end">
                <button className="px-16 py-6 bg-brand-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest italic flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(99,102,241,0.4)]">
                  <Save size={18} /> Deploy Configuration
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingInput({ label, value, disabled }: { label: string, value: string, disabled?: boolean }) {
   return (
      <div className="space-y-2">
         <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest italic">{label}</label>
         <input 
            type="text" 
            defaultValue={value} 
            disabled={disabled}
            className={cn(
               "w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-brand-primary/40 transition-all",
               disabled && "opacity-40 cursor-not-allowed"
            )}
         />
      </div>
   );
}

function UnitToggle({ label, current, options }: { label: string, current: string, options: string[] }) {
   return (
      <div className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl">
         <span className="text-xs font-bold text-white uppercase italic tracking-wider">{label}</span>
         <div className="flex gap-2">
            {options.map(opt => (
               <button 
                  key={opt}
                  className={cn(
                     "px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                     current === opt ? "bg-white text-black" : "bg-black/40 text-slate-500 hover:text-white"
                  )}
               >{opt}</button>
            ))}
         </div>
      </div>
   );
}
