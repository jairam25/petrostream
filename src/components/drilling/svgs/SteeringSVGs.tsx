/* ═══════════════════════════════════════════════════════════════════════
   Steering-mode SVG visualizations for the Directional Drilling Terminal.
   - DLS Profile: dogleg severity along MD with threshold zones
   - SlideRotateGantt: slide/rotate schedule per stand across a section
   ═══════════════════════════════════════════════════════════════════════ */

import React, { useMemo } from 'react';
import { formatNumber } from '../../../lib/utils';

/* ─── Styles for CSS-driven transitions on SVG elements ─── */
const fadeInStyle = `
  .dsv-circle, .dsv-rect, .dsv-line, .dsv-text, .dsv-polygon {
    transition: cx 0.35s ease, cy 0.35s ease, r 0.35s ease,
                width 0.35s ease, height 0.35s ease, x 0.35s ease, y 0.35s ease,
                x1 0.35s ease, y1 0.35s ease, x2 0.35s ease, y2 0.35s ease,
                d 0.35s ease, fill 0.35s ease, opacity 0.35s ease,
                stroke 0.35s ease, stroke-width 0.35s ease,
                font-size 0.35s ease, transform 0.35s ease;
  }
`;

/* ──────────────────────────────────────────────────────────────────────
   DLS Profile along MD
   Props: stations = { md, dls }[] , maxDls (cap for color scale)
   Renders a vertical (MD) vs horizontal (DLS) bar-profile with
   color-coded severity zones (green / amber / red).
   ────────────────────────────────────────────────────────────────────── */
interface DLSStation {
  md: number;
  dls: number;
}

interface DLSProfileProps {
  stations: DLSStation[];
  maxDls?: number;
  targetDls?: number;
  width?: number;
  height?: number;
}

export const DLSProfile: React.FC<DLSProfileProps> = ({
  stations,
  maxDls = 8,
  targetDls = 3,
  width = 400,
  height = 320,
}) => {
  const pad = { l: 52, r: 48, t: 28, b: 32 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;

  const mdMin = stations.length > 0 ? stations[0].md : 0;
  const mdMax = stations.length > 0 ? stations[stations.length - 1].md : 1000;
  const mdRng = mdMax - mdMin || 1;

  const dlsMax = Math.max(maxDls, ...stations.map(s => s.dls));

  const xScale = (md: number) => pad.l + ((md - mdMin) / mdRng) * w;
  const yScale = (dls: number) => pad.t + h - (dls / dlsMax) * h;

  const dlsColor = (dls: number): string => {
    if (dls <= 2) return '#10b981';
    if (dls <= 5) return '#f59e0b';
    return '#ef4444';
  };

  /* Build path fill for area under DLS curve */
  const areaPath = useMemo(() => {
    if (stations.length < 2) return '';
    let d = `M ${xScale(stations[0].md)} ${pad.t + h} `;
    stations.forEach(s => { d += `L ${xScale(s.md)} ${yScale(s.dls)} `; });
    d += `L ${xScale(stations[stations.length - 1].md)} ${pad.t + h} Z`;
    return d;
  }, [stations, width, height]);

  const linePath = useMemo(() => {
    if (stations.length < 2) return '';
    return stations.map((s, i) =>
      `${i === 0 ? 'M' : 'L'} ${xScale(s.md)} ${yScale(s.dls)}`
    ).join(' ');
  }, [stations, width, height]);

  /* Y-axis ticks */
  const yTicks = 6;
  const yTickVals = Array.from({ length: yTicks }, (_, i) =>
    Math.round((dlsMax * i) / (yTicks - 1) * 10) / 10
  );

  /* X-axis MD labels */
  const xTicks = 5;
  const xTickVals = Array.from({ length: xTicks }, (_, i) =>
    Math.round(mdMin + (mdRng * i) / (xTicks - 1))
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <style>{fadeInStyle}</style>

      {/* background */}
      <rect className="dsv-rect" x={0} y={0} width={width} height={height} fill="#0f172a" rx={8} />

      {/* severity zones */}
      <rect className="dsv-rect" x={pad.l} y={pad.t} width={w} height={yScale(2) - pad.t} fill="#10b981" opacity={0.06} />
      <rect className="dsv-rect" x={pad.l} y={yScale(5)} width={w} height={yScale(2) - yScale(5)} fill="#f59e0b" opacity={0.06} />
      <rect className="dsv-rect" x={pad.l} y={yScale(dlsMax)} width={w} height={yScale(5) - yScale(dlsMax)} fill="#ef4444" opacity={0.06} />

      {/* Y-axis */}
      <line className="dsv-line" x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + h} stroke="#334155" strokeWidth={1.5} />
      {yTickVals.map(v => (
        <g key={`yt_${v}`}>
          <line className="dsv-line" x1={pad.l - 5} y1={yScale(v)} x2={pad.l} y2={yScale(v)} stroke="#334155" strokeWidth={1} />
          <text className="dsv-text" x={pad.l - 8} y={yScale(v) + 4} textAnchor="end" fill="#64748b" fontSize={9} fontFamily="system-ui" fontWeight={700}>
            {v}
          </text>
          <line className="dsv-line" x1={pad.l} y1={yScale(v)} x2={pad.l + w} y2={yScale(v)} stroke="#1e293b" strokeWidth={0.5} strokeDasharray="3,3" />
        </g>
      ))}

      {/* Y Label */}
      <text className="dsv-text" x={12} y={pad.t + h / 2} textAnchor="middle" fill="#475569" fontSize={10} fontFamily="system-ui" fontWeight={700}
        transform={`rotate(-90, 12, ${pad.t + h / 2})`}>
        DLS (°/100 ft)
      </text>

      {/* X-axis */}
      <line className="dsv-line" x1={pad.l} y1={pad.t + h} x2={pad.l + w} y2={pad.t + h} stroke="#334155" strokeWidth={1.5} />
      {xTickVals.map(v => (
        <g key={`xt_${v}`}>
          <line className="dsv-line" x1={xScale(v)} y1={pad.t + h} x2={xScale(v)} y2={pad.t + h + 5} stroke="#334155" strokeWidth={1} />
          <text className="dsv-text" x={xScale(v)} y={pad.t + h + 16} textAnchor="middle" fill="#64748b" fontSize={9} fontFamily="system-ui" fontWeight={700}>
            {v}
          </text>
        </g>
      ))}
      <text className="dsv-text" x={pad.l + w / 2} y={height - 4} textAnchor="middle" fill="#475569" fontSize={10} fontFamily="system-ui" fontWeight={700}>
        Measured Depth (ft)
      </text>

      {/* Area fill */}
      <path className="dsv-polygon" d={areaPath} fill="url(#dlsGrad)" opacity={0.35} />
      <defs>
        <linearGradient id="dlsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {/* DLS line */}
      <path className="dsv-line" d={linePath} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {stations.map((s, i) => (
        <circle key={i} className="dsv-circle" cx={xScale(s.md)} cy={yScale(s.dls)} r={4}
          fill={dlsColor(s.dls)} stroke="#0f172a" strokeWidth={1.5} />
      ))}

      {/* Target DLS reference line */}
      <line className="dsv-line" x1={pad.l} y1={yScale(targetDls)} x2={pad.l + w} y2={yScale(targetDls)}
        stroke="#6366f1" strokeWidth={1.2} strokeDasharray="6,3" opacity={0.6} />
      <text className="dsv-text" x={pad.l + w + 2} y={yScale(targetDls) + 4} fill="#6366f1" fontSize={9} fontFamily="system-ui" fontWeight={700} opacity={0.8}>
        target {targetDls}
      </text>

      {/* DLS indicators */}
      <text className="dsv-text" x={pad.l + 8} y={yScale(2) - 3} fill="#10b981" fontSize={8} fontFamily="system-ui" fontWeight={700}>LOW</text>
      <text className="dsv-text" x={pad.l + 8} y={yScale(3.5)} fill="#f59e0b" fontSize={8} fontFamily="system-ui" fontWeight={700}>MED</text>
      <text className="dsv-text" x={pad.l + 8} y={yScale(6.5)} fill="#ef4444" fontSize={8} fontFamily="system-ui" fontWeight={700}>HIGH</text>
    </svg>
  );
};

/* ──────────────────────────────────────────────────────────────────────
   Slide / Rotate Gantt Chart
   A horizontal Gantt-like bar for each 30-ft stand across the section.
   Each bar = (slide footage, rotate footage).
   Color-coded per stand, with DLS contribution at each stand.
   ────────────────────────────────────────────────────────────────────── */
interface SlideRotateStand {
  standNumber: number;
  mdStart: number;
  mdEnd: number;
  slideFt: number;
  rotateFt: number;
  dlsContribution: number; /* °/100ft from this stand */
}

interface SlideRotateGanttChartProps {
  stands: SlideRotateStand[];
  totalMd: number;
  width?: number;
  height?: number;
}

export const SlideRotateGanttChart: React.FC<SlideRotateGanttChartProps> = ({
  stands,
  totalMd,
  width = 520,
  height = 360,
}) => {
  const pad = { l: 60, r: 44, t: 32, b: 40 };
  const w = width - pad.l - pad.r;
  const barH = Math.min(18, Math.max(10, (height - pad.t - pad.b - 20) / Math.max(stands.length, 1)));
  const innerH = stands.length * barH;
  const yOff = pad.t + 4;

  const xScale = (md: number) => pad.l + ((md - (stands[0]?.mdStart ?? 0)) / totalMd) * w;
  const dlsColor = (dls: number): string => {
    if (dls <= 1.5) return '#22c55e';
    if (dls <= 3.0) return '#eab308';
    if (dls <= 5.0) return '#f97316';
    return '#ef4444';
  };

  /* X-axis MD ticks */
  const xTicks = 6;
  const xTickVals = Array.from({ length: xTicks }, (_, i) =>
    Math.round((totalMd * i) / (xTicks - 1) * 10) / 10
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <style>{fadeInStyle}</style>

      <rect className="dsv-rect" x={0} y={0} width={width} height={height} fill="#0f172a" rx={8} />

      {/* X-axis */}
      <line className="dsv-line" x1={pad.l} y1={yOff + innerH + 4} x2={pad.l + w} y2={yOff + innerH + 4} stroke="#334155" strokeWidth={1.5} />
      {xTickVals.map(v => (
        <g key={`x_${v}`}>
          <line className="dsv-line" x1={xScale(v + (stands[0]?.mdStart ?? 0))} y1={yOff + innerH + 4}
            x2={xScale(v + (stands[0]?.mdStart ?? 0))} y2={yOff + innerH + 10} stroke="#334155" strokeWidth={1} />
          <text className="dsv-text" x={xScale(v + (stands[0]?.mdStart ?? 0))} y={yOff + innerH + 22} textAnchor="middle" fill="#64748b"
            fontSize={8.5} fontFamily="system-ui" fontWeight={700}>
            {v}
          </text>
        </g>
      ))}
      <text className="dsv-text" x={pad.l + w / 2} y={height - 6} textAnchor="middle" fill="#475569" fontSize={10} fontFamily="system-ui" fontWeight={700}>
        Measured Depth (ft)
      </text>

      {/* Stand bars */}
      {stands.map((st, i) => {
        const cy = yOff + i * barH;
        const slideW = (st.slideFt / 30) * (w / (stands.length || 1)) * 1.8;
        const rotateW = (st.rotateFt / 30) * (w / (stands.length || 1)) * 1.8;
        const barX = xScale(st.mdStart);
        const barWidth = Math.min(slideW + rotateW, w - (barX - pad.l));
        return (
          <g key={`stand_${i}`}>
            {/* Stand label */}
            <text className="dsv-text" x={pad.l - 6} y={cy + barH / 2 + 3.5} textAnchor="end" fill="#94a3b8" fontSize={9}
              fontFamily="system-ui" fontWeight={700}>
              #{st.standNumber}
            </text>

            {/* Slide portion */}
            <rect className="dsv-rect" x={barX} y={cy + 1} width={Math.max((slideW / (slideW + rotateW || 1)) * barWidth, 1)}
              height={barH - 2} fill="#f97316" rx={3} opacity={0.85} />

            {/* Rotate portion */}
            <rect className="dsv-rect" x={barX + ((slideW / (slideW + rotateW || 1)) * barWidth)}
              y={cy + 1} width={Math.max((rotateW / (slideW + rotateW || 1)) * barWidth, 1)}
              height={barH - 2} fill="#06b6d4" rx={3} opacity={0.85} />

            {/* DLS dot */}
            <circle className="dsv-circle" cx={barX + barWidth + 16} cy={cy + barH / 2} r={5}
              fill={dlsColor(st.dlsContribution)} stroke="#0f172a" strokeWidth={1.5} />
            <text className="dsv-text" x={barX + barWidth + 26} y={cy + barH / 2 + 3.5} fill="#94a3b8" fontSize={8}
              fontFamily="system-ui" fontWeight={700}>
              {formatNumber(st.dlsContribution, 1)}°
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <rect className="dsv-rect" x={pad.l + 4} y={yOff + innerH + 30} width={10} height={10} fill="#f97316" rx={2} opacity={0.85} />
      <text className="dsv-text" x={pad.l + 18} y={yOff + innerH + 39} fill="#94a3b8" fontSize={9} fontFamily="system-ui" fontWeight={700}>Sliding</text>
      <rect className="dsv-rect" x={pad.l + 70} y={yOff + innerH + 30} width={10} height={10} fill="#06b6d4" rx={2} opacity={0.85} />
      <text className="dsv-text" x={pad.l + 84} y={yOff + innerH + 39} fill="#94a3b8" fontSize={9} fontFamily="system-ui" fontWeight={700}>Rotating</text>

      {/* Total MD badge */}
      <text className="dsv-text" x={pad.l + w} y={pad.t - 6} textAnchor="end" fill="#6366f1" fontSize={10} fontFamily="system-ui" fontWeight={800}>
        total MD: {formatNumber(totalMd, 0)} ft
      </text>
    </svg>
  );
};

export default {};

export const RSSComparisonChart: React.FC<{
  pushDLS: number; pointDLS: number; pushLateralCut: number;
  pointLateralCut: number; recommendedSystem: 'push' | 'point';
  dlsAdvantagePct: number;
}> = ({ pushDLS, pointDLS, pushLateralCut, pointLateralCut, recommendedSystem, dlsAdvantagePct }) => {
  const W = 400, H = 280, pad = 50;
  const barW = 70, gap = 60;
  const maxDLS = Math.max(pushDLS, pointDLS) * 1.3;
  const maxCut = Math.max(pushLateralCut, pointLateralCut) * 1.3;
  const baseY = pad + 50;
  const sy = (H - pad * 2 - 80) / maxDLS;
  const recColor = recommendedSystem === 'push' ? '#f59e0b' : '#06b6d4';
  return (
    <svg viewBox={'0 0 ' + W + ' ' + H} className="w-full h-full" style={{ background: '#020617' }}>
      {/* DLS comparison */}
      <text x={pad + 20} y={pad - 8} fill={'#64748b'} fontSize={10} fontFamily="monospace" fontWeight="bold">DLS (°/100ft)</text>
      <rect x={pad + 20} y={baseY - pushDLS * sy} width={barW} height={pushDLS * sy} fill={'#f59e0b'} opacity={0.7} rx={4} />
      <text x={pad + 20 + barW / 2} y={baseY - pushDLS * sy - 6} fill={'#f59e0b'} fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {pushDLS.toFixed(2)}
      </text>
      <rect x={pad + 20 + barW + gap} y={baseY - pointDLS * sy} width={barW} height={pointDLS * sy} fill={'#06b6d4'} opacity={0.7} rx={4} />
      <text x={pad + 20 + barW + gap + barW / 2} y={baseY - pointDLS * sy - 6} fill={'#06b6d4'} fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {pointDLS.toFixed(2)}
      </text>
      <line x1={pad} y1={baseY} x2={W - pad} y2={baseY} stroke={'#334155'} strokeWidth={1} />
      <text x={pad + 20 + barW / 2} y={baseY + 16} fill={'#f59e0b'} fontSize={9} textAnchor="middle" fontFamily="monospace">Push</text>
      <text x={pad + 20 + barW + gap + barW / 2} y={baseY + 16} fill={'#06b6d4'} fontSize={9} textAnchor="middle" fontFamily="monospace">Point</text>

      {/* Lateral cut comparison */}
      <text x={pad + 20} y={baseY + 50} fill={'#64748b'} fontSize={10} fontFamily="monospace" fontWeight="bold">
        Lateral Cut (in/rev): Push {pushLateralCut.toFixed(3)} | Point {pointLateralCut.toFixed(3)}
      </text>
      <rect x={pad + 20} y={baseY + 58} width={180} height={16} rx={4} fill="#1e293b" />
      <rect x={pad + 20} y={baseY + 58} width={Math.min(180, (pushLateralCut / maxCut) * 180)} height={16} rx={4} fill={'#f59e0b'} opacity={0.7} />
      <rect x={pad + 20 + barW + gap} y={baseY + 58} width={180} height={16} rx={4} fill="#1e293b" />
      <rect x={pad + 20 + barW + gap} y={baseY + 58} width={Math.min(180, (pointLateralCut / maxCut) * 180)} height={16} rx={4} fill={'#06b6d4'} opacity={0.7} />

      {/* Recommendation badge */}
      <rect x={W / 2 - 70} y={baseY + 100} width={140} height={36} rx={8} fill={recColor} opacity={0.15}
        stroke={recColor} strokeWidth={1.5} />
      <text x={W / 2} y={baseY + 116} fill={recColor} fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        Recommend: {recommendedSystem.toUpperCase()}
      </text>
      <text x={W / 2} y={baseY + 130} fill={'#94a3b8'} fontSize={8} textAnchor="middle" fontFamily="monospace">
        Advantage: +{dlsAdvantagePct.toFixed(1)}% DLS
      </text>
      <text x={W / 2} y={H - 8} fill={'#64748b'} fontSize={8} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        Push vs Point RSS Comparison
      </text>
    </svg>
  );
};
