import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Activity,
  ExternalLink,
  Search,
  Layers,
  Zap,
  Radio,
  Box,
  Calculator,
  Shield,
  BarChart3,
  PieChart,
  Library,
  Waves,
  Filter,
  Compass,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Map,
  Thermometer,
  Droplet,
  Clock,
  Eye,
  ArrowUpRight,
  BookOpen,
  Globe,
  Crosshair,
  Mountain,
  Ruler,
  Gauge,
  Signal,
  XCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import {
  calculateAcousticImpedance,
  calculateReflectionCoefficient,
  calculateNMO,
  calculateDixVelocity,
  calculateVerticalResolution,
  calculateFresnelZone,
  generateRickerWavelet,
  calculateFreeAirCorrection,
  calculateBouguerSlabCorrection,
  estimateSourceDepth,
  estimateBasementDepthMagnetic,
  calculateTheoreticalGravity,
  calculateBouguerAnomaly,
  calculateSkinDepth,
  compareSurveyCosts
} from '../../lib/geophysics';
import {
  LITHOLOGY_DATABASE,
  MATURITY_WINDOWS,
  classifyKerogen,
  getMaturityInfo
} from '../../lib/geology';
import {
  calculatePg,
  runVolumetricSimulation,
  getPercentiles,
  RiskFactors,
  VolumetricInputs
} from '../../lib/prospect';
import { ACADEMIC_LIBRARY } from '../../lib/references';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { InputWithSlider, DataRow, SectionHeader } from '../SharedUI';
import {
  GLOBAL_BASIN_DATABASE,
  PETROLEUM_SYSTEM_CHECKLIST,
  FLUID_CLASSIFICATION,
  SEISMIC_ACQUISITION_DESIGN,
  VELOCITY_MODEL_REFERENCE
} from '../../lib/exploration_data';

import { FormationDatabaseTab } from './FormationDatabaseTab';
import { ProspectNeuralSimulator } from './ProspectNeuralSimulator';

// ─── Well Planning Imports ───
import {
  WellLocation,
  FaultBoundary,
  SurfaceConstraint,
  OptimalLocationResult,
  TrajectoryDesign,
  WellTrajectoryType,
  StratigraphyPrognosis,
  FormationTop,
  PorePressureProfile,
  PorePressureResult,
  CasingProgram,
  CasingString,
  MudWeightSchedule,
  WirelineLog,
  LoggingProgram,
  CoringInterval,
  FluidSamplePoint,
  AFEBreakdownItem,
  AFEResult,
  RiskItem,
  RiskAssessment,
  DecisionTreeNode,
  FIDResult,
  RegulatoryStatus,
  calculateOptimalCrestalPosition,
  assessFaultProximityRisk,
  evaluateSurfaceConstraints,
  designExplorationTrajectory,
  prognoseFormationTops,
  estimatePorePressureEaton,
  calculateFractureGradientMatthewsKelly,
  buildPorePressureProfile,
  designCasingProgram,
  calculateMudWeightSchedule,
  designLoggingProgram,
  designCoringProgram,
  estimateAFE,
  assessExplorationRisk,
  calculateDecisionTree,
  assessRegulatoryReadiness,
} from '../../lib/well_planning';
import {
  CrestalPositionMap,
  TrajectoryProfile,
  PorePressureChart,
  CasingSchematic,
  LoggingProgramSVG,
  CoringSamplingSVG,
  AFECostBreakdownSVG,
  RiskMatrixSVG,
  DecisionTreeSVG,
  RegulatoryTimelineSVG,
  StratigraphyColumnSVG,
} from './WellPlanningSVGs';

// ─── Animated number counter hook ───
function useAnimatedValue(target: number, duration: number = 600) {
  const [displayed, setDisplayed] = useState(target);
  React.useEffect(() => {
    const start = performance.now();
    const from = displayed;
    const animate = (t: number) => {
      const elapsed = t - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out
      setDisplayed(from + (target - from) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target]);
  return displayed;
}

function AnimatedValue({ value, unit, precision = 1, className }: { value: number; unit?: string; precision?: number; className?: string }) {
  const animated = useAnimatedValue(value);
  return (
    <span className={cn("data-mono font-bold tabular-nums", className)}>
      {animated.toFixed(precision)}{unit ? ` ${unit}` : ''}
    </span>
  );
}

function CalcCard({ icon: Icon, label, value, unit, precision = 1, formula, color = 'brand-primary', children }: {
  icon: any;
  label: string;
  value: number;
  unit?: string;
  precision?: number;
  formula?: string;
  color?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-app-bg border border-border-subtle rounded-lg p-3 hover:border-brand-primary/30 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded-md", `bg-${color}/10 text-${color}`)}>
          <Icon size={13} />
        </div>
        <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <AnimatedValue value={value} unit={unit} precision={precision} className="text-lg text-text-primary" />
      </div>
      {formula && (
        <p className="text-[9px] text-text-tertiary font-mono italic truncate">{formula}</p>
      )}
      {children}
    </motion.div>
  );
}

// ─── Stereonet / Rose Diagram Simple SVG Component ───
function StereonetRose({ data, deformity }: { data: { strike: number; dip: number }[]; deformity: number }) {
  const cx = 140, cy = 140, r = 110;
  const bins = Array.from({ length: 12 }, (_, i) => {
    const start = i * 30;
    const count = data.filter(d => {
      const s = ((d.strike % 360) + 360) % 360;
      return s >= start && s < start + 30;
    }).length;
    return { angle: start + 15, count: Math.max(count, 0.3), start, end: start + 30 };
  });
  const maxCount = Math.max(...bins.map(b => b.count), 1);

  return (
    <svg viewBox="0 0 280 280" className="w-full h-full">
      {/* Outer circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r * 0.67} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="3 3" />
      <circle cx={cx} cy={cy} r={r * 0.33} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="3 3" />
      {/* Cardinal lines */}
      {[0, 90, 180, 270].map(a => (
        <line key={a} x1={cx} y1={cy} x2={cx + r * 0.95 * Math.cos(a * Math.PI / 180)} y2={cy + r * 0.95 * Math.sin(a * Math.PI / 180)} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      ))}
      {/* Rose petals */}
      {bins.map((bin, i) => {
        const midRad = (bin.angle) * Math.PI / 180;
        const len = (bin.count / maxCount) * r * 0.85 * (0.7 + 0.3 * deformity);
        const colors = ['#f59e0b', '#f97316', '#ef4444', '#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#84cc16', '#eab308', '#f59e0b'];
        return (
          <motion.line
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            x1={cx} y1={cy}
            x2={cx + len * Math.sin(midRad)} y2={cy - len * Math.cos(midRad)}
            stroke={colors[i]}
            strokeWidth={6 + (bin.count / maxCount) * 10}
            strokeLinecap="round"
            opacity={0.8}
          />
        );
      })}
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={4} fill="#f59e0b" />
      {/* Labels */}
      <text x={cx} y={cy - r - 10} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">N</text>
      <text x={cx + r + 12} y={cy + 4} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">E</text>
      <text x={cx} y={cy + r + 16} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">S</text>
      <text x={cx - r - 12} y={cy + 4} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">W</text>
    </svg>
  );
}

function RickerWaveletSVG({ waveletData, width = 300, height = 80 }: { waveletData: { t: number; amplitude: number }[]; width?: number; height?: number }) {
  if (!waveletData.length) return null;
  const minT = waveletData[0].t, maxT = waveletData[waveletData.length - 1].t;
  const maxAmp = Math.max(...waveletData.map(w => Math.abs(w.amplitude)), 0.01);
  const points = waveletData.map(w => {
    const x = ((w.t - minT) / (maxT - minT)) * width;
    const y = height / 2 - (w.amplitude / maxAmp) * (height / 2 - 4);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxWidth: width }}>
      <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <motion.polyline
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        points={points}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2"
      />
    </svg>
  );
}

// ─── Kerogen Van Krevelen Plot ───
function VanKrevelenPlot({ hi, oi, kerogenType }: { hi: number; oi: number; kerogenType: string }) {
  const cx = 150, cy = 150;
  const scaleX = (v: number) => 30 + (v / 200) * 240;
  const scaleY = (v: number) => 270 - (v / 1000) * 240;
  const px = scaleX(Math.min(oi, 200));
  const py = scaleY(Math.min(hi, 1000));

  // Type boundaries: simplified trapezoids
  const typeILine = "M30,30 L180,30 L270,90 L270,270";
  const typeIILine = "M30,150 L180,60 L270,170 L270,270";
  const typeIIILine = "M30,270 L180,270 L270,270";

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      {/* Background zones */}
      <rect x={30} y={30} width={240} height={240} fill="rgba(99,102,241,0.04)" rx="4" />
      {/* Axis */}
      <line x1={30} y1={270} x2={270} y2={270} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <line x1={30} y1={30} x2={30} y2={270} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {/* Labels */}
      <text x={150} y={290} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">Oxygen Index (OI)</text>
      <text x={15} y={150} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" transform="rotate(-90,15,150)">Hydrogen Index (HI)</text>
      {/* Zone labels */}
      <text x={90} y={70} fill="rgba(34,197,94,0.4)" fontSize="10" fontWeight="bold">Type I</text>
      <text x={120} y={130} fill="rgba(250,204,21,0.4)" fontSize="10" fontWeight="bold">Type II</text>
      <text x={180} y={210} fill="rgba(239,68,68,0.4)" fontSize="10" fontWeight="bold">Type III</text>
      {/* Point */}
      <motion.circle
        initial={{ r: 0 }}
        animate={{ r: 6 }}
        transition={{ type: "spring", stiffness: 300 }}
        cx={px} cy={py} r={6}
        fill="#6366f1"
        stroke="white"
        strokeWidth="2"
      />
      <motion.text
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        x={px + 10} y={py - 10}
        fill="white" fontSize="10" fontWeight="bold"
      >{kerogenType}</motion.text>
    </svg>
  );
}

// ─── Burial History Curve ───
function BurialHistoryCurve({ events }: { events: { age: number; depth: number; event: string }[] }) {
  const sorted = [...events].sort((a, b) => b.age - a.age);
  const maxAge = Math.max(...sorted.map(e => e.age), 1);
  const maxDepth = Math.max(...sorted.map(e => e.depth), 100);
  const w = 300, h = 200, padL = 45, padR = 10, padT = 15, padB = 30;
  const scalex = (v: number) => padL + ((maxAge - v) / maxAge) * (w - padL - padR);
  const scaley = (v: number) => padT + (v / maxDepth) * (h - padT - padB);
  const pts = sorted.map((e, i) => `${scalex(e.age)},${scaley(e.depth)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {/* Axes */}
      <line x1={padL} y1={padT} x2={padL} y2={h - padB} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <text x={w / 2} y={h - 5} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8">Age (Ma)</text>
      <text x={10} y={h / 2} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" transform={`rotate(-90,10,${h / 2})`}>Depth (m)</text>
      {/* Fill area */}
      <motion.polygon
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 0.5 }}
        points={`${padL},${h - padB} ${pts} ${w - padR},${h - padB}`}
        fill="#6366f1"
      />
      {/* Curve */}
      <motion.polyline
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        points={pts}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.5"
      />
      {/* Points */}
      {sorted.map((e, i) => (
        <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.1 }}>
          <circle cx={scalex(e.age)} cy={scaley(e.depth)} r="3" fill="#f59e0b" />
          <text x={scalex(e.age) + 5} y={scaley(e.depth) - 5} fill="rgba(255,255,255,0.6)" fontSize="7">{e.event}</text>
        </motion.g>
      ))}
    </svg>
  );
}

// ─── Monte Carlo Histogram ───
function MonteCarloHistogram({ results }: { results: number[] }) {
  const bins = 20;
  const min = Math.min(...results), max = Math.max(...results);
  const binWidth = (max - min) / bins;
  const histogram = Array.from({ length: bins }, (_, i) => {
    const low = min + i * binWidth;
    const high = low + binWidth;
    return { bin: (low + high) / 2, count: results.filter(v => v >= low && v < high).length };
  });
  const maxCount = Math.max(...histogram.map(h => h.count), 1);

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer>
        <BarChart data={histogram}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="bin" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.3)' }} tickFormatter={v => v.toFixed(0)} />
          <RechartTooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {histogram.map((_, i) => (
              <Cell key={i} fill={i > bins * 0.8 ? '#22c55e' : i < bins * 0.2 ? '#ef4444' : '#6366f1'} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Survey Cost Comparison Chart ───
function SurveyCostChart({ areaSqKm, location }: { areaSqKm: number; location: 'onshore' | 'offshore' }) {
  const costs = useMemo(() => compareSurveyCosts(areaSqKm, location as any), [areaSqKm, location]);
  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer>
        <BarChart data={costs} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis type="number" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.3)' }} tickFormatter={v => `$${(v / 1e6).toFixed(1)}M`} />
          <YAxis dataKey="surveyType" type="category" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} width={90} />
          <RechartTooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
          <Bar dataKey="costLowUSD" fill="#6366f1" fillOpacity={0.5} radius={[0, 3, 3, 0]} stackId="cost" />
          <Bar dataKey="costHighUSD" fill="#6366f1" fillOpacity={0.3} radius={[0, 3, 3, 0]} stackId="cost" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Risk Tornado Chart ───
function RiskTornado({ factors }: { factors: RiskFactors }) {
  const entries = [
    { name: 'Source', value: factors.source },
    { name: 'Reservoir', value: factors.reservoir },
    { name: 'Trap', value: factors.trap },
    { name: 'Seal', value: factors.seal },
    { name: 'Migration', value: factors.migration },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-2">
      {entries.map((e, i) => (
        <motion.div
          key={e.name}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: i * 0.08, duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <span className="text-[10px] text-text-tertiary w-16 shrink-0 uppercase">{e.name}</span>
          <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${e.value * 100}%` }}
              transition={{ delay: i * 0.08 + 0.2, duration: 0.6, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                e.value >= 0.8 ? "bg-emerald-500/80" : e.value >= 0.6 ? "bg-amber-500/80" : "bg-red-500/80"
              )}
            />
          </div>
          <span className="text-[11px] text-text-primary font-mono w-10 text-right">{Math.round(e.value * 100)}%</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Surface Compass Visualization ───
function CompassRose({ strike, dip }: { strike: number; dip: number }) {
  const cx = 120, cy = 120, r = 100;
  const strikeRad = (strike - 90) * Math.PI / 180;
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r * 0.7} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="3 3" />
      {/* Tick marks */}
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i * 10) * Math.PI / 180;
        const inner = r * (i % 3 === 0 ? 0.85 : 0.92);
        return (
          <line key={i} x1={cx + inner * Math.cos(a)} y1={cy + inner * Math.sin(a)} x2={cx + r * 0.96 * Math.cos(a)} y2={cy + r * 0.96 * Math.sin(a)} stroke="rgba(255,255,255,0.2)" strokeWidth={i % 3 === 0 ? 1.2 : 0.5} />
        );
      })}
      {/* Strike line */}
      <motion.line
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8 }}
        x1={cx - r * 0.8 * Math.cos(strikeRad)} y1={cy - r * 0.8 * Math.sin(strikeRad)}
        x2={cx + r * 0.8 * Math.cos(strikeRad)} y2={cy + r * 0.8 * Math.sin(strikeRad)}
        stroke="#f59e0b" strokeWidth="2.5"
      />
      {/* Dip arrow (perpendicular to strike, pointing downhill) */}
      <motion.line
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        x1={cx} y1={cy}
        x2={cx + r * 0.5 * Math.cos(strikeRad + Math.PI / 2)} y2={cy + r * 0.5 * Math.sin(strikeRad + Math.PI / 2)}
        stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowDip)"
      />
      <defs>
        <marker id="arrowDip" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#ef4444" />
        </marker>
      </defs>
      {/* N label */}
      <text x={cx + r * 0.8 * Math.cos(-Math.PI / 2)} y={cy + r * 0.8 * Math.sin(-Math.PI / 2) - 8} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="bold">N</text>
      <text x={cx} y={cy + 6} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="bold" fontFamily="monospace">{strike}°/{dip}°</text>
    </svg>
  );
}

export function ExplorationStage() {
  const [explorationSubTab, setExplorationSubTab] = useState<
    'seismic' | 'surface' | 'basin' | 'geophysics' | 'evaluation' | 'reference' | 'visualization' | 'formations' | 'well_planning'
  >('seismic');

  // Seismic State
  const [velocity, setVelocity] = useState(3250);
  const [twt, setTwt] = useState(4.5);
  const [elevation, setElevation] = useState(1500);
  const [picks, setPicks] = useState<{ well: string, depth: number, formation: string }[]>([]);
  const [seismicSurveyArea, setSeismicSurveyArea] = useState(150);
  const [seismicLocation, setSeismicLocation] = useState<'onshore' | 'offshore'>('offshore');

  const calculatedDepth = useMemo(() => (velocity * twt) / 2, [velocity, twt]);
  const calculatedBouguer = useMemo(() => calculateBouguerSlabCorrection(elevation, 2.67), [elevation]);

  // Surface Geology State
  const [dipAngle, setDipAngle] = useState(15);
  const [strikeAngle, setStrikeAngle] = useState(45);
  const [apparentThickness, setApparentThickness] = useState(100);
  const [gpsCoords, setGpsCoords] = useState({ lat: 28.54, lon: -90.41 });
  const [outcrops, setOutcrops] = useState<{ lat: number, lon: number, formation: string, lithology: string }[]>([]);
  const calculatedTST = useMemo(() => apparentThickness * Math.cos(dipAngle * Math.PI / 180), [apparentThickness, dipAngle]);

  // Basin Intelligence State
  const [toc, setToc] = useState(2.4);
  const [hydrogenIndex, setHydrogenIndex] = useState(450);
  const [oxygenIndex, setOxygenIndex] = useState(25);
  const [vitriniteReflectance, setVitriniteReflectance] = useState(0.85);
  const [burialEvents, setBurialEvents] = useState([
    { age: 150, depth: 0, event: 'Deposition Start' },
    { age: 100, depth: 1200, event: 'Rapid Subsidence' },
    { age: 60, depth: 2500, event: 'Maximum Burial' },
    { age: 0, depth: 2200, event: 'Present Day' }
  ]);

  const kerogenType = useMemo(() => classifyKerogen(hydrogenIndex, oxygenIndex), [hydrogenIndex, oxygenIndex]);
  const maturityInfo = useMemo(() => getMaturityInfo(vitriniteReflectance), [vitriniteReflectance]);
  const sortedBurialHistory = useMemo(() => [...burialEvents].sort((a, b) => b.age - a.age), [burialEvents]);

  const addBurialEvent = () => {
    setBurialEvents([...burialEvents, { age: 0, depth: 0, event: 'New Event' }]);
  };

  const removeBurialEvent = (index: number) => {
    setBurialEvents(burialEvents.filter((_, i) => i !== index));
  };

  // Geophysics State
  const [seismicFreq, setSeismicFreq] = useState(30);
  const [seismicOffset, setSeismicOffset] = useState(1000);
  const [vAbove, setVAbove] = useState(2500);
  const [vBelow, setVBelow] = useState(3000);
  const [rhoAbove, setRhoAbove] = useState(2.2);
  const [rhoBelow, setRhoBelow] = useState(2.4);
  const [magIntensity, setMagIntensity] = useState(48000);
  const [magAnomWidth, setMagAnomWidth] = useState(500);
  const [magDiurnal, setMagDiurnal] = useState(25);
  const [vrms1, setVrms1] = useState(2000);
  const [t1, setT1] = useState(1.0);
  const [vrms2, setVrms2] = useState(2500);
  const [t2, setT2] = useState(1.5);
  const [surveyAreaKm2, setSurveyAreaKm2] = useState(200);
  const [surveyLocType, setSurveyLocType] = useState<'onshore' | 'offshore'>('offshore');

  const aiAbove = useMemo(() => calculateAcousticImpedance(vAbove, rhoAbove), [vAbove, rhoAbove]);
  const aiBelow = useMemo(() => calculateAcousticImpedance(vBelow, rhoBelow), [vBelow, rhoBelow]);
  const rc = useMemo(() => calculateReflectionCoefficient(aiAbove, aiBelow), [aiAbove, aiBelow]);
  const nmoCorrection = useMemo(() => calculateNMO(twt, seismicOffset, velocity), [twt, seismicOffset, velocity]);
  const intervalVelocity = useMemo(() => calculateDixVelocity(vrms1, t1, vrms2, t2), [vrms1, t1, vrms2, t2]);
  const verticalRes = useMemo(() => calculateVerticalResolution(velocity, seismicFreq), [velocity, seismicFreq]);
  const fresnelZone = useMemo(() => calculateFresnelZone(velocity, twt, seismicFreq), [velocity, twt, seismicFreq]);
  const rickerWavelet = useMemo(() => generateRickerWavelet(seismicFreq, 0.1), [seismicFreq]);
  const freeAirCorr = useMemo(() => calculateFreeAirCorrection(elevation), [elevation]);
  const bouguerSlabCorr = useMemo(() => calculateBouguerSlabCorrection(elevation, 2.67), [elevation]);
  const sourceDepth = useMemo(() => estimateBasementDepthMagnetic(magAnomWidth), [magAnomWidth]);
  const theoreticalGravity = useMemo(() => calculateTheoreticalGravity(gpsCoords.lat), [gpsCoords.lat]);
  const skinDepth = useMemo(() => calculateSkinDepth(20, seismicFreq), [seismicFreq]);

  // Risk & Volumetrics State
  const [riskFactors, setRiskFactors] = useState<RiskFactors>({
    source: 0.8,
    reservoir: 0.7,
    trap: 0.9,
    seal: 0.8,
    migration: 0.85
  });
  const [volInputs, setVolInputs] = useState<VolumetricInputs>({
    area: { min: 500, base: 1200, max: 3000 },
    netPay: { min: 20, base: 45, max: 100 },
    porosity: { min: 0.12, base: 0.18, max: 0.25 },
    sw: { min: 0.2, base: 0.3, max: 0.45 },
    bo: 1.25
  });
  const pg = useMemo(() => calculatePg(riskFactors), [riskFactors]);
  const simulationResults = useMemo(() => runVolumetricSimulation(volInputs, 1000), [volInputs]);
  const percentiles = useMemo(() => getPercentiles(simulationResults), [simulationResults]);

  // Visualization State
  const [structuralData, setStructuralData] = useState<{ strike: number, dip: number }[]>([
    { strike: 45, dip: 30 },
    { strike: 50, dip: 35 },
    { strike: 40, dip: 28 },
    { strike: 135, dip: 60 },
    { strike: 130, dip: 55 },
    { strike: 220, dip: 15 },
  ]);
  const [structuralDeformity, setStructuralDeformity] = useState(1);
  const [refSearchTerm, setRefSearchTerm] = useState('');
  const [refFilter, setRefFilter] = useState<string>('all');
  const [selectedPaper, setSelectedPaper] = useState<typeof ACADEMIC_LIBRARY[0] | null>(null);

  // ─── Library filters ───
  const libCategories = useMemo(() => {
    const cats = new Set(ACADEMIC_LIBRARY.map(p => p.topic));
    return Array.from(cats);
  }, []);

  const filteredPapers = useMemo(() => {
    return ACADEMIC_LIBRARY.filter(p => {
      const matchesSearch = !refSearchTerm ||
        p.title.toLowerCase().includes(refSearchTerm.toLowerCase()) ||
        p.authors.toLowerCase().includes(refSearchTerm.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(refSearchTerm.toLowerCase()));
      const matchesFilter = refFilter === 'all' || p.topic === refFilter;
      return matchesSearch && matchesFilter;
    });
  }, [refSearchTerm, refFilter]);

  // ═══════════════════════════════════════════════════════════════════════
  // WELL PLANNING STATE
  // ═══════════════════════════════════════════════════════════════════════
  const [wpSubTab, setWpSubTab] = useState<'location' | 'trajectory' | 'stratigraphy' | 'pore_pressure' | 'casing' | 'mud' | 'logging' | 'coring' | 'afe' | 'risk' | 'decision_tree' | 'regulatory'>('location');

  // Location State
  const [wpStructuralPoints, setWpStructuralPoints] = useState([
    { x: 100, y: 200, depthFt: 8500 },
    { x: 300, y: 150, depthFt: 8200 },
    { x: 500, y: 250, depthFt: 8700 },
    { x: 200, y: 400, depthFt: 8800 },
    { x: 400, y: 350, depthFt: 8600 },
  ]);
  const [wpFaults] = useState<FaultBoundary[]>([
    { name: 'Fault A', faultX1: 80, faultY1: 80, faultX2: 520, faultY2: 100, throwFt: 200, sealingPotential: 'good' },
    { name: 'Fault B', faultX1: 50, faultY1: 350, faultX2: 450, faultY2: 380, throwFt: 350, sealingPotential: 'moderate' },
    { name: 'Fault C', faultX1: 350, faultY1: 50, faultX2: 380, faultY2: 500, throwFt: 150, sealingPotential: 'poor' },
  ]);
  const [wpSurfaceConstraints] = useState<SurfaceConstraint[]>([
    { type: 'pipeline', centerX: 250, centerY: 250, radiusFt: 60, description: 'Existing gas pipeline corridor' },
    { type: 'environmental', centerX: 400, centerY: 150, radiusFt: 80, description: 'Marine protected area boundary' },
    { type: 'shipping_lane', centerX: 100, centerY: 400, radiusFt: 50, description: 'Approved shipping fairway' },
  ]);

  // Trajectory State
  const [wpKOP, setWpKOP] = useState(3500);
  const [wpBuildRate, setWpBuildRate] = useState(2.5);
  const [wpTargetTVD, setWpTargetTVD] = useState(11000);
  const [wpTangentAngle, setWpTangentAngle] = useState(35);
  const [wpHorizontalTarget, setWpHorizontalTarget] = useState(2500);
  const [wpTrajectoryType, setWpTrajectoryType] = useState<WellTrajectoryType>('deviated');

  // Stratigraphy State
  const [wpVelocityLayers, setWpVelocityLayers] = useState([
    { intervalVelocityFtPerS: 6500, thicknessFt: 2000, formationName: 'Upper Miocene', lithology: 'sand-shale', porosity: 0.28 },
    { intervalVelocityFtPerS: 8000, thicknessFt: 1500, formationName: 'Middle Miocene', lithology: 'shale', porosity: 0.18 },
    { intervalVelocityFtPerS: 9500, thicknessFt: 1200, formationName: 'Lower Miocene', lithology: 'sandstone', porosity: 0.15 },
    { intervalVelocityFtPerS: 10500, thicknessFt: 800, formationName: 'Oligocene', lithology: 'carbonate', porosity: 0.12 },
    { intervalVelocityFtPerS: 12000, thicknessFt: 1500, formationName: 'Eocene', lithology: 'limestone', porosity: 0.08 },
  ]);
  const [wpSeismicConfidence, setWpSeismicConfidence] = useState(0.75);

  // Pore Pressure State
  const [wpNCT, setWpNCT] = useState(8500);
  const [wpEatonExp, setWpEatonExp] = useState(1.2);
  const [wpOBGradient, setWpOBGradient] = useState(1.0);
  const [wpPoissonsRatio, setWpPoissonsRatio] = useState(0.28);
  const [wpMaxDepth, setWpMaxDepth] = useState(14000);

  // Casing State
  const [wpConductorDepth, setWpConductorDepth] = useState(350);
  const [wpSurfaceDepth, setWpSurfaceDepth] = useState(3500);
  const [wpIntermediateDepth, setWpIntermediateDepth] = useState(9000);
  const [wpProductionDepth, setWpProductionDepth] = useState(12000);
  const [wpDesignFactor, setWpDesignFactor] = useState(1.15);

  // Logging State
  const [wpLogTVDTop, setWpLogTVDTop] = useState(1000);
  const [wpLogTVDBase, setWpLogTVDBase] = useState(11000);

  // Coring State
  const [wpCoringIntervals, setWpCoringIntervals] = useState<{ depthTopFt: number; depthBaseFt: number; coreType: 'conventional' | 'sidewall' | 'pressure'; objective: string }[]>([
    { depthTopFt: 7000, depthBaseFt: 7160, coreType: 'conventional', objective: 'Reservoir zone characterization' },
    { depthTopFt: 9800, depthBaseFt: 9860, coreType: 'pressure', objective: 'Pressure-preserved source rock' },
  ]);

  // AFE State
  const [wpSpreadRate, setWpSpreadRate] = useState(350000);
  const [wpDryHoleDays, setWpDryHoleDays] = useState(45);

  // Risk State
  const [wpRiskPg, setWpRiskPg] = useState(0.35);

  // FID State
  const [wpWacc, setWpWacc] = useState(10);
  const [wpOilPrice, setWpOilPrice] = useState(75);

  // Regulatory State
  const [wpJurisdiction, setWpJurisdiction] = useState('US GoM (Federal Waters)');

  // ═══════════════════════════════════════════════════════════════════════
  // WELL PLANNING COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════════════

  // Location calculations
  const crestalResult = useMemo(() =>
    calculateOptimalCrestalPosition(wpStructuralPoints),
    [wpStructuralPoints]
  );

  const faultRisk = useMemo(() =>
    assessFaultProximityRisk(crestalResult.crestalX, crestalResult.crestalY, wpFaults),
    [crestalResult.crestalX, crestalResult.crestalY, wpFaults]
  );

  const surfaceEval = useMemo(() =>
    evaluateSurfaceConstraints(crestalResult.crestalX, crestalResult.crestalY, wpSurfaceConstraints),
    [crestalResult.crestalX, crestalResult.crestalY, wpSurfaceConstraints]
  );

  // Trajectory design
  const trajectory = useMemo(() =>
    designExplorationTrajectory(wpKOP, wpBuildRate, wpTargetTVD, wpTangentAngle, wpHorizontalTarget, wpTrajectoryType),
    [wpKOP, wpBuildRate, wpTargetTVD, wpTangentAngle, wpHorizontalTarget, wpTrajectoryType]
  );

  // Stratigraphy prognosis
  const stratigraphy = useMemo(() =>
    prognoseFormationTops(wpVelocityLayers, wpSeismicConfidence),
    [wpVelocityLayers, wpSeismicConfidence]
  );

  // Pore pressure profile
  const porePressureProfile = useMemo(() => {
    const velProfile: number[] = [];
    const totalPoints = Math.floor(wpMaxDepth / 200);
    for (let i = 0; i < totalPoints; i++) {
      const depth = i * 200;
      let vel = 7000 + depth * 0.3;
      for (const layer of wpVelocityLayers) {
        let cumulativeDepth = 0;
        for (const l of wpVelocityLayers) {
          if (depth >= cumulativeDepth && depth < cumulativeDepth + l.thicknessFt) {
            vel = l.intervalVelocityFtPerS;
            break;
          }
          cumulativeDepth += l.thicknessFt;
        }
      }
      velProfile.push(vel);
    }
    return buildPorePressureProfile(200, wpMaxDepth, velProfile, wpNCT, wpEatonExp, wpOBGradient, wpPoissonsRatio);
  }, [wpMaxDepth, wpNCT, wpEatonExp, wpOBGradient, wpPoissonsRatio, wpVelocityLayers]);

  // Max pore pressure and frac gradient for casing design
  const maxPP = useMemo(() => {
    if (porePressureProfile.points.length === 0) return 10;
    return Math.max(...porePressureProfile.points.map(p => p.porePressurePpg));
  }, [porePressureProfile]);

  const maxFG = useMemo(() => {
    if (porePressureProfile.points.length === 0) return 14;
    return Math.max(...porePressureProfile.points.map(p => p.fractureGradientPpg));
  }, [porePressureProfile]);

  // Casing program
  const casingProgram = useMemo(() =>
    designCasingProgram(wpConductorDepth, wpSurfaceDepth, wpIntermediateDepth, wpProductionDepth, maxPP, maxFG, wpDesignFactor),
    [wpConductorDepth, wpSurfaceDepth, wpIntermediateDepth, wpProductionDepth, maxPP, maxFG, wpDesignFactor]
  );

  // Mud weight schedule
  const mudSchedule = useMemo(() => {
    const sections = [
      { name: 'Conductor', from: 0, to: wpConductorDepth, porePressurePpg: 8.6, fracGradientPpg: 12 },
      { name: 'Surface', from: wpConductorDepth, to: wpSurfaceDepth, porePressurePpg: 9.0, fracGradientPpg: 13 },
      { name: 'Intermediate', from: wpSurfaceDepth, to: wpIntermediateDepth, porePressurePpg: maxPP, fracGradientPpg: maxFG },
      { name: 'Production', from: wpIntermediateDepth, to: wpProductionDepth, porePressurePpg: maxPP, fracGradientPpg: maxFG },
    ];
    return calculateMudWeightSchedule(sections);
  }, [wpConductorDepth, wpSurfaceDepth, wpIntermediateDepth, wpProductionDepth, maxPP, maxFG]);

  // Logging program
  const loggingProgram = useMemo(() =>
    designLoggingProgram(wpLogTVDTop, wpLogTVDBase),
    [wpLogTVDTop, wpLogTVDBase]
  );

  // Coring program
  const coringProgram = useMemo(() =>
    designCoringProgram(wpCoringIntervals.map(ci => ({
      ...ci,
      expectedRecoveryPct: ci.coreType === 'pressure' ? 95 : 85,
      costPerFt: ci.coreType === 'pressure' ? 1800 : ci.coreType === 'conventional' ? 600 : 350,
    }))),
    [wpCoringIntervals]
  );

  // AFE
  const afe = useMemo(() =>
    estimateAFE(trajectory.totalMeasuredDepthFt, casingProgram, loggingProgram, coringProgram, wpSpreadRate, wpDryHoleDays),
    [trajectory.totalMeasuredDepthFt, casingProgram, loggingProgram, coringProgram, wpSpreadRate, wpDryHoleDays]
  );

  // Risk assessment — build risk items from trajectory and pore pressure
  const riskAssessment = useMemo(() => {
    const riskItems: Omit<RiskItem, 'riskScore' | 'riskLevel' | 'residualScore'>[] = [
      { id: 'dry-hole', description: 'Dry hole — no commercial hydrocarbons', category: 'geological', likelihood: Math.round((1 - wpRiskPg) * 5), consequence: 5, residualLikelihood: Math.max(1, Math.round((1 - wpRiskPg) * 5) - 1), residualConsequence: 4, mitigation: 'Amplitude-supported target; adjacent well control' },
      { id: 'overpressure', description: 'Overpressure kick / influx', category: 'operational', likelihood: maxPP > 14 ? 4 : 2, consequence: 4, residualLikelihood: 2, residualConsequence: 3, mitigation: 'Mud weight +30% above pore pressure; BOP stack testing' },
      { id: 'stuck-pipe', description: 'Differential sticking in depleted zones', category: 'operational', likelihood: 3, consequence: 3, residualLikelihood: 2, residualConsequence: 2, mitigation: 'LCM sweeps; rotating BHA; minimize stationary time' },
      { id: 'lost-circulation', description: 'Lost circulation in fractured carbonates', category: 'operational', likelihood: trajectory.tangentAngleDeg > 45 ? 3 : 1, consequence: 3, residualLikelihood: 1, residualConsequence: 2, mitigation: 'LCM pills; managed pressure drilling' },
      { id: 'trajectory-error', description: 'Wellbore position uncertainty exceeding target tolerance', category: 'operational', likelihood: 2, consequence: 3, residualLikelihood: 1, residualConsequence: 2, mitigation: 'MWD + gyro surveys every 100 ft' },
      { id: 'cost-overrun', description: 'AFE cost overrun > 25%', category: 'commercial', likelihood: 3, consequence: 4, residualLikelihood: 2, residualConsequence: 3, mitigation: '15% contingency + risk allowance' },
    ];
    return assessExplorationRisk(riskItems);
  }, [wpRiskPg, maxPP, trajectory]);

  // FID decision tree
  const fidResult = useMemo(() => {
    const successNpv = afe.totalCostUsd * 3.5;
    const dryHoleCost = afe.dryHoleCostUsd;
    const farmoutValue = afe.totalCostUsd * 0.15;
    const deferCost = afe.totalCostUsd * 0.05;
    return calculateDecisionTree(afe.totalCostUsd, successNpv, dryHoleCost, wpRiskPg, farmoutValue, deferCost, 0.05, wpWacc);
  }, [afe.totalCostUsd, afe.dryHoleCostUsd, wpRiskPg, wpWacc]);

  // Regulatory
  const regulatory = useMemo(() => {
    const jurisdictionKey = wpJurisdiction.startsWith('US') ? 'US GOM' : wpJurisdiction.startsWith('UK') ? 'North Sea' : 'default';
    const somePermits = jurisdictionKey === 'US GOM' ? ['BOEM APD', 'MMS Lease', 'Coast Guard'] : jurisdictionKey === 'North Sea' ? ['OGA License', 'HSE Safety Case'] : ['Exploration License'];
    const sensitivity = afe.totalCostUsd > 50e6 ? 'high' as const : afe.totalCostUsd > 20e6 ? 'moderate' as const : 'low' as const;
    return assessRegulatoryReadiness(jurisdictionKey, somePermits, sensitivity);
  }, [wpJurisdiction, afe.totalCostUsd]);

  return (
    <div className="flex flex-col h-full bg-app-bg transition-all duration-150">
      {/* Exploration Sub-navigation */}
      <div className="flex gap-1 p-1 bg-panel-bg border-b border-border-subtle shrink-0 flex-wrap">
        {[
          { id: 'seismic', label: 'Seismic' },
          { id: 'surface', label: 'Surface' },
          { id: 'basin', label: 'Basin Analysis' },
          { id: 'geophysics', label: 'Surveys' },
          { id: 'evaluation', label: 'Risk/Vol.' },
          { id: 'well_planning', label: 'Well Planning' },
          { id: 'reference', label: 'Library' },
          { id: 'formations', label: 'Formations' },
          { id: 'visualization', label: 'Structural' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setExplorationSubTab(tab.id as any)}
            className={cn(
              "px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-tight transition-colors",
              explorationSubTab === tab.id ? "bg-brand-primary text-white" : "text-text-tertiary hover:bg-hover-bg hover:text-text-primary"
            )}
          >{tab.label}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <ProspectNeuralSimulator />

        <div className="mt-4">
          {/* ═══════ SEISMIC TAB ═══════ */}
          {explorationSubTab === 'seismic' && (
            <div className="flex flex-col xl:flex-row gap-4 min-h-[750px]">
              {/* Left: Controls */}
              <div className="w-full xl:w-[320px] bg-panel-bg border border-border-subtle p-4 rounded-lg shrink-0">
                <SectionHeader title="Seismic Parameters" subtitle="Migration Profile: Kirchhoff" />
                <div className="space-y-4">
                  <InputWithSlider label="Avg. Velocity" value={velocity} min={1500} max={6000} step={10} unit="m/s" onChange={setVelocity} />
                  <InputWithSlider label="Two-Way Time" value={twt} min={0} max={10} step={0.01} unit="sec" onChange={setTwt} />
                  <InputWithSlider label="Datum Elevation" value={elevation} min={-500} max={5000} step={10} unit="m" onChange={setElevation} />
                  <InputWithSlider label="Survey Area" value={seismicSurveyArea} min={10} max={1000} step={10} unit="km²" onChange={setSeismicSurveyArea} />
                  <div>
                    <label className="text-[10px] text-text-tertiary uppercase font-bold block mb-1">Location Type</label>
                    <div className="flex gap-1">
                      {(['onshore', 'offshore'] as const).map(t => (
                        <button key={t} onClick={() => setSeismicLocation(t)}
                          className={cn("flex-1 py-1.5 rounded text-[10px] font-bold uppercase", seismicLocation === t ? "bg-brand-primary text-white" : "bg-app-bg text-text-tertiary border border-border-subtle")}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Right: Calculations + Design */}
              <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 content-start">
                {/* Animated Calculation Results */}
                <div className="industry-card p-4 rounded-lg">
                  <SectionHeader title="Seismic Calculations" subtitle="Real-time derived parameters" />
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    <CalcCard icon={Ruler} label="Target Depth" value={calculatedDepth} unit="m" precision={1} formula="D = (V × T) / 2" />
                    <CalcCard icon={Gauge} label="Bouguer Correction" value={calculatedBouguer} unit="mGal" precision={2} formula="BC = 0.04191 × ρ × h" />
                    <CalcCard icon={Waves} label="Vertical Resolution" value={verticalRes} unit="m" precision={1} formula="λ/4 — Rayleigh Criterion" />
                    <CalcCard icon={Crosshair} label="Fresnel Zone" value={fresnelZone} unit="m" precision={1} formula="(v/2) × √(t₀/f)" />
                    <CalcCard icon={Signal} label="Acoustic Impedance" value={aiAbove} unit="kg/m²s" precision={0} formula="AI = ρ × V" />
                    <CalcCard icon={Activity} label="Reflection Coeff." value={rc} unit="" precision={4} formula="(AI₂ − AI₁) / (AI₂ + AI₁)" color="f59e0b" />
                  </div>
                </div>
                {/* Acquisition Design */}
                <div className="industry-card p-4 rounded-lg">
                  <SectionHeader title="Seismic Acquisition Design" subtitle="Technical Specifications" />
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {SEISMIC_ACQUISITION_DESIGN.map((design, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-3 bg-app-bg border border-border-subtle rounded-lg"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-brand-primary uppercase">{design.method}</span>
                          <span className="text-[9px] text-text-tertiary">{design.cost}</span>
                        </div>
                        <p className="text-[10px] text-text-secondary mb-2 italic">Source: {design.source}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-border-subtle/30 pt-2">
                          {Object.entries(design.params).map(([key, val]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-[11px] text-text-tertiary uppercase">{key}</span>
                              <span className="text-[10px] text-text-primary data-mono">{val}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                {/* Velocity Model Reference */}
                <div className="industry-card p-4 rounded-lg xl:col-span-2">
                  <SectionHeader title="Velocity Model Reference" subtitle="Lithology vs Interval Velocity" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {VELOCITY_MODEL_REFERENCE.map((vm, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-app-bg border border-border-subtle rounded-lg p-2.5 text-center"
                      >
                        <p className="text-[10px] text-text-primary font-bold">{vm.lithology}</p>
                        <p className="text-[11px] text-brand-primary font-mono mt-0.5">{vm.velocity}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ SURFACE GEOLOGY TAB ═══════ */}
          {explorationSubTab === 'surface' && (
            <div className="flex flex-col xl:flex-row gap-4 min-h-[700px]">
              {/* Left: Controls */}
              <div className="w-full xl:w-[320px] bg-panel-bg border border-border-subtle p-4 rounded-lg shrink-0">
                <SectionHeader title="Field Compass Data" subtitle="Strike/Dip & GPS" />
                <div className="space-y-4">
                  <InputWithSlider label="Dip Angle" value={dipAngle} min={0} max={90} step={1} unit="deg" onChange={setDipAngle} />
                  <InputWithSlider label="Strike Angle" value={strikeAngle} min={0} max={360} step={1} unit="deg" onChange={setStrikeAngle} />
                  <InputWithSlider label="Apparent Thickness" value={apparentThickness} min={1} max={500} step={1} unit="m" onChange={setApparentThickness} />
                  <div className="space-y-2">
                    <label className="text-[10px] text-text-tertiary uppercase font-bold">GPS Coordinates</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-text-tertiary">Latitude</label>
                        <input type="number" value={gpsCoords.lat} step={0.01} onChange={e => setGpsCoords({ ...gpsCoords, lat: Number(e.target.value) })}
                          className="w-full bg-app-bg border border-border-subtle rounded px-2 py-1 text-[11px] text-text-primary" />
                      </div>
                      <div>
                        <label className="text-[9px] text-text-tertiary">Longitude</label>
                        <input type="number" value={gpsCoords.lon} step={0.01} onChange={e => setGpsCoords({ ...gpsCoords, lon: Number(e.target.value) })}
                          className="w-full bg-app-bg border border-border-subtle rounded px-2 py-1 text-[11px] text-text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right: Calculations */}
              <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-4 content-start">
                {/* Compass Visualization */}
                <div className="industry-card p-4 rounded-lg flex flex-col items-center">
                  <SectionHeader title="Strike/Dip Compass" subtitle="Field measurement visualization" />
                  <div className="w-[240px] h-[240px] mt-2">
                    <CompassRose strike={strikeAngle} dip={dipAngle} />
                  </div>
                </div>
                {/* Calculation Cards */}
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
                  <CalcCard icon={Ruler} label="True Stratigraphic Thickness" value={calculatedTST} unit="m" precision={1} formula="TST = t_app × cos(dip)" />
                  <CalcCard icon={Gauge} label="Dip Angle (deg)" value={dipAngle} unit="°" precision={1} formula="Measured in field" />
                  <CalcCard icon={Compass} label="Strike Direction" value={strikeAngle} unit="°" precision={0} formula="Right-hand rule" />
                  <CalcCard icon={Globe} label="Theoretical Gravity" value={theoreticalGravity} unit="mGal" precision={0} formula="WGS84 Somigliana" />
                  <CalcCard icon={Mountain} label="Free Air Correction" value={freeAirCorr} unit="mGal" precision={2} formula="FAC = −0.3086 × h" />
                  <CalcCard icon={Map} label="Bouguer Slab Corr." value={bouguerSlabCorr} unit="mGal" precision={2} formula="BC = 0.04191 × ρ × h" />
                </div>
                {/* GPS Map Placeholder */}
                <div className="industry-card p-4 rounded-lg xl:col-span-3">
                  <SectionHeader title="Surface Map View" subtitle={`GPS: ${gpsCoords.lat.toFixed(4)}°, ${gpsCoords.lon.toFixed(4)}°`} />
                  <div className="w-full h-[180px] bg-black/40 rounded-lg border border-border-subtle flex items-center justify-center mt-2">
                    <div className="text-center">
                      <MapPin size={28} className="mx-auto text-red-400 animate-pulse mb-2" />
                      <p className="text-[10px] text-text-tertiary uppercase">Outcrop Mapping Grid</p>
                      <p className="text-[11px] text-text-primary font-mono mt-1">{outcrops.length} outcrops mapped</p>
                      <button
                        onClick={() => setOutcrops([...outcrops, { lat: gpsCoords.lat + Math.random() * 0.1, lon: gpsCoords.lon + Math.random() * 0.1, formation: `Unit-${outcrops.length + 1}`, lithology: 'Sandstone' }])}
                        className="mt-2 px-3 py-1 bg-brand-primary/20 border border-brand-primary/30 rounded text-[10px] text-brand-primary font-bold uppercase hover:bg-brand-primary/30 transition-colors"
                      >
                        + Add Outcrop
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ BASIN ANALYSIS TAB ═══════ */}
          {explorationSubTab === 'basin' && (
            <div className="flex flex-col xl:flex-row gap-4 min-h-[700px]">
              {/* Left: Controls */}
              <div className="w-full xl:w-[340px] bg-panel-bg border border-border-subtle p-4 rounded-lg shrink-0 space-y-4">
                <SectionHeader title="Source Properties" subtitle="Petroleum Systems Modeling" />
                <InputWithSlider label="TOC" value={toc} min={0} max={15} step={0.1} unit="wt%" onChange={setToc} />
                <InputWithSlider label="Hydrogen Index (HI)" value={hydrogenIndex} min={0} max={1000} step={10} unit="mg HC/g TOC" onChange={setHydrogenIndex} />
                <InputWithSlider label="Oxygen Index (OI)" value={oxygenIndex} min={0} max={200} step={5} unit="mg CO₂/g TOC" onChange={setOxygenIndex} />
                <InputWithSlider label="Vitrinite Reflectance" value={vitriniteReflectance} min={0.2} max={3.5} step={0.01} unit="Ro%" onChange={setVitriniteReflectance} />

                {/* Basin Selection */}
                <SectionHeader title="Global Basin Database" subtitle="Select analog basin" />
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {GLOBAL_BASIN_DATABASE.map((basin, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="bg-app-bg border border-border-subtle rounded p-2 text-[10px] cursor-pointer hover:border-brand-primary/40 transition-colors">
                      <div className="text-brand-primary font-bold">{basin.name}</div>
                      <div className="text-text-tertiary">{basin.type} • {basin.depthRange}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
              {/* Right: Calculations */}
              <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 content-start">
                {/* Van Krevelen Diagram */}
                <div className="industry-card p-4 rounded-lg flex flex-col">
                  <SectionHeader title="Van Krevelen Diagram" subtitle="Kerogen Type Classification" />
                  <div className="w-full flex-1 min-h-[260px]">
                    <VanKrevelenPlot hi={hydrogenIndex} oi={oxygenIndex} kerogenType={kerogenType} />
                  </div>
                  <div className="mt-2 flex gap-2 justify-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}
                      className="px-3 py-1 bg-brand-primary/20 border border-brand-primary/30 rounded-full text-[11px] text-brand-primary font-bold uppercase">
                      {kerogenType}
                    </motion.div>
                  </div>
                </div>
                {/* Maturity & Generation */}
                <div className="grid grid-cols-1 gap-3 content-start">
                  <CalcCard icon={Thermometer} label="Vitrinite Reflectance" value={vitriniteReflectance} unit="Ro%" precision={2} formula="Lopatin TTI → Waples (1980)" />
                  <CalcCard icon={Droplet} label="TOC" value={toc} unit="wt%" precision={1} formula="Original source richness" />
                  <CalcCard icon={Zap} label="Hydrogen Index" value={hydrogenIndex} unit="mg/g" precision={0} formula="Rock-Eval S2/TOC × 100" />
                  <CalcCard icon={Clock} label="Maturity Window" value={maturityInfo ? (maturityInfo.label?.includes('Oil') ? 1 : maturityInfo.label?.includes('Gas') ? 2 : 0.5) : 0} unit="" precision={0} formula={maturityInfo?.label || 'Immature'}>
                    <p className="text-[11px] text-brand-primary font-bold mt-1 uppercase">{maturityInfo?.label || 'N/A'}</p>
                  </CalcCard>
                </div>
                {/* Burial History */}
                <div className="industry-card p-4 rounded-lg xl:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <SectionHeader title="Burial History Curve" subtitle="Time vs Depth reconstruction" />
                    <div className="flex gap-1">
                      <button onClick={addBurialEvent} className="text-[10px] px-2 py-1 bg-brand-primary/20 border border-brand-primary/30 rounded text-brand-primary font-bold uppercase">+ Event</button>
                    </div>
                  </div>
                  <div className="w-full h-[220px]">
                    <BurialHistoryCurve events={burialEvents} />
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {burialEvents.map((e, i) => (
                      <div key={i} className="bg-app-bg border border-border-subtle rounded px-2 py-1 text-[10px] flex items-center gap-1">
                        <span className="text-text-primary">{e.event}</span>
                        <span className="text-text-tertiary">({e.age}Ma, {e.depth}m)</span>
                        <button onClick={() => removeBurialEvent(i)} className="text-red-400 hover:text-red-300 ml-1">×</button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Petroleum System Checklist */}
                <div className="industry-card p-4 rounded-lg xl:col-span-2">
                  <SectionHeader title="Petroleum System Checklist" subtitle="Essential elements evaluation" />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {Object.entries(PETROLEUM_SYSTEM_CHECKLIST).map(([category, criteria]) => (
                      <div key={category} className="bg-app-bg border border-border-subtle rounded-lg p-2.5">
                        <p className="text-[10px] text-brand-primary font-bold uppercase mb-2">{category}</p>
                        {criteria.map((c, j) => (
                          <div key={j} className="flex justify-between items-start gap-2 mt-1">
                            <span className="text-[10px] text-text-primary leading-tight">{c.criterion}</span>
                            <span className="text-[9px] text-text-tertiary font-mono shrink-0">{c.threshold}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ SURVEYS (GEOPHYSICS) TAB ═══════ */}
          {explorationSubTab === 'geophysics' && (
            <div className="flex flex-col xl:flex-row gap-4 min-h-[700px]">
              {/* Left: Controls */}
              <div className="w-full xl:w-[340px] bg-panel-bg border border-border-subtle p-4 rounded-lg shrink-0 space-y-4">
                <SectionHeader title="Survey Parameters" subtitle="Source, receiver & geometry" />
                <InputWithSlider label="Peak Frequency" value={seismicFreq} min={5} max={100} step={1} unit="Hz" onChange={setSeismicFreq} />
                <InputWithSlider label="Offset" value={seismicOffset} min={100} max={8000} step={100} unit="m" onChange={setSeismicOffset} />
                <InputWithSlider label="Velocity Above" value={vAbove} min={1500} max={7000} step={50} unit="m/s" onChange={setVAbove} />
                <InputWithSlider label="Velocity Below" value={vBelow} min={1500} max={7000} step={50} unit="m/s" onChange={setVBelow} />
                <InputWithSlider label="Density Above" value={rhoAbove} min={1.5} max={3.5} step={0.1} unit="g/cm³" onChange={setRhoAbove} />
                <InputWithSlider label="Density Below" value={rhoBelow} min={1.5} max={3.5} step={0.1} unit="g/cm³" onChange={setRhoBelow} />
                <div className="border-t border-border-subtle pt-3">
                  <p className="text-[10px] text-text-tertiary uppercase font-bold mb-2">Dix Interval Velocity</p>
                  <div className="grid grid-cols-2 gap-2">
                    <InputWithSlider label="Vrms₁" value={vrms1} min={1000} max={6000} step={50} unit="m/s" onChange={setVrms1} />
                    <InputWithSlider label="t₁" value={t1} min={0.1} max={5} step={0.05} unit="s" onChange={setT1} />
                    <InputWithSlider label="Vrms₂" value={vrms2} min={1000} max={6000} step={50} unit="m/s" onChange={setVrms2} />
                    <InputWithSlider label="t₂" value={t2} min={0.1} max={5} step={0.05} unit="s" onChange={setT2} />
                  </div>
                </div>
                <div className="border-t border-border-subtle pt-3">
                  <p className="text-[10px] text-text-tertiary uppercase font-bold mb-2">Magnetics</p>
                  <InputWithSlider label="TMI Intensity" value={magIntensity} min={30000} max={65000} step={100} unit="nT" onChange={setMagIntensity} />
                  <InputWithSlider label="Anomaly Width" value={magAnomWidth} min={50} max={2000} step={50} unit="m" onChange={setMagAnomWidth} />
                </div>
                <div className="border-t border-border-subtle pt-3">
                  <InputWithSlider label="Survey Area" value={surveyAreaKm2} min={10} max={1000} step={10} unit="km²" onChange={setSurveyAreaKm2} />
                  <div className="flex gap-1 mt-2">
                    {(['onshore', 'offshore'] as const).map(t => (
                      <button key={t} onClick={() => setSurveyLocType(t)}
                        className={cn("flex-1 py-1.5 rounded text-[10px] font-bold uppercase", surveyLocType === t ? "bg-brand-primary text-white" : "bg-app-bg text-text-tertiary border border-border-subtle")}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Right: Calculations */}
              <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-4 content-start">
                {/* Seismic Calculations */}
                <CalcCard icon={Activity} label="Acoustic Impedance (Above)" value={aiAbove} unit="" precision={0} formula="AI = ρ × V" />
                <CalcCard icon={Activity} label="Acoustic Impedance (Below)" value={aiBelow} unit="" precision={0} formula="AI = ρ × V" />
                <CalcCard icon={Zap} label="Reflection Coefficient" value={rc} unit="" precision={4} formula="(AI₂ − AI₁) / (AI₂ + AI₁)" color={Math.abs(rc) > 0.1 ? 'f59e0b' : 'brand-primary'} />
                <CalcCard icon={Clock} label="NMO Correction" value={nmoCorrection} unit="s" precision={4} formula="Δt = √(t₀² + x²/v²) − t₀" />
                <CalcCard icon={TrendingUp} label="Interval Velocity (Dix)" value={intervalVelocity} unit="m/s" precision={0} formula="Vint² = (Vrms₂²·t₂ − Vrms₁²·t₁)/(t₂−t₁)" />
                <CalcCard icon={Ruler} label="Vertical Resolution" value={verticalRes} unit="m" precision={1} formula="λ/4 = v/(4f)" />
                <CalcCard icon={Crosshair} label="Fresnel Zone Radius" value={fresnelZone} unit="m" precision={1} formula="(v/2)√(t₀/f)" />
                <CalcCard icon={Globe} label="Free Air Correction" value={freeAirCorr} unit="mGal" precision={2} formula="FAC = −0.3086×h" />
                <CalcCard icon={Mountain} label="Bouguer Slab Correction" value={bouguerSlabCorr} unit="mGal" precision={2} formula="BC = 0.04191×ρ×h" />
                <CalcCard icon={Radio} label="EM Skin Depth" value={skinDepth} unit="m" precision={0} formula="δ = 503√(ρ/f)" />
                <CalcCard icon={Box} label="Basement Depth (Mag)" value={sourceDepth} unit="m" precision={0} formula="Half-width × 0.65" />
                <CalcCard icon={Gauge} label="Theoretical Gravity" value={theoreticalGravity} unit="mGal" precision={0} formula="WGS84 at φ" />
                {/* Wavelet */}
                <div className="industry-card p-4 rounded-lg xl:col-span-3">
                  <SectionHeader title="Ricker Wavelet" subtitle={`Dominant frequency: ${seismicFreq} Hz`} />
                  <RickerWaveletSVG waveletData={rickerWavelet} width={500} height={80} />
                </div>
                {/* Survey Cost Comparison */}
                <div className="industry-card p-4 rounded-lg xl:col-span-3">
                  <SectionHeader title="Survey Cost Comparison" subtitle={`Area: ${surveyAreaKm2} km² (${surveyLocType})`} />
                  <SurveyCostChart areaSqKm={surveyAreaKm2} location={surveyLocType} />
                </div>
                {/* Fluid Classification */}
                <div className="industry-card p-4 rounded-lg xl:col-span-3">
                  <SectionHeader title="Hydrocarbon Fluid Classification" subtitle="Based on GOR & API gravity" />
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {FLUID_CLASSIFICATION.map((f, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="bg-app-bg border border-border-subtle rounded-lg p-2.5 text-center">
                        <p className="text-[11px] text-brand-primary font-bold uppercase">{f.type}</p>
                        <p className="text-[9px] text-text-tertiary mt-1">{f.gor ? `GOR: ${f.gor}` : f.composition || ''}</p>
                        <p className="text-[9px] text-text-secondary">{f.characteristics.slice(0, 60)}...</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ RISK/VOLUMETRICS TAB ═══════ */}
          {explorationSubTab === 'evaluation' && (
            <div className="flex flex-col xl:flex-row gap-4 min-h-[700px]">
              {/* Left: Controls */}
              <div className="w-full xl:w-[340px] bg-panel-bg border border-border-subtle p-4 rounded-lg shrink-0 space-y-4">
                <SectionHeader title="Risk Factors" subtitle="Chance of Success (COS)" />
                <InputWithSlider label="Source Presence" value={riskFactors.source} min={0.05} max={1.0} step={0.01} unit="" onChange={v => setRiskFactors({ ...riskFactors, source: v })} />
                <InputWithSlider label="Reservoir Quality" value={riskFactors.reservoir} min={0.05} max={1.0} step={0.01} unit="" onChange={v => setRiskFactors({ ...riskFactors, reservoir: v })} />
                <InputWithSlider label="Trap Geometry" value={riskFactors.trap} min={0.05} max={1.0} step={0.01} unit="" onChange={v => setRiskFactors({ ...riskFactors, trap: v })} />
                <InputWithSlider label="Seal Integrity" value={riskFactors.seal} min={0.05} max={1.0} step={0.01} unit="" onChange={v => setRiskFactors({ ...riskFactors, seal: v })} />
                <InputWithSlider label="Migration Timing" value={riskFactors.migration} min={0.05} max={1.0} step={0.01} unit="" onChange={v => setRiskFactors({ ...riskFactors, migration: v })} />
                <div className="border-t border-border-subtle pt-3">
                  <SectionHeader title="Volumetric Inputs" subtitle="Triangular distributions" />
                  <InputWithSlider label="Area (base)" value={volInputs.area.base} min={100} max={10000} step={50} unit="acres" onChange={v => setVolInputs({ ...volInputs, area: { ...volInputs.area, base: v } })} />
                  <InputWithSlider label="Net Pay (base)" value={volInputs.netPay.base} min={5} max={200} step={1} unit="ft" onChange={v => setVolInputs({ ...volInputs, netPay: { ...volInputs.netPay, base: v } })} />
                  <InputWithSlider label="Porosity (base)" value={volInputs.porosity.base} min={0.05} max={0.35} step={0.01} unit="" onChange={v => setVolInputs({ ...volInputs, porosity: { ...volInputs.porosity, base: v } })} />
                  <InputWithSlider label="Sw (base)" value={volInputs.sw.base} min={0.1} max={0.6} step={0.01} unit="" onChange={v => setVolInputs({ ...volInputs, sw: { ...volInputs.sw, base: v } })} />
                  <InputWithSlider label="Bo (FVF)" value={volInputs.bo} min={1.0} max={2.5} step={0.01} unit="rb/stb" onChange={v => setVolInputs({ ...volInputs, bo: v })} />
                </div>
              </div>
              {/* Right: Results */}
              <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 content-start">
                {/* PG Gauge */}
                <div className="industry-card p-4 rounded-lg flex flex-col items-center justify-center">
                  <SectionHeader title="Probability of Geologic Success" subtitle="PG = Π(Risk Factors)" />
                  <div className="relative w-[160px] h-[160px] mt-4 mb-2">
                    <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                      <circle cx={80} cy={80} r={68} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                      <motion.circle cx={80} cy={80} r={68} fill="none" stroke="#6366f1" strokeWidth="12" strokeLinecap="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: pg }} transition={{ duration: 1, ease: "easeOut" }}
                        strokeDasharray={`${2 * Math.PI * 68}`} strokeDashoffset={0} style={{}} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.span
                        key={pg.toFixed(2)}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-4xl font-black text-brand-primary data-mono"
                      >{Math.round(pg * 100)}%</motion.span>
                    </div>
                  </div>
                  <p className="text-[10px] text-text-tertiary uppercase text-center mt-2">Chance of Geological Success</p>
                </div>
                {/* Risk Tornado */}
                <div className="industry-card p-4 rounded-lg">
                  <SectionHeader title="Risk Factor Tornado" subtitle="Ordered by impact" />
                  <RiskTornado factors={riskFactors} />
                </div>
                {/* Monte Carlo Histogram */}
                <div className="industry-card p-4 rounded-lg xl:col-span-2">
                  <SectionHeader title="Monte Carlo Simulation" subtitle="1000 iterations — STOIIP Distribution" />
                  <MonteCarloHistogram results={simulationResults} />
                </div>
                {/* Percentiles */}
                <div className="industry-card p-4 rounded-lg xl:col-span-2">
                  <SectionHeader title="Volumetric Percentiles" subtitle="P90 / P50 / P10" />
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'P90 (Proved)', value: percentiles.p90, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
                      { label: 'P50 (Probable)', value: percentiles.p50, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
                      { label: 'P10 (Possible)', value: percentiles.p10, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
                    ].map((p, i) => (
                      <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.15 }}
                        className={cn("rounded-lg p-4 text-center border", p.bg, p.border)}>
                        <p className="text-[10px] text-text-tertiary uppercase font-bold">{p.label}</p>
                        <p className={cn("text-2xl font-black data-mono mt-1", p.color)}>{p.value.toFixed(1)}</p>
                        <p className="text-[11px] text-text-tertiary">MMstb</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="bg-app-bg border border-border-subtle rounded-lg p-2 text-center">
                      <p className="text-[9px] text-text-tertiary uppercase">Mean</p>
                      <p className="text-sm font-bold text-text-primary font-mono">{(simulationResults.reduce((a, b) => a + b, 0) / simulationResults.length).toFixed(1)} MMstb</p>
                    </div>
                    <div className="bg-app-bg border border-border-subtle rounded-lg p-2 text-center">
                      <p className="text-[9px] text-text-tertiary uppercase">Std Dev</p>
                      <p className="text-sm font-bold text-text-primary font-mono">{(() => { const m = simulationResults.reduce((a, b) => a + b, 0) / simulationResults.length; return Math.sqrt(simulationResults.reduce((s, v) => s + (v - m) ** 2, 0) / simulationResults.length); })().toFixed(1)} MMstb</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ LIBRARY TAB ═══════ */}
          {explorationSubTab === 'reference' && (
            <div className="flex flex-col xl:flex-row gap-4 min-h-[600px]">
              {/* Left: Search & Filter */}
              <div className="w-full xl:w-[320px] bg-panel-bg border border-border-subtle p-4 rounded-lg shrink-0 space-y-4">
                <SectionHeader title="Academic Reference Library" subtitle={`${filteredPapers.length} papers available`} />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={14} />
                  <input
                    type="text"
                    placeholder="Search by title, author, or tag..."
                    value={refSearchTerm}
                    onChange={e => setRefSearchTerm(e.target.value)}
                    className="w-full bg-app-bg border border-border-subtle rounded-lg py-2 pl-9 pr-3 text-[11px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-primary/50"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-text-tertiary uppercase font-bold mb-2">Filter by Category</p>
                  <div className="flex flex-wrap gap-1">
                    <button onClick={() => setRefFilter('all')}
                      className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase", refFilter === 'all' ? "bg-brand-primary text-white" : "bg-app-bg text-text-tertiary border border-border-subtle")}>
                      All
                    </button>
                    {libCategories.map(cat => (
                      <button key={cat} onClick={() => setRefFilter(cat)}
                        className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase", refFilter === cat ? "bg-brand-primary text-white" : "bg-app-bg text-text-tertiary border border-border-subtle")}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Paper List */}
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {filteredPapers.map((paper, i) => (
                    <motion.button
                      key={paper.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedPaper(paper)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg border transition-all",
                        selectedPaper?.id === paper.id ? "bg-brand-primary/10 border-brand-primary/30" : "bg-app-bg border-border-subtle hover:border-white/10"
                      )}
                    >
                      <p className="text-[11px] text-text-primary font-bold leading-tight line-clamp-2">{paper.title}</p>
                      <p className="text-[10px] text-text-tertiary mt-0.5">{paper.authors} • {paper.year}</p>
                    </motion.button>
                  ))}
                  {filteredPapers.length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen size={24} className="mx-auto text-text-tertiary mb-2" />
                      <p className="text-[11px] text-text-tertiary uppercase">No papers match your search</p>
                    </div>
                  )}
                </div>
              </div>
              {/* Right: Paper Detail */}
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  {selectedPaper ? (
                    <motion.div
                      key={selectedPaper.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="industry-card p-6 rounded-lg h-full"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-3 bg-brand-primary/10 rounded-xl shrink-0">
                          <BookOpen size={22} className="text-brand-primary" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-white uppercase tracking-tight leading-tight">{selectedPaper.title}</h3>
                          <p className="text-[11px] text-text-tertiary mt-1">{selectedPaper.authors} ({selectedPaper.year})</p>
                          <p className="text-[10px] text-brand-primary font-bold uppercase mt-0.5">{selectedPaper.citation}</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed mb-4">{selectedPaper.summary}</p>
                      {selectedPaper.tags && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {selectedPaper.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-app-bg border border-border-subtle rounded-full text-[9px] text-text-tertiary uppercase">{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <CalcCard icon={Info} label="Category" value={0} unit={selectedPaper.topic} precision={0} formula="" />
                        <CalcCard icon={Info} label="Difficulty" value={0} unit={selectedPaper.difficulty || 'N/A'} precision={0} formula="" />
                      </div>
                      {selectedPaper.citation && (
                        <p className="mt-4 text-[10px] text-text-tertiary italic leading-relaxed">
                          {selectedPaper.citation}
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full border-2 border-dashed border-white/5 rounded-lg flex flex-col items-center justify-center text-center p-12">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                        <Library size={28} className="text-text-tertiary" />
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Select a Paper</h3>
                      <p className="text-[11px] text-text-tertiary uppercase max-w-md">
                        Browse the academic library to view detailed abstracts, keywords, and citation metadata for peer-reviewed exploration references.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* ═══════ STRUCTURAL TAB ═══════ */}
          {explorationSubTab === 'visualization' && (
            <div className="flex flex-col xl:flex-row gap-4 min-h-[700px]">
              {/* Left: Controls */}
              <div className="w-full xl:w-[320px] bg-panel-bg border border-border-subtle p-4 rounded-lg shrink-0 space-y-4">
                <SectionHeader title="Structural Analysis" subtitle="Stereo net, Rose & Deformation" />
                <InputWithSlider label="Deformity Factor" value={structuralDeformity} min={0.3} max={3} step={0.1} unit="" onChange={setStructuralDeformity} />
                <div className="space-y-2">
                  <p className="text-[10px] text-text-tertiary uppercase font-bold">Fabric Data Points ({structuralData.length})</p>
                  {structuralData.map((d, i) => (
                    <div key={i} className="grid grid-cols-3 gap-1 bg-app-bg border border-border-subtle rounded p-1.5">
                      <div>
                        <label className="text-[8px] text-text-tertiary">Strike</label>
                        <input type="number" value={d.strike}
                          onChange={e => { const updated = [...structuralData]; updated[i] = { ...d, strike: Number(e.target.value) }; setStructuralData(updated); }}
                          className="w-full bg-transparent border border-border-subtle rounded px-1 py-0.5 text-[10px] text-text-primary" />
                      </div>
                      <div>
                        <label className="text-[8px] text-text-tertiary">Dip</label>
                        <input type="number" value={d.dip}
                          onChange={e => { const updated = [...structuralData]; updated[i] = { ...d, dip: Number(e.target.value) }; setStructuralData(updated); }}
                          className="w-full bg-transparent border border-border-subtle rounded px-1 py-0.5 text-[10px] text-text-primary" />
                      </div>
                      <button onClick={() => setStructuralData(structuralData.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-300 text-[9px]">×</button>
                    </div>
                  ))}
                  <button onClick={() => setStructuralData([...structuralData, { strike: 90, dip: 45 }])}
                    className="text-[10px] px-2 py-1 bg-brand-primary/20 border border-brand-primary/30 rounded text-brand-primary font-bold uppercase w-full">+ Add Measurement</button>
                </div>
                {/* Calculated stats */}
                <div className="bg-app-bg border border-border-subtle rounded-lg p-3 space-y-1">
                  <p className="text-[10px] text-text-tertiary uppercase font-bold mb-1">Computed Statistics</p>
                  <DataRow label="Mean Strike" value={structuralData.length > 0 ? structuralData.reduce((s, d) => s + d.strike, 0) / structuralData.length : 0} unit="°" precision={0} />
                  <DataRow label="Mean Dip" value={structuralData.length > 0 ? structuralData.reduce((s, d) => s + d.dip, 0) / structuralData.length : 0} unit="°" precision={1} />
                  <DataRow label="Fold Tightness" value={structuralDeformity} unit="" precision={1} source="Ramsay 1967" />
                  <DataRow label="Data Points" value={structuralData.length} unit="" precision={0} />
                </div>
              </div>
              {/* Right: Visualizations */}
              <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 content-start">
                {/* Stereonet / Rose Diagram */}
                <div className="industry-card p-4 rounded-lg flex flex-col items-center xl:col-span-2">
                  <SectionHeader title="Strike Rose Diagram" subtitle="Structural fabric orientation" />
                  <div className="w-full max-w-[400px] h-[300px]">
                    <StereonetRose data={structuralData} deformity={structuralDeformity} />
                  </div>
                </div>
                {/* Stereonet table */}
                <div className="industry-card p-4 rounded-lg xl:col-span-2">
                  <SectionHeader title="Structural Dip/Strike Table" subtitle="Field measurement log" />
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="text-text-tertiary uppercase text-[10px]">
                          <th className="text-left py-1 px-2">#</th>
                          <th className="text-right py-1 px-2">Strike (°)</th>
                          <th className="text-right py-1 px-2">Dip (°)</th>
                          <th className="text-right py-1 px-2">Dip Dir (°)</th>
                          <th className="text-center py-1 px-2">Classification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {structuralData.map((d, i) => {
                          const dipDir = ((d.strike + 90) % 360);
                          const cls = d.dip < 15 ? 'Sub-horizontal' : d.dip < 35 ? 'Gentle' : d.dip < 60 ? 'Moderate' : 'Steep';
                          return (
                            <tr key={i} className="border-t border-border-subtle/20">
                              <td className="py-1 px-2 text-text-tertiary">{i + 1}</td>
                              <td className="py-1 px-2 text-right text-text-primary font-mono">{d.strike.toFixed(0)}</td>
                              <td className="py-1 px-2 text-right text-text-primary font-mono">{d.dip.toFixed(0)}</td>
                              <td className="py-1 px-2 text-right text-text-secondary font-mono">{dipDir.toFixed(0)}</td>
                              <td className="py-1 px-2 text-center text-brand-primary font-bold">{cls}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Deformation Indicators */}
                <div className="industry-card p-4 rounded-lg xl:col-span-2">
                  <SectionHeader title="Deformation Analysis" subtitle="Fold geometry & strain indicators" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-app-bg border border-border-subtle rounded-lg p-3 text-center">
                      <p className="text-[10px] text-text-tertiary uppercase">Interlimb Angle</p>
                      <p className="text-lg font-black text-brand-primary font-mono">{(180 - structuralDeformity * 40).toFixed(0)}°</p>
                      <p className="text-[9px] text-text-tertiary">{structuralDeformity < 0.8 ? 'Tight' : structuralDeformity < 1.5 ? 'Open' : 'Gentle'}</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-app-bg border border-border-subtle rounded-lg p-3 text-center">
                      <p className="text-[10px] text-text-tertiary uppercase">Fold Amplitude</p>
                      <p className="text-lg font-black text-brand-primary font-mono">{(structuralDeformity * 500).toFixed(0)} m</p>
                      <p className="text-[9px] text-text-tertiary">Estimated</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-app-bg border border-border-subtle rounded-lg p-3 text-center">
                      <p className="text-[10px] text-text-tertiary uppercase">Fold Wavelength</p>
                      <p className="text-lg font-black text-brand-primary font-mono">{(structuralDeformity * 800).toFixed(0)} m</p>
                      <p className="text-[9px] text-text-tertiary">Ramsay Class 1B</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-app-bg border border-border-subtle rounded-lg p-3 text-center">
                      <p className="text-[10px] text-text-tertiary uppercase">Axial Plunge</p>
                      <p className="text-lg font-black text-brand-primary font-mono">{Math.abs(10 - structuralDeformity * 15).toFixed(0)}°</p>
                      <p className="text-[9px] text-text-tertiary">Toward {(structuralData[0]?.strike || 0 + 90) % 360}°</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ FORMATIONS TAB ═══════ */}
          {explorationSubTab === 'formations' && <FormationDatabaseTab />}

          {/* ═══════════════════════════════════════════════════════════
                WELL PLANNING TAB
                ═══════════════════════════════════════════════════════════ */}
          {explorationSubTab === 'well_planning' && (
            <div className="flex flex-col gap-4">
              {/* Well Planning Sub-navigation */}
              <div className="flex gap-1 p-1 bg-panel-bg border border-border-subtle rounded-lg shrink-0 flex-wrap">
                {[
                  { id: 'location', label: 'Location', icon: MapPin },
                  { id: 'trajectory', label: 'Trajectory', icon: Compass },
                  { id: 'stratigraphy', label: 'Stratigraphy', icon: Layers },
                  { id: 'pore_pressure', label: 'Pore Pressure', icon: TrendingUp },
                  { id: 'casing', label: 'Casing', icon: Box },
                  { id: 'mud', label: 'Mud Program', icon: Waves },
                  { id: 'logging', label: 'Logging', icon: Activity },
                  { id: 'coring', label: 'Coring/Samp.', icon: Filter },
                  { id: 'afe', label: 'AFE Cost', icon: Calculator },
                  { id: 'risk', label: 'Risk', icon: AlertTriangle },
                  { id: 'decision_tree', label: 'FID', icon: BarChart3 },
                  { id: 'regulatory', label: 'Regulatory', icon: Shield },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setWpSubTab(tab.id as any)}
                      className={cn(
                        "px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-tight transition-colors flex items-center gap-1",
                        wpSubTab === tab.id ? "bg-brand-primary text-white" : "text-text-tertiary hover:bg-hover-bg hover:text-text-primary"
                      )}
                    >
                      <Icon size={12} /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* ─── 1. WELL LOCATION OPTIMIZATION ─── */}
              {wpSubTab === 'location' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="industry-card p-4 xl:col-span-2">
                    <SectionHeader title="Crestal Position & Surface Assessment" subtitle="Weighted interpolation from structural grid" />
                    <CrestalPositionMap
                      points={wpStructuralPoints}
                      faults={wpFaults}
                      constraints={wpSurfaceConstraints}
                      wellX={crestalResult.crestalX}
                      wellY={crestalResult.crestalY}
                      crestalX={crestalResult.crestalX}
                      crestalY={crestalResult.crestalY}
                    />
                  </div>
                  <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-4">
                    <SectionHeader title="Structural Grid" subtitle="Edit 5 control points" />
                    {wpStructuralPoints.map((pt, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="text-[11px] text-text-tertiary w-4">P{i + 1}</span>
                        <div className="flex-1 grid grid-cols-3 gap-1">
                          <div className="flex flex-col">
                            <label className="text-[10px] text-text-tertiary uppercase">X</label>
                            <input
                              type="number"
                              value={pt.x}
                              onChange={e => {
                                const updated = [...wpStructuralPoints];
                                updated[i] = { ...pt, x: Number(e.target.value) };
                                setWpStructuralPoints(updated);
                              }}
                              className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[10px] text-text-primary"
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-[10px] text-text-tertiary uppercase">Y</label>
                            <input
                              type="number"
                              value={pt.y}
                              onChange={e => {
                                const updated = [...wpStructuralPoints];
                                updated[i] = { ...pt, y: Number(e.target.value) };
                                setWpStructuralPoints(updated);
                              }}
                              className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[10px] text-text-primary"
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-[10px] text-text-tertiary uppercase">Depth</label>
                            <input
                              type="number"
                              value={pt.depthFt}
                              onChange={e => {
                                const updated = [...wpStructuralPoints];
                                updated[i] = { ...pt, depthFt: Number(e.target.value) };
                                setWpStructuralPoints(updated);
                              }}
                              className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[10px] text-text-primary"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                      <DataRow label="Crestal X" value={parseFloat(crestalResult.crestalX.toFixed(1))} unit="grid" precision={1} />
                      <DataRow label="Crestal Y" value={parseFloat(crestalResult.crestalY.toFixed(1))} unit="grid" precision={1} />
                      <DataRow label="Crestal Depth" value={crestalResult.crestalDepthFt} unit="ft" precision={0} />
                      <DataRow label="Quality" value={crestalResult.quality} unit="" precision={0} source="Childs et al. 2017" />
                      <div className="border-t border-border-subtle/30 pt-1 mt-1" />
                      <DataRow label="Nearest Fault" value={faultRisk.distanceToNearestFt} unit="ft" precision={0} />
                      <DataRow label="Fault Risk" value={faultRisk.riskCategory.toUpperCase()} unit="" precision={0} />
                      <DataRow label="Surface Score" value={surfaceEval.clearanceScore} unit="/100" precision={0} />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── 2. TRAJECTORY DESIGN ─── */}
              {wpSubTab === 'trajectory' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="industry-card p-4 xl:col-span-2">
                    <SectionHeader title="Wellbore Trajectory Profile" subtitle="Constant curve build + tangent section" />
                    <TrajectoryProfile
                      trajectory={trajectory}
                      formationTops={stratigraphy.formationTops.map(ft => ({ name: ft.name, depthFt: ft.depthTvdFt, color: ft.porosityFraction > 0.2 ? '#f59e0b' : '#6366f1' }))}
                    />
                  </div>
                  <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                    <SectionHeader title="Trajectory Parameters" subtitle="BHA & borehole design" />
                    <div className="flex gap-2 mb-3">
                      {(['vertical', 'deviated', 'horizontal'] as WellTrajectoryType[]).map(t => (
                        <button
                          key={t}
                          onClick={() => setWpTrajectoryType(t)}
                          className={cn(
                            "flex-1 py-1 rounded text-[11px] font-bold uppercase",
                            wpTrajectoryType === t ? "bg-brand-primary text-white" : "bg-app-bg text-text-tertiary border border-border-subtle"
                          )}
                        >{t}</button>
                      ))}
                    </div>
                    <InputWithSlider label="KOP Depth" value={wpKOP} min={500} max={10000} step={100} unit="ft" onChange={setWpKOP} />
                    <InputWithSlider label="Build Rate" value={wpBuildRate} min={0.5} max={6} step={0.1} unit="°/100ft" onChange={setWpBuildRate} />
                    <InputWithSlider label="Target TVD" value={wpTargetTVD} min={3000} max={25000} step={100} unit="ft" onChange={setWpTargetTVD} />
                    <InputWithSlider label="Tangent Angle" value={wpTangentAngle} min={5} max={85} step={1} unit="deg" onChange={setWpTangentAngle} />
                    {wpTrajectoryType === 'horizontal' && (
                      <InputWithSlider label="Horizontal Section" value={wpHorizontalTarget} min={500} max={10000} step={100} unit="ft" onChange={setWpHorizontalTarget} />
                    )}
                    <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1 mt-4">
                      <DataRow label="Total MD" value={trajectory.totalMeasuredDepthFt} unit="ft" precision={0} />
                      <DataRow label="Departure" value={trajectory.targetDepartureFt} unit="ft" precision={0} />
                      <DataRow label="Build Section" value={(trajectory.tangentAngleDeg / wpBuildRate * 100).toFixed(0)} unit="ft" precision={0} />
                      <DataRow label="Horizontal" value={trajectory.horizontalSectionFt} unit="ft" precision={0} />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── 3. STRATIGRAPHY PROGNOSIS ─── */}
              {wpSubTab === 'stratigraphy' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="industry-card p-4 xl:col-span-2">
                    <SectionHeader title="Prognosed Stratigraphic Column" subtitle="From seismic velocity model & Gardner density" />
                    <StratigraphyColumnSVG prognosis={stratigraphy} />
                  </div>
                  <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                    <SectionHeader title="Velocity Model" subtitle="Dix interval velocities" />
                    <InputWithSlider label="Seismic Confidence" value={wpSeismicConfidence} min={0.1} max={1.0} step={0.05} unit="" onChange={setWpSeismicConfidence} />
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {wpVelocityLayers.map((layer, i) => (
                        <div key={i} className="bg-app-bg border border-border-subtle rounded p-2 text-[10px]">
                          <div className="font-bold text-text-primary">{layer.formationName}</div>
                          <div className="grid grid-cols-3 gap-1 mt-1">
                            <div>
                              <label className="text-[10px] text-text-tertiary">Vel</label>
                              <input
                                type="number"
                                value={layer.intervalVelocityFtPerS}
                                onChange={e => {
                                  const updated = [...wpVelocityLayers];
                                  updated[i] = { ...layer, intervalVelocityFtPerS: Number(e.target.value) };
                                  setWpVelocityLayers(updated);
                                }}
                                className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[11px] text-text-primary"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-text-tertiary">Thk</label>
                              <input
                                type="number"
                                value={layer.thicknessFt}
                                onChange={e => {
                                  const updated = [...wpVelocityLayers];
                                  updated[i] = { ...layer, thicknessFt: Number(e.target.value) };
                                  setWpVelocityLayers(updated);
                                }}
                                className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[11px] text-text-primary"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-text-tertiary">Φ</label>
                              <input
                                type="number"
                                value={layer.porosity}
                                step={0.01}
                                onChange={e => {
                                  const updated = [...wpVelocityLayers];
                                  updated[i] = { ...layer, porosity: Number(e.target.value) };
                                  setWpVelocityLayers(updated);
                                }}
                                className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[11px] text-text-primary"
                              />
                            </div>
                          </div>
                          <div className="text-[11px] text-text-secondary mt-1">{layer.lithology} | Top: {stratigraphy.formationTops[i]?.depthTvdFt.toFixed(0)} ft</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                      <DataRow label="Confidence" value={stratigraphy.prognosisConfidence * 100} unit="%" precision={0} />
                      <DataRow label="Markers" value={stratigraphy.keyMarkerBeds.length} unit="beds" precision={0} />
                      <DataRow label="Hazards" value={stratigraphy.drillingHazards.length} unit="identified" precision={0} />
                    </div>
                    {stratigraphy.drillingHazards.length > 0 && (
                      <div className="bg-red-900/20 border border-red-800/40 rounded p-2">
                        <p className="text-[11px] text-red-400 font-bold uppercase mb-1">Drilling Hazards</p>
                        {stratigraphy.drillingHazards.map((h, i) => (
                          <p key={i} className="text-[10px] text-red-300 leading-relaxed">⚠ {h}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── 4. PORE PRESSURE & FRACTURE GRADIENT ─── */}
              {wpSubTab === 'pore_pressure' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="industry-card p-4 xl:col-span-2">
                    <SectionHeader title="Pore Pressure & Fracture Gradient" subtitle="Eaton (1975) + Matthews & Kelly (1967)" />
                    <PorePressureChart profile={porePressureProfile} />
                  </div>
                  <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                    <SectionHeader title="Eaton Parameters" subtitle="Compaction-based prediction" />
                    <InputWithSlider label="NCT Velocity" value={wpNCT} min={5000} max={15000} step={100} unit="ft/s" onChange={setWpNCT} />
                    <InputWithSlider label="Eaton Exponent" value={wpEatonExp} min={0.5} max={3.0} step={0.05} unit="n" onChange={setWpEatonExp} />
                    <InputWithSlider label="OB Gradient" value={wpOBGradient} min={0.7} max={1.2} step={0.01} unit="psi/ft" onChange={setWpOBGradient} />
                    <InputWithSlider label="Poisson's Ratio" value={wpPoissonsRatio} min={0.15} max={0.45} step={0.01} unit="ν" onChange={setWpPoissonsRatio} />
                    <InputWithSlider label="Max Depth" value={wpMaxDepth} min={5000} max={30000} step={500} unit="ft" onChange={setWpMaxDepth} />
                    <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1 mt-2">
                      <DataRow label="Max PP" value={maxPP} unit="ppg" precision={1} />
                      <DataRow label="Max FG" value={maxFG} unit="ppg" precision={1} />
                      <DataRow label="Mud Window" value={maxFG - maxPP} unit="ppg" precision={1} />
                      <DataRow label="Confidence" value={porePressureProfile.prognosisConfidence * 100} unit="%" precision={0} />
                    </div>
                    {porePressureProfile.shallowHazards.length > 0 && (
                      <div className="bg-amber-900/20 border border-amber-800/40 rounded p-2">
                        <p className="text-[11px] text-amber-400 font-bold uppercase mb-1">Shallow Hazards</p>
                        {porePressureProfile.shallowHazards.map((h, i) => (
                          <p key={i} className="text-[10px] text-amber-300">⚠ {h}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── 5. CASING DESIGN ─── */}
              {wpSubTab === 'casing' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="industry-card p-4 xl:col-span-2">
                    <SectionHeader title="Casing Schematic" subtitle="API 5C3 burst/collapse — Von Mises triaxial" />
                    <CasingSchematic casingProgram={casingProgram} />
                  </div>
                  <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                    <SectionHeader title="Shoe Depths" subtitle="Set minimum shoe depths" />
                    <InputWithSlider label="Conductor Shoe" value={wpConductorDepth} min={100} max={1000} step={50} unit="ft" onChange={setWpConductorDepth} />
                    <InputWithSlider label="Surface Shoe" value={wpSurfaceDepth} min={1000} max={8000} step={100} unit="ft" onChange={setWpSurfaceDepth} />
                    <InputWithSlider label="Interm. Shoe" value={wpIntermediateDepth} min={3000} max={18000} step={100} unit="ft" onChange={setWpIntermediateDepth} />
                    <InputWithSlider label="Production Shoe" value={wpProductionDepth} min={5000} max={30000} step={100} unit="ft" onChange={setWpProductionDepth} />
                    <InputWithSlider label="Design Factor" value={wpDesignFactor} min={1.0} max={1.5} step={0.01} unit="" onChange={setWpDesignFactor} />
                    <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                      <DataRow label="Total Cost" value={casingProgram.totalCasingCostUsd} unit="USD" precision={0} source="API 5C3" />
                      {casingProgram.strings.map((s, i) => (
                        <div key={i} className="border-t border-border-subtle/30 pt-1 mt-1">
                          <div className="text-[11px] text-brand-primary font-bold">{s.name}</div>
                          <DataRow label="OD" value={s.odIn} unit="in" precision={2} />
                          <DataRow label="Grade" value={s.grade} unit="" precision={0} />
                          <DataRow label="Weight" value={s.weightLbPerFt} unit="lb/ft" precision={0} />
                          <DataRow label="Burst" value={s.burstRatingPsi} unit="psi" precision={0} />
                          <DataRow label="Collapse" value={s.collapseRatingPsi} unit="psi" precision={0} />
                          <DataRow label="Drift" value={s.driftIn} unit="in" precision={2} />
                          <DataRow label="SF Burst" value={casingProgram.triaxialSafetyFactors[i]?.burst || 0} unit="" precision={2} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── 6. MUD WEIGHT PROGRAM ─── */}
              {wpSubTab === 'mud' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="industry-card p-4">
                    <SectionHeader title="Mud Weight Schedule" subtitle="ECD, yield point, wellbore stability" />
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="text-text-tertiary uppercase text-[11px]">
                            <th className="text-left py-1 px-2">Section</th>
                            <th className="text-right py-1 px-2">From</th>
                            <th className="text-right py-1 px-2">To</th>
                            <th className="text-right py-1 px-2">MW</th>
                            <th className="text-right py-1 px-2">ECD</th>
                            <th className="text-center py-1 px-2">Stability</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mudSchedule.map((s, i) => (
                            <tr key={i} className="border-t border-border-subtle/20">
                              <td className="py-1 px-2 text-text-primary font-bold">{s.section}</td>
                              <td className="py-1 px-2 text-right text-text-secondary">{s.depthFromFt.toFixed(0)}</td>
                              <td className="py-1 px-2 text-right text-text-secondary">{s.depthToFt.toFixed(0)}</td>
                              <td className="py-1 px-2 text-right text-brand-primary data-mono">{s.mudWeightPpg.toFixed(1)}</td>
                              <td className="py-1 px-2 text-right text-text-secondary">{s.ecdPpg.toFixed(1)}</td>
                              <td className={cn(
                                "py-1 px-2 text-center font-bold text-[11px]",
                                s.wellboreStability === 'stable' ? 'text-green-400' : s.wellboreStability === 'moderate' ? 'text-amber-400' : 'text-red-400'
                              )}>{s.wellboreStability}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                    <SectionHeader title="Mud Properties" subtitle="Per section details" />
                    {mudSchedule.map((s, i) => (
                      <div key={i} className="bg-app-bg border border-border-subtle rounded p-3">
                        <div className="text-[10px] text-brand-primary font-bold upppercase">{s.section}</div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                          <DataRow label="Mud Weight" value={s.mudWeightPpg} unit="ppg" precision={1} />
                          <DataRow label="ECD" value={s.ecdPpg} unit="ppg" precision={1} />
                          <DataRow label="Yield Point" value={s.yieldPointLbPer100ft2} unit="lb/100ft²" precision={0} />
                          <DataRow label="PV" value={s.plasticViscosityCp} unit="cP" precision={0} />
                          <div className="col-span-2">
                            <DataRow label="Inhibitor" value={s.recommendedInhibitor} unit="" precision={0} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── 7. LOGGING PROGRAM ─── */}
              {wpSubTab === 'logging' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="industry-card p-4 xl:col-span-2">
                    <SectionHeader title="Wireline Logging Program" subtitle="Quad-combo + specialty tools" />
                    <LoggingProgramSVG logProgram={loggingProgram} />
                  </div>
                  <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                    <SectionHeader title="Logging Parameters" />
                    <InputWithSlider label="Top Depth" value={wpLogTVDTop} min={0} max={5000} step={100} unit="ft" onChange={setWpLogTVDTop} />
                    <InputWithSlider label="Base Depth" value={wpLogTVDBase} min={2000} max={30000} step={100} unit="ft" onChange={setWpLogTVDBase} />
                    <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                      <DataRow label="Total Cost" value={loggingProgram.totalCostUsd} unit="USD" precision={0} />
                      <DataRow label="Run Days" value={loggingProgram.totalRunDays} unit="days" precision={1} />
                      <DataRow label="Interval" value={loggingProgram.depthIntervalTopFt} unit="ft" precision={0} suffix={` — ${loggingProgram.depthIntervalBaseFt} ft`} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-text-tertiary uppercase font-bold">Risks</p>
                      {loggingProgram.operationalRisks.map((r, i) => (
                        <p key={i} className="text-[10px] text-amber-400">⚠ {r}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── 8. CORING & SAMPLING ─── */}
              {wpSubTab === 'coring' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="industry-card p-4 xl:col-span-2">
                    <SectionHeader title="Coring & Fluid Sampling Plan" subtitle="Conventional, sidewall, & pressure coring" />
                    <CoringSamplingSVG
                      coreIntervals={coringProgram.intervals || []}
                      samplePoints={[]}
                      maxDepthFt={wpProductionDepth}
                    />
                  </div>
                  <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                    <SectionHeader title="Coring Intervals" />
                    {wpCoringIntervals.map((ci, i) => (
                      <div key={i} className="bg-app-bg border border-border-subtle rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[11px] text-brand-primary font-bold uppercase">Interval {i + 1}</span>
                          <select
                            value={ci.coreType}
                            onChange={e => {
                              const updated = [...wpCoringIntervals];
                              updated[i] = { ...ci, coreType: e.target.value as any };
                              setWpCoringIntervals(updated);
                            }}
                            className="bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[11px] text-text-primary"
                          >
                            <option value="conventional">Conventional</option>
                            <option value="sidewall">Sidewall</option>
                            <option value="pressure">Pressure</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <label className="text-[10px] text-text-tertiary uppercase">Top</label>
                            <input
                              type="number"
                              value={ci.depthTopFt}
                              onChange={e => {
                                const updated = [...wpCoringIntervals];
                                updated[i] = { ...ci, depthTopFt: Number(e.target.value) };
                                setWpCoringIntervals(updated);
                              }}
                              className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[11px] text-text-primary"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-text-tertiary uppercase">Base</label>
                            <input
                              type="number"
                              value={ci.depthBaseFt}
                              onChange={e => {
                                const updated = [...wpCoringIntervals];
                                updated[i] = { ...ci, depthBaseFt: Number(e.target.value) };
                                setWpCoringIntervals(updated);
                              }}
                              className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[11px] text-text-primary"
                            />
                          </div>
                        </div>
                        <input
                          type="text"
                          value={ci.objective}
                          onChange={e => {
                            const updated = [...wpCoringIntervals];
                            updated[i] = { ...ci, objective: e.target.value };
                            setWpCoringIntervals(updated);
                          }}
                          className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[11px] text-text-primary mt-1"
                          placeholder="Objective..."
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => setWpCoringIntervals([...wpCoringIntervals, { depthTopFt: 5000, depthBaseFt: 5060, coreType: 'conventional', objective: 'New interval' }])}
                      className="text-[11px] text-brand-primary hover:text-brand-primary/80 uppercase font-bold"
                    >+ Add Interval</button>
                    <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                      <DataRow label="Total Length" value={wpCoringIntervals.reduce((s, ci) => s + (ci.depthBaseFt - ci.depthTopFt), 0)} unit="ft" precision={0} />
                      <DataRow label="Avg Recovery" value={wpCoringIntervals.length > 0 ? wpCoringIntervals.reduce((s, ci) => s + (ci.coreType === 'conventional' ? 90 : ci.coreType === 'sidewall' ? 70 : 95), 0) / wpCoringIntervals.length : 0} unit="%" precision={0} />
                      <DataRow label="Cost" value={coringProgram.totalCostUsd} unit="USD" precision={0} />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── 9. AFE COST BREAKDOWN ─── */}
              {wpSubTab === 'afe' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="industry-card p-4">
                    <SectionHeader title="AFE Cost Breakdown" subtitle="Tangible, intangible, services & contingency" />
                    <AFECostBreakdownSVG afe={afe} />
                  </div>
                  <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                    <SectionHeader title="AFE Parameters" />
                    <InputWithSlider label="Spread Rate" value={wpSpreadRate} min={50000} max={1000000} step={10000} unit="USD/day" onChange={setWpSpreadRate} />
                    <InputWithSlider label="Dry Hole Days" value={wpDryHoleDays} min={10} max={180} step={1} unit="days" onChange={setWpDryHoleDays} />
                    <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                      <DataRow label="Total AFE" value={afe.totalCostUsd} unit="USD" precision={0} />
                      <DataRow label="Dry Hole Cost" value={afe.dryHoleCostUsd} unit="USD" precision={0} />
                      <DataRow label="Contingency" value={afe.contingencyPct} unit="%" precision={1} suffix={` ($${(afe.contingencyUsd / 1e6).toFixed(1)}M)`} />
                      <DataRow label="Drilling Days" value={afe.drillingDays} unit="days" precision={0} />
                      <DataRow label="Casing Cost" value={casingProgram.totalCasingCostUsd} unit="USD" precision={0} />
                      <DataRow label="Logging Cost" value={loggingProgram.totalCostUsd} unit="USD" precision={0} />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── 10. RISK ASSESSMENT ─── */}
              {wpSubTab === 'risk' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="industry-card p-4 xl:col-span-2">
                    <SectionHeader title="Risk Matrix" subtitle="Probability × Consequence = Risk Score" />
                    <RiskMatrixSVG assessment={riskAssessment} />
                  </div>
                  <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                    <SectionHeader title="Risk Parameters" />
                    <InputWithSlider label="Pg (Geological)" value={wpRiskPg} min={0.05} max={0.95} step={0.01} unit="" onChange={setWpRiskPg} />
                    <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                      <DataRow label="Overall Risk" value={riskAssessment.overallRiskScore} unit="/25" precision={0} />
                      <DataRow label="Probability" value={riskAssessment.probabilityOfSuccess * 100} unit="%" precision={1} />
                      <DataRow label="Certainty" value={riskAssessment.certaintyBand} unit="" precision={0} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-text-tertiary uppercase font-bold">Top Risks</p>
                      {riskAssessment.topRisks.slice(0, 5).map((r, i) => (
                        <div key={i} className={cn(
                          "bg-app-bg border rounded p-2 text-[11px]",
                          r.riskLevel === 'extreme' ? 'border-red-800/50' : r.riskLevel === 'high' ? 'border-amber-800/50' : 'border-border-subtle'
                        )}>
                          <div className="flex justify-between">
                            <span className="text-text-primary font-bold">{r.description.slice(0, 40)}...</span>
                            <span className={cn(
                              "font-bold",
                              r.riskLevel === 'extreme' ? 'text-red-400' : r.riskLevel === 'high' ? 'text-amber-400' : 'text-green-400'
                            )}>{r.riskLevel.toUpperCase()}</span>
                          </div>
                          <div className="text-text-secondary mt-0.5">Score: {r.riskScore} → Residual: {r.residualScore} | {r.mitigation.slice(0, 50)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── 11. FID DECISION TREE ─── */}
              {wpSubTab === 'decision_tree' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="industry-card p-4 xl:col-span-2">
                    <SectionHeader title="FID Decision Tree" subtitle="EMV Analysis — Drill vs Defer vs Farm-out vs Drop" />
                    <DecisionTreeSVG fid={fidResult} />
                  </div>
                  <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                    <SectionHeader title="Economic Parameters" />
                    <InputWithSlider label="Oil Price" value={wpOilPrice} min={30} max={150} step={1} unit="USD/bbl" onChange={setWpOilPrice} />
                    <InputWithSlider label="WACC" value={wpWacc} min={5} max={20} step={0.5} unit="%" onChange={setWpWacc} />
                    <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                      <DataRow label="Recommendation" value={fidResult.recommendation.toUpperCase()} unit="" precision={0} />
                      <DataRow label="EMV" value={fidResult.emvUsd} unit="USD" precision={0} />
                      <DataRow label="Expected NPV" value={fidResult.expectedNpvUsd} unit="USD" precision={0} />
                      <DataRow label="IRR" value={fidResult.irrPct} unit="%" precision={1} />
                      <DataRow label="VoI" value={fidResult.voIUsd} unit="USD" precision={0} />
                      <DataRow label="Hurdle Rate" value={fidResult.hurdleRatePct} unit="%" precision={1} />
                      <DataRow label="Confidence" value={fidResult.confidenceLevel.toUpperCase()} unit="" precision={0} />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── 12. REGULATORY READINESS ─── */}
              {wpSubTab === 'regulatory' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="industry-card p-4 xl:col-span-2">
                    <SectionHeader title="Regulatory Timeline" subtitle="BSEE 30 CFR 250 — NEPA compliance tracking" />
                    <RegulatoryTimelineSVG status={regulatory} />
                  </div>
                  <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                    <SectionHeader title="Jurisdiction" />
                    <select
                      value={wpJurisdiction}
                      onChange={e => setWpJurisdiction(e.target.value)}
                      className="w-full bg-app-bg border border-border-subtle rounded px-3 py-2 text-[11px] text-text-primary"
                    >
                      <option>US GoM (Federal Waters)</option>
                      <option>UK North Sea</option>
                      <option>Norway NCS</option>
                      <option>Gulf of Thailand</option>
                      <option>West Africa Deepwater</option>
                    </select>
                    <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                      <DataRow label="Jurisdiction" value={regulatory.jurisdiction} unit="" precision={0} />
                      <DataRow label="NEPA Level" value={regulatory.environmentalAssessment} unit="" precision={0} />
                      <DataRow label="Compliance" value={regulatory.complianceScore} unit="/100" precision={0} />
                      <DataRow label="Timeline" value={regulatory.permitTimelineDays} unit="days" precision={0} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-text-tertiary uppercase font-bold">Permits Required</p>
                      {regulatory.permitsRequired.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px]">
                          <span className={cn(
                            "w-3 h-3 rounded-full shrink-0",
                            regulatory.permitsObtained.includes(p) ? 'bg-green-500' : 'bg-amber-500'
                          )} />
                          <span className="text-text-primary">{p}</span>
                        </div>
                      ))}
                    </div>
                    {regulatory.outstandingRequirements.length > 0 && (
                      <div className="bg-red-900/20 border border-red-800/40 rounded p-2">
                        <p className="text-[11px] text-red-400 font-bold uppercase mb-1">Outstanding</p>
                        {regulatory.outstandingRequirements.map((r, i) => (
                          <p key={i} className="text-[10px] text-red-300">• {r}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}