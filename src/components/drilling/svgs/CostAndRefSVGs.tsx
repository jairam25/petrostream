import React from 'react';
const INDIGO='#6366f1',CYAN='#22d3ee',AMBER='#f59e0b',EMERALD='#10b981',SLATE='#94a3b8',RED='#ef4444',PINK='#ec4899';
const TEXT='rgba(148,163,184,0.5)',GRID='rgba(148,163,184,0.08)',AXIS='rgba(148,163,184,0.25)';

export const DirectionalCostBreakdown: React.FC<{
  drillingTimeHours:number;totalCostUSD:number;costPerFoot:number;
  complexityIndex:number;rigDayRate:number;mudCost:number;
}> = ({drillingTimeHours,totalCostUSD,costPerFoot,complexityIndex,rigDayRate,mudCost}) => {
  const W=380,H=380,pad=40,barY=H-pad-120;
  const rigCost=rigDayRate*drillingTimeHours/24;
  const serviceCost=totalCostUSD-rigCost-mudCost;
  const maxCost=Math.max(rigCost,mudCost,serviceCost,1);
  const s=(barY-pad)/maxCost;
  const bars=[
    {v:rigCost,label:'Rig Time',color:CYAN},
    {v:mudCost,label:'Mud/Fluids',color:PINK},
    {v:serviceCost,label:'Services',color:AMBER},
  ];
  return(
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{background:'#020617'}}>
      <text x={W/2} y={14} fill={SLATE} fontSize={9} textAnchor="middle" fontFamily="monospace" fontWeight="bold">Directional Cost Breakdown</text>
      {/* Bar chart */}
      {bars.map((b,i)=>{
        const bw=60,gap=(W-pad*2-3*bw)/4;
        const x=pad+gap+i*(bw+gap);
        const h=b.v*s;
        return(
          <g key={i}>
            <rect x={x} y={barY-h} width={bw} height={h} fill={b.color} opacity={0.7} rx={3}/>
            <text x={x+bw/2} y={barY-h-4} fill={b.color} fontSize={7} textAnchor="middle" fontFamily="monospace">
              ${(b.v/1000).toFixed(0)}k
            </text>
            <text x={x+bw/2} y={barY+12} fill={SLATE} fontSize={7} textAnchor="middle" fontFamily="monospace">{b.label}</text>
          </g>
        );
      })}
      <line x1={pad} y1={barY+1} x2={W-pad} y2={barY+1} stroke={AXIS} strokeWidth={1}/>
      {/* Summary stats */}
      <rect x={pad} y={H-pad-90} width={W-pad*2} height={85} rx={6} fill="#0f172a" stroke={AXIS} strokeWidth={0.5}/>
      <text x={pad+10} y={H-pad-65} fill={CYAN} fontSize={9} fontFamily="monospace" fontWeight="bold">
        Total: ${(totalCostUSD/1000).toFixed(0)}k
      </text>
      <text x={pad+10} y={H-pad-48} fill={SLATE} fontSize={8} fontFamily="monospace">
        Drill Time: {drillingTimeHours.toFixed(1)} hrs | Cost/ft: ${costPerFoot}/ft
      </text>
      <text x={pad+10} y={H-pad-33} fill={SLATE} fontSize={8} fontFamily="monospace">
        Complexity Index: {complexityIndex}
      </text>
      {/* Complexity bar */}
      <rect x={pad+10} y={H-pad-24} width={W-pad*2-20} height={6} rx={3} fill="#1e293b"/>
      <rect x={pad+10} y={H-pad-24} width={(W-pad*2-20)*Math.min(complexityIndex/5,1)} height={6} rx={3}
        fill={complexityIndex>3?RED:complexityIndex>2?AMBER:EMERALD}/>
      <text x={pad+10} y={H-pad-12} fill={TEXT} fontSize={7} fontFamily="monospace">Simple</text>
      <text x={W-pad-10} y={H-pad-12} fill={TEXT} fontSize={7} fontFamily="monospace" textAnchor="end">Complex</text>
    </svg>
  );
};

export const PapersTimelineChart: React.FC<{
  papers:Array<{title:string;authors:string;year?:number|string;speNumber?:string;difficulty:string;description:string;keyConcept:string;link:string}>;
}> = ({papers}) => {
  const W=380,H=220,pad=30;
  const paperData=papers.map((p,i)=>{
    const yr=typeof p.year==='number'?p.year:(typeof p.year==='string'?parseInt(p.year):1990+i);
    return {...p,year:yr};
  }).sort((a,b)=>a.year-b.year);
  const minY=Math.min(...paperData.map(p=>p.year));
  const maxY=Math.max(...paperData.map(p=>p.year));
  const range=Math.max(maxY-minY,5);
  const sx=(W-pad*2)/paperData.length;
  const sy=(H-pad*2)/range;
  const diffColors:Record<string,string>={Basic:EMERALD,Intermediate:AMBER,Advanced:RED,'Very Hard':PINK};
  return(
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{background:'#020617'}}>
      {/* Timeline line */}
      <line x1={pad} y1={H/2} x2={W-pad} y2={H/2} stroke={AXIS} strokeWidth={1.5}/>
      {/* Paper nodes */}
      {paperData.map((p,i)=>{
        const x=pad+sx/2+i*sx;
        const y=H/2-(p.year-minY)*sy;
        const color=diffColors[p.difficulty]||SLATE;
        return(
          <g key={i}>
            <line x1={x} y1={H/2} x2={x} y2={y} stroke={color} strokeWidth={0.5} opacity={0.5} strokeDasharray="2,2"/>
            <circle cx={x} cy={y} r={5} fill={color} opacity={0.8}/>
            <text x={x} y={y-8} fill={color} fontSize={6} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
              {p.speNumber?.replace('SPE-','') || p.year}
            </text>
          </g>
        );
      })}
      {/* Year labels */}
      {[minY,Math.round((minY+maxY)/2),maxY].map(yr=>{
        const y=H/2-(yr-minY)*sy;
        return <text key={yr} x={pad-6} y={y+3} fill={TEXT} fontSize={6} textAnchor="end" fontFamily="monospace">{yr}</text>;
      })}
      <text x={W/2} y={H-4} fill={SLATE} fontSize={8} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        SPE Papers Timeline ({paperData.length} papers)
      </text>
    </svg>
  );
};

export const ReferencePaperCitation: React.FC<{
  paper:{title:string;authors:string;year?:number|string;speNumber?:string;doi?:string;link:string;keyConcept:string};
}> = ({paper}) => (
  <svg viewBox="0 0 320 90" className="w-full h-full" style={{background:'#020617'}}>
    <rect x={4} y={4} width={312} height={82} rx={6} fill="#0f172a" stroke={AXIS} strokeWidth={0.5}/>
    <text x={14} y={20} fill={CYAN} fontSize={8} fontFamily="monospace" fontWeight="bold">
      {paper.speNumber || ''}
    </text>
    <text x={14} y={36} fill={SLATE} fontSize={7} fontFamily="monospace">{paper.title}</text>
    <text x={14} y={50} fill={TEXT} fontSize={6} fontFamily="monospace">{paper.authors}</text>
    <text x={14} y={64} fill={AMBER} fontSize={6} fontFamily="monospace">Key: {paper.keyConcept}</text>
    <text x={W-14} y={76} fill={TEXT} fontSize={5} textAnchor="end" fontFamily="monospace">DOI: {paper.doi || 'N/A'}</text>
  </svg>
);
const W=320;