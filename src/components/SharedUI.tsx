import React from 'react';

export const InputWithSlider = ({ label, value, min, max, step, unit, source, onChange }: any) => (
  <div className="py-1.5 border-b border-border-subtle/20 last:border-0">
    <div className="flex justify-between items-center h-6">
      <div className="flex flex-col flex-1 min-w-0 pr-2">
        <label className="text-[11px] text-industry-label font-medium uppercase truncate" title={label}>{label}</label>
        {source && <span className="formula-ref">{source}</span>}
      </div>
      <div className="flex items-center gap-1.5 w-[110px] justify-end shrink-0">
        <input 
          type="number" 
          value={value} 
          step={step}
          className="w-16 bg-elevated-bg border border-border-subtle rounded px-1.5 py-0.5 text-[12px] text-industry-value data-mono outline-none focus:border-brand-primary text-right"
          onChange={e => onChange(Number(e.target.value))}
        />
        <span className="unit-label uppercase w-8 text-[10px] text-industry-unit shrink-0">{unit}</span>
      </div>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step} 
      value={value} 
      className="w-full h-0.5 mt-1 bg-border-subtle rounded appearance-none cursor-pointer accent-brand-primary hover:accent-brand-primary-hover opacity-40 hover:opacity-100 transition-opacity"
      onChange={e => onChange(Number(e.target.value))}
    />
  </div>
);

export const DataRow = ({ label, value, unit, source, precision = 2 }: any) => (
  <div className="flex justify-between items-center py-1 border-b border-border-subtle/10 last:border-0 px-1 -mx-1 transition-colors">
    <div className="flex flex-col flex-1 min-w-0 pr-2">
      <span className="text-[11px] text-industry-label uppercase truncate" title={label}>{label}</span>
      {source && <span className="formula-ref leading-tight">{source}</span>}
    </div>
    <div className="flex items-baseline justify-end gap-1 shrink-0 w-[110px]">
      <span className="data-mono text-[12px] text-industry-value font-medium">
        {typeof value === 'number' ? value.toFixed(precision) : value}
      </span>
      <span className="unit-label uppercase text-[10px] text-industry-unit w-8 text-left">{unit}</span>
    </div>
  </div>
);

export const SectionHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <div className="mb-4 border-b border-border-subtle pb-2">
    <h3 className="text-[12px] font-bold text-text-primary uppercase tracking-widest">{title}</h3>
    {subtitle && <p className="text-[10px] text-text-secondary uppercase mt-0.5">{subtitle}</p>}
  </div>
);

export const FileDropZone = ({ 
  onFileSelect, 
  accept = ".csv,.las,.xlsx,.witsml", 
  label = "Drop Production File", 
  subLabel = "Supports .CSV, .LAS, .XLSX, .WITSML",
  icon: Icon
}: { 
  onFileSelect: (file: File) => void, 
  accept?: string, 
  label?: string, 
  subLabel?: string,
  icon: any
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept={accept}
        onChange={handleFileSelect}
      />
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`p-10 rounded-3xl border-2 border-dashed mb-8 w-full max-w-lg cursor-pointer transition-all flex flex-col items-center justify-center ${
          isDragging 
            ? "bg-indigo-500/20 border-indigo-500 scale-[1.02]" 
            : "bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10 hover:border-indigo-500/40"
        }`}
      >
        <Icon size={48} className={`mx-auto mb-6 transition-transform ${isDragging ? "text-indigo-400 scale-110" : "text-indigo-400"}`} />
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">
          {isDragging ? "Drop to Ingest" : label}
        </h3>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{subLabel}</p>
      </div>
    </>
  );
};
