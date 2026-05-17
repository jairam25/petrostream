import React from 'react';

export const InputWithSlider = ({ label, value, min, max, step, unit, onChange }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center px-1">
      <label className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-2">
        <input 
          type="number" 
          value={value} 
          step={step}
          className="w-16 bg-white/5 border border-white/5 rounded px-2 py-0.5 text-[10px] text-white font-mono outline-none focus:border-emerald-500/50"
          onChange={e => onChange(Number(e.target.value))}
        />
        <span className="text-[10px] text-slate-700 font-mono uppercase">{unit}</span>
      </div>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step} 
      value={value} 
      className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500"
      onChange={e => onChange(Number(e.target.value))}
    />
  </div>
);
