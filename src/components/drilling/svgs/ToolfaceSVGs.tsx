import React from 'react';
const INDIGO='#6366f1',CYAN='#22d3ee',AMBER='#f59e0b',EMERALD='#10b981',SLATE='#94a3b8',RED='#ef4444',PINK='#ec4899';
const TEXT='rgba(148,163,184,0.5)',GRID='rgba(148,163,184,0.08)',AXIS='rgba(148,163,184,0.25)';
const polarToCart=(cx:number,cy:number,r:number,angleDeg:number)=>{const rad=(angleDeg-90)*Math.PI/180;return{x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)};};

export const ToolfaceGauge: React.FC<{toolface:number;inclination:number}> = ({toolface,inclination}) => {
  const W=280,H=280,cx=W/2,cy=H/2,r=100;
  return(
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{background:'#020617'}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={AXIS} strokeWidth={1}/>
      <circle cx={cx} cy={cy} r={r-15} fill="none" stroke={GRID} strokeWidth={0.5}/>
      <circle cx={cx} cy={cy} r={r-30} fill="none" stroke={GRID} strokeWidth={0.5}/>
      <circle cx={cx} cy={cy} r={r-45} fill="none" stroke={GRID} strokeWidth={0.5}/>
      <circle cx={cx} cy={cy} r={r-60} fill="none" stroke={GRID} strokeWidth={0.5}/>
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>{
        const o=polarToCart(cx,cy,r,a),i=polarToCart(cx,cy,r-10,a);
        return <line key={a} x1={o.x} y1={o.y} x2={i.x} y2={i.y} stroke={SLATE} strokeWidth={0.8}/>;
      })}
      {[0,90,180,270].map(a=>{
        const p=polarToCart(cx,cy,r+12,a);
        return <text key={a} x={p.x} y={p.y} fill={TEXT} fontSize={10} textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">{a}°</text>;
      })}
      {polarToCart(cx,cy,r-50,toolface).x!==0&&(
        <g>
          <line x1={cx} y1={cy} x2={polarToCart(cx,cy,r-20,toolface).x} y2={polarToCart(cx,cy,r-20,toolface).y} stroke={CYAN} strokeWidth={3}/>
          <circle cx={polarToCart(cx,cy,r-50,toolface).x} cy={polarToCart(cx,cy,r-50,toolface).y} r={4} fill={CYAN}/>
        </g>
      )}
      <text x={cx} y={cy+20} fill={SLATE} fontSize={11} textAnchor="middle" fontFamily="monospace" fontWeight="bold">TF: {toolface}°</text>
      <text x={cx} y={cy+36} fill={TEXT} fontSize={9} textAnchor="middle" fontFamily="monospace">Inc: {inclination}°</text>
    </svg>
  );
};

export const GravityToolface: React.FC<{toolface:number;inclination:number}> = ({toolface,inclination}) => {
  const W=300,H=300,cx=W/2,cy=H/2,r=110;
  const gtfAngle=toolface;
  const highSide=0;
  return(
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{background:'#020617'}}>
      <defs>
        <linearGradient id="gBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b"/><stop offset="100%" stopColor="#0f172a"/>
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="url(#gBg)" stroke={AXIS} strokeWidth={1.5}/>
      <circle cx={cx} cy={cy} r={r-8} fill="none" stroke={GRID} strokeWidth={0.5}/>
      {/* High side marker */}
      {polarToCart(cx,cy,r-25,highSide).x!==0&&(
        <g>
          <line x1={cx} y1={cy} x2={polarToCart(cx,cy,r-25,highSide).x} y2={polarToCart(cx,cy,r-25,highSide).y} stroke={AMBER} strokeWidth={1} strokeDasharray="4,2"/>
          <circle cx={polarToCart(cx,cy,r-25,highSide).x} cy={polarToCart(cx,cy,r-25,highSide).y} r={3} fill={AMBER}/>
          <text x={polarToCart(cx,cy,r-32,highSide).x} y={polarToCart(cx,cy,r-32,highSide).y} fill={AMBER} fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight="bold">HS</text>
        </g>
      )}
      {/* Gravity vector */}
      <line x1={cx} y1={cy} x2={cx} y2={cy+r-40} stroke={RED} strokeWidth={2} markerEnd="url(#gArr)"/>
      <defs><marker id="gArr" viewBox="0 0 10 10" refX={5} refY={10} markerWidth={6} markerHeight={6} orient="auto"><path d="M0,0 L5,10 L10,0 Z" fill={RED}/></marker></defs>
      {/* Toolface ray */}
      {polarToCart(cx,cy,r-55,gtfAngle).x!==0&&(
        <g>
          <line x1={cx} y1={cy} x2={polarToCart(cx,cy,r-15,gtfAngle).x} y2={polarToCart(cx,cy,r-15,gtfAngle).y} stroke={CYAN} strokeWidth={3}/>
          <circle cx={polarToCart(cx,cy,r-40,gtfAngle).x} cy={polarToCart(cx,cy,r-40,gtfAngle).y} r={5} fill={CYAN}/>
          <text x={polarToCart(cx,cy,r-55,gtfAngle).x} y={polarToCart(cx,cy,r-55,gtfAngle).y} fill={CYAN} fontSize={11} textAnchor="middle" fontFamily="monospace" fontWeight="bold">GTF</text>
        </g>
      )}
      <text x={cx} y={cy+18} fill={SLATE} fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight="bold">Gravity Toolface</text>
      <text x={cx} y={cy+34} fill={TEXT} fontSize={9} textAnchor="middle" fontFamily="monospace">GTF: {gtfAngle}° | Inc: {inclination}°</text>
      <rect x={cx-50} y={cy+42} width={100} height={8} rx={4} fill="#1e293b"/>
      <rect x={cx-50} y={cy+42} width={Math.min(100,inclination/90*100)} height={8} rx={4} fill={
        inclination>10?'#22d3ee':inclination<5?'#ef4444':'#f59e0b'
      }/>
      <text x={cx} y={cy+62} fill={TEXT} fontSize={8} textAnchor="middle" fontFamily="monospace">GTF Valid ({inclination>5?'✓':'✗ Low'})</text>
    </svg>
  );
};

export const MagneticToolface: React.FC<{toolface:number;declination:number;latitude:number}> = ({toolface,declination,latitude}) => {
  const W=300,H=300,cx=W/2,cy=H/2,r=110;
  const trueN=0,magN=declination;
  return(
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{background:'#020617'}}>
      <circle cx={cx} cy={cy} r={r} fill="#0f172a" stroke={AXIS} strokeWidth={1.5}/>
      <circle cx={cx} cy={cy} r={r-8} fill="none" stroke={GRID} strokeWidth={0.5}/>
      {[0,90,180,270].map(a=>{
        const p=polarToCart(cx,cy,r+15,a);
        return <text key={a} x={p.x} y={p.y} fill={TEXT} fontSize={10} textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">{a}°</text>;
      })}
      {/* True North */}
      <line x1={cx} y1={cy} x2={cx} y2={cy-r+20} stroke={EMERALD} strokeWidth={2}/>
      <polygon points={`${cx},${cy-r+22} ${cx-6},${cy-r+32} ${cx+6},${cy-r+32}`} fill={EMERALD}/>
      <text x={cx} y={cy-r+40} fill={EMERALD} fontSize={11} textAnchor="middle" fontFamily="monospace" fontWeight="bold">TN</text>
      {/* magnetic North */}
      {polarToCart(cx,cy,r-25,magN).x!==0&&(
        <g>
          <line x1={cx} y1={cy} x2={polarToCart(cx,cy,r-25,magN).x} y2={polarToCart(cx,cy,r-25,magN).y} stroke={CYAN} strokeWidth={1.5} strokeDasharray="5,3"/>
          <polygon points={`${polarToCart(cx,cy,r-25,magN).x},${polarToCart(cx,cy,r-25,magN).y} ${polarToCart(cx,cy,r-35,magN-5).x},${polarToCart(cx,cy,r-35,magN-5).y} ${polarToCart(cx,cy,r-35,magN+5).x},${polarToCart(cx,cy,r-35,magN+5).y}`} fill={CYAN}/>
          <text x={polarToCart(cx,cy,r-38,magN).x} y={polarToCart(cx,cy,r-38,magN).y} fill={CYAN} fontSize={10} textAnchor="middle" fontFamily="monospace">MN</text>
        </g>
      )}
      {/* MTF ray */}
      {polarToCart(cx,cy,r-55,toolface).x!==0&&(
        <g>
          <line x1={cx} y1={cy} x2={polarToCart(cx,cy,r-20,toolface).x} y2={polarToCart(cx,cy,r-20,toolface).y} stroke={AMBER} strokeWidth={2.5}/>
          <circle cx={polarToCart(cx,cy,r-40,toolface).x} cy={polarToCart(cx,cy,r-40,toolface).y} r={4} fill={AMBER}/>
        </g>
      )}
      <text x={cx} y={cy+24} fill={SLATE} fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight="bold">Magnetic Toolface</text>
      <text x={cx} y={cy+40} fill={TEXT} fontSize={9} textAnchor="middle" fontFamily="monospace">MTF: {toolface}° | Dec: {declination>0?'+':''}{declination.toFixed(1)}°</text>
      <text x={cx} y={cy+54} fill={TEXT} fontSize={8} textAnchor="middle" fontFamily="monospace">Lat: {latitude>0?'+':''}{latitude.toFixed(1)}°</text>
    </svg>
  );
};

export const PumpPressureToolfaceDiagram: React.FC<{
  reactiveTorque: number; toolfaceOffset: number; netToolface: number;
  motorDeltaP: number; stallMargin: number;
}> = ({ reactiveTorque, toolfaceOffset, netToolface, motorDeltaP, stallMargin }) => {
  const W = 480, H = 300, pad = 40;
  const barH = 18, gap = 12;
  const cx = 140, cy = H / 2, r = 90;
  const netRad = ((netToolface - 90) * Math.PI) / 180;
  const offRad = toolfaceOffset * (Math.PI / 180);
  const offColor = toolfaceOffset > 5 ? RED : toolfaceOffset > 2 ? AMBER : EMERALD;
  const stallPct = Math.min(100, (stallMargin / Math.max(1, motorDeltaP)) * 100);
  return (
    <svg viewBox={'0 0 ' + W + ' ' + H} className="w-full h-full" style={{ background: '#020617' }}>
      {/* Gauge */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={AXIS} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={r - 12} fill="none" stroke={GRID} strokeWidth={0.5} />
      <circle cx={cx} cy={cy} r={r - 27} fill="none" stroke={GRID} strokeWidth={0.5} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
        const rad = ((a - 90) * Math.PI) / 180;
        const ox = cx + (r - 4) * Math.cos(rad), oy = cy + (r - 4) * Math.sin(rad);
        const ix = cx + (r - 12) * Math.cos(rad), iy = cy + (r - 12) * Math.sin(rad);
        return <line key={a} x1={ox} y1={oy} x2={ix} y2={iy} stroke={SLATE} strokeWidth={0.6} />;
      })}
      {/* Offset arc */}
      {offRad !== 0 && (
        <g>
          <path d={'M' + cx + ',' + cy + ' L' + (cx + (r - 18) * Math.cos(offRad)) + ',' + (cy + (r - 18) * Math.sin(offRad))}
            fill="none" stroke={offColor} strokeWidth={2.5} strokeDasharray="4,3" />
          <text x={cx + (r - 24) * Math.cos(offRad)} y={cy + (r - 24) * Math.sin(offRad)}
            fill={offColor} fontSize={8} fontFamily="monospace" textAnchor="middle" dominantBaseline="middle">
            Δ{Math.abs(toolfaceOffset).toFixed(1)}°
          </text>
        </g>
      )}
      {/* Net TF ray */}
      <line x1={cx} y1={cy} x2={cx + (r - 30) * Math.cos(netRad)} y2={cy + (r - 30) * Math.sin(netRad)}
        stroke={CYAN} strokeWidth={3} />
      <circle cx={cx + (r - 40) * Math.cos(netRad)} cy={cy + (r - 40) * Math.sin(netRad)} r={5} fill={CYAN} />
      <text x={cx} y={cy + 16} fill={SLATE} fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        Net TF: {netToolface.toFixed(1)}°
      </text>

      {/* Right panel — bar charts */}
      <text x={cx + r + 50} y={pad} fill={SLATE} fontSize={10} fontFamily="monospace" fontWeight="bold">
        Reactive Torque
      </text>
      <rect x={cx + r + 30} y={pad + 8} width={200} height={barH} rx={4} fill="#1e293b" />
      <rect x={cx + r + 30} y={pad + 8} width={Math.min(200, reactiveTorque * 20)} height={barH} rx={4}
        fill={reactiveTorque > 8 ? RED : reactiveTorque > 4 ? AMBER : EMERALD} />
      <text x={cx + r + 35} y={pad + 8 + barH / 2 + 4} fill="#fff" fontSize={9} fontFamily="monospace">
        {reactiveTorque.toFixed(1)} kft·lbf
      </text>

      <text x={cx + r + 50} y={pad + 8 + barH + gap + 20} fill={SLATE} fontSize={10} fontFamily="monospace" fontWeight="bold">
        Motor ΔP: {motorDeltaP} psi
      </text>
      <rect x={cx + r + 30} y={pad + 8 + barH + gap + 28} width={200} height={barH} rx={4} fill="#1e293b" />
      <rect x={cx + r + 30} y={pad + 8 + barH + gap + 28} width={Math.min(200, motorDeltaP / 15000 * 200)} height={barH} rx={4}
        fill={INDIGO} />
      <text x={cx + r + 35} y={pad + 8 + barH + gap + 28 + barH / 2 + 4} fill="#fff" fontSize={9} fontFamily="monospace">
        {motorDeltaP} psi
      </text>

      <text x={cx + r + 50} y={pad + 8 + (barH + gap) * 2 + 40} fill={SLATE} fontSize={10} fontFamily="monospace" fontWeight="bold">
        Stall Margin: {stallMargin} psi ({stallPct.toFixed(1)}%)
      </text>
      <rect x={cx + r + 30} y={pad + 8 + (barH + gap) * 2 + 48} width={200} height={barH} rx={4} fill="#1e293b" />
      <rect x={cx + r + 30} y={pad + 8 + (barH + gap) * 2 + 48} width={Math.min(200, stallPct * 2)} height={barH} rx={4}
        fill={stallPct < 15 ? RED : stallPct < 30 ? AMBER : EMERALD} />
      <text x={cx + r + 35} y={pad + 8 + (barH + gap) * 2 + 48 + barH / 2 + 4} fill="#fff" fontSize={9} fontFamily="monospace">
        {stallMargin} psi
      </text>

      <text x={cx + r + 50} y={pad + 8 + (barH + gap) * 3 + 68} fill={TEXT} fontSize={8} fontFamily="monospace">
        Toolface Offset: {toolfaceOffset.toFixed(1)}°
      </text>
    </svg>
  );
};
