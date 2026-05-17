/**
 * Cementing Engineering Tab
 * API RP 10B / API Spec 10A compliant cementing design, evaluation & QA/QC
 */
import React, { useState, useMemo } from 'react';
import {
  SlurryInputs, ThickeningInputs, CompressiveInputs, AnnularInputs,
  WellheadInputs, CentralizerInputs, CementBondInputs,
  calculateSlurryDensity, calculateSlurryYield, calculateWaterRequirement,
  calculateThickeningTime, calculateCompressiveStrength, generateStrengthCurve,
  calculateCementVolume, calculateDisplacementVolume, calculateECD,
  calculateHydrostaticPressure, calculateUTubeRisk, calculateFreeWaterRisk,
  calculateCentralizerStandoff, calculateCBLAmp, calculateSqueezeCement
} from '../../lib/cementing';
import {
  CEMENT_CLASSES, CementClassData, CementAdditive, CentralizerType
} from '../../lib/cementing_data';

// ── Slurry Design Panel ──
const SlurryDesignPanel: React.FC = () => {
  const [cementClass, setCementClass] = useState('G');
  const [density, setDensity] = useState(15.8);
  const [waterRatio, setWaterRatio] = useState(4.3);
  const [waterDensity, setWaterDensity] = useState(8.34);
  const [additiveFrac, setAdditiveFrac] = useState(0);
  const [additiveDensity, setAdditiveDensity] = useState(10);
  const [sacks, setSacks] = useState(500);

  const inputs: SlurryInputs = { cementClass, density, yield: 1.15, waterRatio, waterDensity, additiveFrac, additiveDensity };
  const calcDensity = useMemo(() => calculateSlurryDensity(inputs), [inputs]);
  const calcYield = useMemo(() => calculateSlurryYield(waterRatio, 0), [waterRatio]);
  const waterReq = useMemo(() => calculateWaterRequirement(sacks, waterRatio, 0), [sacks, waterRatio]);

  const selectedCement = CEMENT_CLASSES.find(c => c.class === cementClass);

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-amber-300 border-b border-slate-700 pb-2">Slurry Formulation</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400">Cement Class (API Spec 10A)</label>
          <select value={cementClass} onChange={e => { const c = CEMENT_CLASSES.find(x => x.class === e.target.value); setCementClass(e.target.value); if (c) { setDensity(c.defaultDensity); setWaterRatio(c.waterRequirement); } }} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white">
            {CEMENT_CLASSES.map(c => <option key={c.class} value={c.class}>{c.apiClass} — {c.application}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400">Target Density (ppg)</label>
          <input type="number" value={density} onChange={e => setDensity(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Water Ratio (gal/sk)</label>
          <input type="number" value={waterRatio} onChange={e => setWaterRatio(parseFloat(e.target.value) || 0)} step="0.01" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Water Density (ppg) — fresh=8.34, brine=10.0</label>
          <input type="number" value={waterDensity} onChange={e => setWaterDensity(parseFloat(e.target.value) || 0)} step="0.01" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Additive (% BWOC)</label>
          <input type="number" value={additiveFrac} onChange={e => setAdditiveFrac(parseFloat(e.target.value) || 0)} step="0.1" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Number of Sacks</label>
          <input type="number" value={sacks} onChange={e => setSacks(parseInt(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
      </div>

      {selectedCement && (
        <div className="bg-slate-800/60 border border-slate-700 rounded p-3 text-xs text-slate-300">
          <p><span className="text-slate-400">Depth Range:</span> {selectedCement.depthRange}</p>
          <p><span className="text-slate-400">Thickening Time:</span> {selectedCement.thickeningTime}</p>
          <p><span className="text-slate-400">8hr Compressive:</span> {selectedCement.compressive8hr}</p>
          <p className="mt-1 italic">{selectedCement.description}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800 border border-amber-600/30 rounded p-3 text-center">
          <div className="text-xs text-slate-400">Calculated Density</div>
          <div className="text-xl text-amber-400 font-bold">{calcDensity.toFixed(2)} <span className="text-xs">ppg</span></div>
        </div>
        <div className="bg-slate-800 border border-amber-600/30 rounded p-3 text-center">
          <div className="text-xs text-slate-400">Slurry Yield</div>
          <div className="text-xl text-amber-400 font-bold">{calcYield.toFixed(2)} <span className="text-xs">cuft/sk</span></div>
        </div>
        <div className="bg-slate-800 border border-amber-600/30 rounded p-3 text-center">
          <div className="text-xs text-slate-400">Water Requirement</div>
          <div className="text-xl text-amber-400 font-bold">{waterReq.totalBbl.toFixed(1)} <span className="text-xs">bbl</span></div>
          <div className="text-xs text-slate-500">{waterReq.totalGal.toFixed(0)} gal</div>
        </div>
      </div>
    </div>
  );
};

// ── Thickening Time Panel ──
const ThickeningTimePanel: React.FC = () => {
  const [bhst, setBhst] = useState(250);
  const [retarderPct, setRetarderPct] = useState(1.0);
  const [acceleratorPct, setAcceleratorPct] = useState(0);
  const [silicaPresent, setSilicaPresent] = useState(true);

  const inputs: ThickeningInputs = { bhst, retarderPct, acceleratorPct, silicaPresent };
  const result = useMemo(() => calculateThickeningTime(inputs), [inputs]);

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-amber-300 border-b border-slate-700 pb-2">Thickening Time (API RP 10B-2)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400">BHST (°F)</label>
          <input type="number" value={bhst} onChange={e => setBhst(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Retarder (% BWOC)</label>
          <input type="number" value={retarderPct} onChange={e => setRetarderPct(parseFloat(e.target.value) || 0)} step="0.1" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Accelerator (% BWOC)</label>
          <input type="number" value={acceleratorPct} onChange={e => setAcceleratorPct(parseFloat(e.target.value) || 0)} step="0.1" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" checked={silicaPresent} onChange={e => setSilicaPresent(e.target.checked)} className="rounded" />
          <label className="text-xs text-slate-400">Silica Flour Present (35% BWOC)</label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800 border border-cyan-600/30 rounded p-3 text-center">
          <div className="text-xs text-slate-400">Thickening Time</div>
          <div className="text-xl text-cyan-400 font-bold">{result.hours}h {result.min}m</div>
          <div className="text-xs text-slate-500">({result.totalMin} min)</div>
        </div>
        <div className="bg-slate-800 border border-cyan-600/30 rounded p-3">
          <div className="text-xs text-slate-400 mb-1">Interpretation</div>
          <div className={`text-sm font-medium ${result.totalMin < 120 ? 'text-red-400' : result.totalMin < 240 ? 'text-amber-400' : 'text-green-400'}`}>{result.interpretation}</div>
        </div>
      </div>
    </div>
  );
};

// ── Compressive Strength Panel ──
const CompressiveStrengthPanel: React.FC = () => {
  const [curingTime, setCuringTime] = useState(24);
  const [curingTemp, setCuringTemp] = useState(200);
  const [silicaPct, setSilicaPct] = useState(35);
  const [csDensity, setCsDensity] = useState(15.8);

  const inputs: CompressiveInputs = { curingTime, curingTemp, silicaPct, density: csDensity };
  const strength = useMemo(() => calculateCompressiveStrength(inputs), [inputs]);
  const curve = useMemo(() => generateStrengthCurve(inputs, 20), [inputs]);

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-amber-300 border-b border-slate-700 pb-2">Compressive Strength Development</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400">Curing Time (hours)</label>
          <input type="number" value={curingTime} onChange={e => setCuringTime(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Curing Temperature (°F)</label>
          <input type="number" value={curingTemp} onChange={e => setCuringTemp(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Silica Flour (% BWOC)</label>
          <input type="number" value={silicaPct} onChange={e => setSilicaPct(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Slurry Density (ppg)</label>
          <input type="number" value={csDensity} onChange={e => setCsDensity(parseFloat(e.target.value) || 0)} step="0.1" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
      </div>

      <div className="bg-slate-800 border border-emerald-600/30 rounded p-3 text-center">
        <div className="text-xs text-slate-400">Estimated Compressive Strength @ {curingTime}h</div>
        <div className="text-2xl text-emerald-400 font-bold">{strength.toLocaleString()} <span className="text-xs">psi</span></div>
        {curingTemp > 230 && silicaPct < 25 && <div className="text-xs text-red-400 mt-1">⚠ Strength retrogression risk — insufficient silica</div>}
      </div>

      {/* Strength Development Curve */}
      <div className="bg-slate-800/60 border border-slate-700 rounded p-3">
        <div className="text-xs text-slate-400 mb-2">Strength Development Curve (72 hr)</div>
        <div className="h-32 flex items-end space-x-0.5">
          {curve.map((pt, i) => (
            <div key={i} className="flex-1 flex flex-col items-center" title={`${pt.time}h: ${pt.strength} psi`}>
              <div className="w-full bg-emerald-500/70 rounded-t" style={{ height: `${Math.min(100, (pt.strength / 5000) * 100)}%` }} />
              {i % 4 === 0 && <div className="text-[10px] text-slate-500 mt-1">{pt.time}h</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Volumetrics & Displacement Panel ──
const VolumetricsPanel: React.FC = () => {
  const [holeDiameter, setHoleDiameter] = useState(8.5);
  const [casingOD, setCasingOD] = useState(5.5);
  const [intervalLength, setIntervalLength] = useState(2000);
  const [excessFactor, setExcessFactor] = useState(1.25);
  const [casingID, setCasingID] = useState(4.892);
  const [depth, setDepth] = useState(8000);

  const annInputs: AnnularInputs = { holeDiameter, casingOD, intervalLength, excessFactor };
  const vol = useMemo(() => calculateCementVolume(annInputs), [annInputs]);
  const disp = useMemo(() => calculateDisplacementVolume(casingID, depth), [casingID, depth]);

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-amber-300 border-b border-slate-700 pb-2">Volumetrics & Displacement</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400">Hole Diameter (inches)</label>
          <input type="number" value={holeDiameter} onChange={e => setHoleDiameter(parseFloat(e.target.value) || 0)} step="0.125" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Casing OD (inches)</label>
          <input type="number" value={casingOD} onChange={e => setCasingOD(parseFloat(e.target.value) || 0)} step="0.125" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Interval Length (ft)</label>
          <input type="number" value={intervalLength} onChange={e => setIntervalLength(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Excess Factor</label>
          <input type="number" value={excessFactor} onChange={e => setExcessFactor(parseFloat(e.target.value) || 0)} step="0.05" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Casing ID (inches)</label>
          <input type="number" value={casingID} onChange={e => setCasingID(parseFloat(e.target.value) || 0)} step="0.001" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Total Depth (ft)</label>
          <input type="number" value={depth} onChange={e => setDepth(parseInt(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800 border border-amber-600/30 rounded p-3">
          <div className="text-xs text-slate-400 mb-2">Annular Volume</div>
          <div className="text-xl text-amber-400 font-bold">{vol.annularVolBbl.toFixed(1)} <span className="text-xs">bbl</span></div>
          <div className="text-xs text-slate-500">{vol.annularVolCuft.toFixed(1)} cuft</div>
          <div className="text-xs text-slate-400 mt-1">Sacks Needed: <span className="text-amber-300 font-semibold">{vol.sacksNeeded}</span></div>
          <div className="text-xs text-slate-400">Water Required: <span className="text-amber-300">{vol.waterBbl.toFixed(1)} bbl</span></div>
        </div>
        <div className="bg-slate-800 border border-amber-600/30 rounded p-3">
          <div className="text-xs text-slate-400 mb-2">Displacement</div>
          <div className="text-xl text-amber-400 font-bold">{disp.displacementBbl.toFixed(1)} <span className="text-xs">bbl</span></div>
          <div className="text-xs text-slate-400 mt-1">Pump Strokes: <span className="text-amber-300 font-semibold">{disp.strokesNeeded.toLocaleString()}</span></div>
          <div className="text-xs text-slate-500">(@ 0.15 bbl/stroke)</div>
        </div>
      </div>
    </div>
  );
};

// ── ECD & U-Tube Panel ──
const ECDPanel: React.FC = () => {
  const [mudDensity, setMudDensity] = useState(10.5);
  const [pumpRate, setPumpRate] = useState(5);
  const [ecdHoleDiam, setEcdHoleDiam] = useState(8.5);
  const [ecdCasingOD, setEcdCasingOD] = useState(5.5);
  const [ecdDepth, setEcdDepth] = useState(8000);
  const [pv, setPv] = useState(20);
  const [yp, setYp] = useState(15);
  const [cementDensity, setCementDensity] = useState(15.8);
  const [cementHeight, setCementHeight] = useState(2000);
  const [totalDepth, setTotalDepth] = useState(8000);
  const [spacerDensity, setSpacerDensity] = useState(10.0);

  const ecd = useMemo(() => calculateECD(mudDensity, pumpRate, ecdHoleDiam, ecdCasingOD, ecdDepth, pv, yp), [mudDensity, pumpRate, ecdHoleDiam, ecdCasingOD, ecdDepth, pv, yp]);
  const uTube = useMemo(() => calculateUTubeRisk(cementDensity, cementHeight, mudDensity, totalDepth, spacerDensity), [cementDensity, cementHeight, mudDensity, totalDepth, spacerDensity]);

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-amber-300 border-b border-slate-700 pb-2">ECD & U-Tube Analysis</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400">Mud Density (ppg)</label>
          <input type="number" value={mudDensity} onChange={e => setMudDensity(parseFloat(e.target.value) || 0)} step="0.1" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Pump Rate (bbl/min)</label>
          <input type="number" value={pumpRate} onChange={e => setPumpRate(parseFloat(e.target.value) || 0)} step="0.5" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Plastic Viscosity (cP)</label>
          <input type="number" value={pv} onChange={e => setPv(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Yield Point (lb/100ft²)</label>
          <input type="number" value={yp} onChange={e => setYp(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Cement Height (ft)</label>
          <input type="number" value={cementHeight} onChange={e => setCementHeight(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Spacer Density (ppg)</label>
          <input type="number" value={spacerDensity} onChange={e => setSpacerDensity(parseFloat(e.target.value) || 0)} step="0.1" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`bg-slate-800 border rounded p-3 text-center ${ecd.isSafe ? 'border-green-600/30' : 'border-red-600/30'}`}>
          <div className="text-xs text-slate-400">ECD</div>
          <div className={`text-xl font-bold ${ecd.isSafe ? 'text-green-400' : 'text-red-400'}`}>{ecd.ecd.toFixed(2)} <span className="text-xs">ppg</span></div>
          <div className="text-xs text-slate-500">ΔP Annulus: {ecd.apLoss.toFixed(0)} psi</div>
          <div className={`text-xs ${ecd.isSafe ? 'text-green-500' : 'text-red-500'}`}>{ecd.isSafe ? '✓ Safe' : `⚠ Above frac by ${ecd.ecdAboveFrac.toFixed(2)} ppg`}</div>
        </div>
        <div className={`bg-slate-800 border rounded p-3 text-center ${uTube.freeFallRisk === 'none' ? 'border-green-600/30' : uTube.freeFallRisk === 'low' ? 'border-amber-600/30' : 'border-red-600/30'}`}>
          <div className="text-xs text-slate-400">U-Tube Risk</div>
          <div className={`text-sm font-bold ${uTube.freeFallRisk === 'none' ? 'text-green-400' : uTube.freeFallRisk === 'low' ? 'text-amber-400' : 'text-red-400'}`}>{uTube.freeFallRisk.toUpperCase()}</div>
          <div className="text-xs text-slate-500">Imbalance: {uTube.pressureImbalance.toFixed(0)} psi</div>
          <div className="text-xs text-slate-400 mt-1">{uTube.description}</div>
        </div>
      </div>
    </div>
  );
};

// ── Centralizer & Standoff Panel ──
const CentralizerPanel: React.FC = () => {
  const [casingOD, setCasingOD] = useState(5.5);
  const [holeDiameter, setHoleDiameter] = useState(8.5);
  const [spacing, setSpacing] = useState(40);
  const [deviation, setDeviation] = useState(30);
  const [casingWeight, setCasingWeight] = useState(17);
  const [type, setType] = useState<'bow-spring' | 'rigid' | 'semi-rigid'>('bow-spring');
  const [mudWeight, setMudWeight] = useState(10.5);

  const inputs: CentralizerInputs = { casingOD, holeDiameter, spacing, deviation, casingWeight, type, mudWeight };
  const result = useMemo(() => calculateCentralizerStandoff(inputs), [inputs]);

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-amber-300 border-b border-slate-700 pb-2">Centralizer Design (API Spec 10D)</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400">Casing OD (inches)</label>
          <input type="number" value={casingOD} onChange={e => setCasingOD(parseFloat(e.target.value) || 0)} step="0.125" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Borehole Diameter (inches)</label>
          <input type="number" value={holeDiameter} onChange={e => setHoleDiameter(parseFloat(e.target.value) || 0)} step="0.125" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Spacing (ft)</label>
          <input type="number" value={spacing} onChange={e => setSpacing(parseInt(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Deviation (degrees)</label>
          <input type="number" value={deviation} onChange={e => setDeviation(parseFloat(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Centralizer Type</label>
          <select value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white">
            <option value="bow-spring">Bow-Spring</option>
            <option value="rigid">Rigid</option>
            <option value="semi-rigid">Semi-Rigid</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400">Mud Weight (ppg)</label>
          <input type="number" value={mudWeight} onChange={e => setMudWeight(parseFloat(e.target.value) || 0)} step="0.1" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800 border border-amber-600/30 rounded p-3 text-center">
          <div className="text-xs text-slate-400">Standoff</div>
          <div className={`text-xl font-bold ${result.standoffPercent > 67 ? 'text-green-400' : result.standoffPercent > 50 ? 'text-amber-400' : 'text-red-400'}`}>{result.standoffPercent.toFixed(1)}%</div>
        </div>
        <div className="bg-slate-800 border border-amber-600/30 rounded p-3 text-center">
          <div className="text-xs text-slate-400">Recommended Spacing</div>
          <div className="text-xl text-amber-400 font-bold">{result.recommendedSpacing} <span className="text-xs">ft</span></div>
        </div>
        <div className="bg-slate-800 border border-amber-600/30 rounded p-3 text-center">
          <div className="text-xs text-slate-400">Bow Force Needed</div>
          <div className="text-xl text-amber-400 font-bold">{result.bowForceNeeded.toLocaleString()} <span className="text-xs">lbf</span></div>
        </div>
      </div>
      <div className="bg-slate-800/60 border border-slate-700 rounded p-2 text-xs text-slate-300">
        <span className="text-slate-400">Eccentricity:</span> {result.eccentricity.toFixed(3)} — {result.interpretation}
      </div>
    </div>
  );
};

// ── Cement Bond Log Panel ──
const CBLPanel: React.FC = () => {
  const [compressiveStrength, setCompressiveStrength] = useState(2500);
  const [casingSize, setCasingSize] = useState(5.5);
  const [casingThickness, setCasingThickness] = useState(0.304);
  const [cementDensity, setCementDensity] = useState(15.8);
  const [microannulusGap, setMicroannulusGap] = useState(0);

  const inputs: CementBondInputs = { compressiveStrength, casingSize, casingThickness, cementDensity, microannulusGap };
  const cbl = useMemo(() => calculateCBLAmp(inputs), [inputs]);

  const qualityColor = cbl.quality === 'excellent' ? 'text-green-400' : cbl.quality === 'good' ? 'text-cyan-400' : cbl.quality === 'fair' ? 'text-amber-400' : cbl.quality === 'poor' ? 'text-orange-400' : 'text-red-400';

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-amber-300 border-b border-slate-700 pb-2">Cement Bond Log (CBL) Evaluation</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400">Compressive Strength (psi)</label>
          <input type="number" value={compressiveStrength} onChange={e => setCompressiveStrength(parseInt(e.target.value) || 0)} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Casing OD (inches)</label>
          <input type="number" value={casingSize} onChange={e => setCasingSize(parseFloat(e.target.value) || 0)} step="0.125" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Casing Wall Thickness (inches)</label>
          <input type="number" value={casingThickness} onChange={e => setCasingThickness(parseFloat(e.target.value) || 0)} step="0.001" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Microannulus Gap (microns, 0 = perfect)</label>
          <input type="number" value={microannulusGap} onChange={e => setMicroannulusGap(parseFloat(e.target.value) || 0)} step="1" className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800 border border-slate-700 rounded p-3 text-center">
          <div className="text-xs text-slate-400">CBL Amplitude</div>
          <div className={`text-xl font-bold ${cbl.amplitude_mV < 5 ? 'text-green-400' : cbl.amplitude_mV < 30 ? 'text-amber-400' : 'text-red-400'}`}>{cbl.amplitude_mV} <span className="text-xs">mV</span></div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded p-3 text-center">
          <div className="text-xs text-slate-400">Bond Index</div>
          <div className="text-xl text-cyan-400 font-bold">{cbl.bondIndex.toFixed(2)}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded p-3 text-center">
          <div className="text-xs text-slate-400">Quality</div>
          <div className={`text-lg font-bold uppercase ${qualityColor}`}>{cbl.quality}</div>
        </div>
      </div>
      <div className="bg-slate-800/60 border border-slate-700 rounded p-2 text-xs text-slate-300">{cbl.interpretation}</div>
    </div>
  );
};

// ── Main CementingTab ──
const CementingTab: React.FC = () => {
  const [activePanel, setActivePanel] = useState<string>('slurry');

  const panels: { key: string; label: string }[] = [
    { key: 'slurry', label: 'Slurry Design' },
    { key: 'thickening', label: 'Thickening Time' },
    { key: 'compressive', label: 'Compressive Strength' },
    { key: 'volumetrics', label: 'Volumetrics' },
    { key: 'ecd', label: 'ECD & U-Tube' },
    { key: 'centralizer', label: 'Centralizer' },
    { key: 'cbl', label: 'CBL Eval' }
  ];

  return (
    <div className="text-white">
      <div className="flex flex-wrap gap-1 mb-4">
        {panels.map(p => (
          <button
            key={p.key}
            onClick={() => setActivePanel(p.key)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${activePanel === p.key ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4">
        {activePanel === 'slurry' && <SlurryDesignPanel />}
        {activePanel === 'thickening' && <ThickeningTimePanel />}
        {activePanel === 'compressive' && <CompressiveStrengthPanel />}
        {activePanel === 'volumetrics' && <VolumetricsPanel />}
        {activePanel === 'ecd' && <ECDPanel />}
        {activePanel === 'centralizer' && <CentralizerPanel />}
        {activePanel === 'cbl' && <CBLPanel />}
      </div>
    </div>
  );
};

export default CementingTab;