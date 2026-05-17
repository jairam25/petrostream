import React from 'react';
const INDIGO = '#6366f1', CYAN = '#22d3ee', AMBER = '#f59e0b', EMERALD = '#10b981', SLATE = '#94a3b8', RED = '#ef4444', PINK = '#ec4899';
const GRID = 'rgba(148,163,184,0.08)', TEXT = 'rgba(148,163,184,0.5)', AXIS = 'rgba(148,163,184,0.25)';

/* ── Multi-station survey point (N,E,TVD,DLS,MD) ── */
export interface SurveyPoint { md: number; tvd: number; north: number; east: number; inc: number; azi: number; dls: number; }

const polarToCart = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

/* ── Helper: build smooth cubic bezier path from survey stations ── */
function buildSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const xm = (pts[i - 1].x + pts[i].x) / 2;
    const ym = (pts[i - 1].y + pts[i].y) / 2;
    d += ` Q${pts[i - 1].x},${pts[i - 1].y} ${xm},${ym}`;
  }
  d += ` L${pts[pts.length - 1].x},${pts[pts.length - 1].y}`;
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════
   3D ISOMETRIC TRAJECTORY with multi-station rendering
   Pro: isoX = cx + (east - north) * cos(30°), isoY = baseY - tvd + (east + north) * sin(30°)
   ═══════════════════════════════════════════════════════════════════════ */
export const TrajectorySVG: React.FC<{
  tvd: number; north: number; east: number; dls: number;
  inc1: number; inc2: number; azi1: number; azi2: number;
  surveyStations?: SurveyPoint[];
  mdTotal?: number;
}> = ({ tvd, north, east, dls, inc1, inc2, azi1, azi2, surveyStations, mdTotal }) => {
  const W = 600, H = 400, pad = 55;
  const stations = surveyStations && surveyStations.length >= 2 ? surveyStations : null;

  if (stations) {
    /* ── Multi-station 3D isometric rendering ── */
    const maxTvd = Math.max(...stations.map(s => s.tvd), 100);
    const allN = stations.map(s => Math.abs(s.north));
    const allE = stations.map(s => Math.abs(s.east));
    const maxH = Math.max(...allN, ...allE, 50) * 1.6;
    const cx = pad + 250;
    const baseY = H - pad - 20;
    const sy = (H - pad * 2 - 60) / maxTvd;
    const sxy = (W - pad * 2 - 100) / (maxH * 2);
    const isoPts = stations.map(s => ({
      x: cx + (s.east - s.north) * sxy * 0.866,
      y: baseY - s.tvd * sy + (s.east + s.north) * sxy * 0.5,
      dls: s.dls,
      md: s.md,
    }));

    // DLS color scale: green (<2) → amber (2-5) → red (>5)
    const dlsColor = (d: number) => d > 5 ? RED : d > 2 ? AMBER : EMERALD;

    // Build depth-gradient line segments
    const segments: { x1: number; y1: number; x2: number; y2: number; dls: number }[] = [];
    for (let i = 1; i < isoPts.length; i++) {
      segments.push({ x1: isoPts[i - 1].x, y1: isoPts[i - 1].y, x2: isoPts[i].x, y2: isoPts[i].y, dls: isoPts[i].dls });
    }

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
        {/* Grid: TVD horizontals */}
        {Array.from({ length: 8 }, (_, i) => {
          const y = baseY - (i / 7) * maxTvd * sy;
          return <line key={`h${i}`} x1={pad} y1={y} x2={W - pad} y2={y} stroke={GRID} strokeWidth={0.5} />;
        })}
        {/* Isometric axes */}
        <line x1={cx} y1={baseY} x2={cx} y2={pad} stroke={AXIS} strokeWidth={1} />
        <line x1={cx} y1={baseY} x2={cx - 180} y2={baseY + 90} stroke={AXIS} strokeWidth={0.7} strokeDasharray="4,3" />
        <line x1={cx} y1={baseY} x2={cx + 180} y2={baseY + 90} stroke={AXIS} strokeWidth={0.7} strokeDasharray="4,3" />
        <text x={cx} y={pad - 6} fill={TEXT} fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight="bold">TVD ↓</text>
        <text x={cx - 185} y={baseY + 98} fill={TEXT} fontSize={9} textAnchor="middle" fontFamily="monospace">W ← → E</text>
        <text x={cx + 185} y={baseY + 98} fill={TEXT} fontSize={9} textAnchor="middle" fontFamily="monospace">N ← → S</text>
        {/* Wellpath segments with DLS coloring */}
        {segments.map((seg, i) => (
          <g key={i}>
            <line x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
              stroke={dlsColor(seg.dls)} strokeWidth={3} strokeLinecap="round" opacity={0.9}
              style={{ transition: 'all 0.6s ease' }} />
          </g>
        ))}
        {/* Station markers */}
        {isoPts.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r={i === 0 ? 5 : i === isoPts.length - 1 ? 5 : 2.5}
              fill={i === 0 ? EMERALD : i === isoPts.length - 1 ? CYAN : dlsColor(pt.dls)} opacity={0.85}
              style={{ transition: 'all 0.6s ease' }} />
            {i === 0 && <text x={pt.x + 6} y={pt.y - 6} fill={EMERALD} fontSize={8} fontFamily="monospace">KOP</text>}
            {i === isoPts.length - 1 && (
              <text x={pt.x + 6} y={pt.y - 6} fill={CYAN} fontSize={8} fontFamily="monospace">
                TD {stations[stations.length - 1].md}′
              </text>
            )}
          </g>
        ))}
        {/* DLS legend */}
        <rect x={pad} y={pad - 10} width={180} height={55} rx={4} fill="#0f172a" stroke={AXIS} strokeWidth={0.5} />
        <text x={pad + 5} y={pad + 8} fill={SLATE} fontSize={8} fontFamily="monospace" fontWeight="bold">DLS Scale</text>
        {[{ color: EMERALD, label: '<2°/100ft' }, { color: AMBER, label: '2-5°/100ft' }, { color: RED, label: '>5°/100ft' }].map((l, i) => (
          <g key={i}>
            <line x1={pad + 10} y1={pad + 20 + i * 12} x2={pad + 30} y2={pad + 20 + i * 12} stroke={l.color} strokeWidth={3} strokeLinecap="round" />
            <text x={pad + 36} y={pad + 23 + i * 12} fill={l.color} fontSize={7} fontFamily="monospace">{l.label}</text>
          </g>
        ))}
        {/* Footer */}
        <text x={W / 2} y={H - 5} fill={SLATE} fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
          MD: {mdTotal || stations[stations.length - 1].md}′ | Inc: {inc1}°→{inc2}° | Azi: {azi1}°→{azi2}°
        </text>
      </svg>
    );
  }

  /* ── Fallback: single-station quadratic trajectory ── */
  const maxTvd = Math.max(tvd, 100);
  const maxH = Math.max(Math.abs(north), Math.abs(east), Math.sqrt(north * north + east * east), 50);
  const cx = pad + (W - pad * 2) * 0.5 + 40;
  const sy = (H - pad * 2 - 60) / maxTvd;
  const sx = (W - pad * 2 - 80) / (maxH * 2.2);
  const x0 = cx, y0 = H - pad - 20;
  const xE = cx + east * sx;
  const yT = y0 - tvd * sy;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      {Array.from({ length: 6 }, (_, i) => {
        const y = y0 - (i / 5) * tvd * sy;
        return <line key={`h${i}`} x1={pad} y1={y} x2={W - pad} y2={y} stroke={GRID} strokeWidth={0.5} />;
      })}
      <line x1={cx} y1={y0} x2={cx} y2={pad} stroke={AXIS} strokeWidth={1} />
      <line x1={pad} y1={y0} x2={W - pad} y2={y0} stroke={AXIS} strokeWidth={1} />
      <path d={`M${x0},${y0} Q${cx + east * 0.3 * sx},${y0 - tvd * 0.4 * sy} ${xE},${yT}`}
        fill="none" stroke={INDIGO} strokeWidth={2.5} opacity={0.9}
        style={{ transition: 'all 0.6s ease' }} />
      <circle cx={x0} cy={y0} r={5} fill={EMERALD} style={{ transition: 'all 0.6s ease' }} />
      <circle cx={xE} cy={yT} r={5} fill={CYAN} style={{ transition: 'all 0.6s ease' }} />
      <text x={cx} y={pad - 5} fill={TEXT} fontSize={9} textAnchor="middle" fontFamily="monospace">TVD</text>
      <text x={W - pad + 5} y={y0 + 4} fill={TEXT} fontSize={9} fontFamily="monospace">E</text>
      <text x={cx + 5} y={y0 + 14} fill={TEXT} fontSize={9} fontFamily="monospace">N</text>
      <text x={W / 2} y={H - 5} fill={SLATE} fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        DLS: {dls.toFixed(2)}°/100ft | Inc: {inc1}°→{inc2}° | Azi: {azi1}°→{azi2}°
      </text>
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   PLAN VIEW with multi-station path overlay
   ═══════════════════════════════════════════════════════════════════════ */
export const PlanViewSVG: React.FC<{
  north: number; east: number; azi1: number; azi2: number;
  surveyStations?: SurveyPoint[];
}> = ({ north, east, azi1, azi2, surveyStations }) => {
  const W = 320, H = 320, cx = W / 2, cy = H / 2;
  const stations = surveyStations && surveyStations.length >= 2 ? surveyStations : null;
  const maxR = Math.max(
    ...(stations ? stations.map(s => Math.max(Math.abs(s.north), Math.abs(s.east))) : [Math.abs(north), Math.abs(east)]),
    50
  ) * 1.2;
  const sc = (W / 2 - 40) / maxR;
  const gridR = Array.from({ length: 5 }, (_, i) => (i + 1) / 5 * maxR);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      {/* Concentric grid */}
      {gridR.map((r, i) => <circle key={i} cx={cx} cy={cy} r={r * sc} fill="none" stroke={GRID} strokeWidth={0.5} />)}
      {/* Radial grid lines */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
        const p = polarToCart(cx, cy, maxR * sc, a);
        return <line key={a} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={GRID} strokeWidth={0.3} />;
      })}
      {/* Multi-station path */}
      {stations && (
        <g>
          {stations.map((pt, i) => {
            if (i === 0) return null;
            const prev = stations[i - 1];
            const x1 = cx + prev.east * sc, y1 = cy - prev.north * sc;
            const x2 = cx + pt.east * sc, y2 = cy - pt.north * sc;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={CYAN} strokeWidth={2} opacity={0.7}
              style={{ transition: 'all 0.6s ease' }} />;
          })}
          {stations.map((pt, i) => (
            <circle key={`d${i}`} cx={cx + pt.east * sc} cy={cy - pt.north * sc}
              r={i === 0 || i === stations.length - 1 ? 4 : 2}
              fill={i === 0 ? EMERALD : i === stations.length - 1 ? CYAN : SLATE}
              opacity={0.8} style={{ transition: 'all 0.6s ease' }} />
          ))}
        </g>
      )}
      {/* Single-station fallback */}
      {!stations && (
        <>
          <circle cx={cx} cy={cy} r={3} fill={SLATE} />
          <circle cx={cx + east * sc} cy={cy - north * sc} r={6} fill={CYAN} opacity={0.8}
            style={{ transition: 'all 0.6s ease' }} />
          <text x={cx + east * sc} y={cy - north * sc - 8} fill={CYAN} fontSize={9} textAnchor="middle" fontFamily="monospace">
            N:{north.toFixed(0)} E:{east.toFixed(0)}
          </text>
        </>
      )}
      {/* Azimuth rays */}
      {[azi1, azi2].map((a, i) => {
        const p = polarToCart(cx, cy, maxR * sc * 0.8, a);
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={p.x} y2={p.y}
              stroke={i === 0 ? EMERALD : CYAN} strokeWidth={1.5}
              strokeDasharray={i === 0 ? '4,2' : ''}
              style={{ transition: 'all 0.6s ease' }} />
            <text x={p.x + 4} y={p.y - 4} fill={i === 0 ? EMERALD : CYAN} fontSize={9} fontFamily="monospace">
              Azi{i + 1}:{a}°
            </text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 5} fill={SLATE} fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        Plan View (N↑)
      </text>
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   VERTICAL SECTION with multi-station & DLS coloring
   ═══════════════════════════════════════════════════════════════════════ */
export const VerticalSectionSVG: React.FC<{
  tvd: number; departure: number; inc1: number; inc2: number;
  surveyStations?: SurveyPoint[];
}> = ({ tvd, departure, inc1, inc2, surveyStations }) => {
  const W = 320, H = 320, pad = 40;
  const stations = surveyStations && surveyStations.length >= 2 ? surveyStations : null;
  if (stations) {
    const maxTvd = Math.max(...stations.map(s => s.tvd), 100);
    const deps = stations.map(s => Math.sqrt(s.north ** 2 + s.east ** 2));
    const maxDep = Math.max(...deps, 50);
    const sy = (H - pad * 2) / maxTvd;
    const sx = (W - pad * 2) / maxDep;
    const dlsColor = (d: number) => d > 5 ? RED : d > 2 ? AMBER : EMERALD;
    const segments = [];
    for (let i = 1; i < stations.length; i++) {
      segments.push({
        x1: pad + Math.sqrt(stations[i - 1].north ** 2 + stations[i - 1].east ** 2) * sx,
        y1: H - pad - stations[i - 1].tvd * sy,
        x2: pad + Math.sqrt(stations[i].north ** 2 + stations[i].east ** 2) * sx,
        y2: H - pad - stations[i].tvd * sy,
        dls: stations[i].dls,
      });
    }
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
        {Array.from({ length: 6 }, (_, i) => {
          const y = H - pad - (i / 5) * maxTvd * sy;
          return <line key={`g${i}`} x1={pad} y1={y} x2={W - pad} y2={y} stroke={GRID} strokeWidth={0.5} />;
        })}
        {Array.from({ length: 6 }, (_, i) => {
          const x = pad + (i / 5) * maxDep * sx;
          return <line key={`v${i}`} x1={x} y1={pad} x2={x} y2={H - pad} stroke={GRID} strokeWidth={0.5} />;
        })}
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke={AXIS} strokeWidth={1.5} />
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke={AXIS} strokeWidth={1.5} />
        {segments.map((seg, i) => (
          <line key={i} x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
            stroke={dlsColor(seg.dls)} strokeWidth={3} strokeLinecap="round" opacity={0.85}
            style={{ transition: 'all 0.6s ease' }} />
        ))}
        {stations.map((pt, i) => {
          const dep = Math.sqrt(pt.north ** 2 + pt.east ** 2);
          return (
            <circle key={i} cx={pad + dep * sx} cy={H - pad - pt.tvd * sy}
              r={i === 0 || i === stations.length - 1 ? 4 : 2}
              fill={i === 0 ? EMERALD : i === stations.length - 1 ? CYAN : dlsColor(pt.dls)}
              opacity={0.8} style={{ transition: 'all 0.6s ease' }} />
          );
        })}
        <text x={W / 2} y={H - 5} fill={SLATE} fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
          Inc: {inc1}°→{inc2}° | Vert. Section
        </text>
      </svg>
    );
  }
  /* Fallback single-station */
  const maxTvd = Math.max(tvd, 100), maxDep = Math.max(departure, 50);
  const sy = (H - pad * 2) / maxTvd, sx = (W - pad * 2) / maxDep;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      {Array.from({ length: 6 }, (_, i) => {
        const y = H - pad - (i / 5) * tvd * sy;
        return <line key={`g${i}`} x1={pad} y1={y} x2={W - pad} y2={y} stroke={GRID} strokeWidth={0.5} />;
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const x = pad + (i / 5) * maxDep * sx;
        return <line key={`v${i}`} x1={x} y1={pad} x2={x} y2={H - pad} stroke={GRID} strokeWidth={0.5} />;
      })}
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke={AXIS} strokeWidth={1.5} />
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke={AXIS} strokeWidth={1.5} />
      <path d={`M${pad},${H - pad} Q${pad + departure * sx * 0.4},${H - pad - tvd * sy * 0.6} ${pad + departure * sx},${H - pad - tvd * sy}`}
        fill="none" stroke={INDIGO} strokeWidth={2.5} style={{ transition: 'all 0.6s ease' }} />
      <circle cx={pad + departure * sx} cy={H - pad - tvd * sy} r={5} fill={CYAN} style={{ transition: 'all 0.6s ease' }} />
      <text x={pad + departure * sx + 6} y={H - pad - tvd * sy + 3} fill={CYAN} fontSize={8} fontFamily="monospace">
        Dep:{departure.toFixed(0)}′
      </text>
      <text x={W / 2} y={H - 5} fill={SLATE} fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        Inc: {inc1}°→{inc2}°
      </text>
    </svg>
  );
};
