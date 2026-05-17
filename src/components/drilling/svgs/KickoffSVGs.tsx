import React from 'react';
const INDIGO = '#6366f1', CYAN = '#22d3ee', AMBER = '#f59e0b', EMERALD = '#10b981', RED = '#ef4444', SLATE = '#94a3b8';
const GRID = 'rgba(148,163,184,0.08)', TEXT = 'rgba(148,163,184,0.5)', AXIS = 'rgba(148,163,184,0.25)';
const polarToCart = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

export const KickoffMethodDiagram: React.FC<{
  whipstockFace: number; plannedInc: number; doglegSeverity: number; tvd: number; kop: number;
}> = ({ whipstockFace, plannedInc, doglegSeverity, tvd, kop }) => {
  const W = 400, H = 320, pad = 45;
  const sy = (H - pad * 2) / tvd;
  const kopY = H - pad - kop * sy;
  const endY = kopY - 70, endDX = 60;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      <line x1={pad + 120} y1={pad} x2={pad + 120} y2={H - pad} stroke={AXIS} strokeWidth={1} />
      <line x1={pad} y1={kopY} x2={W - pad} y2={kopY} stroke={GRID} strokeWidth={0.5} strokeDasharray="3,3" />
      <text x={pad} y={kopY - 4} fill={AMBER} fontSize={8} fontFamily="monospace">KOP @ {kop}′</text>
      <line x1={pad + 120} y1={H - pad} x2={pad + 120} y2={kopY} stroke={SLATE} strokeWidth={3} />
      <circle cx={pad + 120} cy={kopY} r={4} fill={AMBER} />
      <path d={`M${pad + 120},${kopY} Q${pad + 120 - endDX * 0.3},${endY + 40} ${pad + 120 - endDX * Math.sin(whipstockFace * Math.PI / 180)},${endY}`}
        fill="none" stroke={CYAN} strokeWidth={2.5} strokeDasharray="5,3" />
      <line x1={pad + 120} y1={kopY} x2={polarToCart(pad + 120, kopY, 12, whipstockFace + 90).x}
        y2={polarToCart(pad + 120, kopY, 12, whipstockFace + 90).y} stroke={RED} strokeWidth={2} />
      <text x={polarToCart(pad + 120, kopY, 16, whipstockFace + 90).x}
        y={polarToCart(pad + 120, kopY, 16, whipstockFace + 90).y} fill={RED} fontSize={8} fontFamily="monospace">
        Face:{whipstockFace.toFixed(0)}°
      </text>
      <text x={W / 2} y={H - 8} fill={SLATE} fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        DLS: {doglegSeverity.toFixed(2)}°/100ft | Target Inc: {plannedInc}°
      </text>
    </svg>
  );
};

export const BuildRateChart: React.FC<{ buildRate: number; bendAngle: number }> = ({ buildRate, bendAngle }) => {
  const W = 380, H = 160, pad = 35;
  const bendVals = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
  const synthRates = bendVals.map(b => Math.round((buildRate / Math.max(bendAngle, 0.1)) * b * 10) / 10);
  const maxR = Math.max(...synthRates, buildRate) * 1.2;
  const sx = (W - pad * 2) / (bendVals.length - 1);
  const sy = (H - pad * 2) / maxR;
  const pts = synthRates.map((r, i) => `${pad + i * sx},${H - pad - r * sy}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      {Array.from({ length: 4 }, (_, i) => {
        const y = H - pad - (i / 3) * maxR * sy;
        return <line key={i} x1={pad} y1={y} x2={W - pad} y2={y} stroke={GRID} strokeWidth={0.5} />;
      })}
      <polyline points={pts} fill="none" stroke={INDIGO} strokeWidth={2} />
      {synthRates.map((r, i) => <circle key={i} cx={pad + i * sx} cy={H - pad - r * sy} r={3} fill={CYAN} />)}
      <circle cx={pad + bendVals.indexOf(bendAngle) * sx} cy={H - pad - buildRate * sy} r={5} fill={AMBER} stroke={AMBER} strokeWidth={2} opacity={0.9} />
      <text x={W / 2} y={H - 5} fill={SLATE} fontSize={9} textAnchor="middle" fontFamily="monospace">Bend Angle vs Build Rate</text>
    </svg>
  );
};

export const MotorBuildRateDiagram: React.FC<{ buildRate: number; netDogleg: number; bendAngle: number; holeSize: number }> = ({ buildRate, netDogleg, bendAngle, holeSize }) => {
  const W = 380, H = 140, pad = 40, barW = 60;
  const maxVal = Math.max(buildRate, netDogleg, 5) * 1.3;
  const sy = (H - pad * 2) / maxVal;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      <text x={pad + 10} y={pad - 5} fill={SLATE} fontSize={10} fontFamily="monospace" fontWeight="bold">
        Bend: {bendAngle}° | Hole: {holeSize}″
      </text>
      <rect x={pad} y={H - pad - buildRate * sy} width={barW} height={buildRate * sy} fill={INDIGO} opacity={0.7} rx={3} />
      <text x={pad + barW / 2} y={H - pad - buildRate * sy - 4} fill={INDIGO} fontSize={9} textAnchor="middle" fontFamily="monospace">{buildRate.toFixed(1)}°/100ft</text>
      <text x={pad + barW / 2} y={H - pad + 12} fill={TEXT} fontSize={8} textAnchor="middle" fontFamily="monospace">Build</text>
      <rect x={pad + barW + 30} y={H - pad - netDogleg * sy} width={barW} height={netDogleg * sy} fill={AMBER} opacity={0.7} rx={3} />
      <text x={pad + barW + 30 + barW / 2} y={H - pad - netDogleg * sy - 4} fill={AMBER} fontSize={9} textAnchor="middle" fontFamily="monospace">{netDogleg.toFixed(1)}°/100ft</text>
      <text x={pad + barW + 30 + barW / 2} y={H - pad + 12} fill={TEXT} fontSize={8} textAnchor="middle" fontFamily="monospace">Net DLS</text>
      <line x1={pad} y1={H - pad} x2={pad + barW * 2 + 30} y2={H - pad} stroke={AXIS} strokeWidth={1} />
    </svg>
  );
};

export const RSSDiagram: React.FC<{ dls: number; padForce: number; formationUCS: number }> = ({ dls, padForce, formationUCS }) => {
  const W = 380, H = 130, cx = 60, cy = H / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      <rect x={cx - 25} y={cy - 25} width={50} height={50} rx={25} fill="none" stroke={SLATE} strokeWidth={1} />
      {[0, 120, 240].map((a, i) => {
        const p = polarToCart(cx, cy, 22, a);
        return <circle key={i} cx={p.x} cy={p.y} r={5} fill={i === 0 ? CYAN : SLATE} opacity={0.6} />;
      })}
      <line x1={cx} y1={cy} x2={cx - 22} y2={cy} stroke={CYAN} strokeWidth={2} markerEnd="url(#arrCyan)" />
      <defs><marker id="arrCyan" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill={CYAN} /></marker></defs>
      <text x={cx + 35} y={cy - 15} fill={SLATE} fontSize={9} fontFamily="monospace">DLS: {dls.toFixed(2)}°/100ft</text>
      <text x={cx + 35} y={cy + 2} fill={TEXT} fontSize={8} fontFamily="monospace">Force: {padForce} lbf</text>
      <text x={cx + 35} y={cy + 16} fill={TEXT} fontSize={8} fontFamily="monospace">UCS: {formationUCS} psi</text>
    </svg>
  );
};

export const RSSForceDiagram: React.FC<{
  padForce: number; netSteeringForce: number; padPressure: number; formationUCS: number;
}> = ({ padForce, netSteeringForce, padPressure, formationUCS }) => {
  const W = 380, H = 120, pad = 40, barW = 70;
  const maxVal = Math.max(padForce, netSteeringForce, 1000) * 1.2;
  const sy = (H - pad * 2) / maxVal;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      <rect x={pad} y={H - pad - padForce * sy} width={barW} height={padForce * sy} fill={INDIGO} opacity={0.6} rx={3} />
      <text x={pad + barW / 2} y={H - pad - padForce * sy - 4} fill={INDIGO} fontSize={8} textAnchor="middle" fontFamily="monospace">{padForce} lbf</text>
      <text x={pad + barW / 2} y={H - pad + 12} fill={TEXT} fontSize={8} textAnchor="middle" fontFamily="monospace">Pad Force</text>
      <rect x={pad + barW + 25} y={H - pad - netSteeringForce * sy} width={barW} height={netSteeringForce * sy} fill={CYAN} opacity={0.6} rx={3} />
      <text x={pad + barW + 25 + barW / 2} y={H - pad - netSteeringForce * sy - 4} fill={CYAN} fontSize={8} textAnchor="middle" fontFamily="monospace">{netSteeringForce.toFixed(0)} lbf</text>
      <text x={pad + barW + 25 + barW / 2} y={H - pad + 12} fill={TEXT} fontSize={8} textAnchor="middle" fontFamily="monospace">Net Steer</text>
      <text x={pad + barW + 25 + barW / 2} y={H - pad + 24} fill={TEXT} fontSize={7} textAnchor="middle" fontFamily="monospace">Pad P: {padPressure.toFixed(0)} psi</text>
      <line x1={pad} y1={H - pad} x2={pad + barW * 2 + 25} y2={H - pad} stroke={AXIS} strokeWidth={1} />
    </svg>
  );
};

export const BitWalkDiagram: React.FC<{
  walkRate: number; walkDirection: 'left' | 'right';
  netBuildModifier: number; dipAngleRelative: number;
  severity: 'negligible' | 'mild' | 'moderate' | 'severe';
}> = ({ walkRate, walkDirection, netBuildModifier, dipAngleRelative, severity }) => {
  const W = 420, H = 280, pad = 50;
  const cx = 170, cy = H / 2, rOuter = 90, rInner = 45;
  const walkAngle = walkDirection === 'left' ? -walkRate * 30 : walkRate * 30;
  const walkRad = ((walkAngle - 90) * Math.PI) / 180;
  const sevColors: Record<string, string> = { negligible: EMERALD, mild: AMBER, moderate: '#f97316', severe: RED };
  const sevColor = sevColors[severity] || SLATE;
  return (
    <svg viewBox={'0 0 ' + W + ' ' + H} className="w-full h-full" style={{ background: '#020617' }}>
      {/* Polar background */}
      <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke={AXIS} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={rOuter - 18} fill="none" stroke={GRID} strokeWidth={0.5} />
      <circle cx={cx} cy={cy} r={rInner} fill="none" stroke={GRID} strokeWidth={0.5} />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
        const rad = ((a - 90) * Math.PI) / 180;
        const ox = cx + (rOuter - 5) * Math.cos(rad), iy = cy + (rOuter - 5) * Math.sin(rad);
        const ix = cx + (rOuter - 12) * Math.cos(rad);
        return <line key={a} x1={ox} y1={iy} x2={ix} y2={cy + (rOuter - 12) * Math.sin(rad)} stroke={SLATE} strokeWidth={0.4} />;
      })}
      {/* Ref direction (straight ahead = top = 0°) */}
      <line x1={cx} y1={cy} x2={cx} y2={cy - rOuter + 10} stroke={SLATE} strokeWidth={1} strokeDasharray="3,3" />
      <text x={cx} y={cy - rOuter} fill={TEXT} fontSize={7} textAnchor="middle" fontFamily="monospace">Planned</text>
      {/* Walk vector */}
      {walkRate > 0.01 && (
        <g>
          <line x1={cx} y1={cy} x2={cx + (rOuter - 30) * Math.cos(walkRad)} y2={cy + (rOuter - 30) * Math.sin(walkRad)}
            stroke={sevColor} strokeWidth={3} />
          <circle cx={cx + (rInner + 5) * Math.cos(walkRad)} cy={cy + (rInner + 5) * Math.sin(walkRad)} r={4} fill={sevColor} />
          <text x={cx + (rOuter - 5) * Math.cos(walkRad)}
            y={cy + (rOuter - 5) * Math.sin(walkRad)} fill={sevColor} fontSize={8}
            textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">
            {walkDirection.toUpperCase()}
          </text>
        </g>
      )}
      <text x={cx} y={cy + rOuter + 24} fill={SLATE} fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        Walk Rate: {walkRate.toFixed(2)}°/100ft
      </text>

      {/* Right panel — severity badge + stats */}
      <rect x={cx + rOuter + 30} y={pad} width={120} height={40} rx={8} fill={sevColor} opacity={0.15} stroke={sevColor} strokeWidth={2} />
      <text x={cx + rOuter + 90} y={pad + 24} fill={sevColor} fontSize={14} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {severity.toUpperCase()}
      </text>

      <text x={cx + rOuter + 50} y={pad + 70} fill={SLATE} fontSize={10} fontFamily="monospace" fontWeight="bold">
        Stats
      </text>
      <text x={cx + rOuter + 50} y={pad + 90} fill={TEXT} fontSize={9} fontFamily="monospace">
        Dip Angle (rel): {dipAngleRelative.toFixed(1)}°
      </text>
      <text x={cx + rOuter + 50} y={pad + 108} fill={TEXT} fontSize={9} fontFamily="monospace">
        Build Modifier: {(netBuildModifier >= 0 ? '+' : '') + netBuildModifier.toFixed(2)}° /100ft
      </text>
      <text x={cx + rOuter + 50} y={pad + 126} fill={TEXT} fontSize={9} fontFamily="monospace">
        Walk Direction: {walkDirection.toUpperCase()}
      </text>

      <text x={W / 2} y={H - 8} fill={SLATE} fontSize={8} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        Bit Walk Analysis — Formation Anisotropy
      </text>
    </svg>
  );
};
