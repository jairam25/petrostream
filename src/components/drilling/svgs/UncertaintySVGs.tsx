import React from 'react';
const INDIGO='#6366f1',CYAN='#22d3ee',AMBER='#f59e0b',EMERALD='#10b981',SLATE='#94a3b8',RED='#ef4444',PINK='#ec4899';
const TEXT='rgba(148,163,184,0.5)',GRID='rgba(148,163,184,0.08)',AXIS='rgba(148,163,184,0.25)';

export const EllipseOfUncertaintySVG: React.FC<{
  semiMajor:number;semiMinor:number;orientation:number;confidenceLevel:number;kFactor:number;verticalUncertainty:number;
}> = ({semiMajor,semiMinor,orientation,confidenceLevel,kFactor,verticalUncertainty}) => {
  const W=380,H=240,cx=W/2,cy=H/2-10;
  const scale=W/(semiMajor*4.5);
  const rx=semiMajor*scale, ry=semiMinor*scale;
  return(
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{background:'#020617'}}>
      <line x1={cx} y1={cy-80} x2={cx} y2={cy+80} stroke={AXIS} strokeWidth={1}/>
      <line x1={cx-100} y1={cy} x2={cx+100} y2={cy} stroke={AXIS} strokeWidth={1}/>
      <text x={cx+105} y={cy+4} fill={TEXT} fontSize={7} fontFamily="monospace">E</text>
      <text x={cx-4} y={cy-85} fill={TEXT} fontSize={7} fontFamily="monospace">N</text>
      <ellipse cx={cx} cy={cy} rx={rx/kFactor} ry={ry/kFactor} fill={CYAN} opacity={0.1} stroke={CYAN} strokeWidth={1} strokeDasharray="4,2"
        transform={`rotate(${orientation},${cx},${cy})`}/>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={AMBER} opacity={0.08} stroke={AMBER} strokeWidth={1.5}
        transform={`rotate(${orientation},${cx},${cy})`}/>
      <circle cx={cx} cy={cy} r={3} fill={RED}/>
      <rect x={10} y={H-40} width={360} height={35} rx={6} fill="#0f172a" stroke={AXIS} strokeWidth={0.5}/>
      <text x={20} y={H-20} fill={SLATE} fontSize={8} fontFamily="monospace">
        Semi-Major: {semiMajor.toFixed(1)}ft | Semi-Minor: {semiMinor.toFixed(1)}ft | Vert: {verticalUncertainty.toFixed(1)}ft
      </text>
      <text x={20} y={H-8} fill={AMBER} fontSize={7} fontFamily="monospace">
        {confidenceLevel}% Confidence (k={kFactor.toFixed(2)}) | Orientation: {orientation.toFixed(0)}°
      </text>
    </svg>
  );
};

export const ISCWSAErrorSpider: React.FC<{
  errorTerms:Array<{name:string;weight:number;value:number}>;
  inclinations:number[];
  magField:number;
}> = ({errorTerms}) => {
  const W=380,H=260,cx=W/2,cy=H/2;
  const r=80,n=errorTerms.length;
  const maxVal=Math.max(...errorTerms.map(t=>t.value),0.1);
  return(
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{background:'#020617'}}>
      {[0.25,0.5,0.75,1].map(f=>
        <polygon key={f} points={errorTerms.map((_,i)=>{
          const a=(i/n)*2*Math.PI-Math.PI/2;
          return `${cx+Math.cos(a)*r*f},${cy+Math.sin(a)*r*f}`;
        }).join(' ')} fill="none" stroke={GRID} strokeWidth={0.5}/>
      )}
      {Array.from({length:8}).map((_,i)=>{
        const a=(i/8)*2*Math.PI-Math.PI/2;
        return <line key={i} x1={cx} y1={cy} x2={cx+Math.cos(a)*r} y2={cy+Math.sin(a)*r} stroke={GRID} strokeWidth={0.3}/>;
      })}
      <polygon points={errorTerms.map((t,i)=>{
        const a=(i/n)*2*Math.PI-Math.PI/2;
        const dist=(t.value/maxVal)*r;
        return `${cx+Math.cos(a)*dist},${cy+Math.sin(a)*dist}`;
      }).join(' ')} fill={CYAN} opacity={0.15} stroke={CYAN} strokeWidth={1.5}/>
      {errorTerms.map((t,i)=>{
        const a=(i/n)*2*Math.PI-Math.PI/2;
        const dist=(t.value/maxVal)*r;
        const lx=cx+Math.cos(a)*(dist+14),ly=cy+Math.sin(a)*(dist+14);
        return(
          <g key={i}>
            <circle cx={cx+Math.cos(a)*dist} cy={cy+Math.sin(a)*dist} r={3} fill={CYAN}/>
            <text x={lx} y={ly} fill={SLATE} fontSize={6} textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">{t.name}</text>
          </g>
        );
      })}
      <text x={cx} y={cy+r+30} fill={TEXT} fontSize={8} textAnchor="middle" fontFamily="monospace">ISCWSA Error Source Contribution</text>
    </svg>
  );
};

export const ErrorEllipse3D: React.FC<{
  semiMajor:number;semiMinor:number;orientation:number;verticalUncertainty:number;md:number;
}> = ({semiMajor,semiMinor,orientation,verticalUncertainty,md}) => {
  const W=380,H=200,cx=W/2,cy=H/2;
  const s=W/(semiMajor*3.5);
  const orad=orientation*Math.PI/180;
  return(
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{background:'#020617'}}>
      <defs>
        <linearGradient id="e3d" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={CYAN} stopOpacity={0.3}/>
          <stop offset="100%" stopColor={INDIGO} stopOpacity={0.05}/>
        </linearGradient>
      </defs>
      {/* 3D cylinder-ish projection */}
      <ellipse cx={cx-30} cy={cy+10} rx={semiMinor*s} ry={verticalUncertainty*s} fill="none" stroke={SLATE} strokeWidth={0.8} opacity={0.5}/>
      <ellipse cx={cx+50} cy={cy+20} rx={semiMinor*s} ry={verticalUncertainty*s} fill="none" stroke={SLATE} strokeWidth={0.8} opacity={0.5}/>
      <line x1={cx-30-semiMinor*s} y1={cy+10} x2={cx+50-semiMinor*s} y2={cy+20} stroke={SLATE} strokeWidth={0.5} opacity={0.4}/>
      <line x1={cx-30+semiMinor*s} y1={cy+10} x2={cx+50+semiMinor*s} y2={cy+20} stroke={SLATE} strokeWidth={0.5} opacity={0.4}/>
      {/* main ellipse */}
      <ellipse cx={cx+50} cy={cy+20} rx={Math.abs(semiMajor*Math.cos(orad)*s)} ry={Math.abs(semiMajor*Math.sin(orad)*s)}
        fill="url(#e3d)" stroke={CYAN} strokeWidth={1.5}
        transform={`rotate(${orientation},${cx+50},${cy+20})`}/>
      <ellipse cx={cx-30} cy={cy+10} rx={Math.abs(semiMajor*Math.cos(orad)*s)} ry={Math.abs(semiMajor*Math.sin(orad)*s)}
        fill={CYAN} opacity={0.1} stroke={AMBER} strokeWidth={1} strokeDasharray="3,2"
        transform={`rotate(${orientation},${cx-30},${cy+10})`}/>
      <circle cx={cx+50} cy={cy+20} r={3} fill={RED}/>
      <text x={20} y={H-12} fill={SLATE} fontSize={8} fontFamily="monospace">3D EOU at MD {md}ft | Semi-Major: {semiMajor.toFixed(1)}ft</text>
    </svg>
  );
};

export const UncertaintyConeDiagram: React.FC<{
  stations: { md: number; tvd: number; north: number; east: number;
    semiMajor: number; semiMinor: number; verticalUncertainty: number; orientation: number }[];
}> = ({ stations }) => {
  const W = 420, H = 340, pad = 55;
  const maxMD = stations.length > 1 ? stations[stations.length - 1].md : 1000;
  const maxH = stations.reduce((m, s) => Math.max(m, Math.abs(s.north), Math.abs(s.east), s.semiMajor), 50);
  const sx = (W - pad * 2) / (maxH * 2.2);
  const sy = (H - pad * 2) / maxMD;
  const cx = W / 2;
  const step = Math.max(1, Math.floor(stations.length / 15));
  return (
    <svg viewBox={'0 0 ' + W + ' ' + H} className="w-full h-full" style={{ background: '#020617' }}>
      {/* Center line */}
      <line x1={cx} y1={pad} x2={cx} y2={H - pad} stroke={AXIS} strokeWidth={0.5} strokeDasharray="4,4" />
      {/* Ellipse slices at each sampled station */}
      {stations.filter((_, i) => i % step === 0 || i === stations.length - 1).map((s, idx) => {
        const y = pad + s.md * sy;
        const rad = ((s.orientation - 90) * Math.PI) / 180;
        const sm = s.semiMajor * sx * 0.9;
        const sn = s.semiMinor * sx * 0.9;
        if (isNaN(sm) || isNaN(sn) || sm <= 0 || sn <= 0) return null;
        return (
          <g key={idx}>
            <ellipse cx={cx} cy={y} rx={sm} ry={sn} fill="none" stroke={CYAN} strokeWidth={0.7} opacity={0.3} />
            <circle cx={cx} cy={y} r={2} fill={AMBER} />
            {idx % 3 === 0 && (
              <text x={cx - sm - 6} y={y + 3} fill={TEXT} fontSize={6} textAnchor="end" fontFamily="monospace">
                {(s.semiMajor * 2).toFixed(1)}×{(s.semiMinor * 2).toFixed(1)}′
              </text>
            )}
          </g>
        );
      })}
      {/* Depth labels */}
      {[0, Math.round(maxMD * 0.25), Math.round(maxMD * 0.5), Math.round(maxMD * 0.75), Math.round(maxMD)].map(d => {
        const y = pad + d * sy;
        return (
          <g key={d}>
            <line x1={cx - 4} y1={y} x2={cx + 4} y2={y} stroke={SLATE} strokeWidth={0.5} />
            <text x={cx + 8} y={y + 3} fill={TEXT} fontSize={7} fontFamily="monospace">{d}′</text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 6} fill={SLATE} fontSize={9} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        Uncertainty Cone — {stations.length} stations to TD {maxMD.toFixed(0)}′
      </text>
      <text x={W - pad} y={12} fill={TEXT} fontSize={7} textAnchor="end" fontFamily="monospace">
        Max EOU Semi-major: {(stations.reduce((m, s) => Math.max(m, s.semiMajor), 0) * 2).toFixed(1)}′
      </text>
    </svg>
  );
};
