import React from 'react';
const INDIGO='#6366f1',CYAN='#22d3ee',AMBER='#f59e0b',EMERALD='#10b981',SLATE='#94a3b8',RED='#ef4444',PINK='#ec4899';
const TEXT='rgba(148,163,184,0.5)',GRID='rgba(148,163,184,0.08)',AXIS='rgba(148,163,184,0.25)';

export const AntiCollisionDiagram: React.FC<{
  refWell:{md:number;tvd:number;n:number;e:number;inc:number;azi:number}[];
  offsetWell:{md:number;tvd:number;n:number;e:number;inc:number;azi:number}[];
  closestApproach:number;depthAtClosest:number;separationFactor:number;riskLevel:string;
}> = ({refWell,offsetWell,closestApproach,depthAtClosest,separationFactor,riskLevel}) => {
  const W=380,H=220,cx=W/2,cy=H/2;
  const maxCoord=Math.max(
    ...refWell.map(s=>Math.abs(s.n)+Math.abs(s.e)),
    ...offsetWell.map(s=>Math.abs(s.n)+Math.abs(s.e)),
    100
  );
  const s=(H-80)/maxCoord/2;
  return(
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{background:'#020617'}}>
      <line x1={cx} y1={cy-(H/2-pad)} x2={cx} y2={cy+(H/2-pad)} stroke={AXIS} strokeWidth={0.5}/>
      <line x1={cx-(W/2-pad)} y1={cy} x2={cx+(W/2-pad)} y2={cy} stroke={AXIS} strokeWidth={0.5}/>
      <text x={cx+2} y={cy-(H/2-pad-4)} fill={TEXT} fontSize={7} fontFamily="monospace">N</text>
      <text x={cx+(W/2-pad-15)} y={cy-3} fill={TEXT} fontSize={7} fontFamily="monospace">E</text>
      {/* Offset well path */}
      {offsetWell.length>1&&(
        <g>
          {offsetWell.map((pt,i)=>{
            if(i===0)return null;
            const prev=offsetWell[i-1];
            const x1=cx+prev.e*s,y1=cy-prev.n*s,x2=cx+pt.e*s,y2=cy-pt.n*s;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={SLATE} strokeWidth={2} opacity={0.6}/>;
          })}
          <circle cx={cx+offsetWell[offsetWell.length-1].e*s} cy={cy-offsetWell[offsetWell.length-1].n*s} r={4} fill={SLATE}/>
        </g>
      )}
      {/* Reference well path */}
      {refWell.length>1&&(
        <g>
          {refWell.map((pt,i)=>{
            if(i===0)return null;
            const prev=refWell[i-1];
            const x1=cx+prev.e*s,y1=cy-prev.n*s,x2=cx+pt.e*s,y2=cy-pt.n*s;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={CYAN} strokeWidth={2.5}/>;
          })}
          <circle cx={cx+refWell[refWell.length-1].e*s} cy={cy-refWell[refWell.length-1].n*s} r={4} fill={CYAN}/>
        </g>
      )}
      {/* Closest approach indicator */}
      <circle cx={cx} cy={cy-20} r={Math.min(closestApproach*s,35)} fill="none" stroke={riskLevel==='safe'?EMERALD:riskLevel==='minor'?AMBER:RED} strokeWidth={1.5} strokeDasharray="4,2"/>
      <text x={cx+Math.min(closestApproach*s,35)+6} y={cy-24} fill={riskLevel==='safe'?EMERALD:riskLevel==='minor'?AMBER:RED} fontSize={7} fontFamily="monospace">{closestApproach.toFixed(0)}ft</text>
      {/* Legend */}
      <rect x={10} y={8} width={110} height={45} rx={4} fill="#0f172a" stroke={AXIS} strokeWidth={0.5}/>
      <line x1={18} y1={18} x2={38} y2={18} stroke={CYAN} strokeWidth={2}/>
      <text x={42} y={20} fill={SLATE} fontSize={7} fontFamily="monospace">Ref Well</text>
      <line x1={18} y1={32} x2={38} y2={32} stroke={SLATE} strokeWidth={2}/>
      <text x={42} y={34} fill={SLATE} fontSize={7} fontFamily="monospace">Offset</text>
      <text x={20} y={48} fill={TEXT} fontSize={6} fontFamily="monospace">SF: {separationFactor.toFixed(1)} @ {depthAtClosest}ft</text>
    </svg>
  );
};
const pad=40;

export const SeparationFactorGauge: React.FC<{
  separationFactor:number;riskLevel:string;refEOU:number;offsetEOU:number;
}> = ({separationFactor,riskLevel,refEOU,offsetEOU}) => {
  const W=380,H=260,cx=W/2,cy=H/2-10,r=90;
  const angle=-90+(Math.min(separationFactor,5)/5)*270;
  const color=separationFactor>3?EMERALD:separationFactor>1.5?AMBER:RED;
  return(
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{background:'#020617'}}>
      {/* Gauge arc background */}
      <path d={`M${cx-r},${cy} A${r},${r} 0 0,1 ${cx},${cy-r}`} fill="none" stroke="#1e293b" strokeWidth={14} strokeLinecap="round"/>
      <path d={`M${cx-r},${cy} A${r},${r} 0 0,1 ${cx+r*Math.cos(angle*Math.PI/180)},${cy+r*Math.sin(angle*Math.PI/180)}`}
        fill="none" stroke={color} strokeWidth={14} strokeLinecap="round"/>
      {/* Markers */}
      {[0,1.5,3,5].map(v=>{
        const a=-90+(Math.min(v,5)/5)*270;
        const ox=cx+Math.cos(a*Math.PI/180)*(r-20),oy=cy+Math.sin(a*Math.PI/180)*(r-20);
        const ix=cx+Math.cos(a*Math.PI/180)*(r-10),iy=cy+Math.sin(a*Math.PI/180)*(r-10);
        return(
          <g key={v}>
            <line x1={ox} y1={oy} x2={ix} y2={iy} stroke={SLATE} strokeWidth={1}/>
            <text x={cx+Math.cos(a*Math.PI/180)*(r+14)} y={cy+Math.sin(a*Math.PI/180)*(r+14)} fill={TEXT} fontSize={8} textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">{v}</text>
          </g>
        );
      })}
      {/* Needle */}
      {!isNaN(angle)&&(
        <line x1={cx} y1={cy} x2={cx+Math.cos(angle*Math.PI/180)*(r-25)} y2={cy+Math.sin(angle*Math.PI/180)*(r-25)}
          stroke={color} strokeWidth={3} strokeLinecap="round"/>
      )}
      <circle cx={cx} cy={cy} r={8} fill="#020617" stroke={color} strokeWidth={2}/>
      <circle cx={cx} cy={cy} r={3} fill={color}/>
      <text x={cx} y={cy+50} fill={color} fontSize={22} textAnchor="middle" fontFamily="monospace" fontWeight="bold">{separationFactor.toFixed(2)}</text>
      <text x={cx} y={cy+70} fill={TEXT} fontSize={10} textAnchor="middle" fontFamily="monospace">
        Separation Factor — {riskLevel.toUpperCase()}
      </text>
      <text x={cx} y={cy+86} fill={TEXT} fontSize={7} textAnchor="middle" fontFamily="monospace">
        EOU Ref: {refEOU.toFixed(1)}ft | Offset: {offsetEOU.toFixed(1)}ft
      </text>
    </svg>
  );
};

export const CollisionRiskMatrix: React.FC<{
  separationFactor:number;closestApproach:number;riskLevel:string;
}> = ({separationFactor,closestApproach,riskLevel}) => {
  const W=380,H=200,pad=40,cellW=(W-pad*2)/3,cellH=(H-pad*2)/3;
  const grid=[
    ['Minor','Minor','Moderate'],
    ['Minor','Moderate','Major'],
    ['Moderate','Major','Critical'],
  ];
  const colors:Record<string,string>={Minor:EMERALD,Moderate:AMBER,Major:'#f97316',Critical:RED};
  const approachIdx=closestApproach<50?2:closestApproach<150?1:0;
  const sfIdx=separationFactor<1?2:separationFactor<3?1:0;
  return(
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{background:'#020617'}}>
      <text x={W/2} y={pad-8} fill={SLATE} fontSize={8} textAnchor="middle" fontFamily="monospace" fontWeight="bold">Collision Risk Matrix</text>
      {grid.map((row,ri)=>row.map((cell,ci)=>{
        const x=pad+ci*cellW,y=pad+ri*cellH;
        const isActive=ri===sfIdx&&ci===approachIdx;
        return(
          <g key={`${ri}-${ci}`}>
            <rect x={x} y={y} width={cellW} height={cellH} fill={colors[cell]} opacity={isActive?0.5:0.1} stroke={isActive?colors[cell]:AXIS} strokeWidth={isActive?2:0.5} rx={4}/>
            <text x={x+cellW/2} y={y+cellH/2} fill={isActive?colors[cell]:TEXT} fontSize={9} textAnchor="middle" dominantBaseline="middle" fontFamily="monospace" fontWeight={isActive?'bold':'normal'}>{cell}</text>
          </g>
        );
      }))}
      <text x={pad+cellW/2} y={H-2} fill={TEXT} fontSize={6} textAnchor="middle" fontFamily="monospace">{'SF > 3'}</text>
      <text x={pad+cellW*1.5} y={H-2} fill={TEXT} fontSize={6} textAnchor="middle" fontFamily="monospace">{'SF 1-3'}</text>
      <text x={pad+cellW*2.5} y={H-2} fill={TEXT} fontSize={6} textAnchor="middle" fontFamily="monospace">{'SF < 1'}</text>
      <text x={2} y={pad+cellH/2} fill={TEXT} fontSize={6} fontFamily="monospace" transform={`rotate(-90,2,${pad+cellH/2})`}>{'A >150ft'}</text>
      <text x={2} y={pad+cellH*1.5} fill={TEXT} fontSize={6} fontFamily="monospace" transform={`rotate(-90,2,${pad+cellH*1.5})`}>{'50-150ft'}</text>
      <text x={2} y={pad+cellH*2.5} fill={TEXT} fontSize={6} fontFamily="monospace" transform={`rotate(-90,2,${pad+cellH*2.5})`}>{'A <50ft'}</text>
    </svg>
  );
};

export const TravelingCylinderDiagram: React.FC<{
  approachStations: { md: number; separation: number; cylinderRadius: number;
    sf: number; crossingRisk: 'safe' | 'warning' | 'danger' }[];
  minSeparation: number; minSeparationMD: number; overallSF: number;
}> = ({ approachStations, minSeparation, minSeparationMD, overallSF }) => {
  const W = 450, H = 320, pad = 55;
  const maxMD = approachStations.length > 1 ? approachStations[approachStations.length - 1].md : 1000;
  const maxSep = approachStations.reduce((m, s) => Math.max(m, s.separation, s.cylinderRadius), 10) * 1.2;
  const sy = (H - pad * 2) / maxMD;
  const sx = (W - pad * 2) / maxSep;
  const riskColor = overallSF < 1 ? RED : overallSF < 2 ? AMBER : EMERALD;
  const step = Math.max(1, Math.floor(approachStations.length / 12));
  return (
    <svg viewBox={'0 0 ' + W + ' ' + H} className="w-full h-full" style={{ background: '#020617' }}>
      {/* Axis */}
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke={AXIS} strokeWidth={1} />
      <text x={pad - 8} y={pad - 8} fill={TEXT} fontSize={8} textAnchor="middle" fontFamily="monospace">MD</text>
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke={AXIS} strokeWidth={1} />
      <text x={W - pad + 8} y={H - pad + 3} fill={TEXT} fontSize={8} fontFamily="monospace">Sep</text>

      {/* Cylinder boundary */}
      <line x1={pad} y1={pad} x2={pad + maxSep * sx} y2={H - pad} stroke={riskColor} strokeWidth={1} strokeDasharray="5,5" opacity={0.4} />
      <text x={pad + maxSep * sx + 4} y={pad + 10} fill={riskColor} fontSize={7} fontFamily="monospace">Cyl</text>

      {/* Stations */}
      {approachStations.filter((_, i) => i % step === 0 || i === approachStations.length - 1).map((s, idx) => {
        const y = pad + s.md * sy;
        const x = pad + (s.separation || 0) * sx;
        const cr = (s.cylinderRadius || 1) * sx;
        const sc = s.crossingRisk === 'danger' ? RED : s.crossingRisk === 'warning' ? AMBER : EMERALD;
        return (
          <g key={idx}>
            <circle cx={x} cy={y} r={Math.max(3, cr)} fill="none" stroke={sc} strokeWidth={1}
              opacity={0.5} strokeDasharray="2,2" />
            <circle cx={x} cy={y} r={4} fill={sc} />
            <line x1={pad} y1={y} x2={x} y2={y} stroke={sc} strokeWidth={0.5} opacity={0.3} />
          </g>
        );
      })}

      {/* Legend */}
      <rect x={W - 140} y={pad} width={125} height={70} rx={6} fill="#0f172a" stroke={AXIS} strokeWidth={0.5} />
      <text x={W - 130} y={pad + 14} fill={SLATE} fontSize={8} fontFamily="monospace" fontWeight="bold">Closest Approach</text>
      <text x={W - 130} y={pad + 28} fill={riskColor} fontSize={9} fontFamily="monospace" fontWeight="bold">
        {minSeparation.toFixed(1)}′ @ {minSeparationMD.toFixed(0)}′ MD
      </text>
      <text x={W - 130} y={pad + 42} fill={riskColor} fontSize={8} fontFamily="monospace">SF: {overallSF.toFixed(2)}</text>
      <rect x={W - 130} y={pad + 48} width={Math.min(100, overallSF * 25)} height={10} rx={3} fill={riskColor} opacity={0.6} />
      <text x={W - 130} y={pad + 62} fill={TEXT} fontSize={6} fontFamily="monospace">
        {overallSF < 1 ? '⚠ High Risk' : overallSF < 2 ? '⚡ Moderate' : '✓ Safe'}
      </text>

      <text x={W / 2} y={H - 8} fill={SLATE} fontSize={8} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        Traveling Cylinder — {approachStations.length} stations
      </text>
    </svg>
  );
};
