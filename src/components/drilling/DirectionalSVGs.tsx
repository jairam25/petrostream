import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

// ── 3D Wellplan Wellpath ──
export function Wellpath3DSVG({
   tvd, md, doglegSeverity, inclination, azimuth, kickoffPoint
}: { tvd: number; md: number; doglegSeverity: number; inclination: number; azimuth: number; kickoffPoint: number }) {
   const w = 320, h = 340, ml = 55, mr = 15, mt = 30, mb = 30;
   const pw = w - ml - mr, ph = h - mt - mb;
   const maxTVD = tvd * 1.1;
   const lateral = md > tvd ? Math.sqrt(md * md - tvd * tvd) : 1000;
   const maxHDisp = lateral * 1.3;
   const toY = (d: number) => mt + (d / maxTVD) * ph;
   const toX = (d: number) => ml + (d / maxHDisp) * pw;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 500); return () => clearTimeout(t); }, []);

   const pts: { tvd: number; hdisp: number; inc: number }[] = [];
   const nSegments = 20;
   for (let i = 0; i <= nSegments; i++) {
      const frac = i / nSegments;
      const d = frac * md;
      let inc = 0, hdisp = 0, tvdSeg = d;
      if (d <= kickoffPoint) {
         tvdSeg = d;
         hdisp = 0;
         inc = 0;
      } else {
         const buildLen = d - kickoffPoint;
         const buildAngle = Math.min(inclination, (buildLen * doglegSeverity) / 100);
         inc = buildAngle;
         const rad = buildAngle * Math.PI / 180;
         const r = (100 * 180) / (doglegSeverity * Math.PI + 1e-6);
         tvdSeg = kickoffPoint + r * Math.sin(rad);
         hdisp = r * (1 - Math.cos(rad));
      }
      pts.push({ tvd: tvdSeg, hdisp, inc });
   }

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <defs>
            <linearGradient id="wellpathGrad" x1="0" y1="1" x2="0" y2="0">
               <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
               <stop offset="100%" stopColor="#22c55e" stopOpacity="0.9" />
            </linearGradient>
            <filter id="pathGlow"><feGaussianBlur stdDeviation="2" /></filter>
         </defs>
         <rect x={ml} y={mt} width={pw} height={ph} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {Array.from({ length: 5 }, (_, i) => {
            const y = mt + (i / 4) * ph;
            return <line key={i} x1={ml} y1={y} x2={ml + pw} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />;
         })}
         {Array.from({ length: 4 }, (_, i) => {
            const x = ml + ((i + 1) / 4) * pw;
            return <line key={i} x1={x} y1={mt} x2={x} y2={mt + ph} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />;
         })}
         <motion.polyline
            points={pts.map(p => `${toX(p.hdisp)},${toY(p.tvd)}`).join(" ")}
            fill="none" stroke="url(#wellpathGrad)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"
            filter="url(#pathGlow)"
            initial={{ pathLength: 0 }}
            animate={animated ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
         />
         <motion.circle cx={toX(0)} cy={toY(kickoffPoint)} r="5" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: "spring" }} />
         <line x1={ml} y1={mt} x2={w - mr} y2={mt} stroke="#475569" strokeWidth="1.5" />
         <text x={w - mr - 4} y={mt - 6} fill="#475569" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="end">RKB</text>
         <text x={ml + pw / 2} y={mt + ph + 16} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">HORIZONTAL DISP (ft)</text>
         <text x={ml + pw - 10} y={mt + 14} fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="end">KOP: {kickoffPoint.toFixed(0)}′</text>
         <text x={ml + pw - 10} y={mt + 26} fill="#22c55e" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="end">{inclination.toFixed(1)}° @ TD</text>
      </svg>
   );
}

// ── Dogleg Severity Gauge ──
export function DLSSpiderGaugeSVG({ currentDLS, maxDLS, buildRate, turnRate }: { currentDLS: number; maxDLS: number; buildRate: number; turnRate: number }) {
   const w = 240, h = 240, cx = 120, cy = 130, r = 95;
   const normalizedDLS = Math.min(1, currentDLS / (maxDLS || 1));
   const rad = r * normalizedDLS;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <defs>
            <radialGradient id="dlsGlow" cx="50%" cy="50%" r="50%">
               <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
               <stop offset="80%" stopColor="#f59e0b" stopOpacity="0.05" />
               <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
            </radialGradient>
         </defs>
         <rect width={w} height={h} fill="transparent" />
         {[0.25, 0.5, 0.75, 1].map(f => (
            <circle key={f} cx={cx} cy={cy} r={r * f} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,3" />
         ))}
         <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#1e293b" strokeWidth="1" />
         <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#1e293b" strokeWidth="1" />
         <motion.line
            animate={{ x1: cx, y1: cy, x2: cx + rad * Math.cos((turnRate * Math.PI) / 180), y2: cy + rad * Math.sin((-buildRate * Math.PI) / 180) }}
            initial={{ x1: cx, y1: cy, x2: cx + r * 0.1, y2: cy }}
            stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"
            transition={{ type: "spring", stiffness: 60, damping: 8 }} />
         <motion.circle cx={cx + rad * Math.cos((turnRate * Math.PI) / 180)} cy={cy + rad * Math.sin((-buildRate * Math.PI) / 180)} r="6"
            fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"
            initial={{ scale: 0 }} animate={animated ? { scale: 1 } : {}} transition={{ type: "spring" }} />
         <circle cx={cx} cy={cy} r="4" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
         <text x={cx} y={cy + 32} fill="#f59e0b" fontSize="16" fontFamily="monospace" fontWeight="black" textAnchor="middle">{currentDLS.toFixed(2)}</text>
         <text x={cx} y={cy + 47} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">°/100ft</text>
         <text x={cx - r + 12} y={cy + 16} fill="#475569" fontSize="7" fontFamily="monospace" fontWeight="bold">B: {buildRate.toFixed(1)}°</text>
         <text x={cx - r + 12} y={cy + 28} fill="#475569" fontSize="7" fontFamily="monospace" fontWeight="bold">T: {turnRate.toFixed(1)}°</text>
      </svg>
   );
}

// ── Survey Position Uncertainty Ellipse ──
export function SurveyUncertaintySVG({
   eouSemiMajor, eouSemiMinor, eouOrientation, closureDistance, closureAzimuth
}: { eouSemiMajor: number; eouSemiMinor: number; eouOrientation: number; closureDistance: number; closureAzimuth: number }) {
   const w = 280, h = 260, cx = 140, cy = 130;
   const maxRadius = Math.max(eouSemiMajor, closureDistance) * 1.4;
   const scale = w * 0.35 / maxRadius;
   const toX = (x: number) => cx + x * scale;
   const toY = (y: number) => cy - y * scale;

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <defs>
            <filter id="blurGlow"> <feGaussianBlur stdDeviation="3" /> </filter>
         </defs>
         <rect x={10} y={20} width={w - 20} height={h - 40} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {[1, 2, 3].map(i => (
            <circle key={i} cx={cx} cy={cy} r={i * 30} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,4" />
         ))}
         <line x1={cx - 110} y1={cy} x2={cx + 110} y2={cy} stroke="#334155" strokeWidth="1" />
         <line x1={cx} y1={cy - 110} x2={cx} y2={cy + 110} stroke="#334155" strokeWidth="1" />
         <motion.ellipse cx={cx} cy={cy} rx={eouSemiMajor * scale} ry={eouSemiMinor * scale}
            fill="#f59e0b10" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,2"
            transform={`rotate(${-eouOrientation},${cx},${cy})`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 80 }} />
         <motion.line
            animate={{ x1: cx, y1: cy, x2: toX(closureDistance * Math.cos((closureAzimuth - 90) * Math.PI / 180)), y2: toY(closureDistance * Math.sin((closureAzimuth - 90) * Math.PI / 180)) }}
            initial={{ x1: cx, y1: cy, x2: cx, y2: cy }}
            stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"
            transition={{ type: "spring", stiffness: 60 }} />
         <circle cx={cx} cy={cy} r="5" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
         <text x={cx} y={cy + 112} fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle" textDecoration="underline">
            EOUE {eouSemiMajor.toFixed(1)}×{eouSemiMinor.toFixed(1)} ft
         </text>
         <text x={cx} y={25} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle" textDecoration="underline">
            UNCERTAINTY ELLIPSE
         </text>
      </svg>
   );
}

// ── Trajectory 3D Visualization ──
export function TrajectorySVG({ tvd, md, vs, ns, ew }: { tvd: number; md: number; vs: number; ns: number; ew: number }) {
   const w = 320, h = 300, cx = 160, cy = 150, r = 120;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);

   const maxN = Math.max(Math.abs(ns), Math.abs(ew), 500) * 1.2;
   const scaleN = (v: number) => cx + (v / maxN) * r;
   const scaleE = (v: number) => cy - (v / maxN) * r;

   const steps = 40;
   const pts: [number, number][] = [];
   for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const d = f * md;
      let t = d;
      let n = 0, e = 0;
      if (d > md * 0.3) {
         const buildF = (d - md * 0.3) / (md * 0.7);
         n = ns * Math.sin(buildF * Math.PI / 2);
         e = ew * Math.sin(buildF * Math.PI / 2);
      }
      pts.push([n, e]);
   }

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <defs>
            <linearGradient id="trajGrad" x1="0" y1="1" x2="1" y2="0">
               <stop offset="0%" stopColor="#3b82f6" />
               <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
         </defs>
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {[0.25, 0.5, 0.75, 1].map(f => (
            <circle key={f} cx={cx} cy={cy} r={r * f} fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,3" />
         ))}
         <line x1={cx - r - 10} y1={cy} x2={cx + r + 10} y2={cy} stroke="#334155" strokeWidth="0.5" />
         <line x1={cx} y1={cy - r - 10} x2={cx} y2={cy + r + 10} stroke="#334155" strokeWidth="0.5" />
         <motion.polyline
            points={pts.map(([n, e]) => `${scaleN(n)},${scaleE(e)}`).join(" ")}
            fill="none" stroke="url(#trajGrad)" strokeWidth="2.5" strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={animated ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
         />
         <motion.circle cx={scaleN(pts[pts.length - 1][0])} cy={scaleE(pts[pts.length - 1][1])} r="5"
            fill="#22c55e" stroke="#22c55e" strokeWidth="1"
            initial={{ scale: 0 }} animate={animated ? { scale: 1 } : {}} transition={{ delay: 2, type: "spring" }} />
         <text x={cx + r + 8} y={cy + 16} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold">N: {ns.toFixed(0)}ft</text>
         <text x={cx + r + 8} y={cy + 28} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold">E: {ew.toFixed(0)}ft</text>
         <text x={cx + r + 8} y={cy + 40} fill="#3b82f6" fontSize="7" fontFamily="monospace" fontWeight="bold">MD: {md.toFixed(0)}ft</text>
      </svg>
   );
}

// ── Plan View (Bird's Eye) ──
export function PlanViewSVG({ ns, ew, closureAzimuth, closureDistance }: { ns: number; ew: number; closureAzimuth: number; closureDistance: number }) {
   const w = 280, h = 280, cx = 140, cy = 140, r = 115;
   const maxR = Math.max(Math.abs(ns), Math.abs(ew), closureDistance) * 1.2;
   const s = r / maxR;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);

   const angle = (closureAzimuth - 90) * Math.PI / 180;

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {[0.25, 0.5, 0.75, 1].map(f => (
            <circle key={f} cx={cx} cy={cy} r={r * f} fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,4" />
         ))}
         <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#334155" strokeWidth="0.5" />
         <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#334155" strokeWidth="0.5" />
         <text x={cx + 8} y={cy - r + 12} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold">N</text>
         <text x={cx + r - 12} y={cy + 4} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold">E</text>

         {/* Wellpath dots */}
         {Array.from({ length: 15 }, (_, i) => {
            const f = i / 14;
            const x = cx + ns * s * f;
            const y = cy - ew * s * f;
            return (
               <motion.circle key={i} cx={x} cy={y} r={i === 14 ? 4 : 2}
                  fill={i === 14 ? "#22c55e" : "#3b82f6"}
                  initial={{ opacity: 0 }} animate={animated ? { opacity: 1 } : {}} transition={{ delay: 0.1 * i }} />
            );
         })}
         {/* Closure vector */}
         <motion.line
            animate={{ x1: cx, y1: cy, x2: cx + closureDistance * s * Math.cos(angle), y2: cy - closureDistance * s * Math.sin(angle) }}
            initial={{ x1: cx, y1: cy, x2: cx, y2: cy }}
            stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,3"
            transition={{ type: "spring", stiffness: 50 }} />
         <motion.circle cx={cx + closureDistance * s * Math.cos(angle)} cy={cy - closureDistance * s * Math.sin(angle)} r="5"
            fill="#f59e0b" stroke="#f59e0b"
            initial={{ scale: 0 }} animate={animated ? { scale: 1 } : {}} transition={{ delay: 1, type: "spring" }} />
         <text x={cx} y={cy + r + 20} fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            Closure: {closureDistance.toFixed(0)}ft @ {closureAzimuth.toFixed(1)}°
         </text>
      </svg>
   );
}

// ── Vertical Section ──
export function VerticalSectionSVG({ tvd, md, vs, kickoffPoint }: { tvd: number; md: number; vs: number; kickoffPoint: number }) {
   const w = 300, h = 320, ml = 50, mr = 15, mt = 25, mb = 30;
   const pw = w - ml - mr, ph = h - mt - mb;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 500); return () => clearTimeout(t); }, []);
   const toY = (d: number) => mt + (d / (tvd * 1.15)) * ph;
   const toX = (d: number) => ml + (d / (vs * 1.3)) * pw;

   const pts: [number, number][] = [];
   for (let i = 0; i <= 25; i++) {
      const f = i / 25;
      const d = f * md;
      let disp = 0, depth = d;
      if (d > kickoffPoint) {
         const angle = Math.PI / 2 * Math.min(1, (d - kickoffPoint) / (md - kickoffPoint));
         disp = vs * Math.sin(angle);
      }
      pts.push([disp, Math.min(depth, tvd + 500)]);
   }

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect x={ml} y={mt} width={pw} height={ph} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {Array.from({ length: 6 }, (_, i) => {
            const y = mt + (i / 5) * ph;
            return <line key={i} x1={ml} y1={y} x2={ml + pw} y2={y} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,4" />;
         })}
         <motion.polyline
            points={pts.map(([x, y]) => `${toX(x)},${toY(y)}`).join(" ")}
            fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={animated ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
         />
         <motion.line x1={ml} y1={toY(kickoffPoint)} x2={ml + pw} y2={toY(kickoffPoint)}
            stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,3"
            initial={{ opacity: 0 }} animate={animated ? { opacity: 1 } : {}} transition={{ delay: 0.5 }} />
         <text x={ml - 4} y={toY(kickoffPoint) + 3} fill="#f59e0b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="end">KOP</text>
         <text x={ml + pw / 2} y={mt + ph + 16} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">VS (ft)</text>
      </svg>
   );
}

// ── Kickoff Method Diagram ──
export function KickoffMethodDiagram({ method }: { method: string }) {
   const w = 300, h = 280, ml = 60, mr = 10, mt = 30, mb = 25;
   const pw = w - ml - mr, ph = h - mt - mb;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);
   const toY = (d: number) => mt + (d / 10000) * ph;

   const methods = {
      whipstock: [["Whipstock Set", 2000, 0], ["Milled Window", 2100, 0], ["Build Section", 2500, 15], ["Tangent", 5000, 30]],
      jetting: [["Jet Spud", 1500, 0], ["Hydraulic Jetting", 1800, 8], ["Build", 3000, 25], ["Tangent", 5500, 35]],
      motor: [["KOP Motor", 3000, 0], ["Build Rate 3°/100ft", 4000, 30], ["Tangent Hold", 7000, 30]],
   };
   const steps = methods[method as keyof typeof methods] || methods.motor;

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect x={ml} y={mt} width={pw} height={ph} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {steps.map((step, i) => (
            <g key={i}>
               <motion.rect x={ml + 10} y={toY(step[1] as number) - 8} width={pw - 20} height="20" rx="4"
                  fill={i === 0 ? "#f59e0b20" : "#3b82f620"} stroke={i === 0 ? "#f59e0b50" : "#3b82f650"} strokeWidth="1"
                  initial={{ opacity: 0, x: ml - 20 }} animate={animated ? { opacity: 1, x: ml + 10 } : {}}
                  transition={{ delay: 0.2 * i, type: "spring" }} />
               <text x={ml + 18} y={toY(step[1] as number) + 4} fill="#e2e8f0" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  {step[0]} – {((step[1] as number) / 1000).toFixed(1)}K ft / {step[3] !== undefined ? `${step[3]}°` : `${step[2]}°`}
               </text>
            </g>
         ))}
         <text x={ml + pw / 2} y={mt - 10} fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="black" textAnchor="middle">
            {method.charAt(0).toUpperCase() + method.slice(1)} Kickoff
         </text>
      </svg>
   );
}

// ── Build Rate Chart ──
export function BuildRateChart({ buildRate, targetInc, md }: { buildRate: number; targetInc: number; md: number }) {
   const w = 300, h = 240, ml = 45, mr = 15, mt = 25, mb = 35;
   const pw = w - ml - mr, ph = h - mt - mb;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);
   const toX = (d: number) => ml + (d / md) * pw;
   const toY = (inc: number) => mt + ph - (inc / 90) * ph;

   const pts: [number, number][] = [];
   for (let i = 0; i <= 40; i++) {
      const dist = (i / 40) * md;
      const inc = Math.min(targetInc, (dist / 100) * buildRate);
      pts.push([dist, inc]);
   }

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect x={ml} y={mt} width={pw} height={ph} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {[25, 50, 75, 90].map(inc => (
            <line key={inc} x1={ml} y1={toY(inc)} x2={ml + pw} y2={toY(inc)} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,4" />
         ))}
         <motion.polyline
            points={pts.map(([x, y]) => `${toX(x)},${toY(y)}`).join(" ")}
            fill="none" stroke="#22c55e" strokeWidth="2.5"
            initial={{ pathLength: 0 }}
            animate={animated ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.8 }}
         />
         <motion.line x1={ml} y1={toY(targetInc)} x2={ml + pw} y2={toY(targetInc)}
            stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,3"
            initial={{ opacity: 0 }} animate={animated ? { opacity: 1 } : {}} transition={{ delay: 1.5 }} />
         <text x={ml + pw + 4} y={toY(targetInc) + 3} fill="#f59e0b" fontSize="7" fontFamily="monospace" fontWeight="bold">{targetInc.toFixed(1)}°</text>
         <text x={ml + pw / 2} y={mt + ph + 18} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">MD (ft)</text>
         <text x={ml + pw / 2} y={mt - 10} fill="#22c55e" fontSize="8" fontFamily="monospace" fontWeight="black" textAnchor="middle">Build Rate: {buildRate.toFixed(1)}°/100ft</text>
      </svg>
   );
}

// ── Motor Build Rate Diagram ──
export function MotorBuildRateDiagram({ bendAngle, toolFace, buildRate }: { bendAngle: number; toolFace: number; buildRate: number }) {
   const w = 260, h = 280;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);
   const cx = 130, cy = 150;

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {/* Motor housing */}
         <motion.rect x={cx - 15} y={60} width="30" height="60" rx="6" fill="#475569" stroke="#64748b" strokeWidth="1"
            initial={{ opacity: 0, height: 0 }} animate={animated ? { opacity: 1, height: 60 } : {}} transition={{ type: "spring" }} />
         {/* Bent sub */}
         <motion.g
            initial={{ rotate: 0 }} animate={animated ? { rotate: bendAngle } : {}}
            transition={{ type: "spring", stiffness: 40 }}
            style={{ transformOrigin: `${cx}px ${120}px` }}>
            <rect x={cx - 8} y="120" width="16" height="50" rx="4" fill="#f59e0b" stroke="#f59e0b80" strokeWidth="1" />
         </motion.g>
         {/* Toolface indicator */}
         <motion.circle cx={cx} cy={200} r="45" fill="none" stroke="#1e293b" strokeWidth="1" />
         <motion.line
            animate={{ x1: cx, y1: cy, x2: cx + 30 * Math.cos((toolFace - 90) * Math.PI / 180), y2: cy + 30 * Math.sin((toolFace - 90) * Math.PI / 180) }}
            stroke="#ef4444" strokeWidth="2" strokeLinecap="round"
            transition={{ type: "spring", stiffness: 50 }} />
         <circle cx={cx} cy={200} r="4" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
         <text x={cx} y={240} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">TF: {toolFace.toFixed(0)}°</text>
         <text x={cx} y={260} fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="black" textAnchor="middle">BR: {buildRate.toFixed(1)}°/100ft</text>
         <text x={cx} y={30} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">PDM Motor</text>
      </svg>
   );
}

// ── RSS Diagram ──
export function RSSDiagram({ type, buildRate, turnRate }: { type: string; buildRate: number; turnRate: number }) {
   const w = 280, h = 280, cx = 140, cy = 140;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);
   const isPBR = type === 'pbr' || type === 'push';

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {/* Wellbore cross section */}
         <circle cx={cx} cy={cy} r="85" fill="#0f172a" stroke="#334155" strokeWidth="2" />
         <circle cx={cx} cy={cy} r="70" fill="#0a0f1a" stroke="#1e293b" strokeWidth="1" strokeDasharray="2,3" />
         {/* Pad/Pistons */}
         {isPBR ? (
            <>
               {[0, 120, 240].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  return (
                     <motion.rect key={i}
                        x={cx + 65 * Math.cos(rad) - 6} y={cy + 65 * Math.sin(rad) - 4}
                        width="12" height="8" rx="2" fill="#ef4444"
                        initial={{ opacity: 0 }} animate={animated ? { opacity: 1 } : {}} transition={{ delay: 0.3 * i }} />
                  );
               })}
               <text x={cx} y={cy + 115} fill="#ef4444" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Push-the-Bit</text>
            </>
         ) : (
            <>
               <motion.circle cx={cx + 25} cy={cy} r="8" fill="#3b82f6" stroke="#3b82f680"
                  initial={{ scale: 0 }} animate={animated ? { scale: 1 } : {}} transition={{ type: "spring" }} />
               <text x={cx} y={cy + 115} fill="#3b82f6" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Point-the-Bit</text>
            </>
         )}
         <text x={cx} y={30} fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="black" textAnchor="middle">RSS Tool</text>
         <text x={cx} y={cy + 130} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            B: {buildRate.toFixed(1)}° / T: {turnRate.toFixed(1)}°
         </text>
      </svg>
   );
}

// ── RSS Force Diagram ──
export function RSSForceDiagram({ sideForce, padForce, type }: { sideForce: number; padForce: number; type: string }) {
   const w = 260, h = 280;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);
   const cx = 130, cy = 140, maxF = Math.max(sideForce, padForce, 5000) * 1.2;
   const barH = 120;
   const sBar = (sideForce / maxF) * barH;
   const pBar = (padForce / maxF) * barH;

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {/* Side force bar */}
         <rect x={20} y={cy + 20} width="40" height={barH} fill="#1e293b" rx="4" />
         <motion.rect x={20} y={cy + 20 + barH - sBar} width="40" height={sBar} fill="#3b82f6" rx="4"
            initial={{ height: 0, y: cy + 20 + barH }} animate={animated ? { height: sBar, y: cy + 20 + barH - sBar } : {}} transition={{ type: "spring" }} />
         <text x={40} y={cy + 20 + barH + 16} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Side</text>
         <text x={40} y={cy + 20 + barH + 28} fill="#3b82f6" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{sideForce.toFixed(0)} lbf</text>

         {/* Pad force bar */}
         <rect x={100} y={cy + 20} width="40" height={barH} fill="#1e293b" rx="4" />
         <motion.rect x={100} y={cy + 20 + barH - pBar} width="40" height={pBar} fill="#ef4444" rx="4"
            initial={{ height: 0, y: cy + 20 + barH }} animate={animated ? { height: pBar, y: cy + 20 + barH - pBar } : {}} transition={{ type: "spring", delay: 0.2 }} />
         <text x={120} y={cy + 20 + barH + 16} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Pad</text>
         <text x={120} y={cy + 20 + barH + 28} fill="#ef4444" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{padForce.toFixed(0)} lbf</text>

         <text x={cx} y={30} fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="black" textAnchor="middle">RSS Force Budget</text>
         <text x={cx} y={50} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{type}</text>
      </svg>
   );
}

// ── Bit Walk Diagram ──
export function BitWalkDiagram({ walkRate, inclination, formationDip }: { walkRate: number; inclination: number; formationDip: number }) {
   const w = 280, h = 240, cx = 140, cy = 120;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {/* Wellbore axis */}
         <motion.line x1={cx - 80} y1={cy + 60} x2={cx + 80} y2={cy - 60}
            stroke="#475569" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={animated ? { pathLength: 1 } : {}} transition={{ duration: 1 }} />
         {/* Bit face */}
         <motion.line x1={cx - 40} y1={cy + 30} x2={cx + 40} y2={cy - 30}
            stroke="#22c55e" strokeWidth="3"
            initial={{ opacity: 0 }} animate={animated ? { opacity: 1 } : {}} transition={{ delay: 0.5 }} />
         {/* Walk direction arrows */}
         <motion.g
            initial={{ x: 0, y: 0 }} animate={animated ? { x: walkRate * 2 } : {}}
            transition={{ type: "spring", stiffness: 30 }}>
            <polygon points={`${cx + 50},${cy - 50} ${cx + 65},${cy - 58} ${cx + 55},${cy - 42}`} fill="#f59e0b" />
            <line x1={cx + 40} y1={cy - 48} x2={cx + 55} y2={cy - 50} stroke="#f59e0b" strokeWidth="2" />
         </motion.g>
         {/* Formation dip indicator */}
         <motion.line x1={cx - 70} y1={cy - 40} x2={cx + 70} y2={cy - 70}
            stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3"
            initial={{ opacity: 0 }} animate={animated ? { opacity: 1 } : {}} transition={{ delay: 1 }} />
         <text x={cx + 74} y={cy - 72} fill="#ef4444" fontSize="7" fontFamily="monospace" fontWeight="bold">Dip: {formationDip}°</text>
         <text x={cx} y={38} fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="black" textAnchor="middle">Bit Walk</text>
         <text x={cx} y={65} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{walkRate > 0 ? `Right Walk: +${walkRate.toFixed(2)}°/100ft` : `Left Walk: ${walkRate.toFixed(2)}°/100ft`}</text>
      </svg>
   );
}

// ── Toolface Gauge ──
export function ToolfaceGauge({ toolface, toolfaceMode, reactiveTorque }: { toolface: number; toolfaceMode: string; reactiveTorque: number }) {
   const w = 240, h = 240, cx = 120, cy = 130, r = 85;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);
   const angle = (toolface - 90) * Math.PI / 180;

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <defs>
            <linearGradient id="tfGauge">
               <stop offset="0%" stopColor="#22c55e" />
               <stop offset="50%" stopColor="#f59e0b" />
               <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
         </defs>
         <rect width={w} height={h} fill="transparent" />
         {/* Gauge arc */}
         <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="8"
            initial={{ pathLength: 0 }} animate={animated ? { pathLength: 1 } : {}} transition={{ duration: 1 }}
            strokeDasharray={`${Math.PI * r * 0.75} ${Math.PI * r * 0.25}`} strokeDashoffset={Math.PI * r * 0.375}
            transform={`rotate(-135,${cx},${cy})`} />
         {/* Ticks */}
         {Array.from({ length: 13 }, (_, i) => {
            const a = (i * 30 - 90) * Math.PI / 180;
            return (
               <line key={i}
                  x1={cx + (r - 10) * Math.cos(a)} y1={cy + (r - 10) * Math.sin(a)}
                  x2={cx + (r + 5) * Math.cos(a)} y2={cy + (r + 5) * Math.sin(a)}
                  stroke="#475569" strokeWidth="1" />
            );
         })}
         {/* Needle */}
         <motion.line
            animate={{ x1: cx, y1: cy, x2: cx + (r - 15) * Math.cos(angle), y2: cy + (r - 15) * Math.sin(angle) }}
            stroke="#ef4444" strokeWidth="3" strokeLinecap="round"
            transition={{ type: "spring", stiffness: 60 }} />
         <circle cx={cx} cy={cy} r="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
         <text x={cx} y={cy + 40} fill="#f59e0b" fontSize="16" fontFamily="monospace" fontWeight="black" textAnchor="middle">{toolface.toFixed(0)}°</text>
         <text x={cx} y={cy + 55} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{toolfaceMode}</text>
         <text x={cx} y={cy + 68} fill="#475569" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">RT: {reactiveTorque.toFixed(0)} ft·lbf</text>
      </svg>
   );
}

// ── Gravity Toolface ──
export function GravityToolface({ inc, tf }: { inc: number; tf: number }) {
   const w = 240, h = 280, cx = 120, cy = 140;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);
   const angle = tf * Math.PI / 180;

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         <circle cx={cx} cy={cy} r="80" fill="#0f172a" stroke="#334155" strokeWidth="2" />
         {/* High side marker */}
         <motion.circle cx={cx} cy={cy - 70} r="4" fill="#22c55e"
            initial={{ scale: 0 }} animate={animated ? { scale: 1 } : {}} transition={{ type: "spring" }} />
         <text x={cx} y={cy - 78} fill="#22c55e" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">High Side</text>
         {/* Low side */}
         <circle cx={cx} cy={cy + 70} r="3" fill="#ef4444" />
         <text x={cx} y={cy + 84} fill="#ef4444" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Low Side</text>
         {/* Toolface arrow */}
         <motion.line
            animate={{ x1: cx, y1: cy, x2: cx + 50 * Math.sin(angle), y2: cy - 50 * Math.cos(angle) }}
            stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"
            transition={{ type: "spring", stiffness: 50 }} />
         <motion.circle cx={cx + 50 * Math.sin(angle)} cy={cy - 50 * Math.cos(angle)} r="5"
            fill="#f59e0b"
            initial={{ scale: 0 }} animate={animated ? { scale: 1 } : {}} transition={{ delay: 0.8, type: "spring" }} />
         <text x={cx} y={cy + 105} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Gravity TF: {tf.toFixed(0)}°</text>
         <text x={cx} y={25} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Gravity Toolface (Gz)</text>
      </svg>
   );
}

// ── Magnetic Toolface ──
export function MagneticToolface({ azm, tf }: { azm: number; tf: number }) {
   const w = 240, h = 280, cx = 120, cy = 140;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);
   const angle = tf * Math.PI / 180;

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         <circle cx={cx} cy={cy} r="80" fill="#0f172a" stroke="#334155" strokeWidth="2" />
         {/* N-E-S-W */}
         <text x={cx} y={cy - 72} fill="#ef4444" fontSize="8" fontFamily="monospace" fontWeight="black" textAnchor="middle">N</text>
         <text x={cx + 78} y={cy + 4} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">E</text>
         <text x={cx} y={cy + 80} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">S</text>
         <text x={cx - 80} y={cy + 4} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">W</text>
         {/* Toolface arrow */}
         <motion.line
            animate={{ x1: cx, y1: cy, x2: cx + 50 * Math.sin(angle), y2: cy - 50 * Math.cos(angle) }}
            stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"
            transition={{ type: "spring", stiffness: 50 }} />
         <motion.circle cx={cx + 50 * Math.sin(angle)} cy={cy - 50 * Math.cos(angle)} r="5"
            fill="#3b82f6"
            initial={{ scale: 0 }} animate={animated ? { scale: 1 } : {}} transition={{ delay: 0.8, type: "spring" }} />
         <text x={cx} y={cy + 105} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Mag TF: {tf.toFixed(0)}°</text>
         <text x={cx} y={cy + 120} fill="#475569" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Azm: {azm.toFixed(1)}°</text>
         <text x={cx} y={25} fill="#3b82f6" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Magnetic Toolface (Bx,By)</text>
      </svg>
   );
}

// ── Pump Pressure Toolface Diagram ──
export function PumpPressureToolfaceDiagram({ pumpPressure, toolface }: { pumpPressure: number; toolface: number }) {
   const w = 280, h = 240, ml = 45, mr = 15, mt = 30, mb = 30;
   const pw = w - ml - mr, ph = h - mt - mb;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);
   const toX = (d: number) => ml + (d / 360) * pw;
   const toY = (p: number) => mt + ph - (p / (pumpPressure * 1.3)) * ph;

   const pts: [number, number][] = [];
   for (let i = 0; i <= 20; i++) {
      const tf = (i / 20) * 360;
      const p = pumpPressure * (0.85 + 0.15 * Math.abs(Math.sin(tf * Math.PI / 180 - toolface * Math.PI / 180)));
      pts.push([tf, p]);
   }

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect x={ml} y={mt} width={pw} height={ph} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {[0, 90, 180, 270, 360].map(d => (
            <line key={d} x1={toX(d)} y1={mt} x2={toX(d)} y2={mt + ph} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,3" />
         ))}
         <motion.polyline
            points={pts.map(([x, y]) => `${toX(x)},${toY(y)}`).join(" ")}
            fill="none" stroke="#06b6d4" strokeWidth="2.5"
            initial={{ pathLength: 0 }}
            animate={animated ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 1.5 }}
         />
         <motion.line x1={toX(toolface)} y1={mt} x2={toX(toolface)} y2={mt + ph}
            stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3"
            initial={{ opacity: 0 }} animate={animated ? { opacity: 1 } : {}} transition={{ delay: 1 }} />
         <text x={toX(toolface)} y={mt - 10} fill="#f59e0b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">TF: {toolface}°</text>
         <text x={ml + pw / 2} y={mt + ph + 16} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Toolface (°)</text>
         <text x={ml - 4} y={mt + 8} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="end">P (psi)</text>
      </svg>
   );
}

// ── Magnetic Declination Map ──
export function MagneticDeclinationMap({ declination, lat, lon }: { declination: number; lat: number; lon: number }) {
   const w = 280, h = 240, cx = 140, cy = 120;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {/* Grid lines */}
         {Array.from({ length: 5 }, (_, i) => {
            const x = cx + (i - 2) * 35;
            return <line key={`v${i}`} x1={x} y1={cy - 70} x2={x} y2={cy + 70} stroke="#1e293b" strokeWidth="0.5" />;
         })}
         {Array.from({ length: 5 }, (_, i) => {
            const y = cy + (i - 2) * 35;
            return <line key={`h${i}`} x1={cx - 70} y1={y} x2={cx + 70} y2={y} stroke="#1e293b" strokeWidth="0.5" />;
         })}
         {/* True North */}
         <motion.line x1={cx} y1={cy} x2={cx} y2={cy - 55} stroke="#ef4444" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={animated ? { pathLength: 1 } : {}} transition={{ duration: 0.8 }} />
         <text x={cx} y={cy - 60} fill="#ef4444" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">TN</text>
         {/* Magnetic North */}
         <motion.line
            animate={{ x1: cx, y1: cy, x2: cx + 55 * Math.sin(declination * Math.PI / 180), y2: cy - 55 * Math.cos(declination * Math.PI / 180) }}
            stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,3"
            transition={{ type: "spring", stiffness: 50 }} />
         <text x={cx + 55 * Math.sin(declination * Math.PI / 180) + 6} y={cy - 55 * Math.cos(declination * Math.PI / 180)} fill="#3b82f6" fontSize="7" fontFamily="monospace" fontWeight="bold">MN</text>
         {/* Declination arc */}
         <motion.path d={`M ${cx + 25 * Math.sin(0)} ${cy - 25 * Math.cos(0)} A 25 25 0 0 0 ${cx + 25 * Math.sin(declination * Math.PI / 180)} ${cy - 25 * Math.cos(declination * Math.PI / 180)}`}
            fill="none" stroke="#f59e0b" strokeWidth="1.5"
            initial={{ pathLength: 0 }} animate={animated ? { pathLength: 1 } : {}} transition={{ duration: 1 }} />
         <text x={cx + 35} y={cy - 18} fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="black">{declination.toFixed(1)}°</text>
         <text x={cx} y={cy + 85} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Declination @ {lat.toFixed(1)}°, {lon.toFixed(1)}°</text>
      </svg>
   );
}

// ── Axial Interference Diagram ──
export function AxialInterferenceDiagram({ azm, inc, interference }: { azm: number; inc: number; interference: number }) {
   const w = 280, h = 260, cx = 140, cy = 130;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);

   // Simulated axial magnetic field components
   const bx = 35000 * Math.cos(inc * Math.PI / 180) * Math.cos(azm * Math.PI / 180) + interference;
   const by = 35000 * Math.cos(inc * Math.PI / 180) * Math.sin(azm * Math.PI / 180);
   const bz = 35000 * Math.sin(inc * Math.PI / 180);
   const btotal = Math.sqrt(bx * bx + by * by + bz * bz);
   const maxB = 50000 + Math.abs(interference);

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {/* Bar chart for B components */}
         {[{ label: 'Bx', val: Math.abs(bx), color: '#ef4444' },
         { label: 'By', val: Math.abs(by), color: '#22c55e' },
         { label: 'Bz', val: Math.abs(bz), color: '#3b82f6' },
         { label: 'Btot', val: btotal, color: '#f59e0b' }].map((item, i) => {
            const barW = (item.val / maxB) * 200;
            return (
               <g key={i}>
                  <text x={15} y={50 + i * 45} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold">{item.label}</text>
                  <motion.rect x={45} y={42 + i * 45} width={barW} height="14" rx="3" fill={item.color}
                     initial={{ width: 0 }} animate={animated ? { width: barW } : {}} transition={{ type: "spring", delay: 0.1 * i }} />
                  <text x={45 + barW + 4} y={54 + i * 45} fill={item.color} fontSize="7" fontFamily="monospace" fontWeight="bold">
                     {(item.val / 1000).toFixed(1)}k nT
                  </text>
               </g>
            );
         })}
         <text x={cx} y={30} fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="black" textAnchor="middle">Axial Mag Interference</text>
         <text x={cx} y={235} fill="#ef4444" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            Interference: {interference.toFixed(0)} nT
         </text>
      </svg>
   );
}

// ── IFR Diagram ──
export function IFRDiagram({ ifr1, ifr2, separation }: { ifr1: number; ifr2: number; separation: number }) {
   const w = 280, h = 240, cx = 140, cy = 120;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {/* IFR 1 */}
         <motion.circle cx={cx - 40} cy={cy} r={ifr1 * 2} fill="none" stroke="#3b82f6" strokeWidth="2"
            initial={{ r: 0, opacity: 0 }} animate={animated ? { r: ifr1 * 2, opacity: 1 } : {}} transition={{ type: "spring" }} />
         <text x={cx - 40} y={cy + 10 + ifr1 * 2} fill="#3b82f6" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">IFR1: {ifr1.toFixed(1)}ft</text>
         {/* IFR 2 */}
         <motion.circle cx={cx + 40} cy={cy} r={ifr2 * 2} fill="none" stroke="#22c55e" strokeWidth="2"
            initial={{ r: 0, opacity: 0 }} animate={animated ? { r: ifr2 * 2, opacity: 1 } : {}} transition={{ type: "spring", delay: 0.2 }} />
         <text x={cx + 40} y={cy + 10 + ifr2 * 2} fill="#22c55e" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">IFR2: {ifr2.toFixed(1)}ft</text>
         {/* Separation */}
         <motion.line x1={cx - 40 + ifr1 * 2} y1={cy} x2={cx + 40 - ifr2 * 2} y2={cy}
            stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,3"
            initial={{ pathLength: 0 }} animate={animated ? { pathLength: 1 } : {}} transition={{ duration: 1 }} />
         <text x={cx} y={cy - 20} fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="black" textAnchor="middle">Sep: {separation.toFixed(1)}ft</text>
         <text x={cx} y={25} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Isolation Frequency Response</text>
      </svg>
   );
}

// ── Gyro Drift Chart ──
export function GyroDriftChart({ driftRate, time, totalDrift, qualityFactor }: { driftRate: number; time: number; totalDrift: number; qualityFactor: number }) {
   const w = 300, h = 240, ml = 50, mr = 15, mt = 30, mb = 30;
   const pw = w - ml - mr, ph = h - mt - mb;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);
   const toX = (t: number) => ml + (t / time) * pw;
   const toY = (d: number) => mt + ph - (d / (totalDrift * 1.3)) * ph;

   const pts: [number, number][] = [];
   for (let i = 0; i <= 20; i++) {
      const t = (i / 20) * time;
      const d = driftRate * t / 60;
      pts.push([t, d]);
   }

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect x={ml} y={mt} width={pw} height={ph} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {[0.25, 0.5, 0.75, 1].map(f => (
            <line key={f} x1={ml} y1={mt + ph * (1 - f)} x2={ml + pw} y2={mt + ph * (1 - f)} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,3" />
         ))}
         <motion.polyline
            points={pts.map(([x, y]) => `${toX(x)},${toY(y)}`).join(" ")}
            fill="none" stroke="#ef4444" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={animated ? { pathLength: 1 } : {}} transition={{ duration: 2 }} />
         <text x={ml + pw / 2} y={mt + ph + 16} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Time (min)</text>
         <text x={ml + pw / 2} y={mt - 12} fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="black" textAnchor="middle">
            Drift: {driftRate.toFixed(2)}°/hr | QF: {qualityFactor.toFixed(1)}
         </text>
      </svg>
   );
}

// ── MFM Comparison Chart ──
export function MFMComparisonChart({ mwdInc, mwdAzm, gyroInc, gyroAzm }: { mwdInc: number; mwdAzm: number; gyroInc: number; gyroAzm: number }) {
   const w = 280, h = 260, ml = 60, mr = 15, mt = 30, mb = 25;
   const pw = w - ml - mr, ph = h - mt - mb;

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {/* MWC circle */}
         <circle cx={100} cy={100} r="60" fill="none" stroke="#3b82f6" strokeWidth="2" />
         <text x={100} y={90} fill="#3b82f6" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">MWD</text>
         <text x={100} y={110} fill="#3b82f6" fontSize="10" fontFamily="monospace" fontWeight="black" textAnchor="middle">Inc: {mwdInc.toFixed(1)}°</text>
         <text x={100} y={125} fill="#3b82f6" fontSize="10" fontFamily="monospace" fontWeight="black" textAnchor="middle">Az: {mwdAzm.toFixed(1)}°</text>
         {/* Gyro circle */}
         <circle cx={180} cy={180} r="60" fill="none" stroke="#22c55e" strokeWidth="2" />
         <text x={180} y={170} fill="#22c55e" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Gyro</text>
         <text x={180} y={190} fill="#22c55e" fontSize="10" fontFamily="monospace" fontWeight="black" textAnchor="middle">Inc: {gyroInc.toFixed(1)}°</text>
         <text x={180} y={205} fill="#22c55e" fontSize="10" fontFamily="monospace" fontWeight="black" textAnchor="middle">Az: {gyroAzm.toFixed(1)}°</text>
         {/* Delta indicator */}
         <motion.line x1={160} y1={100} x2={180} y2={180} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} />
         <text x={w / 2} y={25} fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="black" textAnchor="middle">ΔInc: {(Math.abs(mwdInc - gyroInc)).toFixed(2)}° | ΔAz: {(Math.abs(mwdAzm - gyroAzm)).toFixed(2)}°</text>
      </svg>
   );
}

// ── Ellipse of Uncertainty SVG ──
export function EllipseOfUncertaintySVG({ semiMajor, semiMinor, orientation }: { semiMajor: number; semiMinor: number; orientation: number }) {
   const w = 280, h = 260, cx = 140, cy = 130;
   const scale = Math.min(100, w * 0.35) / Math.max(semiMajor, semiMinor, 1);

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <defs>
            <filter id="eouGlow"><feGaussianBlur stdDeviation="2" /></filter>
         </defs>
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         <line x1={cx - 110} y1={cy} x2={cx + 110} y2={cy} stroke="#1e293b" strokeWidth="1" />
         <line x1={cx} y1={cy - 100} x2={cx} y2={cy + 100} stroke="#1e293b" strokeWidth="1" />
         <motion.ellipse cx={cx} cy={cy} rx={semiMajor * scale} ry={semiMinor * scale}
            fill="#f59e0b10" stroke="#f59e0b" strokeWidth="2"
            transform={`rotate(${-orientation},${cx},${cy})`}
            filter="url(#eouGlow)"
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 80 }} />
         <circle cx={cx} cy={cy} r="4" fill="#ef4444" />
         <text x={cx} y={cy - 110} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Elipse of Uncertainty</text>
         <text x={cx} y={cy + 108} fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{semiMajor.toFixed(1)}×{semiMinor.toFixed(1)} ft</text>
      </svg>
   );
}

// ── ISCWSA Error Spider ──
export function ISCWSAErrorSpider({ iscwsaValues }: { iscwsaValues: { sx: number; sy: number; sz: number; sInc: number; sAzm: number; sMD: number } }) {
   const w = 260, h = 260, cx = 130, cy = 140, r = 80;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);
   const maxVal = Math.max(iscwsaValues.sx, iscwsaValues.sy, iscwsaValues.sz, iscwsaValues.sInc, iscwsaValues.sAzm, iscwsaValues.sMD, 1);
   const labels = ['Sx', 'Sy', 'Sz', 'δInc', 'δAzm', 'δMD'];
   const vals = [iscwsaValues.sx, iscwsaValues.sy, iscwsaValues.sz, iscwsaValues.sInc, iscwsaValues.sAzm, iscwsaValues.sMD];
   const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

   const pts = vals.map((v, i) => {
      const angle = (i / vals.length) * 2 * Math.PI - Math.PI / 2;
      const dist = (v / maxVal) * r;
      return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle), label: labels[i], val: v, color: colors[i], angle };
   });

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {/* Grid */}
         {[0.25, 0.5, 0.75, 1].map(f => (
            <circle key={f} cx={cx} cy={cy} r={r * f} fill="none" stroke="#1e293b" strokeWidth="0.5" />
         ))}
         {/* Spider web axes */}
         {vals.map((_, i) => {
            const angle = (i / vals.length) * 2 * Math.PI - Math.PI / 2;
            return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="#1e293b" strokeWidth="0.5" />;
         })}
         {/* Polygon */}
         <motion.polygon
            points={pts.map(p => `${p.x},${p.y}`).join(" ")}
            fill="#f59e0b10" stroke="#f59e0b" strokeWidth="1.5"
            initial={{ scale: 0 }} animate={animated ? { scale: 1 } : {}} transition={{ type: "spring" }}
         />
         {/* Points */}
         {pts.map((p, i) => (
            <motion.circle key={i} cx={p.x} cy={p.y} r="4" fill={p.color}
               initial={{ scale: 0 }} animate={animated ? { scale: 1 } : {}} transition={{ delay: 0.1 * i, type: "spring" }} />
         ))}
         {/* Labels */}
         {pts.map((p, i) => (
            <text key={`l${i}`} x={cx + (r + 20) * Math.cos(p.angle)} y={cy + (r + 20) * Math.sin(p.angle) + 3}
               fill={p.color} fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{p.label}</text>
         ))}
         <text x={cx} y={cy + 115} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">ISCWSA Error Budget</text>
      </svg>
   );
}

// ── Error Ellipse 3D ──
export function ErrorEllipse3D({ sx, sy, sz }: { sx: number; sy: number; sz: number }) {
   const w = 280, h = 260, cx = 140, cy = 135;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);
   const maxS = Math.max(sx, sy, sz, 1) * 1.3;
   const scale = 80 / maxS;

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {/* Isometric axes */}
         <line x1={cx - 80} y1={cy + 46} x2={cx + 80} y2={cy - 46} stroke="#334155" strokeWidth="0.5" />
         <line x1={cx} y1={cy - 90} x2={cx} y2={cy + 90} stroke="#334155" strokeWidth="0.5" />
         <line x1={cx - 80} y1={cy - 46} x2={cx + 80} y2={cy + 46} stroke="#334155" strokeWidth="0.5" />
         {/* Ellipsoid representation */}
         <motion.ellipse cx={cx} cy={cy} rx={sx * scale * 0.87} ry={sz * scale * 0.5}
            fill="#3b82f620" stroke="#3b82f6" strokeWidth="1.5"
            initial={{ scale: 0 }} animate={animated ? { scale: 1 } : {}} transition={{ type: "spring", stiffness: 60 }} />
         <motion.ellipse cx={cx} cy={cy} rx={sy * scale * 0.87} ry={sz * scale * 0.5}
            fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="3,2"
            transform={`rotate(60,${cx},${cy})`}
            initial={{ opacity: 0 }} animate={animated ? { opacity: 1 } : {}} transition={{ delay: 0.3 }} />
         <text x={cx} y={30} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">3D Error Ellipsoid</text>
         <text x={cx - 85} y={cy + 100} fill="#3b82f6" fontSize="7" fontFamily="monospace" fontWeight="bold">sx: {sx.toFixed(1)}</text>
         <text x={cx} y={cy + 115} fill="#22c55e" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">sy: {sy.toFixed(1)}</text>
         <text x={cx + 60} y={cy + 100} fill="#ef4444" fontSize="7" fontFamily="monospace" fontWeight="bold">sz: {sz.toFixed(1)}</text>
      </svg>
   );
}

// ── Uncertainty Cone Diagram ──
export function UncertaintyConeDiagram({ tvd, eouAtTD, coneAngle }: { tvd: number; eouAtTD: number; coneAngle: number }) {
   const w = 280, h = 300, ml = 55, mr = 15, mt = 25, mb = 30;
   const pw = w - ml - mr, ph = h - mt - mb;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);
   const toY = (d: number) => mt + (d / (tvd * 1.1)) * ph;
   const toX = (d: number) => ml + (0.5 + (d / (eouAtTD * 2 || 1))) * pw;

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect x={ml} y={mt} width={pw} height={ph} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {[0.25, 0.5, 0.75].map(f => (
            <line key={f} x1={ml} y1={mt + ph * f} x2={ml + pw} y2={mt + ph * f} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,3" />
         ))}
         {/* Cone lines */}
         <motion.line x1={ml + pw / 2} y1={mt} x2={ml + pw / 2 - eouAtTD * 0.5 / (tvd * 1.1) * ph * 0.3} y2={toY(tvd)}
            stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,3"
            initial={{ pathLength: 0 }} animate={animated ? { pathLength: 1 } : {}} transition={{ duration: 1.5 }} />
         <motion.line x1={ml + pw / 2} y1={mt} x2={ml + pw / 2 + eouAtTD * 0.5 / (tvd * 1.1) * ph * 0.3} y2={toY(tvd)}
            stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,3"
            initial={{ pathLength: 0 }} animate={animated ? { pathLength: 1 } : {}} transition={{ duration: 1.5 }} />
         {/* Centerline */}
         <line x1={ml + pw / 2} y1={mt} x2={ml + pw / 2} y2={toY(tvd)} stroke="#3b82f6" strokeWidth="2" />
         {/* EOU at TD */}
         <motion.line x1={ml + pw / 2 - eouAtTD * 0.3} y1={toY(tvd)} x2={ml + pw / 2 + eouAtTD * 0.3} y2={toY(tvd)}
            stroke="#ef4444" strokeWidth="2"
            initial={{ pathLength: 0 }} animate={animated ? { pathLength: 1 } : {}} transition={{ delay: 1 }} />
         <text x={ml + pw / 2 + eouAtTD * 0.35} y={toY(tvd) + 4} fill="#ef4444" fontSize="7" fontFamily="monospace" fontWeight="bold">{eouAtTD.toFixed(1)}ft</text>
         <text x={ml + pw / 2} y={mt - 10} fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="black" textAnchor="middle">Cone: {coneAngle.toFixed(2)}°</text>
      </svg>
   );
}

// ── Anti-Collision Diagram ──
export function AntiCollisionDiagram({ sepFactor, minSep, offsetWellDistance }: { sepFactor: number; minSep: number; offsetWellDistance: number }) {
   const w = 280, h = 260, cx = 140, cy = 130;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);
   const maxR = offsetWellDistance * 1.3;
   const scale = 90 / maxR;

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {[0.33, 0.66, 1].map(f => (
            <circle key={f} cx={cx} cy={cy} r={maxR * scale * f} fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,3" />
         ))}
         {/* Reference well */}
         <circle cx={cx} cy={cy} r={8} fill="#3b82f6" stroke="#3b82f6" strokeWidth="1" />
         <text x={cx} y={cy - 16} fill="#3b82f6" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Ref Well</text>
         {/* Offset well */}
         <motion.circle cx={cx + offsetWellDistance * scale} cy={cy + 30} r="6"
            fill={sepFactor < 1.5 ? "#ef4444" : "#22c55e"} stroke={sepFactor < 1.5 ? "#ef4444" : "#22c55e"} strokeWidth="1"
            initial={{ scale: 0 }} animate={animated ? { scale: 1 } : {}} transition={{ type: "spring" }} />
         <text x={cx + offsetWellDistance * scale + 12} y={cy + 34} fill={sepFactor < 1.5 ? "#ef4444" : "#22c55e"} fontSize="7" fontFamily="monospace" fontWeight="bold">Offset</text>
         {/* Separation ring */}
         <motion.circle cx={cx} cy={cy} r={minSep * scale} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,2"
            initial={{ r: 0 }} animate={animated ? { r: minSep * scale } : {}} transition={{ type: "spring", stiffness: 60 }} />
         <text x={cx} y={cy + 115} fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="black" textAnchor="middle">SF: {sepFactor.toFixed(2)}</text>
         <text x={cx} y={25} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Anti-Collision Analysis</text>
      </svg>
   );
}

// ── Separation Factor Gauge ──
export function SeparationFactorGauge({ sf, threshold }: { sf: number; threshold: number }) {
   const w = 220, h = 220, cx = 110, cy = 115, r = 80;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);
   const angle = Math.min(180, (sf / (threshold * 2)) * 180);
   const rad = (angle - 90) * Math.PI / 180;
   const color = sf < 1.0 ? "#ef4444" : sf < threshold ? "#f59e0b" : "#22c55e";

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="transparent" />
         {/* Gauge arc */}
         <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#1e293b" strokeWidth="10" />
         {/* Colored sectors */}
         <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(60 * Math.PI / 180)} ${cy - r * Math.sin(60 * Math.PI / 180)}`} fill="none" stroke="#22c55e30" strokeWidth="10" />
         <path d={`M ${cx + r * Math.cos(60 * Math.PI / 180)} ${cy - r * Math.sin(60 * Math.PI / 180)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(30 * Math.PI / 180)} ${cy - r * Math.sin(30 * Math.PI / 180)}`} fill="none" stroke="#f59e0b30" strokeWidth="10" />
         <path d={`M ${cx + r * Math.cos(30 * Math.PI / 180)} ${cy - r * Math.sin(30 * Math.PI / 180)} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#ef444430" strokeWidth="10" />
         {/* Needle */}
         <motion.line
            animate={{ x1: cx, y1: cy, x2: cx + (r - 12) * Math.cos(rad), y2: cy - (r - 12) * Math.sin(rad) }}
            stroke={color} strokeWidth="3" strokeLinecap="round"
            transition={{ type: "spring", stiffness: 60 }} />
         <circle cx={cx} cy={cy} r="6" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
         <text x={cx} y={cy + 30} fill={color} fontSize="20" fontFamily="monospace" fontWeight="black" textAnchor="middle">{sf.toFixed(2)}</text>
         <text x={cx} y={cy + 45} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">SF (min: {threshold.toFixed(1)})</text>
      </svg>
   );
}

// ── Collision Risk Matrix ──
export function CollisionRiskMatrix({ prob, severity }: { prob: number; severity: number }) {
   const w = 260, h = 260, margin = 35, sz = 55;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);
   const riskColors = [
      ['#22c55e', '#22c55e', '#84cc16', '#eab308', '#f59e0b'],
      ['#22c55e', '#84cc16', '#eab308', '#f59e0b', '#ef4444'],
      ['#84cc16', '#eab308', '#f59e0b', '#ef4444', '#ef4444'],
      ['#eab308', '#f59e0b', '#ef4444', '#ef4444', '#dc2626'],
      ['#f59e0b', '#ef4444', '#ef4444', '#dc2626', '#dc2626'],
   ];

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {Array.from({ length: 5 }, (_, r) =>
            Array.from({ length: 5 }, (_, c) => (
               <g key={`${r}-${c}`}>
                  <motion.rect x={margin + c * sz} y={margin + r * sz} width={sz - 2} height={sz - 2} rx="4"
                     fill={riskColors[r][c] + (r === severity - 1 && c === prob - 1 ? '' : '30')}
                     stroke={r === severity - 1 && c === prob - 1 ? '#fff' : riskColors[r][c] + '50'}
                     strokeWidth={r === severity - 1 && c === prob - 1 ? 2 : 0.5}
                     initial={{ opacity: 0 }} animate={animated ? { opacity: 1 } : {}} transition={{ delay: 0.02 * (r * 5 + c) }} />
               </g>
            ))
         )}
         <text x={margin + sz * 2.5} y={margin - 10} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Probability →</text>
         <text x={margin - 18} y={margin + sz * 2.5} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle"
            transform={`rotate(-90,${margin - 18},${margin + sz * 2.5})`}>Severity →</text>
         <text x={w / 2} y={h - 10} fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="black" textAnchor="middle">Risk: P{prob}×S{severity}</text>
      </svg>
   );
}

// ── Traveling Cylinder Diagram ──
export function TravelingCylinderDiagram({ radius, length, offsetDistance }: { radius: number; length: number; offsetDistance: number }) {
   const w = 280, h = 260, cx = 140, cy = 130;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);
   const scaleR = 50 / (radius || 1);
   const scaleL = 100 / (length || 1000);

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {/* Cylinder body (isometric) */}
         <motion.ellipse cx={cx} cy={cy - 30} rx={radius * scaleR * 0.7} ry={radius * scaleR * 0.3}
            fill="#3b82f620" stroke="#3b82f6" strokeWidth="1.5"
            initial={{ opacity: 0 }} animate={animated ? { opacity: 1 } : {}} transition={{ duration: 0.8 }} />
         <motion.rect x={cx - radius * scaleR * 0.7} y={cy - 30} width={radius * scaleR * 1.4} height={length * scaleL} rx="2"
            fill="#3b82f610" stroke="#3b82f6" strokeWidth="1"
            initial={{ height: 0, opacity: 0 }} animate={animated ? { height: length * scaleL, opacity: 1 } : {}} transition={{ duration: 1 }} />
         <motion.ellipse cx={cx} cy={cy - 30 + length * scaleL} rx={radius * scaleR * 0.7} ry={radius * scaleR * 0.3}
            fill="#3b82f610" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3,2"
            initial={{ opacity: 0 }} animate={animated ? { opacity: 1 } : {}} transition={{ delay: 1 }} />
         {/* Offset marker */}
         <motion.line x1={cx} y1={cy + 60} x2={cx + offsetDistance * 2} y2={cy + 60}
            stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,3"
            initial={{ pathLength: 0 }} animate={animated ? { pathLength: 1 } : {}} transition={{ duration: 1 }} />
         <text x={cx + offsetDistance * 1} y={cy + 55} fill="#f59e0b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            {offsetDistance.toFixed(1)}ft
         </text>
         <text x={cx} y={25} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Traveling Cylinder</text>
         <text x={cx} y={cy + 90} fill="#3b82f6" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">R: {radius.toFixed(1)}ft | L: {length.toFixed(0)}ft</text>
      </svg>
   );
}

// ── Directional Cost Breakdown ──
export function DirectionalCostBreakdown({ costs }: { costs: { label: string; value: number; color: string }[] }) {
   const w = 280, h = 260, cx = 140, cy = 140, r = 85;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);
   const total = costs.reduce((s, c) => s + c.value, 0) || 1;

   let cumAngle = -Math.PI / 2;
   const arcs = costs.map(c => {
      const sliceAngle = (c.value / total) * 2 * Math.PI;
      const start = cumAngle;
      cumAngle += sliceAngle;
      const end = cumAngle;
      return { ...c, start, end, mid: (start + end) / 2 };
   });

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="transparent" />
         {arcs.map((arc, i) => {
            const x1 = cx + r * Math.cos(arc.start);
            const y1 = cy + r * Math.sin(arc.start);
            const x2 = cx + r * Math.cos(arc.end);
            const y2 = cy + r * Math.sin(arc.end);
            const largeArc = arc.end - arc.start > Math.PI ? 1 : 0;
            const lmx = cx + r * 0.65 * Math.cos(arc.mid);
            const lmy = cy + r * 0.65 * Math.sin(arc.mid);

            return (
               <g key={i}>
                  <motion.path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${cx} ${cy} Z`}
                     fill={arc.color} opacity="0"
                     initial={{ opacity: 0, scale: 0.8 }} animate={animated ? { opacity: 1, scale: 1 } : {}}
                     transition={{ delay: 0.15 * i, type: "spring" }}
                  />
                  <text x={lmx} y={lmy} fill="#fff" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                     {arc.label}
                  </text>
                  <text x={lmx} y={lmy + 11} fill="#ccc" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                     {(arc.value / total * 100).toFixed(0)}%
                  </text>
               </g>
            );
         })}
         <text x={cx} y={cy + r + 20} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Cost Breakdown</text>
      </svg>
   );
}

// ── Papers Timeline Chart ──
export function PapersTimelineChart({ papers }: { papers: { title: string; year?: number; authors: string; speNumber?: string }[] }) {
   const w = 600, h = 200, ml = 55, mr = 15, mt = 30, mb = 30;
   const pw = w - ml - mr, ph = h - mt - mb;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);

   const years = papers.map(p => p.year || 2010);
   const minY = Math.min(...years) - 1;
   const maxY = Math.max(...years) + 1;
   const toX = (y: number) => ml + ((y - minY) / (maxY - minY)) * pw;
   const toY = (i: number, n: number) => mt + 20 + ((i + 0.5) / n) * (ph - 40);

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="transparent" />
         {/* Timeline axis */}
         <line x1={ml} y1={mt + ph} x2={ml + pw} y2={mt + ph} stroke="#334155" strokeWidth="1.5" />
         {Array.from({ length: maxY - minY + 1 }, (_, i) => {
            const yr = minY + i;
            const x = toX(yr);
            return (
               <g key={yr}>
                  <line x1={x} y1={mt + ph - 5} x2={x} y2={mt + ph + 5} stroke="#475569" strokeWidth="1" />
                  <text x={x} y={mt + ph + 16} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{yr}</text>
               </g>
            );
         })}
         {papers.map((p, i) => {
            const cx = toX(p.year || 2010);
            const cy = (i + 0.5) * (ph - 40) / papers.length + mt + 20;
            return (
               <g key={i}>
                  <motion.line x1={cx} y1={mt + ph} x2={cx} y2={cy}
                     stroke="#f59e0b30" strokeWidth="1" strokeDasharray="2,3"
                     initial={{ pathLength: 0 }} animate={animated ? { pathLength: 1 } : {}} transition={{ delay: 0.1 * i }} />
                  <motion.circle cx={cx} cy={cy} r="5" fill="#3b82f620" stroke="#3b82f6" strokeWidth="1.5"
                     initial={{ scale: 0 }} animate={animated ? { scale: 1 } : {}} transition={{ delay: 0.1 * i, type: "spring" }} />
                  <text x={cx + 8} y={cy + 3} fill="#e2e8f0" fontSize="7" fontFamily="monospace" fontWeight="bold" className="truncate">
                     {p.authors.split(',')[0]}
                  </text>
               </g>
            );
         })}
      </svg>
   );
}

// ── DLS Profile ──
export function DLSProfile({ md, dlsValues }: { md: number; dlsValues: { depth: number; dls: number }[] }) {
   const w = 300, h = 240, ml = 50, mr = 15, mt = 25, mb = 30;
   const pw = w - ml - mr, ph = h - mt - mb;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);
   const maxDLS = Math.max(...dlsValues.map(d => d.dls), 5);
   const toX = (d: number) => ml + (d / maxDLS) * pw;
   const toY = (dep: number) => mt + (dep / md) * ph;

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect x={ml} y={mt} width={pw} height={ph} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {[0.25, 0.5, 0.75, 1].map(f => (
            <line key={f} x1={ml} y1={mt + f * ph} x2={ml + pw} y2={mt + f * ph} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,3" />
         ))}
         <motion.polyline
            points={dlsValues.map((d, i) => `${toX(d.dls)},${toY(d.depth)}`).join(" ")}
            fill="#f59e0b10" stroke="#f59e0b" strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }} animate={animated ? { pathLength: 1, opacity: 1 } : {}} transition={{ duration: 2 }} />
         {dlsValues.map((d, i) => (
            <motion.circle key={i} cx={toX(d.dls)} cy={toY(d.depth)} r="3" fill="#f59e0b"
               initial={{ scale: 0 }} animate={animated ? { scale: 1 } : {}} transition={{ delay: 1 + 0.05 * i }} />
         ))}
         <text x={ml + pw / 2} y={mt + ph + 16} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">DLS (°/100ft)</text>
         <text x={ml + pw / 2} y={mt - 10} fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="black" textAnchor="middle">Dogleg Severity Profile</text>
      </svg>
   );
}

// ── Slide/Rotate Gantt Chart ──
export function SlideRotateGanttChart({ segments }: { segments: { label: string; startMD: number; endMD: number; type: 'slide' | 'rotate' }[] }) {
   const w = 320, h = 200, ml = 55, mr = 15, mt = 30, mb = 30;
   const pw = w - ml - mr, ph = h - mt - mb;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);
   const maxMD = Math.max(...segments.map(s => s.endMD), 10000);
   const toX = (d: number) => ml + (d / maxMD) * pw;

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect width={w} height={h} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {segments.map((seg, i) => (
            <g key={i}>
               <motion.rect x={toX(seg.startMD)} y={mt + (i % 4) * (ph / 4) + 4}
                  width={Math.max(5, toX(seg.endMD) - toX(seg.startMD))} height={Math.floor(ph / 4) - 8} rx="3"
                  fill={seg.type === 'slide' ? '#ef444460' : '#22c55e60'}
                  stroke={seg.type === 'slide' ? '#ef4444' : '#22c55e'} strokeWidth="1"
                  initial={{ width: 0, opacity: 0 }} animate={animated ? { width: Math.max(5, toX(seg.endMD) - toX(seg.startMD)), opacity: 1 } : {}}
                  transition={{ delay: 0.2 * i, type: "spring" }} />
               <text x={toX(seg.startMD) + 4} y={mt + (i % 4) * (ph / 4) + Math.floor(ph / 4) / 2 + 3}
                  fill="#e2e8f0" fontSize="7" fontFamily="monospace" fontWeight="bold">{seg.label}</text>
            </g>
         ))}
         <text x={ml + pw / 2} y={mt + ph + 16} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">MD (ft)</text>
      </svg>
   );
}

// ── RSS Comparison Chart ──
export function RSSComparisonChart({ tools }: { tools: { name: string; buildRate: number; turnRate: number; reliability: number; cost: number }[] }) {
   const w = 300, h = 260, ml = 80, mr = 15, mt = 30, mb = 25;
   const pw = w - ml - mr, ph = h - mt - mb;
   const [animated, setAnimated] = useState(false);
   useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);
   const maxBR = Math.max(...tools.map(t => t.buildRate), 15);
   const barH = Math.min(30, ph / (tools.length * 1.5));

   return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
         <rect x={ml} y={mt} width={pw} height={ph} fill="#05070a" rx="8" stroke="#1e293b" strokeWidth="1" />
         {tools.map((t, i) => {
            const y = mt + i * (ph / tools.length) + 10;
            return (
               <g key={i}>
                  <text x={ml - 6} y={y + barH / 2 + 4} fill="#e2e8f0" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="end">{t.name}</text>
                  <motion.rect x={ml + 2} y={y} width={(t.buildRate / maxBR) * pw * 0.7} height={barH} rx="3"
                     fill="#3b82f680" stroke="#3b82f6" strokeWidth="1"
                     initial={{ width: 0 }} animate={animated ? { width: (t.buildRate / maxBR) * pw * 0.7 } : {}} transition={{ delay: 0.15 * i, type: "spring" }} />
                  <text x={ml + 4 + (t.buildRate / maxBR) * pw * 0.7} y={y + barH / 2 + 4} fill="#3b82f6" fontSize="7" fontFamily="monospace" fontWeight="bold">
                     BR: {t.buildRate.toFixed(1)}°
                  </text>
               </g>
            );
         })}
         <text x={ml + pw / 2} y={mt + ph + 12} fill="#64748b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Build Rate Comparison (°/100ft)</text>
         <text x={ml + pw / 2} y={mt - 12} fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="black" textAnchor="middle">RSS Tool Comparison</text>
      </svg>
   );
}