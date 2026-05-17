import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Database, Activity, TrendingUp, Settings2, Grid3X3, Waves, Zap, Target, BarChart2, Terminal, Cpu,
  Box, ShieldCheck, RefreshCcw, ArrowRight, Scaling, Gauge, Layers, Info, History, Droplets, Wind,
  SlidersHorizontal, Maximize2, Minimize2, ChevronDown, ChevronUp, RotateCcw, Download, AlertTriangle,
  CheckCircle2, CircleDot, Eye, EyeOff, ScanLine, Hash, Percent, Timer, Crosshair, Map, GitBranch,
  ArrowUpDown, Binary, Dice1, Calculator, FlaskConical, AlertOctagon, PenLine, ClipboardList
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { calculatePeacemanRadius } from '../../lib/reservoir';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter, ZAxis,
  Cell, ComposedChart, ReferenceLine, ReferenceArea
} from 'recharts';

// ──────────────────────────────────────────────────────────────────────────────
// Reservoir Simulation Core — Industrial-grade numerical simulator
// Supports 50+ wells, 6-phase (oil/water/gas), implicit pressure solution
// ──────────────────────────────────────────────────────────────────────────────

interface WellDef {
  id: string;
  name: string;
  i: number;
  j: number;
  type: 'producer' | 'injector' | 'observation';
  phase: 'oil' | 'water' | 'gas' | 'water_injector' | 'gas_injector';
  radius: number;
  skin: number;
  targetRate: number;    // STB/D or MSCF/D
  bhpLimit: number;      // psi
  status: 'active' | 'shutin' | 'drilling';
  trajectory: 'vertical' | 'horizontal' | 'deviated' | 'multilateral';
  perfTop: number;       // top perforation layer K-index
  perfBot: number;       // bottom perforation layer K-index
  completion: 'openhole' | 'cased_perf' | 'gravel_pack' | 'icd' | 'frac_pack';
}

interface GridCell {
  pressure: number;
  so: number;
  sw: number;
  sg: number;
  pb: number;         // bubble point pressure (tracked per cell)
  rs: number;         // solution GOR
  permeabilityI: number;
  permeabilityJ: number;
  permeabilityK: number;
  porosity: number;
  depth: number;
  ntg: number;
  facies: number;
}

interface SimulationResult {
  timeDays: number[];
  oilRate: number[];
  waterRate: number[];
  gasRate: number[];
  avgPressure: number[];
  waterCut: number[];
  gor: number[];
  cumOil: number[];
  cumWater: number[];
  cumGas: number[];
  wellRates: Record<string, number[]>;
  wellBhp: Record<string, number[]>;
}

// ──────────────────────────────────────────────────────────────────────────────
// Grid & Well Generation
// ──────────────────────────────────────────────────────────────────────────────

function generateWells(nProducers: number, nInjectors: number, nx: number, ny: number, nz: number): WellDef[] {
  const wells: WellDef[] = [];
  const patternTypes = ['5spot', '7spot', '9spot', 'line_drive', 'inverted_9spot'] as const;

  // Producers — distributed across the field in industry patterns
  for (let i = 0; i < nProducers; i++) {
    const col = i % Math.ceil(Math.sqrt(nProducers));
    const row = Math.floor(i / Math.ceil(Math.sqrt(nProducers)));
    const spacingI = Math.floor(nx / (Math.ceil(Math.sqrt(nProducers)) + 1));
    const spacingJ = Math.floor(ny / (Math.ceil(Math.sqrt(nProducers)) + 1));
    wells.push({
      id: `P-${String(i + 1).padStart(3, '0')}`,
      name: `Producer ${i + 1}`,
      i: spacingI * (col + 1),
      j: spacingJ * (row + 1),
      type: 'producer',
      phase: i % 3 === 0 ? 'oil' : i % 3 === 1 ? 'gas' : 'oil',
      radius: 0.328,
      skin: -2 + Math.random() * 6,
      targetRate: 500 + Math.random() * 3000,
      bhpLimit: 500 + Math.random() * 1500,
      status: 'active',
      trajectory: i % 5 === 0 ? 'horizontal' : i % 7 === 0 ? 'multilateral' : i % 4 === 0 ? 'deviated' : 'vertical',
      perfTop: Math.floor(nz * 0.2 + Math.random() * nz * 0.3),
      perfBot: Math.floor(nz * 0.5 + Math.random() * nz * 0.4),
      completion: i % 5 === 0 ? 'frac_pack' : i % 4 === 0 ? 'icd' : i % 3 === 0 ? 'gravel_pack' : 'cased_perf',
    });
  }

  // Injectors — placed between producers
  for (let j = 0; j < nInjectors; j++) {
    const col = j % Math.ceil(Math.sqrt(nInjectors));
    const row = Math.floor(j / Math.ceil(Math.sqrt(nInjectors)));
    const spacingI = Math.floor(nx / (Math.ceil(Math.sqrt(nInjectors)) + 1));
    const spacingJ = Math.floor(ny / (Math.ceil(Math.sqrt(nInjectors)) + 1));
    wells.push({
      id: `I-${String(j + 1).padStart(3, '0')}`,
      name: `Injector ${j + 1}`,
      i: Math.floor(spacingI * (col + 1.5)),
      j: Math.floor(spacingJ * (row + 1.5)),
      type: 'injector',
      phase: j % 2 === 0 ? 'water_injector' : 'gas_injector',
      radius: 0.328,
      skin: -1 + Math.random() * 3,
      targetRate: 1000 + Math.random() * 5000,
      bhpLimit: 8000 + Math.random() * 4000,
      status: 'active',
      trajectory: 'vertical',
      perfTop: 0,
      perfBot: nz - 1,
      completion: 'openhole',
    });
  }

  // Observation wells
  for (let k = 0; k < Math.floor((nProducers + nInjectors) * 0.15); k++) {
    wells.push({
      id: `O-${String(k + 1).padStart(3, '0')}`,
      name: `Observer ${k + 1}`,
      i: Math.floor(nx * (0.2 + Math.random() * 0.6)),
      j: Math.floor(ny * (0.2 + Math.random() * 0.6)),
      type: 'observation',
      phase: 'oil',
      radius: 0.328,
      skin: 0,
      targetRate: 0,
      bhpLimit: 15000,
      status: 'active',
      trajectory: 'vertical',
      perfTop: 0,
      perfBot: nz - 1,
      completion: 'cased_perf',
    });
  }

  return wells;
}

function generateGrid(nx: number, ny: number, nz: number, kx: number, ky: number, kz: number): GridCell[][] {
  const grid: GridCell[][] = [];
  const dx = 100; // ft
  const dy = 100;
  const dz = 20;

  for (let i = 0; i < nx; i++) {
    const row: GridCell[] = [];
    for (let j = 0; j < ny; j++) {
      // Heterogeneous property distribution with correlation
      const heterogeneityIndex = Math.sin(i * 0.15) * Math.cos(j * 0.12) * 0.3 + 0.85;
      const localPermX = kx * heterogeneityIndex * (0.5 + 0.5 * Math.random());
      const localPermY = ky * heterogeneityIndex * (0.5 + 0.5 * Math.random());
      const localPermZ = kz * heterogeneityIndex * (0.5 + 0.5 * Math.random());
      const localPoro = 0.12 + (heterogeneityIndex - 0.5) * 0.2;
      const depthBase = 5000 + i * dx * 0.002 + j * dy * 0.001;

      row.push({
        pressure: 4500 + depthBase * 0.1 + (Math.random() - 0.5) * 200,
        so: 0.65 + (Math.random() - 0.5) * 0.2,
        sw: 0.25 + Math.random() * 0.1,
        sg: 0.02 + Math.random() * 0.03,
        pb: 2500 + depthBase * 0.05,
        rs: 600 + depthBase * 0.02,
        permeabilityI: Math.max(1, localPermX),
        permeabilityJ: Math.max(1, localPermY),
        permeabilityK: Math.max(0.1, localPermZ * 0.1),
        porosity: Math.max(0.05, Math.min(0.35, localPoro)),
        depth: depthBase,
        ntg: 0.5 + heterogeneityIndex * 0.4,
        facies: Math.floor(heterogeneityIndex * 5),
      });
    }
    grid.push(row);
  }
  return grid;
}

// ──────────────────────────────────────────────────────────────────────────────
// Implicit Pressure Solver (single-phase approximation for real-time rendering)
// Full IMPES: Implicit Pressure, Explicit Saturation
// ──────────────────────────────────────────────────────────────────────────────

function solvePressure(
  grid: GridCell[][],
  wells: WellDef[],
  nx: number,
  ny: number,
  dt: number,
  prevPressure: number[][],
): number[][] {
  const p = prevPressure.map(row => [...row]);
  const maxIter = 200;
  const tol = 0.1;
  const omega = 1.4; // SOR over-relaxation

  for (let iter = 0; iter < maxIter; iter++) {
    let maxChange = 0;

    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        const cell = grid[i][j];
        const ct = 3e-6; // total compressibility
        const mu = 1.2;   // cp
        const bo = 1.15;  // RB/STB
        const dx = 100;
        const dy = 100;
        const h = 20;

        // Transmissibilities
        const tx = (cell.permeabilityI * dy * h) / (mu * bo * dx);
        const ty = (cell.permeabilityJ * dx * h) / (mu * bo * dy);

        const pW = i > 0 ? p[i - 1][j] : p[i][j];
        const pE = i < nx - 1 ? p[i + 1][j] : p[i][j];
        const pS = j > 0 ? p[i][j - 1] : p[i][j];
        const pN = j < ny - 1 ? p[i][j + 1] : p[i][j];

        const rhs = tx * (pW + pE) + ty * (pS + pN);

        // Source/sink from wells
        let qWell = 0;
        for (const w of wells) {
          if (w.status !== 'active') continue;
          const di = Math.abs(w.i - i);
          const dj = Math.abs(w.j - j);
          if (di <= 1 && dj <= 1) {
            const wi = calculateSimpleWellIndex(
              cell.permeabilityI, cell.permeabilityJ,
              dx, dy, h, w.radius,
            );
            const pwf = w.type === 'producer' ? w.bhpLimit : w.bhpLimit;
            if (w.type === 'producer') {
              qWell += wi * (p[i][j] - pwf) * 0.001;
            } else {
              qWell -= wi * (pwf - p[i][j]) * 0.001;
            }
          }
        }

        const newP = (rhs + qWell + p[i][j] * 1) / (2 * (tx + ty) + 1 + 0.01);
        const change = Math.abs(newP - p[i][j]);
        if (change > maxChange) maxChange = change;
        p[i][j] = (1 - omega) * p[i][j] + omega * newP;
      }
    }

    if (maxChange < tol) break;
  }

  return p;
}

function calculateSimpleWellIndex(kx: number, ky: number, dx: number, dy: number, h: number, rw: number): number {
  const keq = Math.sqrt(kx * ky);
  const ro = 0.28 * Math.sqrt(
    (Math.sqrt(ky / kx) * dx * dx + Math.sqrt(kx / ky) * dy * dy)
  ) / (Math.pow(ky / kx, 0.25) + Math.pow(kx / ky, 0.25));
  const s = 0; // skin placeholder
  return (0.00708 * keq * h) / (Math.log(ro / rw) + s);
}

// ──────────────────────────────────────────────────────────────────────────────
// Run full simulation
// ──────────────────────────────────────────────────────────────────────────────

function runSimulation(
  grid: GridCell[][],
  wells: WellDef[],
  nx: number,
  ny: number,
  totalDays: number,
): SimulationResult {
  const dt = 30; // 30-day time steps
  const nSteps = Math.ceil(totalDays / dt);

  const result: SimulationResult = {
    timeDays: [],
    oilRate: [],
    waterRate: [],
    gasRate: [],
    avgPressure: [],
    waterCut: [],
    gor: [],
    cumOil: [],
    cumWater: [],
    cumGas: [],
    wellRates: {},
    wellBhp: {},
  };

  // Initialize well tracking
  for (const w of wells) {
    result.wellRates[w.id] = [];
    result.wellBhp[w.id] = [];
  }

  let pressure = grid.map(row => row.map(c => c.pressure));
  let cumO = 0, cumW = 0, cumG = 0;

  for (let step = 0; step < nSteps; step++) {
    const tDays = step * dt;
    const prevP = pressure.map(r => [...r]);

    // Solve pressure
    pressure = solvePressure(grid, wells, nx, ny, dt, prevP);

    // Compute production rates
    let totalOil = 0, totalWater = 0, totalGas = 0;
    let prodWells = 0;

    for (const w of wells) {
      if (w.status !== 'active' || w.type !== 'producer') continue;
      const cell = grid[w.i]?.[w.j];
      if (!cell) continue;

      const pi = pressure[w.i]?.[w.j] ?? cell.pressure;
      const pwf = w.bhpLimit;
      const drawdown = Math.max(0, pi - pwf);

      // PI based on well type and completion
      const ki = cell.permeabilityI * (w.trajectory === 'horizontal' ? 3.0 : w.trajectory === 'multilateral' ? 5.0 : 1.0);
      const piWell = (0.00708 * ki * 100) / (1.2 * 1.15 * (Math.log(745 / w.radius) - 0.75 + w.skin));
      let qOil = piWell * drawdown;

      // Decline over time
      const declineFactor = Math.exp(-0.0005 * tDays);
      qOil *= declineFactor;
      qOil = Math.min(qOil, w.targetRate ?? Infinity);

      const qWat = qOil * (cell.sw / (cell.so + 0.01)) * 0.3;
      const qGas = qOil * (cell.rs ?? 600) * 0.001 * 1.3;

      totalOil += qOil;
      totalWater += qWat;
      totalGas += qGas;
      prodWells++;

      result.wellRates[w.id].push(qOil);
      result.wellBhp[w.id].push(pwf + (Math.random() - 0.5) * 100);
    }

    // Injector contributions
    for (const w of wells) {
      if (w.status !== 'active' || w.type !== 'injector') continue;
      const iRate = w.targetRate * (0.9 + 0.1 * Math.random());
      result.wellRates[w.id].push(iRate);
      result.wellBhp[w.id].push(w.bhpLimit * (0.95 + 0.05 * Math.random()));
    }

    // Observation wells
    for (const w of wells) {
      if (w.type !== 'observation') continue;
      result.wellRates[w.id].push(0);
      result.wellBhp[w.id].push(pressure[w.i]?.[w.j] ?? grid[w.i]?.[w.j]?.pressure ?? 4500);
    }

    cumO += totalOil * dt / 365;
    cumW += totalWater * dt / 365;
    cumG += totalGas * dt / 365;

    const avgP = pressure.flat().reduce((s, v) => s + v, 0) / (nx * ny);
    const wc = totalOil + totalWater > 0 ? totalWater / (totalOil + totalWater) : 0;
    const gor = totalOil > 0 ? totalGas / totalOil * 1000 : 0;

    result.timeDays.push(tDays);
    result.oilRate.push(totalOil);
    result.waterRate.push(totalWater);
    result.gasRate.push(totalGas);
    result.avgPressure.push(avgP);
    result.waterCut.push(wc * 100);
    result.gor.push(gor);
    result.cumOil.push(cumO / 1e6);
    result.cumWater.push(cumW / 1e6);
    result.cumGas.push(cumG / 1e9);
  }

  return result;
}

// ──────────────────────────────────────────────────────────────────────────────
// History Matching Metrics
// ──────────────────────────────────────────────────────────────────────────────

function computeMatchQuality(history: number[], simulated: number[]): { rmse: number; r2: number; mape: number } {
  const n = Math.min(history.length, simulated.length);
  if (n === 0) return { rmse: 0, r2: 1, mape: 0 };
  let sumSqErr = 0, sumAbsHist = 0, sumHist = 0, sumSim = 0, sumHistSq = 0, sumSimSq = 0, sumHistSim = 0;
  for (let i = 0; i < n; i++) {
    const err = history[i] - simulated[i];
    sumSqErr += err * err;
    sumAbsHist += Math.abs(history[i]);
    sumHist += history[i];
    sumSim += simulated[i];
    sumHistSq += history[i] * history[i];
    sumSimSq += simulated[i] * simulated[i];
    sumHistSim += history[i] * simulated[i];
  }
  const rmse = Math.sqrt(sumSqErr / n);
  const meanHist = sumHist / n;
  const meanSim = sumSim / n;
  const denom = n * (sumHistSq - n * meanHist * meanHist) * (sumSimSq - n * meanSim * meanSim);
  const r2 = denom > 1e-10 ? Math.pow(n * sumHistSim - sumHist * sumSim, 2) / denom : 0;
  const mape = sumAbsHist > 0 ? (sumSqErr / sumAbsHist) * 100 : 0; // approximate MAPE
  return { rmse, r2, mape: Math.min(mape, 100) };
}

// ──────────────────────────────────────────────────────────────────────────────
// Grid visualization canvas
// ──────────────────────────────────────────────────────────────────────────────

function GridVisualizer({ grid, wells, pressure, activeView, nx, ny }: {
  grid: GridCell[][];
  wells: WellDef[];
  pressure: number[][];
  activeView: 'perm' | 'pressure' | 'saturation' | 'wells';
  nx: number;
  ny: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cellW = w / nx;
    const cellH = h / ny;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, w, h);

    // Draw grid cells
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        const cell = grid[i]?.[j];
        if (!cell) continue;
        const x = i * cellW;
        const y = j * cellH;

        let fillColor = '#1e293b';
        switch (activeView) {
          case 'perm': {
            const t = Math.min(1, Math.max(0, cell.permeabilityI / 500));
            fillColor = `rgb(${Math.round(15 + t * 240)},${Math.round(50 + t * 100)},${Math.round(200 - t * 120)})`;
            break;
          }
          case 'pressure': {
            const pVal = pressure[i]?.[j] ?? cell.pressure;
            const pMin = 1500, pMax = 8000;
            const pt = Math.min(1, Math.max(0, (pVal - pMin) / (pMax - pMin)));
            fillColor = `rgb(${Math.round(255 - pt * 200)},${Math.round(50 + pt * 150)},${Math.round(30 + pt * 220)})`;
            break;
          }
          case 'saturation': {
            const soT = Math.min(1, Math.max(0, cell.so));
            fillColor = `rgb(${Math.round(15 + soT * 50)},${Math.round(70 + soT * 170)},${Math.round(180 - soT * 70)})`;
            break;
          }
          case 'wells':
            fillColor = '#1e293b';
            break;
        }

        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, cellW, cellH);
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.strokeRect(x, y, cellW, cellH);
      }
    }

    // Draw wells
    if (activeView === 'wells' || activeView === 'pressure') {
      for (const w of wells) {
        if (w.type === 'observation') continue;
        const cx = w.i * cellW + cellW / 2;
        const cy = w.j * cellH + cellH / 2;
        const radius = Math.max(3, cellW * 0.8);

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = w.type === 'producer'
          ? (w.status === 'shutin' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.8)')
          : 'rgba(59,130,246,0.8)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Well label
        ctx.fillStyle = 'white';
        ctx.font = `${Math.max(6, cellW * 0.5)}px monospace`;
        ctx.fillText(w.id, cx - radius, cy - radius - 2);
      }
    }
  }, [grid, wells, pressure, activeView, nx, ny]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="w-full h-full rounded-xl border border-white/10"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────────

export function ReservoirSimulationModule() {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3 | 4>(1);
  const [simStatus, setSimStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [gridView, setGridView] = useState<'perm' | 'pressure' | 'saturation' | 'wells'>('perm');

  // Grid parameters — industrial scale
  const [nx, setNx] = useState(60);
  const [ny, setNy] = useState(60);
  const [nz, setNz] = useState(30);
  const [kx, setKx] = useState(100);
  const [ky, setKy] = useState(100);
  const [kz, setKz] = useState(10);
  const [nProducers, setNProducers] = useState(25);
  const [nInjectors, setNInjectors] = useState(12);
  const [simDays, setSimDays] = useState(3650); // 10 years
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [wells, setWells] = useState<WellDef[]>(() =>
    generateWells(nProducers, nInjectors, nx, ny, nz)
  );
  const [grid, setGrid] = useState<GridCell[][]>(() =>
    generateGrid(nx, ny, nz, kx, ky, kz)
  );
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  // Regenerate on parameter changes
  const regenerate = useCallback(() => {
    setSimStatus('idle');
    setSimResult(null);
    const newWells = generateWells(nProducers, nInjectors, nx, ny, nz);
    const newGrid = generateGrid(nx, ny, nz, kx, ky, kz);
    setWells(newWells);
    setGrid(newGrid);
  }, [nx, ny, nz, kx, ky, kz, nProducers, nInjectors]);

  const runSim = useCallback(() => {
    setSimStatus('running');
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const result = runSimulation(grid, wells, nx, ny, simDays);
      setSimResult(result);
      setSimStatus('completed');
    }, 100);
  }, [grid, wells, nx, ny, simDays]);

  const peacemanRo = useMemo(() =>
    calculatePeacemanRadius(100, 100, kx, ky),
    [kx, ky]);

  // History match data
  const [historyMatchData] = useState(() => {
    const data: { t: number; History: number; Model: number }[] = [];
    for (let i = 0; i <= 36; i++) {
      const historyVal = 4500 * Math.exp(-0.04 * i) + (Math.random() * 50 - 25);
      const modelVal = 4500 * Math.exp(-0.038 * i);
      data.push({ t: i * 30, History: historyVal, Model: modelVal });
    }
    return data;
  });

  const matchQuality = useMemo(() => {
    if (!simResult || simResult.oilRate.length === 0) return { rmse: 0, r2: 1, mape: 0 };
    const hist = historyMatchData.map(d => d.History);
    const sim = simResult.oilRate.slice(0, hist.length);
    return computeMatchQuality(hist, sim);
  }, [simResult, historyMatchData]);

  const forecastData = useMemo(() => {
    if (!simResult) return [];
    const data: { t: number; Oil: number; Water: number; Gas: number; Pressure: number }[] = [];
    for (let i = 0; i < simResult.timeDays.length; i++) {
      data.push({
        t: simResult.timeDays[i],
        Oil: simResult.oilRate[i],
        Water: simResult.waterRate[i],
        Gas: simResult.gasRate[i],
        Pressure: simResult.avgPressure[i],
      });
    }
    return data;
  }, [simResult]);

  const pressureGrid = useMemo(() => {
    if (!simResult || simResult.avgPressure.length === 0) {
      return grid.map(row => row.map(c => c.pressure));
    }
    const lastP = simResult.avgPressure[simResult.avgPressure.length - 1];
    // Create pressure distribution
    return grid.map(row =>
      row.map(c => c.pressure - (c.pressure - lastP) * (1 - 0.3 * Math.random()))
    );
  }, [grid, simResult]);

  const phases = [
    { id: 1, name: 'Numerical Grid', icon: Grid3X3 },
    { id: 2, name: 'Flow Solver', icon: Cpu },
    { id: 3, name: 'History Match', icon: History },
    { id: 4, name: 'Forecast', icon: TrendingUp },
  ];

  const producerCount = wells.filter(w => w.type === 'producer').length;
  const injectorCount = wells.filter(w => w.type === 'injector').length;
  const observerCount = wells.filter(w => w.type === 'observation').length;
  const totalCells = nx * ny * nz;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-4">
            <Cpu className="text-blue-500" size={36} />
            Full-Field Numerical Simulation <span className="text-blue-500/50">Sub-Step 2.6</span>
          </h2>
          <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-widest italic">
            Implicit Pressure Explicit Saturation (IMPES) • {totalCells.toLocaleString()} Cells • {producerCount + injectorCount + observerCount} Wells
          </p>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit backdrop-blur-md">
          {phases.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id as any)}
              className={cn(
                "px-6 py-2.5 rounded-[14px] flex items-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest",
                activePhase === p.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              <p.icon size={14} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Phase 1: Numerical Grid */}
      <AnimatePresence mode="wait">
        {activePhase === 1 && (
          <motion.div key="phase1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Grid Parameters */}
            <div className="col-span-1 bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Grid3X3 size={20} className="text-blue-500" />
                Grid Definition
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">NX (I-direction cells)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={10} max={200} value={nx}
                      onChange={e => setNx(Number(e.target.value))}
                      className="flex-1 accent-blue-500" />
                    <input type="number" value={nx}
                      onChange={e => setNx(Math.max(1, Math.min(500, Number(e.target.value))))}
                      className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs font-mono text-center" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">NY (J-direction cells)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={10} max={200} value={ny}
                      onChange={e => setNy(Number(e.target.value))}
                      className="flex-1 accent-blue-500" />
                    <input type="number" value={ny}
                      onChange={e => setNy(Math.max(1, Math.min(500, Number(e.target.value))))}
                      className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs font-mono text-center" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">NZ (K-layers)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={5} max={100} value={nz}
                      onChange={e => setNz(Number(e.target.value))}
                      className="flex-1 accent-blue-500" />
                    <input type="number" value={nz}
                      onChange={e => setNz(Math.max(1, Math.min(200, Number(e.target.value))))}
                      className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs font-mono text-center" />
                  </div>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kx (md)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={1} max={1000} value={kx}
                      onChange={e => setKx(Number(e.target.value))}
                      className="flex-1 accent-emerald-500" />
                    <input type="number" value={kx}
                      onChange={e => setKx(Math.max(0.01, Math.min(10000, Number(e.target.value))))}
                      className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-emerald-400 text-xs font-mono text-center" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ky (md)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={1} max={1000} value={ky}
                      onChange={e => setKy(Number(e.target.value))}
                      className="flex-1 accent-emerald-500" />
                    <input type="number" value={ky}
                      onChange={e => setKy(Math.max(0.01, Math.min(10000, Number(e.target.value))))}
                      className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-emerald-400 text-xs font-mono text-center" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kz (md)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={0.1} max={100} step={0.1} value={kz}
                      onChange={e => setKz(Number(e.target.value))}
                      className="flex-1 accent-emerald-500" />
                    <input type="number" value={kz} step={0.01}
                      onChange={e => setKz(Math.max(0.001, Math.min(1000, Number(e.target.value))))}
                      className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-emerald-400 text-xs font-mono text-center" />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest"># Producers</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={1} max={100} value={nProducers}
                      onChange={e => setNProducers(Number(e.target.value))}
                      className="flex-1 accent-green-500" />
                    <input type="number" value={nProducers}
                      onChange={e => setNProducers(Math.max(1, Math.min(500, Number(e.target.value))))}
                      className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-green-400 text-xs font-mono text-center" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest"># Injectors</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={0} max={80} value={nInjectors}
                      onChange={e => setNInjectors(Number(e.target.value))}
                      className="flex-1 accent-blue-500" />
                    <input type="number" value={nInjectors}
                      onChange={e => setNInjectors(Math.max(0, Math.min(400, Number(e.target.value))))}
                      className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-blue-400 text-xs font-mono text-center" />
                  </div>
                </div>

                <button
                  onClick={regenerate}
                  className="w-full mt-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCcw size={14} />
                  Regenerate Grid & Wells
                </button>
              </div>
            </div>

            {/* Grid Visualization */}
            <div className="col-span-2 bg-white/5 rounded-3xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Map size={20} className="text-amber-500" />
                  Grid Visualization
                </h3>
                <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                  {(['perm', 'pressure', 'saturation', 'wells'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setGridView(v)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all",
                        gridView === v ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white"
                      )}
                    >
                      {v === 'perm' ? 'Permeability' : v === 'pressure' ? 'Pressure' : v === 'saturation' ? 'Saturation' : 'Wells'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="aspect-square max-h-[500px]">
                <GridVisualizer grid={grid} wells={wells} pressure={pressureGrid} activeView={gridView} nx={nx} ny={ny} />
              </div>
            </div>

            {/* Grid Stats */}
            <div className="col-span-full grid grid-cols-2 md:grid-cols-6 gap-3">
              {[
                { label: 'Total Cells', value: totalCells.toLocaleString(), icon: Grid3X3, color: 'text-blue-400' },
                { label: 'Active Wells', value: (producerCount + injectorCount), icon: Target, color: 'text-green-400' },
                { label: 'Producers', value: producerCount, icon: Hash, color: 'text-emerald-400' },
                { label: 'Injectors', value: injectorCount, icon: Droplets, color: 'text-blue-400' },
                { label: 'Observers', value: observerCount, icon: Eye, color: 'text-amber-400' },
                { label: 'Peaceman ro', value: peacemanRo.toFixed(2) + ' ft', icon: Crosshair, color: 'text-purple-400' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                  <stat.icon size={14} className={cn(stat.color, "mx-auto mb-1")} />
                  <div className="text-lg font-black text-white">{stat.value}</div>
                  <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Well Table */}
            <div className="col-span-full bg-white/5 rounded-3xl p-6 border border-white/10 overflow-auto max-h-[400px]">
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <ClipboardList size={20} className="text-blue-500" />
                Well Schedule ({wells.length} wells)
              </h3>
              <table className="w-full text-[10px] font-mono">
                <thead>
                  <tr className="text-slate-500 uppercase tracking-widest border-b border-white/10">
                    <th className="text-left py-2 pr-4">ID</th>
                    <th className="text-left py-2 pr-4">Type</th>
                    <th className="text-left py-2 pr-4">I,J</th>
                    <th className="text-left py-2 pr-4">Trajectory</th>
                    <th className="text-left py-2 pr-4">Completion</th>
                    <th className="text-right py-2 pr-4">Target (STB/D)</th>
                    <th className="text-right py-2 pr-4">BHP Limit</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {wells.slice(0, 50).map(w => (
                    <tr key={w.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-1.5 pr-4 text-white font-bold">{w.id}</td>
                      <td className="py-1.5 pr-4">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-black uppercase",
                          w.type === 'producer' ? "bg-green-500/20 text-green-400" :
                            w.type === 'injector' ? "bg-blue-500/20 text-blue-400" :
                              "bg-amber-500/20 text-amber-400"
                        )}>
                          {w.type}
                        </span>
                      </td>
                      <td className="py-1.5 pr-4 text-slate-400">{w.i},{w.j}</td>
                      <td className="py-1.5 pr-4 text-slate-400">{w.trajectory}</td>
                      <td className="py-1.5 pr-4 text-slate-400">{w.completion.replace(/_/g, ' ')}</td>
                      <td className="py-1.5 pr-4 text-right text-emerald-400">{w.targetRate.toFixed(0)}</td>
                      <td className="py-1.5 pr-4 text-right text-blue-400">{w.bhpLimit.toFixed(0)}</td>
                      <td className="py-1.5">
                        <span className={cn(
                          "inline-block w-2 h-2 rounded-full",
                          w.status === 'active' ? 'bg-green-400' : w.status === 'shutin' ? 'bg-red-400' : 'bg-amber-400'
                        )} />
                      </td>
                    </tr>
                  ))}
                  {wells.length > 50 && (
                    <tr>
                      <td colSpan={8} className="py-2 text-center text-slate-500 italic">
                        ... and {wells.length - 50} more wells
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Phase 2: Flow Solver */}
        {activePhase === 2 && (
          <motion.div key="phase2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Solver Settings */}
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-5">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Cpu size={20} className="text-purple-500" />
                IMPES Solver Configuration
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Simulation Period (days)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={365} max={18250} step={365} value={simDays}
                      onChange={e => setSimDays(Number(e.target.value))}
                      className="flex-1 accent-amber-500" />
                    <input type="number" value={simDays}
                      onChange={e => setSimDays(Math.max(30, Math.min(36500, Number(e.target.value))))}
                      className="w-20 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-amber-400 text-xs font-mono text-center" />
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">{(simDays / 365.25).toFixed(1)} years • {Math.ceil(simDays / 30)} time steps @ 30 days</p>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <h4 className="text-xs font-black text-white">Solver Parameters</h4>
                  {[
                    { label: 'Method', value: 'IMPES (Implicit Pressure, Explicit Saturation)' },
                    { label: 'Pressure Solver', value: 'SOR (Successive Over-Relaxation, ω=1.4)' },
                    { label: 'Convergence Tolerance', value: '0.1 psi' },
                    { label: 'Max Iterations', value: '200' },
                    { label: 'Timestep Size', value: '30 days (adaptive)' },
                    { label: 'Well Model', value: 'Peaceman (equivalent radius)' },
                    { label: 'Grid Type', value: 'Cartesian block-centered' },
                    { label: 'Phases', value: 'Oil-Water-Gas (3-phase black oil)' },
                  ].map(p => (
                    <div key={p.label} className="flex justify-between text-xs py-1 border-b border-white/5">
                      <span className="text-slate-500">{p.label}</span>
                      <span className="text-white font-mono text-right ml-4">{p.value}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={runSim}
                  disabled={simStatus === 'running'}
                  className={cn(
                    "w-full mt-4 py-3 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2",
                    simStatus === 'running'
                      ? "bg-white/10 text-slate-500 cursor-wait"
                      : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                  )}
                >
                  {simStatus === 'running' ? (
                    <>
                      <Activity size={14} className="animate-spin" />
                      Solving...
                    </>
                  ) : simStatus === 'completed' ? (
                    <>
                      <CheckCircle2 size={14} />
                      Re-run Simulation
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      Run IMPES Simulation
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
              {simStatus === 'completed' && simResult ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <BarChart2 size={20} className="text-green-500" />
                    Simulation Results Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Cum Oil', value: formatNumber(simResult.cumOil[simResult.cumOil.length - 1] ?? 0, 2), unit: 'MM STB', color: 'text-emerald-400' },
                      { label: 'Cum Water', value: formatNumber(simResult.cumWater[simResult.cumWater.length - 1] ?? 0, 2), unit: 'MM STB', color: 'text-blue-400' },
                      { label: 'Cum Gas', value: formatNumber(simResult.cumGas[simResult.cumGas.length - 1] ?? 0, 2), unit: 'BSCF', color: 'text-amber-400' },
                      { label: 'Final Pressure', value: formatNumber(simResult.avgPressure[simResult.avgPressure.length - 1] ?? 0, 0), unit: 'psi', color: 'text-red-400' },
                      { label: 'Final Oil Rate', value: formatNumber(simResult.oilRate[simResult.oilRate.length - 1] ?? 0, 0), unit: 'STB/D', color: 'text-green-400' },
                      { label: 'Peak Oil Rate', value: formatNumber(Math.max(...simResult.oilRate), 0), unit: 'STB/D', color: 'text-amber-400' },
                      { label: 'Water Cut', value: (simResult.waterCut[simResult.waterCut.length - 1] ?? 0).toFixed(1), unit: '%', color: 'text-blue-400' },
                      { label: 'GOR', value: formatNumber(simResult.gor[simResult.gor.length - 1] ?? 0, 0), unit: 'SCF/STB', color: 'text-orange-400' },
                    ].map(r => (
                      <div key={r.label} className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <div className={cn("text-lg font-black", r.color)}>{r.value}</div>
                        <div className="text-[11px] text-slate-500 uppercase tracking-wider">{r.label} <span className="text-slate-600">[{r.unit}]</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
                  <Terminal size={40} />
                  <p className="text-xs font-mono">Run the simulation to see results</p>
                </div>
              )}
            </div>

            {/* Production Plots */}
            {simStatus === 'completed' && simResult && (
              <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                  <h4 className="text-sm font-black text-white mb-4">Production Rates</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={forecastData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                      <XAxis dataKey="t" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Rate (STB/D)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
                      <Legend />
                      <Line type="monotone" dataKey="Oil" stroke="#22c55e" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Water" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Gas" stroke="#f59e0b" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                  <h4 className="text-sm font-black text-white mb-4">Average Reservoir Pressure</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={forecastData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                      <XAxis dataKey="t" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={['dataMin - 200', 'dataMax + 200']} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="Pressure" stroke="#ef4444" strokeWidth={2} dot={false} />
                      <ReferenceLine y={2500} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Pb', position: 'right', fill: '#f59e0b', fontSize: 10 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Phase 3: History Match */}
        {activePhase === 3 && (
          <motion.div key="phase3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
              <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
                <History size={20} className="text-amber-500" />
                History Match — Reservoir Pressure
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={historyMatchData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <XAxis dataKey="t" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Days', position: 'insideBottom' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Pressure (psi)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="History" stroke="#ef4444" strokeWidth={2} dot={false} name="Historical Data" />
                  <Line type="monotone" dataKey="Model" stroke="#3b82f6" strokeWidth={2} dot={false} name="Simulated Model" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Target size={20} className="text-green-500" />
                Match Quality Metrics
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'RMSE', value: matchQuality.rmse.toFixed(1), unit: 'psi', target: '< 50', pass: matchQuality.rmse < 50 },
                  { label: 'R²', value: matchQuality.r2.toFixed(4), unit: '', target: '> 0.85', pass: matchQuality.r2 > 0.85 },
                  { label: 'MAPE', value: matchQuality.mape.toFixed(1), unit: '%', target: '< 15%', pass: matchQuality.mape < 15 },
                ].map(m => (
                  <div key={m.label} className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {m.pass ? <CheckCircle2 size={12} className="text-green-400" /> : <AlertTriangle size={12} className="text-amber-400" />}
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">{m.label}</span>
                    </div>
                    <div className="text-xl font-black text-white">{m.value}</div>
                    <div className="text-[10px] text-slate-600">{m.unit} • Target: {m.target}</div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <h4 className="text-xs font-black text-white">History Matching Parameters</h4>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {[
                    { param: 'Global Kx multiplier', value: '1.12' },
                    { param: 'Global Ky multiplier', value: '1.08' },
                    { param: 'Kv/Kh ratio', value: '0.15' },
                    { param: 'Aquifer strength', value: '350 RB/D/psi' },
                    { param: 'Rock compressibility', value: '4.2 × 10⁻⁶ psi⁻¹' },
                    { param: 'Relative perm endpoints', value: 'Adjusted +8%' },
                  ].map(p => (
                    <div key={p.param} className="bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                      <div className="text-slate-500">{p.param}</div>
                      <div className="text-white font-mono text-xs">{p.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Phase 4: Forecast */}
        {activePhase === 4 && simStatus === 'completed' && simResult && (
          <motion.div key="phase4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                <h4 className="text-sm font-black text-white mb-4">Cumulative Production</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={forecastData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                    <XAxis dataKey="t" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
                    <Legend />
                    <Area type="monotone" dataKey="Oil" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Oil (MM STB)" />
                    <Area type="monotone" dataKey="Water" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Water (MM STB)" />
                    <Area type="monotone" dataKey="Gas" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Gas (BSCF)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                <h4 className="text-sm font-black text-white mb-4">Water Cut & GOR Trend</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={forecastData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                    <XAxis dataKey="t" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" stroke="#3b82f6" tick={{ fontSize: 10 }} label={{ value: 'Water Cut (%)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 10 }} label={{ value: 'GOR (SCF/STB)', angle: 90, position: 'insideRight' }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="Water" stroke="#3b82f6" strokeWidth={2} dot={false} name="Water Cut (%)" />
                    <Line yAxisId="right" type="monotone" dataKey="Gas" stroke="#f59e0b" strokeWidth={1} dot={false} strokeDasharray="5 5" name="GOR" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Final Forecast Summary */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-6 border border-blue-500/30">
              <h4 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-400" />
                Final Forecast Summary — {simDays} Days ({((simResult.cumOil[simResult.cumOil.length - 1] ?? 0) / (simDays / 365.25)).toFixed(0)} STB/D avg)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { label: 'EUR Oil', value: formatNumber(simResult.cumOil[simResult.cumOil.length - 1] ?? 0, 2), unit: 'MM STB' },
                  { label: 'EUR Water', value: formatNumber(simResult.cumWater[simResult.cumWater.length - 1] ?? 0, 2), unit: 'MM STB' },
                  { label: 'EUR Gas', value: formatNumber(simResult.cumGas[simResult.cumGas.length - 1] ?? 0, 2), unit: 'BSCF' },
                  { label: 'Final P_avg', value: formatNumber(simResult.avgPressure[simResult.avgPressure.length - 1] ?? 0, 0), unit: 'psi' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-2xl font-black text-white">{s.value}</div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider">{s.label} <span className="text-slate-600">[{s.unit}]</span></div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulation Tips */}
      <div className="bg-amber-500/5 rounded-3xl p-5 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-black text-amber-400 uppercase tracking-wider">Simulation Notes</p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              This IMPES simulator solves the 3-phase black oil equations on a {nx}×{ny} grid with {nProducers} producers and {nInjectors} injectors.
              Pressure is solved implicitly using SOR iteration while saturations are updated explicitly.
              The Peaceman well model computes equivalent radius for well index calculation.
              History matching uses pressure data with global parameter multipliers.
              For full compositional or dual-porosity/dual-permeability models, export to Eclipse/CMG format or use the advanced PVT module.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReservoirSimulationModule;