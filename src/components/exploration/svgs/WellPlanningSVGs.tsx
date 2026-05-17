import React from 'react';
import type {
  FaultBoundary, PorePressureProfile, CasingProgram, CasingString,
  TrajectoryDesign, LoggingProgram, CoringInterval, FluidSamplePoint,
  AFEResult, RiskAssessment, RiskItem, FIDResult, DecisionTreeNode,
  RegulatoryStatus, SurfaceConstraint, StratigraphyPrognosis,
} from '../../../lib/well_planning';

// ─── Color Palette ──────────────────────────────────────────────────────────
const INDIGO = '#6366f1', CYAN = '#22d3ee', AMBER = '#f59e0b', EMERALD = '#10b981';
const RED = '#ef4444', SLATE = '#94a3b8', VIOLET = '#a855f7', ROSE = '#f43f5e';
const GRID = 'rgba(148,163,184,0.08)', TEXT = 'rgba(148,163,184,0.5)', AXIS = 'rgba(148,163,184,0.25)';

// ─── Helpers ────────────────────────────────────────────────────────────────
const scale = (val: number, dMin: number, dMax: number, rMin: number, rMax: number): number =>
  rMin + ((val - dMin) / Math.max(dMax - dMin, 0.01)) * (rMax - rMin);

const fmtM = (n: number): string => {
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toFixed(0);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CRESTAL POSITION MAP (Well Location)
// ═══════════════════════════════════════════════════════════════════════════════

export const CrestalPositionMap: React.FC<{
  points: { x: number; y: number; depthFt: number }[];
  faults: FaultBoundary[];
  constraints: SurfaceConstraint[];
  wellX: number; wellY: number;
  crestalX: number; crestalY: number;
}> = ({ points, faults, constraints, wellX, wellY, crestalX, crestalY }) => {
  const W = 400, H = 300, pad = 40;
  const allX = [...points.map(p => p.x), ...faults.flatMap(f => [f.faultX1, f.faultX2]), ...constraints.map(c => c.centerX)];
  const allY = [...points.map(p => p.y), ...faults.flatMap(f => [f.faultY1, f.faultY2]), ...constraints.map(c => c.centerY)];
  const xMin = Math.min(...allX) - 100;
  const xMax = Math.max(...allX) + 100;
  const yMin = Math.min(...allY) - 100;
  const yMax = Math.max(...allY) + 100;
  const sx = (x: number) => pad + scale(x, xMin, xMax, 0, W - pad * 2);
  const sy = (y: number) => H - pad - scale(y, yMin, yMax, 0, H - pad * 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      {/* Grid */}
      {[0.25, 0.5, 0.75].map(t => (
        <g key={t}>
          <line x1={pad + (W - pad * 2) * t} y1={pad} x2={pad + (W - pad * 2) * t} y2={H - pad} stroke={GRID} strokeWidth={0.5} />
          <line x1={pad} y1={pad + (H - pad * 2) * t} x2={W - pad} y2={pad + (H - pad * 2) * t} stroke={GRID} strokeWidth={0.5} />
        </g>
      ))}
      {/* Fault boundaries */}
      {faults.map((f, i) => (
        <line key={`fault-${i}`} x1={sx(f.faultX1)} y1={sy(f.faultY1)} x2={sx(f.faultX2)} y2={sy(f.faultY2)}
          stroke={RED} strokeWidth={2.5} strokeDasharray="6,4" opacity={0.8} />
      ))}
      {faults.map((f, i) => (
        <text key={`flabel-${i}`} x={sx((f.faultX1 + f.faultX2) / 2) + 5} y={sy((f.faultY1 + f.faultY2) / 2) - 6}
          fill={RED} fontSize={8} fontFamily="monospace">{f.name}</text>
      ))}
      {/* Surface constraints (exclusion zones) */}
      {constraints.map((c, i) => (
        <React.Fragment key={`sc-${i}`}>
          <circle cx={sx(c.centerX)} cy={sy(c.centerY)} r={scale(c.radiusFt, 0, xMax - xMin, 0, W - pad * 2) * 0.3}
            fill={VIOLET} fillOpacity={0.15} stroke={VIOLET} strokeWidth={1} strokeDasharray="3,3" />
          <text x={sx(c.centerX)} y={sy(c.centerY)} fill={VIOLET} fontSize={7} textAnchor="middle"
            fontFamily="monospace">{c.type}</text>
        </React.Fragment>
      ))}
      {/* Structural contour points */}
      {points.map((p, i) => (
        <circle key={`pt-${i}`} cx={sx(p.x)} cy={sy(p.y)} r={4} fill={SLATE} stroke={CYAN} strokeWidth={1} opacity={0.7} />
      ))}
      {/* Labels for points */}
      {points.map((p, i) => (
        <text key={`lbl-${i}`} x={sx(p.x) + 7} y={sy(p.y) - 7}
          fill={TEXT} fontSize={7} fontFamily="monospace">{p.depthFt}′</text>
      ))}
      {/* Crestal marker */}
      <circle cx={sx(crestalX)} cy={sy(crestalY)} r={7} fill="none" stroke={AMBER} strokeWidth={2} />
      <text x={sx(crestalX) + 10} y={sy(crestalY) - 10} fill={AMBER} fontSize={9} fontFamily="monospace" fontWeight="bold">CREST</text>
      {/* Well location */}
      <circle cx={sx(wellX)} cy={sy(wellY)} r={8} fill={EMERALD} opacity={0.8} />
      <line x1={sx(wellX) - 6} y1={sy(wellY)} x2={sx(wellX) + 6} y2={sy(wellY)} stroke="#fff" strokeWidth={1.5} />
      <line x1={sx(wellX)} y1={sy(wellY) - 6} x2={sx(wellX)} y2={sy(wellY) + 6} stroke="#fff" strokeWidth={1.5} />
      <text x={sx(wellX) + 12} y={sy(wellY) + 4} fill={EMERALD} fontSize={9} fontFamily="monospace" fontWeight="bold">WELL</text>
      {/* Legend */}
      <rect x={W - 110} y={pad - 5} width={105} height={50} fill="rgba(2,6,23,0.85)" rx={4} />
      <line x1={W - 100} y1={pad + 8} x2={W - 85} y2={pad + 8} stroke={RED} strokeWidth={2} strokeDasharray="4,2" />
      <text x={W - 80} y={pad + 11} fill={TEXT} fontSize={7} fontFamily="monospace">Fault</text>
      <circle cx={W - 92} cy={pad + 22} r={4} fill={VIOLET} fillOpacity={0.3} stroke={VIOLET} strokeWidth={0.8} />
      <text x={W - 80} y={pad + 25} fill={TEXT} fontSize={7} fontFamily="monospace">Exclusion</text>
      <circle cx={W - 92} cy={pad + 36} r={4} fill={EMERALD} />
      <text x={W - 80} y={pad + 39} fill={TEXT} fontSize={7} fontFamily="monospace">Well loc.</text>
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. TRAJECTORY PROFILE (Vertical Section + Plan View)
// ═══════════════════════════════════════════════════════════════════════════════

export const TrajectoryProfile: React.FC<{
  trajectory: TrajectoryDesign;
  formationTops: { name: string; depthFt: number; color?: string }[];
}> = ({ trajectory, formationTops }) => {
  const W = 400, H = 340, pad = 50;
  const maxDep = Math.max(...trajectory.trajectoryPoints.map(p => p.tvd));
  const maxDepOut = Math.max(...trajectory.trajectoryPoints.map(p => p.departure));
  const totalRange = Math.max(maxDep, maxDepOut) * 1.1;
  const sx = (d: number) => pad + scale(d, 0, totalRange, 0, W - pad * 2);
  const sy = (t: number) => pad + scale(t, 0, totalRange, 0, H - pad * 2);

  const horizColors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      {/* Grid */}
      {[0.2, 0.4, 0.6, 0.8].map(t => (
        <g key={t}>
          <line x1={pad} y1={pad + (H - pad * 2) * t} x2={W - pad} y2={pad + (H - pad * 2) * t} stroke={GRID} strokeWidth={0.5} />
          <line x1={pad + (W - pad * 2) * t} y1={pad} x2={pad + (W - pad * 2) * t} y2={H - pad} stroke={GRID} strokeWidth={0.5} />
        </g>
      ))}
      {/* TVD axis */}
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke={AXIS} strokeWidth={1} />
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <text key={`tvd-${t}`} x={pad - 6} y={pad + (H - pad * 2) * t} fill={TEXT} fontSize={7}
          textAnchor="end" fontFamily="monospace">{fmtM(totalRange * (1 - t))}′</text>
      ))}
      {/* Departure axis */}
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke={AXIS} strokeWidth={1} />
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <text key={`dep-${t}`} x={pad + (W - pad * 2) * t} y={H - pad + 12} fill={TEXT} fontSize={7}
          textAnchor="middle" fontFamily="monospace">{fmtM(totalRange * t)}′</text>
      ))}
      {/* Formation tops (horizontal bands) */}
      {formationTops.map((f, i) => (
        <React.Fragment key={`ft-${i}`}>
          <line x1={pad} y1={sy(f.depthFt)} x2={W - pad} y2={sy(f.depthFt)}
            stroke={f.color || horizColors[i % horizColors.length]} strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
          <text x={pad + 3} y={sy(f.depthFt) - 3} fill={TEXT} fontSize={7} fontFamily="monospace" opacity={0.8}>
            {f.name} ({fmtM(f.depthFt)}′)
          </text>
        </React.Fragment>
      ))}
      {/* Well trajectory path (TVD vs Departure) */}
      <polyline
        points={trajectory.trajectoryPoints.map(p => `${sx(p.departure)},${sy(p.tvd)}`).join(' ')}
        fill="none" stroke={CYAN} strokeWidth={2.5} strokeLinejoin="round" />
      {/* KOP marker */}
      {trajectory.kopDepthFt > 0 && (
        <>
          <circle cx={sx(0)} cy={sy(trajectory.kopDepthFt)} r={5} fill={AMBER} />
          <text x={sx(0) + 8} y={sy(trajectory.kopDepthFt) - 4} fill={AMBER} fontSize={8} fontFamily="monospace">
            KOP @ {fmtM(trajectory.kopDepthFt)}′
          </text>
        </>
      )}
      {/* Target marker */}
      <circle cx={sx(trajectory.targetDepartureFt)} cy={sy(trajectory.targetTvdFt)}
        r={5} fill="none" stroke={EMERALD} strokeWidth={2} />
      <text x={sx(trajectory.targetDepartureFt) + 8} y={sy(trajectory.targetTvdFt) - 6}
        fill={EMERALD} fontSize={8} fontFamily="monospace">Target</text>
      {/* Label */}
      <text x={W / 2} y={H - 3} fill={SLATE} fontSize={9} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {trajectory.type.toUpperCase()} · MD: {fmtM(trajectory.totalMeasuredDepthFt)}′ · Inc: {trajectory.tangentAngleDeg}° · BUR: {trajectory.buildRateDegPer100ft}°/100′
      </text>
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. PORE PRESSURE & FRACTURE GRADIENT PROFILE
// ═══════════════════════════════════════════════════════════════════════════════

export const PorePressureChart: React.FC<{ profile: PorePressureProfile }> = ({ profile }) => {
  const W = 380, H = 320, pad = 45;
  const { points } = profile;
  const maxD = Math.max(...points.map(p => p.depthFt), 10000);
  const minPPG = 8, maxPPG = Math.max(...points.map(p => p.fractureGradientPpg), 18) + 1;
  const sx = (ppg: number) => pad + scale(ppg, minPPG, maxPPG, 0, W - pad * 2);
  const sy = (d: number) => H - pad - scale(d, 0, maxD, 0, H - pad * 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      {/* Grid */}
      {[minPPG + 2, minPPG + 4, minPPG + 6, minPPG + 8].map(ppg => (
        <line key={`gx-${ppg}`} x1={sx(ppg)} y1={pad} x2={sx(ppg)} y2={H - pad} stroke={GRID} strokeWidth={0.5} />
      ))}
      {[2000, 4000, 6000, 8000].map(d => (
        <line key={`gy-${d}`} x1={pad} y1={sy(d)} x2={W - pad} y2={sy(d)} stroke={GRID} strokeWidth={0.5} />
      ))}
      {/* Axis */}
      <line x1={sx(minPPG)} y1={pad} x2={sx(minPPG)} y2={H - pad} stroke={AXIS} strokeWidth={1} />
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke={AXIS} strokeWidth={1} />
      {/* X labels */}
      {[minPPG, minPPG + 2, minPPG + 4, minPPG + 6, minPPG + 8].map(ppg => (
        <text key={`xl-${ppg}`} x={sx(ppg)} y={H - pad + 12} fill={TEXT} fontSize={7} textAnchor="middle" fontFamily="monospace">{ppg}</text>
      ))}
      <text x={W / 2} y={H - 3} fill={TEXT} fontSize={7} textAnchor="middle" fontFamily="monospace">Gradient (ppg)</text>
      {/* Y labels */}
      {[0, 2000, 4000, 6000, 8000].map(d => (
        <text key={`yl-${d}`} x={sx(minPPG) - 5} y={sy(d) + 3} fill={TEXT} fontSize={6} textAnchor="end" fontFamily="monospace">{d === 0 ? '0' : fmtM(d)}</text>
      ))}
      {/* Overburden */}
      <polyline points={points.map(p => `${sx(p.overburdenPpg)},${sy(p.depthFt)}`).join(' ')}
        fill="none" stroke={SLATE} strokeWidth={1.5} strokeDasharray="4,3" opacity={0.6} />
      <text x={sx(maxPPG) - 30} y={sy(1000)} fill={SLATE} fontSize={7} fontFamily="monospace">OBG</text>
      {/* Fracture gradient */}
      <polyline points={points.map(p => `${sx(p.fractureGradientPpg)},${sy(p.depthFt)}`).join(' ')}
        fill="none" stroke={INDIGO} strokeWidth={2} />
      <text x={sx(maxPPG) - 45} y={sy(2000)} fill={INDIGO} fontSize={7} fontFamily="monospace" fontWeight="bold">FG</text>
      {/* Pore pressure */}
      <polyline points={points.map(p => `${sx(p.porePressurePpg)},${sy(p.depthFt)}`).join(' ')}
        fill="none" stroke={RED} strokeWidth={2} />
      <text x={sx(minPPG) + 10} y={sy(4000)} fill={RED} fontSize={7} fontFamily="monospace" fontWeight="bold">PP</text>
      {/* Mud weight window shading */}
      {profile.points.length > 1 && (
        <polygon
          points={[
            ...points.map(p => `${sx(p.mudWindowMinPpg)},${sy(p.depthFt)}`),
            ...points.slice().reverse().map(p => `${sx(p.mudWindowMaxPpg)},${sy(p.depthFt)}`),
          ].join(' ')}
          fill={EMERALD} fillOpacity={0.08} stroke="none" />
      )}
      <text x={sx(minPPG) + 20} y={sy(6000)} fill={EMERALD} fontSize={7} fontFamily="monospace" opacity={0.7}>MW Window</text>
      {/* Eaton exponent label */}
      <text x={sx(minPPG) + 5} y={pad + 8} fill={TEXT} fontSize={8} fontFamily="monospace">
        Eaton n={profile.eatonExponent.toFixed(1)} · NCT={fmtM(profile.normalCompactionTrendFtPerS)} ft/s
      </text>
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CASING DESIGN SCHEMATIC
// ═══════════════════════════════════════════════════════════════════════════════

export const CasingSchematic: React.FC<{ casingProgram: CasingProgram }> = ({ casingProgram }) => {
  const W = 380, H = 320, pad = 55;
  const { strings } = casingProgram;
  const maxDepth = Math.max(...strings.map(s => s.shoeDepthFt), 10000);
  const sy = (d: number) => pad + scale(d, 0, maxDepth, 0, H - pad * 2);
  const casingColors = ['#64748b', '#6366f1', '#22d3ee', '#f59e0b', '#ef4444'];
  const minOD = Math.min(...strings.map(s => s.odIn));
  const maxOD = Math.max(...strings.map(s => s.odIn));
  const sx = (od: number) => W / 2 + scale(od, minOD, maxOD, -60, 60);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      {/* Depth axis */}
      <line x1={W / 2} y1={pad} x2={W / 2} y2={H - pad} stroke={AXIS} strokeWidth={1} />
      {[0, 2000, 4000, 6000, 8000].map(d => (
        <text key={`cd-${d}`} x={W / 2 - 6} y={sy(d) + 3} fill={TEXT} fontSize={6} textAnchor="end" fontFamily="monospace">
          {d === 0 ? '0′' : fmtM(d) + '′'}
        </text>
      ))}
      {/* Casing strings */}
      {strings.map((s, i) => {
        const halfW = scale(s.odIn, minOD, maxOD, 30, 65);
        return (
          <g key={s.name}>
            {/* Casing wall */}
            <rect x={W / 2 - halfW} y={Math.min(sy(s.topDepthFt), sy(s.shoeDepthFt))}
              width={halfW * 2} height={Math.abs(sy(s.shoeDepthFt) - sy(s.topDepthFt))}
              fill={casingColors[i % casingColors.length]} fillOpacity={0.25}
              stroke={casingColors[i % casingColors.length]} strokeWidth={1.5} rx={2} />
            {/* Shoe marker */}
            <line x1={W / 2 - halfW - 5} y1={sy(s.shoeDepthFt)} x2={W / 2 + halfW + 5} y2={sy(s.shoeDepthFt)}
              stroke={casingColors[i % casingColors.length]} strokeWidth={1.5} />
            {/* Label */}
            <text x={W / 2 + halfW + 8} y={sy((s.topDepthFt + s.shoeDepthFt) / 2) + 3}
              fill={casingColors[i % casingColors.length]} fontSize={7} fontFamily="monospace">
              {s.name} {s.odIn}″ {s.grade} ({s.weightLbPerFt}ppf)
            </text>
            {i === 0 && (
              <text x={W / 2 + halfW + 8} y={sy((s.topDepthFt + s.shoeDepthFt) / 2) + 12}
                fill={TEXT} fontSize={6} fontFamily="monospace">
                B:{fmtM(s.burstRatingPsi)}psi C:{fmtM(s.collapseRatingPsi)}psi
              </text>
            )}
          </g>
        );
      })}
      {/* Open hole */}
      <rect x={W / 2 - 20} y={sy(strings[strings.length - 1].shoeDepthFt)}
        width={40} height={sy(maxDepth) - sy(strings[strings.length - 1].shoeDepthFt)}
        fill="none" stroke={SLATE} strokeWidth={1} strokeDasharray="4,3" opacity={0.6} />
      <text x={W / 2 + 25} y={sy(maxDepth) - 3} fill={TEXT} fontSize={7} fontFamily="monospace">OH</text>
      {/* Design factor */}
      <text x={pad} y={pad - 5} fill={TEXT} fontSize={8} fontFamily="monospace">
        DF: {casingProgram.designFactor.toFixed(1)} · Cost: ${fmtM(casingProgram.totalCasingCostUsd)}
      </text>
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. LOGGING PROGRAM DISPLAY
// ═══════════════════════════════════════════════════════════════════════════════

export const LoggingProgramSVG: React.FC<{ logProgram: LoggingProgram }> = ({ logProgram }) => {
  const W = 380, H = 220, pad = 40;
  const { logs } = logProgram;
  const barH = 20, gap = 6;
  const maxCost = Math.max(...logs.map(l => l.costPerFt), 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      <text x={pad} y={pad - 8} fill={TEXT} fontSize={9} fontFamily="monospace" fontWeight="bold">
        Logging Program · {fmtM(logProgram.depthIntervalBaseFt - logProgram.depthIntervalTopFt)}′ interval
      </text>
      {logs.map((l, i) => {
        const y = pad + i * (barH + gap);
        const w = scale(l.costPerFt, 0, maxCost, 50, W - pad * 2 - 110);
        return (
          <g key={l.acronym}>
            <rect x={pad} y={y} width={w} height={barH} fill={INDIGO} fillOpacity={0.6} rx={3} />
            <text x={pad + 4} y={y + barH / 2 + 3} fill="#fff" fontSize={8} fontFamily="monospace" fontWeight="bold">
              {l.acronym}
            </text>
            <text x={pad + w + 5} y={y + barH / 2 + 3} fill={TEXT} fontSize={7} fontFamily="monospace">
              ${l.costPerFt.toFixed(0)}/ft · {l.runDays}d · {l.conveyance}
            </text>
          </g>
        );
      })}
      <text x={pad} y={H - pad + 15} fill={EMERALD} fontSize={8} fontFamily="monospace">
        Total: ${fmtM(logProgram.totalCostUsd)} · {logProgram.totalRunDays.toFixed(1)} days
      </text>
      {logProgram.operationalRisks.map((r, i) => (
        <text key={`lr-${i}`} x={W - pad - 5} y={pad - 8 + i * 10} fill={AMBER} fontSize={7} textAnchor="end" fontFamily="monospace">{r}</text>
      ))}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. CORING & SAMPLING DIAGRAM
// ═══════════════════════════════════════════════════════════════════════════════

export const CoringSamplingSVG: React.FC<{
  coreIntervals: CoringInterval[];
  samplePoints: FluidSamplePoint[];
  maxDepthFt: number;
}> = ({ coreIntervals, samplePoints, maxDepthFt }) => {
  const W = 380, H = 280, pad = 45;
  const sy = (d: number) => pad + scale(d, 0, maxDepthFt, 0, H - pad * 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      {/* Depth ruler */}
      <line x1={pad + 30} y1={pad} x2={pad + 30} y2={H - pad} stroke={AXIS} strokeWidth={1} />
      {[0, 2000, 4000, 6000, 8000].filter(d => d <= maxDepthFt).map(d => (
        <g key={`cr-${d}`}>
          <line x1={pad + 25} y1={sy(d)} x2={pad + 35} y2={sy(d)} stroke={AXIS} strokeWidth={1} />
          <text x={pad + 22} y={sy(d) + 3} fill={TEXT} fontSize={6} textAnchor="end" fontFamily="monospace">{d === 0 ? '0′' : fmtM(d) + '′'}</text>
        </g>
      ))}
      {/* Core intervals (left of ruler) */}
      {coreIntervals.map((c, i) => (
        <g key={`core-${i}`}>
          <rect x={pad} y={Math.min(sy(c.depthTopFt), sy(c.depthBaseFt))}
            width={22} height={Math.abs(sy(c.depthBaseFt) - sy(c.depthTopFt))}
            fill={c.coreType === 'pressure' ? ROSE : c.coreType === 'sidewall' ? CYAN : EMERALD} fillOpacity={0.6} rx={2} />
          <text x={pad + 2} y={sy((c.depthTopFt + c.depthBaseFt) / 2) + 3} fill="#fff" fontSize={6} fontFamily="monospace">
            {c.coreType.slice(0, 3)}
          </text>
          <text x={pad + 35} y={sy((c.depthTopFt + c.depthBaseFt) / 2) + 3} fill={TEXT} fontSize={6} fontFamily="monospace">
            {fmtM(c.depthTopFt)}-{fmtM(c.depthBaseFt)}′ ({c.expectedRecoveryPct}%)
          </text>
        </g>
      ))}
      {/* Fluid sample points (right of ruler) */}
      {samplePoints.map((s, i) => (
        <g key={`fs-${i}`}>
          <circle cx={pad + 55} cy={sy(s.depthFt)} r={5}
            fill={s.tool === 'DST' ? AMBER : s.tool === 'MDT' ? VIOLET : CYAN} />
          <text x={pad + 63} y={sy(s.depthFt) + 3} fill={TEXT} fontSize={6} fontFamily="monospace">
            {s.tool} @ {fmtM(s.depthFt)}′ ({s.estimatedPumpTimeHr}h)
          </text>
        </g>
      ))}
      {/* Legend */}
      <rect x={pad} y={pad - 22} width={W - pad * 2} height={16} fill="rgba(2,6,23,0.8)" rx={3} />
      <circle cx={pad + 10} cy={pad - 14} r={4} fill={EMERALD} />
      <text x={pad + 18} y={pad - 11} fill={TEXT} fontSize={7} fontFamily="monospace">Conv</text>
      <circle cx={pad + 65} cy={pad - 14} r={4} fill={CYAN} />
      <text x={pad + 73} y={pad - 11} fill={TEXT} fontSize={7} fontFamily="monospace">Sidewall</text>
      <circle cx={pad + 135} cy={pad - 14} r={4} fill={ROSE} />
      <text x={pad + 143} y={pad - 11} fill={TEXT} fontSize={7} fontFamily="monospace">Pressure</text>
      <circle cx={pad + 205} cy={pad - 14} r={4} fill={VIOLET} />
      <text x={pad + 213} y={pad - 11} fill={TEXT} fontSize={7} fontFamily="monospace">MDT</text>
      <circle cx={pad + 255} cy={pad - 14} r={4} fill={AMBER} />
      <text x={pad + 263} y={pad - 11} fill={TEXT} fontSize={7} fontFamily="monospace">DST</text>
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 7. AFE COST BREAKDOWN
// ═══════════════════════════════════════════════════════════════════════════════

export const AFECostBreakdownSVG: React.FC<{ afe: AFEResult }> = ({ afe }) => {
  const W = 380, H = 260, pad = 40;
  const categories = ['tangible', 'intangible', 'service', 'logistics', 'regulatory', 'contingency'] as const;
  const catLabels: Record<string, string> = { tangible: 'Tangible', intangible: 'Intangible', service: 'Service', logistics: 'Logistics', regulatory: 'Reg.', contingency: 'Conting.' };
  const catColors: Record<string, string> = { tangible: INDIGO, intangible: CYAN, service: EMERALD, logistics: AMBER, regulatory: VIOLET, contingency: ROSE };
  const catTotals = categories.map(cat => afe.breakdown.filter(b => b.category === cat).reduce((s, b) => s + b.cost, 0));
  const total = catTotals.reduce((s, v) => s + v, 0) || 1;
  const barH = 22, gap = 8;
  const maxBar = W - pad * 2 - 90;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      <text x={pad} y={pad - 8} fill={SLATE} fontSize={10} fontFamily="monospace" fontWeight="bold">
        AFE · ${fmtM(afe.totalCostUsd)} Total · {afe.drillingDays.toFixed(1)} days
      </text>
      {catTotals.map((catVal, i) => {
        const y = pad + i * (barH + gap);
        const barW = scale(catVal, 0, total, 0, maxBar);
        return (
          <g key={categories[i]}>
            <rect x={pad} y={y} width={maxBar} height={barH} fill={GRID} rx={3} />
            <rect x={pad} y={y} width={barW} height={barH} fill={catColors[categories[i]]} fillOpacity={0.75} rx={3} />
            <text x={pad + 5} y={y + barH / 2 + 3} fill="#fff" fontSize={8} fontFamily="monospace" fontWeight="bold">{catLabels[categories[i]]}</text>
            <text x={pad + barW + 5} y={y + barH / 2 + 3} fill={TEXT} fontSize={7} fontFamily="monospace">
              ${fmtM(catVal)} ({(catVal / total * 100).toFixed(0)}%)
            </text>
          </g>
        );
      })}
      {/* Bottom metrics */}
      <text x={pad} y={H - pad + 14} fill={TEXT} fontSize={8} fontFamily="monospace">
        Dry Hole: ${fmtM(afe.dryHoleCostUsd)} · Spread Rate: ${fmtM(afe.spreadRateUsdPerDay)}/day
      </text>
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 8. RISK MATRIX (5×5)
// ═══════════════════════════════════════════════════════════════════════════════

export const RiskMatrixSVG: React.FC<{ assessment: RiskAssessment }> = ({ assessment }) => {
  const W = 400, H = 300, pad = 50;
  const cellSize = (H - pad * 2) / 5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      {/* Column headers */}
      {[1, 2, 3, 4, 5].map(c => (
        <text key={`ch-${c}`} x={pad + cellSize * (c - 0.5)} y={pad - 12} fill={TEXT} fontSize={8} textAnchor="middle" fontFamily="monospace">
          C={c}
        </text>
      ))}
      {/* Row labels */}
      {[5, 4, 3, 2, 1].map((r, ri) => (
        <text key={`rl-${r}`} x={pad - 8} y={pad + cellSize * (ri + 0.5) + 3} fill={TEXT} fontSize={8} textAnchor="end" fontFamily="monospace">
          L={r}
        </text>
      ))}
      {/* Matrix cells */}
      {[5, 4, 3, 2, 1].map((lik, ri) =>
        [1, 2, 3, 4, 5].map((con, ci) => {
          const score = lik * con;
          const inExtreme = score >= 20;
          const inHigh = score >= 15 && score < 20;
          const inModerate = score >= 9 && score < 15;
          const fill = inExtreme ? ROSE : inHigh ? RED : inModerate ? AMBER : EMERALD;
          const opacity = inExtreme ? 0.4 : inHigh ? 0.3 : inModerate ? 0.2 : 0.1;
          const count = assessment.matrix.filter(r => r.likelihood === lik && r.consequence === con).length;
          return (
            <g key={`${lik}-${con}`}>
              <rect x={pad + cellSize * (ci)} y={pad + cellSize * (ri)}
                width={cellSize} height={cellSize} fill={fill} fillOpacity={opacity} stroke={GRID} strokeWidth={0.5} rx={2} />
              {count > 0 && (
                <text x={pad + cellSize * (ci + 0.5)} y={pad + cellSize * (ri + 0.5) + 3}
                  fill="#fff" fontSize={11} textAnchor="middle" fontFamily="monospace" fontWeight="bold">{count}</text>
              )}
            </g>
          );
        })
      )}
      {/* Axes labels */}
      <text x={W / 2} y={pad - 20} fill={SLATE} fontSize={9} textAnchor="middle" fontFamily="monospace" fontWeight="bold">Consequence →</text>
      <text x={pad - 30} y={H / 2} fill={SLATE} fontSize={9} textAnchor="middle" fontFamily="monospace" fontWeight="bold" transform={`rotate(-90, ${pad - 30}, ${H / 2})`}>Likelihood →</text>
      {/* Summary */}
      <text x={W - pad} y={pad + 5} fill={TEXT} fontSize={7} textAnchor="end" fontFamily="monospace">
        Pg: {(assessment.probabilityOfSuccess * 100).toFixed(0)}% · Band: {assessment.certaintyBand} · Score: {assessment.overallRiskScore.toFixed(1)}
      </text>
      {/* Top risks */}
      {assessment.topRisks.slice(0, 3).map((r, i) => (
        <text key={`tr-${i}`} x={W - pad} y={pad + 18 + i * 11} fill={r.riskLevel === 'extreme' ? ROSE : r.riskLevel === 'high' ? AMBER : TEXT}
          fontSize={7} textAnchor="end" fontFamily="monospace">
          {r.id}: {r.riskScore} ({r.riskLevel})
        </text>
      ))}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 9. DECISION TREE
// ═══════════════════════════════════════════════════════════════════════════════

export const DecisionTreeSVG: React.FC<{ fid: FIDResult }> = ({ fid }) => {
  const W = 450, H = 280, pad = 50;
  const { decisionTree, recommendation } = fid;
  const cx = W / 2;
  const nodeY = pad + 30;
  const childY = nodeY + 60;
  const terminalY = childY + 50;
  const dx = 130;

  const recColors: Record<string, string> = { drill: EMERALD, defer: AMBER, farmout: VIOLET, drop: RED };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      {/* Root decision node */}
      <rect x={cx - 55} y={nodeY - 12} width={110} height={24} fill={INDIGO} opacity={0.8} rx={4} />
      <text x={cx} y={nodeY + 3} fill="#fff" fontSize={8} textAnchor="middle" fontFamily="monospace" fontWeight="bold">DECISION GATE</text>

      {/* Connector lines */}
      <line x1={cx} y1={nodeY + 12} x2={cx - dx} y2={childY - 12} stroke={AXIS} strokeWidth={1} />
      <line x1={cx} y1={nodeY + 12} x2={cx} y2={childY - 12} stroke={AXIS} strokeWidth={1} />
      <line x1={cx} y1={nodeY + 12} x2={cx + dx} y2={childY - 12} stroke={AXIS} strokeWidth={1} />

      {/* Drill branch */}
      {decisionTree.children.find(c => c.id === 'drill') && (
        <>
          <rect x={cx - dx - 45} y={childY - 12} width={90} height={22} fill={EMERALD} fillOpacity={0.7} rx={4} />
          <text x={cx - dx} y={childY + 2} fill="#fff" fontSize={7} textAnchor="middle" fontFamily="monospace">Drill</text>
          <line x1={cx - dx} y1={childY + 10} x2={cx - dx - 30} y2={terminalY - 10} stroke={AXIS} strokeWidth={0.8} />
          <line x1={cx - dx} y1={childY + 10} x2={cx - dx + 30} y2={terminalY - 10} stroke={AXIS} strokeWidth={0.8} />
          <text x={cx - dx - 32} y={terminalY + 4} fill={EMERALD} fontSize={7} textAnchor="end" fontFamily="monospace">
            Success ({((decisionTree.children.find(c => c.id === 'drill')?.children[0]?.probability || 0) * 100).toFixed(0)}%)
          </text>
          <text x={cx - dx + 32} y={terminalY + 4} fill={ROSE} fontSize={7} textAnchor="start" fontFamily="monospace">
            Dry Hole
          </text>
        </>
      )}

      {/* Defer branch */}
      {decisionTree.children.find(c => c.id === 'defer') && (
        <>
          <rect x={cx - 45} y={childY - 12} width={90} height={22} fill={AMBER} fillOpacity={0.7} rx={4} />
          <text x={cx} y={childY + 2} fill="#fff" fontSize={7} textAnchor="middle" fontFamily="monospace">Defer</text>
          <text x={cx} y={terminalY + 4} fill={AMBER} fontSize={7} textAnchor="middle" fontFamily="monospace">
            ${fmtM(decisionTree.children.find(c => c.id === 'defer')?.npvUsd || 0)}
          </text>
        </>
      )}

      {/* Farmout branch */}
      {decisionTree.children.find(c => c.id === 'farmout') && (
        <>
          <rect x={cx + dx - 45} y={childY - 12} width={90} height={22} fill={VIOLET} fillOpacity={0.7} rx={4} />
          <text x={cx + dx} y={childY + 2} fill="#fff" fontSize={7} textAnchor="middle" fontFamily="monospace">Farm-out</text>
          <text x={cx + dx} y={terminalY + 4} fill={VIOLET} fontSize={7} textAnchor="middle" fontFamily="monospace">
            ${fmtM(decisionTree.children.find(c => c.id === 'farmout')?.npvUsd || 0)}
          </text>
        </>
      )}

      {/* Recommend box */}
      <rect x={W / 2 - 70} y={H - 40} width={140} height={26} fill={recColors[recommendation]} fillOpacity={0.3}
        stroke={recColors[recommendation]} strokeWidth={1.5} rx={6} />
      <text x={W / 2} y={H - 24} fill={recColors[recommendation]} fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        RECOMMEND: {recommendation.toUpperCase()}
      </text>
      <text x={W / 2} y={H - 10} fill={TEXT} fontSize={7} textAnchor="middle" fontFamily="monospace">
        EMV: ${fmtM(fid.emvUsd)} · IRR: {fid.irrPct.toFixed(0)}% · VoI: ${fmtM(fid.voIUsd)} · {fid.confidenceLevel}
      </text>
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 10. REGULATORY TIMELINE
// ═══════════════════════════════════════════════════════════════════════════════

export const RegulatoryTimelineSVG: React.FC<{ status: RegulatoryStatus }> = ({ status }) => {
  const W = 380, H = 160, pad = 40;
  const { permitsRequired, permitsObtained, permitTimelineDays, complianceScore } = status;
  const barW = (W - pad * 2) / Math.max(permitsRequired.length, 1) - 6;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      {/* Compliance gauge */}
      <circle cx={55} cy={H / 2 - 10} r={32} fill="none" stroke={GRID} strokeWidth={6} />
      <circle cx={55} cy={H / 2 - 10} r={32} fill="none"
        stroke={complianceScore >= 80 ? EMERALD : complianceScore >= 50 ? AMBER : RED} strokeWidth={6}
        strokeDasharray={`${complianceScore * 2.01} ${200 - complianceScore * 2.01}`}
        strokeDashoffset="50" transform={`rotate(-90, 55, ${H / 2 - 10})`} />
      <text x={55} y={H / 2 - 6} fill="#fff" fontSize={14} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {complianceScore.toFixed(0)}
      </text>
      <text x={55} y={H / 2 + 8} fill={TEXT} fontSize={7} textAnchor="middle" fontFamily="monospace">% Ready</text>

      {/* Permit bars */}
      {permitsRequired.map((p, i) => {
        const obtained = permitsObtained.includes(p);
        const y = pad + i * 22;
        return (
          <g key={p}>
            <rect x={105} y={y} width={barW} height={16} fill={obtained ? EMERALD : GRID}
              fillOpacity={obtained ? 0.7 : 1} rx={3} stroke={obtained ? EMERALD : AXIS} strokeWidth={0.5} />
            <text x={108} y={y + 11} fill={obtained ? '#fff' : TEXT} fontSize={7} fontFamily="monospace">
              {p} {obtained ? '✓' : '○'}
            </text>
          </g>
        );
      })}

      {/* Timeline text */}
      <text x={108} y={H - pad + 14} fill={TEXT} fontSize={7} fontFamily="monospace">
        Est. approval: {status.estimatedApprovalDate} ({permitTimelineDays.toFixed(0)} days) · {status.environmentalAssessment}
      </text>
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 11. STRATIGRAPHY COLUMN
// ═══════════════════════════════════════════════════════════════════════════════

export const StratigraphyColumnSVG: React.FC<{ prognosis: StratigraphyPrognosis }> = ({ prognosis }) => {
  const W = 220, H = 320, pad = 40;
  const { formationTops } = prognosis;
  const maxDepth = Math.max(...formationTops.map(f => f.depthTvdFt + f.thicknessFt), 10000);
  const sy = (d: number) => pad + scale(d, 0, maxDepth, 0, H - pad * 2);
  const lithColors: Record<string, string> = {
    shale: '#64748b', sandstone: '#f59e0b', limestone: '#22d3ee', dolomite: '#a855f7',
    salt: '#f43f5e', anhydrite: '#fbcfe8', siltstone: '#94a3b8', conglomerate: '#f97316',
    basalt: '#1e293b', coal: '#1c1917',
  };

  const getColor = (lith: string): string => {
    for (const [key, color] of Object.entries(lithColors)) {
      if (lith.toLowerCase().includes(key)) return color;
    }
    return SLATE;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ background: '#020617' }}>
      {/* Title */}
      <text x={W / 2} y={pad - 10} fill={SLATE} fontSize={9} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        Stratigraphy ({prognosis.prognosisConfidence * 100}% confidence)
      </text>
      {/* Column */}
      {formationTops.map((f, i) => {
        const topY = sy(f.depthTvdFt);
        const botY = sy(f.depthTvdFt + f.thicknessFt);
        const fillColor = getColor(f.lithology);
        return (
          <g key={f.name}>
            <rect x={W / 2 - 35} y={Math.min(topY, botY)} width={70}
              height={Math.max(Math.abs(botY - topY), 2)} fill={fillColor} fillOpacity={0.6}
              stroke={fillColor} strokeWidth={0.5} rx={1} />
            <text x={W / 2 + 40} y={topY + Math.abs(botY - topY) / 2 + 3} fill={TEXT} fontSize={7} fontFamily="monospace">
              {f.name}
            </text>
            <text x={W / 2 - 40} y={topY + 3} fill={TEXT} fontSize={6} textAnchor="end" fontFamily="monospace">
              {fmtM(f.depthTvdFt)}′
            </text>
            <text x={W / 2 - 40} y={topY + Math.abs(botY - topY) / 2 + 3} fill={TEXT} fontSize={6} textAnchor="end" fontFamily="monospace">
              {f.lithology}
            </text>
          </g>
        );
      })}
      {/* Depth ruler */}
      <line x1={W / 2 + 42} y1={pad} x2={W / 2 + 42} y2={H - pad} stroke={AXIS} strokeWidth={1} />
    </svg>
  );
};