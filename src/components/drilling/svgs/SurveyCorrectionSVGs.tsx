import React from 'react';
const INDIGO='#6366f1',CYAN='#22d3ee',AMBER='#f59e0b',EMERALD='#10b981',SLATE='#94a3b8',RED='#ef4444',PINK='#ec4899';
const TEXT='rgba(148,163,184,0.5)',GRID='rgba(148,163,184,0.08)',AXIS='rgba(148,163,184,0.25)';
const polarToCart=(cx:number,cy:number,r:number,angleDeg:number)=>{const rad=(angleDeg-90)*Math.PI/180;return{x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)};};

export const AxialInterferenceDiagram: React.FC<{
  correctedAzimuth:number;azimuthCorrection:number;horizontalField:number;axialBias:number;
}> = ({correctedAzimuth,azimuthCorrection,horizontalField,axialBias}) => {
  const W=380,H=160,pad=40,cx=60,cy=H/2;
  const fieldAngle=(correctedAzimuth-90)*Math.PI/180;
  return(
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{background:'#020617'}}>
      <text x={pad} y={pad-10} fill={SLATE} fontSize={9} fontFamily="monospace" fontWeight="bold">Axial Bias: {axialBias} nT</text>
      {[1,2,3,4].map(i=><line key={i} x1={pad+cx+40+(i-1)*50} y1={pad/2} x2={pad+cx+40+(i-1)*50} y2={H-pad/2} stroke={GRID} strokeWidth={0.5}/>)}
      <circle cx={cx} cy={cy} r={30} fill="none" stroke={AXIS} strokeWidth={1}/>
      <line x1={cx} y1={cy} x2={cx-Math.cos(fieldAngle)*28} y2={cy-Math.sin(fieldAngle)*28} stroke={CYAN} strokeWidth={2.5} markerEnd="url(#arrCyan)"/>
      <defs><marker id="arrCyan" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill={CYAN}/></marker></defs>
      <text x={cx+35} y={cy-10} fill={CYAN} fontSize={8} fontFamily="monospace">H: {horizontalField.toFixed(0)} nT</text>
      {/* Bars for correction visual */}
      <rect x={pad+cx+20} y={cy+10-azimuthCorrection*2} width={30} height={Math.abs(azimuthCorrection)*2} fill={azimuthCorrection>0?AMBER:RED} opacity={0.6} rx={3}/>
      <text x={pad+cx+35} y={cy+30} fill={SLATE} fontSize={7} textAnchor="middle" fontFamily="monospace">Δ: {azimuthCorrection>0?'+':''}{azimuthCorrection.toFixed(2)}°</text>
      <text x={pad+cx+35} y={cy+42} fill={TEXT} fontSize={7} textAnchor="middle" fontFamily="monospace">Corr: {correctedAzimuth.toFixed(1)}°</text>
      <line x1={pad} y1={cy} x2={W-pad} y2={cy} stroke={AXIS} strokeWidth={0.5} strokeDasharray="2,2"/>
    </svg>
  );
};

export const IFRDiagram: React.FC<{
  correctedDeclination:number;declinationCorrection:number;igrfDeclination:number;
}> = ({correctedDeclination,declinationCorrection,igrfDeclination}) => {
  const W=380,H=160,pad=40,barW=60;
  const vals=[igrfDeclination,correctedDeclination,declinationCorrection];
  const maxV=Math.max(...vals.map(Math.abs),5)*1.3;
  const sy=(H-pad*2)/(maxV*2);
  const baseY=H/2;
  const bars=[
    {v:igrfDeclination,label:'IGRF',color:SLATE},
    {v:correctedDeclination,label:'IFR Corr',color:EMERALD},
    {v:declinationCorrection,label:'Δ Corr',color:AMBER},
  ];
  return(
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{background:'#020617'}}>
      <line x1={pad} y1={baseY} x2={W-pad} y2={baseY} stroke={AXIS} strokeWidth={1}/>
      {bars.map((b,i)=>{
        const h=b.v*sy;
        return(
          <g key={i}>
            <rect x={pad+20+i*(barW+25)} y={h>0?baseY-h:baseY} width={barW} height={Math.abs(h)} fill={b.color} opacity={0.6} rx={3}/>
            <text x={pad+20+i*(barW+25)+barW/2} y={h>0?baseY-h-4:baseY+Math.abs(h)+12} fill={b.color} fontSize={7} textAnchor="middle" fontFamily="monospace">{b.v.toFixed(2)}°</text>
            <text x={pad+20+i*(barW+25)+barW/2} y={baseY+Math.abs(h)+24} fill={TEXT} fontSize={7} textAnchor="middle" fontFamily="monospace">{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

export const MagneticDeclinationMap: React.FC<{lat:number;lon:number;declination:number}> = ({lat,lon,declination}) => {
  const W=340,H=200,pad=30;
  const sx=(pickx(lon))*0.9+pad, sy=(1-picky(lat))*0.8+pad;
  return(
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{background:'#020617'}}>
      <rect x={pad-5} y={pad-5} width={W-pad*2+10} height={H-pad*2+10} fill="none" stroke={AXIS} strokeWidth={1} rx={4}/>
      <text x={W/2} y={pad/2} fill={SLATE} fontSize={8} textAnchor="middle" fontFamily="monospace">Declination Map</text>
      <circle cx={sx} cy={sy} r={6} fill={CYAN} opacity={0.8}/>
      <text x={sx} y={sy-10} fill={CYAN} fontSize={8} textAnchor="middle" fontFamily="monospace">{lat>0?'+':''}{lat.toFixed(0)}°,{lon>0?'+':''}{lon.toFixed(0)}°</text>
      <line x1={sx} y1={sy} x2={sx+Math.sin(declination*Math.PI/180)*30} y2={sy-Math.cos(declination*Math.PI/180)*30} stroke={AMBER} strokeWidth={2}/>
      <polygon points={`${sx+Math.sin(declination*Math.PI/180)*30-5},${sy-Math.cos(declination*Math.PI/180)*30-3} ${sx+Math.sin(declination*Math.PI/180)*30+5},${sy-Math.cos(declination*Math.PI/180)*30-3} ${sx+Math.sin(declination*Math.PI/180)*30},${sy-Math.cos(declination*Math.PI/180)*30+5}`} fill={AMBER}/>
      <text x={W/2} y={H-pad+12} fill={AMBER} fontSize={9} textAnchor="middle" fontFamily="monospace">Decl: {declination>0?'+':''}{declination.toFixed(1)}°</text>
    </svg>
  );
};

export const GyroDriftChart: React.FC<{
  driftRate:number;totalDrift:number;gyroType:string;qualityIndex:number;surveyTime:number;
}> = ({driftRate,totalDrift,gyroType,qualityIndex,surveyTime}) => {
  const W=380,H=200,pad=40;
  const pts:number[]=[];for(let i=0;i<=20;i++)pts.push(driftRate*Math.sqrt(i/20*surveyTime)*2);
  const maxD=Math.max(...pts,driftRate,1)*1.2;
  const sx=(W-pad*2)/20, sy=(H-pad*2)/maxD;
  return(
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{background:'#020617'}}>
      {[0,0.5,1].map((f,i)=>{
        const y=H-pad-f*maxD*sy;
        return <line key={i} x1={pad} y1={y} x2={W-pad} y2={y} stroke={GRID} strokeWidth={0.5}/>;
      })}
      <polyline points={pts.map((d,i)=>`${pad+i*sx},${H-pad-d*sy}`).join(' ')} fill="none" stroke={AMBER} strokeWidth={2}/>
      {pts.map((d,i)=><circle key={i} cx={pad+i*sx} cy={H-pad-d*sy} r={1.5} fill={AMBER} opacity={0.6}/>)}
      <text x={pad} y={H-pad+14} fill={TEXT} fontSize={7} fontFamily="monospace">0h</text>
      <text x={W-pad} y={H-pad+14} fill={TEXT} fontSize={7} fontFamily="monospace" textAnchor="end">{surveyTime}h</text>
      <text x={W/2} y={H-4} fill={SLATE} fontSize={9} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {gyroType.toUpperCase()} | Drift: {driftRate.toFixed(3)}°/hr | Q: {qualityIndex.toFixed(3)}
      </text>
    </svg>
  );
};

/* Proj helpers for declination map */
const pickx=(lon:number)=>Math.cos(lon*Math.PI/30)*50+100*(180+lon)/360;
const picky=(lat:number)=>100*(90-lat)/180;

export const MFMComparisonChart: React.FC<{
  igrfDeclination: number; ifrDeclination: number; mfmDeclination: number;
  igrfOnlyAzimuthError: number; ifrOnlyAzimuthError: number;
  mfmResidualError: number; diurnalSignal: number;
  stormActivity: 'quiet' | 'active' | 'storm';
}> = ({ igrfDeclination, ifrDeclination, mfmDeclination, igrfOnlyAzimuthError,
      ifrOnlyAzimuthError, mfmResidualError, diurnalSignal, stormActivity }) => {
  const W = 480, H = 260, pad = 50;
  const barW = 70, gap = 30;
  const vals = [igrfDeclination, ifrDeclination, mfmDeclination];
  const maxV = Math.max(...vals.map(Math.abs), 5) * 1.3;
  const sy = (H - pad * 2) / (maxV * 2);
  const baseY = H / 2 + 10;
  const bars = [
    { v: igrfDeclination, label: 'IGRF', color: SLATE, err: igrfOnlyAzimuthError },
    { v: ifrDeclination, label: 'IFR', color: EMERALD, err: ifrOnlyAzimuthError },
    { v: mfmDeclination, label: 'MFM', color: CYAN, err: mfmResidualError },
  ];
  const stormColor = stormActivity === 'storm' ? RED : stormActivity === 'active' ? AMBER : EMERALD;
  return (
    <svg viewBox={'0 0 ' + W + ' ' + H} className="w-full h-full" style={{ background: '#020617' }}>
      <line x1={pad - 15} y1={baseY} x2={W - pad + 15} y2={baseY} stroke={AXIS} strokeWidth={1} />
      {bars.map((b, i) => {
        const x = pad + 30 + i * (barW + gap + 40);
        const h = b.v * sy;
        return (
          <g key={i}>
            <rect x={x} y={h > 0 ? baseY - h : baseY} width={barW} height={Math.abs(h)} fill={b.color} opacity={0.75} rx={4} />
            {/* Error whisker */}
            <line x1={x + barW / 2} y1={baseY - Math.abs(h) - b.err * sy * 2} x2={x + barW / 2} y2={baseY + b.err * sy * 2}
              stroke={RED} strokeWidth={1.5} opacity={0.7} />
            <line x1={x + barW / 2 - 8} y1={baseY - Math.abs(h) - b.err * sy * 2} x2={x + barW / 2 + 8}
              y2={baseY - Math.abs(h) - b.err * sy * 2} stroke={RED} strokeWidth={1} opacity={0.7} />
            <line x1={x + barW / 2 - 8} y1={baseY + b.err * sy * 2} x2={x + barW / 2 + 8}
              y2={baseY + b.err * sy * 2} stroke={RED} strokeWidth={1} opacity={0.7} />
            <text x={x + barW / 2} y={h > 0 ? baseY - Math.abs(h) - b.err * sy * 2 - 8 : baseY + b.err * sy * 2 + 16}
              fill={RED} fontSize={7} textAnchor="middle" fontFamily="monospace">±{b.err.toFixed(2)}°</text>
            <text x={x + barW / 2} y={h > 0 ? baseY - h - 6 : baseY + Math.abs(h) + 14}
              fill={b.color} fontSize={9} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
              {b.v.toFixed(2)}°
            </text>
            <text x={x + barW / 2} y={baseY + (Math.abs(h) || 20) + 14 + Math.max(0, b.err * sy * 2) + 10}
              fill={TEXT} fontSize={9} textAnchor="middle" fontFamily="monospace">{b.label}</text>
          </g>
        );
      })}
      {/* Storm activity indicator */}
      <rect x={W - 120} y={pad - 14} width={90} height={20} rx={4} fill={stormColor} opacity={0.2} stroke={stormColor} strokeWidth={1} />
      <text x={W - 75} y={pad} fill={stormColor} fontSize={9} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {stormActivity.toUpperCase()}
      </text>
      <text x={W - 75} y={pad + 14} fill={TEXT} fontSize={7} textAnchor="middle" fontFamily="monospace">
        Diurnal: {diurnalSignal} nT
      </text>
      <text x={W / 2} y={H - 8} fill={SLATE} fontSize={8} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        MFM / IFR / IGRF Declination Comparison
      </text>
    </svg>
  );
};
